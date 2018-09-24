import * as React from 'react';
import {
  CardType,
  QryptoAccount,
} from '../types';

export interface ContextState {
  account?: QryptoAccount;
  cards?: CardType[];
  selectedIndex: number;
}

export interface ContextFunctions {
  getCards: () => void;
  requestCard: () => void;
  selectCard: (index: number) => void;
  sendPayment: (address: string) => void;
}

const defaultState: ContextState & ContextFunctions = {
  selectedIndex: -1,
  getCards: () => {},
  selectCard: () => {},
  sendPayment: () => {},
  requestCard: () => {},
};

export const AppContext = React.createContext(defaultState);
