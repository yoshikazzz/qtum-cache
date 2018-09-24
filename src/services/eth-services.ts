const Web3 = require('web3');
import bs58 from 'bs58';
const config = require('../contracts/eth.json');
const contractAbi = config.abi;
const contractAddress = config.address;

const GAS_PRICE = 21;
const PRIVATE_KEY = '0xa3fa6c1d3d0d57cadf2864d098987b2ef5c5a5f0c32b5fbf461b5c86ac09d1c7';

class EthServices {
  private web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/odc6wF4Kjd2Iup2Hvepz'));
  private contract = new this.web3.eth.Contract(contractAbi, contractAddress);

  sendTx(callObject, _privateKey, gasPrice) {
    const _gasPrice = gasPrice ? gasPrice.toString() : GAS_PRICE;
    const privateKey = this.hexStringFull(_privateKey);
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    const rawTx = {
      from: account.address,
      to: contractAddress,
      gasPrice: this.web3.utils.toHex(this.web3.utils.toWei(_gasPrice, 'gwei')),
      gasLimit: this.web3.utils.toHex(200000),
      gas: '',
      nonce: '',
      data: '',
    };
    return new Promise((done, fail) => {
      this.web3.eth.getTransactionCount(account.address)
      .then(count => {
        rawTx.nonce = this.web3.utils.toHex(count);
        const data = callObject.encodeABI();
        rawTx.data = data;
        // return callObject.estimateGas();
        return 2000000;
      }).then(gas => {
        rawTx.gasLimit = this.web3.utils.toHex(gas);
        rawTx.gas = rawTx.gasLimit;
        return this.web3.eth.accounts.signTransaction(rawTx, privateKey);
      }).then(signedData => {
        this.web3.eth.sendSignedTransaction(signedData.rawTransaction, (err, txHash) => {
          if (err) {
            fail(err);
          } else {
            done(txHash);
          }
        });
      }).catch(err => {
        fail(err);
      });
    });
  }

  public async multiTransfer(froms, tos, tokens, ipfsHash) {
    const count = Math.min(froms.length, tos.length, tokens.length);
    const callObject = this.contract.methods.multiTransfer(froms.slice(0, count), tos.slice(0, count), tokens.slice(0, count), ipfsHash);
    const result = await this.sendTx(callObject, PRIVATE_KEY, GAS_PRICE);
    return result;
  }

  public async getTxStatus(txHash) {
    try {
      const txInfo = await this.web3.eth.getTransaction(txHash);
      return txInfo;
    } catch (err) {
      return null;
    }
  }

  hexStringFull(hexStr) {
    return hexStr.indexOf('0x') === 0 ? hexStr : `0x${hexStr}`;
  }

  hexStringSort(hexStr) {
    return hexStr.indexOf('0x') === 0 ? hexStr.substr(2) : hexStr;
  }

  hexArrayToString(arr) {
    let result = '';
    arr.forEach(dec => {
      const hexStr = Number(dec).toString(16);
      const str = hexStr.length === 1 ? `0${hexStr}` : hexStr;
      result = result + str;
    });
    return result;
  }

  hexString2Array(str) {
    str = this.hexStringSort(str);
    const result = [];
    while (str.length >= 2) {
      result.push(parseInt(str.substring(0, 2), 16));
      str = str.substring(2, str.length);
    }
    return result;
  }
}

export default new EthServices();
