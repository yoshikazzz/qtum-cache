export type CardType = {
  qtum_address: string;
  img: string;
  token_id: number;
  user_id: number;
  pending: boolean;
};

export type QryptoAccount = {
  address: string;
  balance: number;
  loggedIn: boolean;
  name: string;
  network: string;
};
