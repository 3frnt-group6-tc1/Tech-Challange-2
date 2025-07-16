export enum TransactionType {
  Exchange = 'cambio',
  Loan = 'emprestimo',
  Transfer = 'transferencia',
}

export const CREDIT_TYPES: TransactionType[] = [
  TransactionType.Exchange,
  TransactionType.Loan,
];
export const DEBIT_TYPES: TransactionType[] = [TransactionType.Transfer];

// Interface simplificada alinhada com a API oficial
export interface Transaction {
  id?: string;
  accountId: string;
  value: number;
  type: TransactionType;
  description: string;
  from: string;
  to: string;
  date?: string;
  anexo?: string;
}

export interface Attachment {
  name: string;
  type: string;
  key?: string; // S3 key
  url?: string; // S3 URL
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
