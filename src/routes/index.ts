import * as express from 'express';

import apiRouter from './apiRouter';
import tokenRouter from './tokenRoute';
import rootRouter from './rootRouter';

export default function (app: express.Express) {
  apiRouter(rootRouter);
  tokenRouter(rootRouter);
  app.use('/', rootRouter);
};
