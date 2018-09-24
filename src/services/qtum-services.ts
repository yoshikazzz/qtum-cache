import {
  Qtum,
} from 'qtumjs';
const Web3 = require('web3');
import * as dotenv from 'dotenv';
import {
  isHexAddress,
  base58ToHex,
  hexStringFull,
  hexStringSort,
} from './utils';
import { models } from '../models/index';
import IpfsServices from './ipfs-services';
import EthServices from './eth-services';

// load env vars into process.env
dotenv.config();

const config = require('../contracts/qtum.json');
const contractOwner = config.owner;

const qtumUser = process.env.QTUMD_USER || 'test';
const qtumPass = process.env.QTUMD_PW || 'test1234';
const qtumPort = process.env.QTUMD_PORT || 13889;
const qtum = new Qtum(`http://${qtumUser}:${qtumPass}@localhost:${qtumPort}`, {
  contracts: {
    erc721: config
  }
} as any);
const myToken = qtum.contract('erc721');

class QtumService {
  private transferEvents = [];
  public async mint(to) {
    try {
      let address = to;
      if (!isHexAddress(address)) {
        address = base58ToHex(to);
      } else {
        address = hexStringFull(to);
      }
      if (!isHexAddress(address)) {
        throw new Error('Invalid address');
      }
      const tokenId = Math.floor(Math.random() * 100000);
      const tokenExist = await this.tokenExist(tokenId);
      if (tokenExist) {
        return null;
      }
      console.log(`Mint: ${to} - ${tokenId}`);
      const tx = await myToken.send('mint', [address, tokenId, address], {
        senderAddress: contractOwner,
      });
      const dbInfo = await models.Tokens.create({
        token_id: tokenId,
        qtum_address: hexStringSort(address),
        img: this.genImg(tokenId),
        user_id: 1,
        pending: 1,
      });
      return {
        tx: tx,
        db: dbInfo.dataValues,
      };
    } catch (err) {
      throw err;
    }
  }

  async tokenExist(tokenId) {
    try {
      await this.readInfo('ownerOf', [tokenId]);
      return true;
    } catch (err) {
      return false;
    }
  }

  async getLogs(fromBlock, toBlock) {
    const logs = await myToken.logs({
      fromBlock,
      toBlock,
      minconf: 1,
    });
    return logs;
  }

  public async readInfo(field, params) {
    const result = await myToken.call(field, params);

    // supply is a BigNumber instance (see: bn.js)
    const supply = result.outputs[0];

    if (Web3.utils.isBN(supply)) {
      return supply.toNumber();
    } else {
      return supply;
    }
  }

  public async writeData(field, params) {
    console.log(`Sending ${field} with params ${params}`);
    const result = await myToken.send(field, params, {
      senderAddress: contractOwner,
    });
    return result;
  }

  public startMonitor = () => {
    this.updateToEth();
    const emitter = myToken.logEmitter({ minconf: 0 });
    emitter.on('Transfer', async (e) => {
      this.transferEvents.push(e);
      const from = e.event['_from'];
      const to = e.event['_to'];
      const tokenId = e.event['_tokenId'].toNumber();
      const count = await models.Tokens.destroy({
        where: {
          token_id: tokenId,
          qtum_address: [from, to],
        }
      });
      console.log(`${count} row(s) deleted`);
      await models.Tokens.create({
        token_id: tokenId,
        qtum_address: to,
        img: this.genImg(tokenId),
        user_id: 1,
        pending: 0,
      });
    });
  }

  public convertParam = (type, value) => {
    switch (type) {
      case 'address': {
        let address = value;
        if (!isHexAddress(address)) {
          address = base58ToHex(value);
        }
        address = hexStringFull(address);
        return address;
      }
      case 'number': {
        return parseInt(value);
      }
      default:
        return value;
    }
  }

  private updateToEth = () => {
    setInterval(async () => {
      if (!this.transferEvents.length) {
        return;
      }
      const froms = [], tos = [], tokens = [], ipfsData = [];
      this.transferEvents.forEach(e => {
        const from = e.event['_from'];
        const to = e.event['_to'];
        const signature = e.event['_signature'];
        const tokenId = e.event['_tokenId'].toNumber();
        ipfsData.push({ to, tokenId });
        froms.push(from);
        tos.push(to);
        tokens.push(tokenId);
      });
      this.transferEvents = [];
      const ipfsHash = await IpfsServices.addData(Buffer.from(JSON.stringify(ipfsData), 'utf8'));
      const txHash = await EthServices.multiTransfer(froms, tos, tokens, ipfsHash);
      console.log(`Data written to Ethereum: ${txHash}`);
    }, 5 * 60 * 1000); // Update each 5 mins
  }

  private genImg = (tokenId) => {
    let numberString = ('000' + (tokenId % 370 + 1));
    numberString = numberString.substr(numberString.length - 3);
    return `f${numberString}.png`;
  };
}

export default new QtumService();
