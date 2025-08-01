import { createAction, props } from '@ngrx/store';

// Ações para carregar o saldo
export const loadBalance = createAction('[Balance] Load Balance');

export const loadBalanceSuccess = createAction(
  '[Balance] Load Balance Success',
  props<{ balance: number; accountType: string }>()
);

export const loadBalanceFailure = createAction(
  '[Balance] Load Balance Failure',
  props<{ error: string }>()
);

// Ações para atualizar o saldo
export const updateBalance = createAction(
  '[Balance] Update Balance',
  props<{ balance: number }>()
);

export const updateBalanceSuccess = createAction(
  '[Balance] Update Balance Success',
  props<{ balance: number }>()
);

export const updateBalanceFailure = createAction(
  '[Balance] Update Balance Failure',
  props<{ error: string }>()
);

// Ação para alternar a visibilidade do saldo
export const toggleBalanceVisibility = createAction('[Balance] Toggle Balance Visibility');

// Ação para definir a visibilidade do saldo
export const setBalanceVisibility = createAction(
  '[Balance] Set Balance Visibility',
  props<{ showBalance: boolean }>()
);

// Ação para definir o tipo de conta
export const setAccountType = createAction(
  '[Balance] Set Account Type',
  props<{ accountType: string }>()
);

// Ação para limpar erros
export const clearBalanceError = createAction('[Balance] Clear Error'); 