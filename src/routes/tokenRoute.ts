import express = require('express');

import { models } from '../models/index';
import QtumServices from '../services/qtum-services';
import {
  hexStringSort,
  hexStringFull,
  hexToBase58,
  base58ToHex,
  isHexAddress,
} from '../services/utils';

export default function (router: express.Router) {

  router.get('/api/tokens',
    async (req, res) => {
      const { method, params} = req.query;
      try {
        const methodParams = params && params.length ? params.map((param) => {
          const parts = param.split(':');
          return QtumServices.convertParam(parts[1], parts[0]);
        }) : undefined;
        const result = await QtumServices.readInfo(method, methodParams);
        return res.send({
          code: 0,
          status: 'success',
          data: result,
        });
      } catch (err) {
        return res.send({
          code: -1,
          status: 'fail',
          error: err.message,
        });
      }
    }
  );

  router.get('/api/tokens/info/:tokenId',
    async (req, res) => {
      const { tokenId } = req.params;
      try {
        const token = await models.Tokens.findOne({
          where: {
            token_id: tokenId,
          },
          attributes: ['user_id', 'token_id', 'qtum_address', 'img', 'pending'],
        });
        return res.send({
          code: 0,
          status: 'success',
          data: token,
        });
      } catch (err) {
        return res.send({
          code: -1,
          status: 'fail',
          error: err.message,
        });
      }
    }
  );

  router.get('/api/tokens/:address',
    async (req, res) => {
      const { address } = req.params;
      let hexFullAddress, hexShortAddress, base58Address;
      if (isHexAddress(address)) {
        hexFullAddress = hexStringFull(address);
        hexShortAddress = hexStringSort(address);
        base58Address = hexToBase58(address);
      } else {
        base58Address = address;
        hexFullAddress = base58ToHex(address);
        hexShortAddress = hexStringSort(hexFullAddress);
      }
      try {
        const tokens = await models.Tokens.findAll({
          where: {
            qtum_address: [hexFullAddress, hexShortAddress, base58Address],
          },
          attributes: ['user_id', 'token_id', 'qtum_address', 'img', 'pending'],
        });
        return res.send({
          code: 0,
          status: 'success',
          data: tokens,
        });
      } catch (err) {
        return res.send({
          code: -1,
          status: 'fail',
          error: err.message,
        });
      }
    }
  );

  router.post('/api/mint',
    async (req, res) => {
      const { address } = req.body;
      if (!address) {
        return res.status(500).send(new Error('Invalid or missing address'));
      }
      try {
        const result = await QtumServices.mint(address);
        return res.send({
          code: 0,
          status: 'success',
          data: result,
        });
      } catch (err) {
        return res.send({
          code: -1,
          status: 'fail',
          error: err.message,
        });
      }
    }
  );
}
