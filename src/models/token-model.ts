/* tslint:disable:variable-name */

import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import {
  TokenAttributes,
  TokenInstance,
} from './interfaces/token-interface';

export default function (sequelize: Sequelize, dataTypes: DataTypes):
  SequelizeStatic.Model<TokenAttributes, TokenAttributes> {
  let Model = sequelize.define<TokenAttributes, TokenAttributes>('Tokens', {
    user_id: { type: dataTypes.INTEGER, allowNull: true },
    qtum_address: { type: dataTypes.STRING, allowNull: true },
    token_id: { type: dataTypes.INTEGER, allowNull: true, primaryKey: true },
    img: { type: dataTypes.STRING, allowNull: true },
    pending: { type: dataTypes.INTEGER, allowNull: true },
  }, {
      indexes: [],
      classMethods: {},
      timestamps: false,
      tableName: 'owner_tokens'
    }
  );

  return Model;
}
