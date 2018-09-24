import express = require('express');
import * as path from 'path';

import router from './routes';

import requestLogger = require('./middleware/requestLogger');
import QtumServices from './services/qtum-services';
import Config from './config/config';
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let cors = require('cors');
import { models, sequelize } from './models/index';

export class App {
  /**
   * @param app - express application
   * @param port - port to listen on
   */

  constructor(private app: express.Express, private config: Config) {
    this.configureApp(app);
    this.configureMiddleware(app);
    this.configureRoutes(app);
  }

  /**
   * @param app - express application
   */
  private configureApp(app: express.Express) {
    // view engine setup
    app.use(express.static(path.join(__dirname, '.', 'public')));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    // bodyParser
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());

    // cookieParser
    app.use(cookieParser());
  }

  private configureMiddleware(app: express.Express) {
    app.use(requestLogger);
  }

  private configureRoutes(app: express.Express) {
    router(app);
  }

  public run() {
    sequelize.sync().then(() => {
      this.app.listen(this.config.port);
      QtumServices.startMonitor();
    }).catch((error: Error) => {
      console.error(error.message);
    });
  }
}
