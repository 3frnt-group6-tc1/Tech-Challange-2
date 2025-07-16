import { Transaction } from './transaction';
import { Card } from './card';

export interface Account {
  id: string;
  userId: string;
  type: string;
}

export interface AccountStatement {
  message: string;
  result: {
    transactions: Transaction[];
  };
}

export interface AccountSummary {
  message: string;
  result: {
    account: Account[];
    transactions: Transaction[];
    cards: Card[];
  };
}
