
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import express = require('express');

import IpfsService from '../services/ipfs-services';

const UPLOAD_PATH = 'uploads/';

export default function (router: express.Router) {

  const upload = multer({ dest: UPLOAD_PATH });
  router.post('/api/file', upload.single('file'), (req, res) => {
    console.log('Upload file to IPFS: ' + JSON.stringify(req.file));
    const filePath = path.join(UPLOAD_PATH, req.file.filename);
    IpfsService.addFileToIpfs(req.file.originalname, filePath)
      .then(result => {
        return res.json({
          code: 200,
          status: 'success',
          data: result,
        });
      })
      .catch(err => {
        console.log('Upload file error: ' + err);
        res.status(500).send(err.message);
      });
  });

  router.post('/api/files', upload.array('file', 12), (req, res) => {
    const promises = (req.files as any).map(file => {
      console.log('Upload file to IPFS: ' + JSON.stringify(file));
      const filePath = path.join(UPLOAD_PATH, file.filename);
      return IpfsService.addFileToIpfs(file.originalname, filePath);
    });
    Promise.all(promises)
      .then(result => {
        return res.json({
          code: 200,
          status: 'success',
          data: result,
        });
      })
      .catch(err => {
        console.log('Upload file error: ' + err);
        res.status(500).send(err);
      });
  });
}
