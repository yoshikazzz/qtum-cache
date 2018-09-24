import * as cls from 'continuation-local-storage';
import * as fs from 'fs';
import * as path from 'path';
import * as SequelizeStatic from 'sequelize';
import { databaseConfig } from '../config/dbconfig';
import {
  TokenAttributes,
  TokenInstance,
} from './interfaces/token-interface';
import {Sequelize} from 'sequelize';

export interface SequelizeModels {
  Tokens: SequelizeStatic.Model<TokenInstance, TokenAttributes>;
}

class Database {
  private _basename: string;
  private _models: SequelizeModels;
  private _sequelize: Sequelize;

  constructor() {
    this._basename = path.basename(module.filename);

    (SequelizeStatic as any).cls = cls.createNamespace('sequelize-transaction');
    this._sequelize = new SequelizeStatic(databaseConfig.database, databaseConfig.username,
      databaseConfig.password, databaseConfig);
    this._models = ({} as any);

    fs.readdirSync(__dirname).filter((file: string) => {
      return (file !== this._basename) && (file !== 'interfaces') && (file.indexOf('js.map') === -1);
    }).forEach((file: string) => {
      let model = this._sequelize.import(path.join(__dirname, file));
      this._models[(model as any).name] = model;
    });

    Object.keys(this._models).forEach((modelName: string) => {
      if (typeof this._models[modelName].associate === 'function') {
        this._models[modelName].associate(this._models);
      }
    });
  }

  getModels() {
    return this._models;
  }

  getSequelize() {
    return this._sequelize;
  }
}

const database = new Database();
export const models = database.getModels();
export const sequelize = database.getSequelize();
