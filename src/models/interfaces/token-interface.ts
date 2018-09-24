import { Instance } from 'sequelize';

export interface TokenAttributes {
  user_id: number;
  qtum_address: string;
  token_id: number;
  img: string;
  pending: number;
}

export interface TokenInstance extends Instance<TokenAttributes> {
  dataValues: TokenAttributes;
}
