const bs58 = require('bs58');
const Web3 = require('web3');

export const hexStringFull = (hexStr) => {
  return hexStr.indexOf('0x') === 0 ? hexStr : `0x${hexStr}`;
};

export const hexStringSort = (hexStr) => {
  return hexStr.indexOf('0x') === 0 ? hexStr.substr(2) : hexStr;
};

export const hexArrayToString = (arr) => {
  let result = '';
  arr.forEach(dec => {
    const hexStr = Number(dec).toString(16);
    const str = hexStr.length === 1 ? `0${hexStr}` : hexStr;
    result = result + str;
  });
  return result;
};

export const hexString2Array = (str) => {
  str = this.hexStringSort(str);
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
};

export const base58ToHex = (address) => {
  try {
    const bytes = bs58.decode(address);
    const converted: string = bytes.toString('hex');
    return hexStringFull(converted.substr(2, 40));
  } catch (err) {
    return null;
  }
};

export const hexToBase58 = (address) => {
  try {
    const bytes = Buffer.from(address, 'hex');
    const result = bs58.encode(bytes);
    return result;
  } catch (err) {
    return null;
  }
};

export const isHexAddress = (address) => {
  return Web3.utils.isAddress(address);
};
