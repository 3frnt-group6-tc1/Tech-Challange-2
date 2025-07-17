export enum TransactionType {
  Exchange = 'exchange',
  Loan = 'loan',
  Transfer = 'transfer',
}

export const CREDIT_TYPES: TransactionType[] = [
  TransactionType.Exchange,
  TransactionType.Loan,
];
export const DEBIT_TYPES: TransactionType[] = [TransactionType.Transfer];

export interface Transaction {
  id?: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  description: string;
  from: string;
  to: string;
  date?: Date;
  anexo?: string;
}

export function isCredit(type: TransactionType): boolean {
  return CREDIT_TYPES.includes(type);
}

export function isDebit(type: TransactionType): boolean {
  return DEBIT_TYPES.includes(type);
}

export const TRANSACTION_TYPE_LABELS: Record<string, TransactionType> = {
  'Câmbio de Moeda': TransactionType.Exchange,
  'Empréstimo e Financiamento': TransactionType.Loan,
  'DOC/TED': TransactionType.Transfer,
};
