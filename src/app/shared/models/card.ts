export interface Card {
  id?: string;
  accountId: string;
  type: 'credit' | 'debit';
  is_blocked?: boolean;
  number: string;
  dueDate: string;
  functions: string;
  cvc: string;
  paymentDate: string;
  name: string;
}

export interface CardResponse {
  message: string;
  result: Card | Card[];
}

export interface CreateCardRequest {
  accountId: string;
  type: 'credit' | 'debit';
  number: string;
  dueDate: string;
  functions: string;
  cvc: string;
  paymentDate: string;
  name: string;
}

export interface UpdateCardRequest {
  type?: 'credit' | 'debit';
  is_blocked?: boolean;
  dueDate?: string;
  functions?: string;
  paymentDate?: string;
  name?: string;
}

export interface ToggleBlockRequest {
  is_blocked: boolean;
}
