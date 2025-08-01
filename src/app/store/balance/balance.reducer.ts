import { createReducer, on } from '@ngrx/store';
import { BalanceState, initialState } from './balance.state';
import * as BalanceActions from './balance.actions';

export const balanceReducer = createReducer(
  initialState,
  
  // carrega o saldo
  on(BalanceActions.loadBalance, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(BalanceActions.loadBalanceSuccess, (state, { balance, accountType }) => ({
    ...state,
    balance,
    formattedBalance: formatBalance(balance),
    accountType,
    isLoading: false,
    error: null
  })),
  
  on(BalanceActions.loadBalanceFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // atualiza o saldo
  on(BalanceActions.updateBalance, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(BalanceActions.updateBalanceSuccess, (state, { balance }) => ({
    ...state,
    balance,
    formattedBalance: formatBalance(balance),
    isLoading: false,
    error: null
  })),
  
  on(BalanceActions.updateBalanceFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // alterna a visibilidade do saldo
  on(BalanceActions.toggleBalanceVisibility, (state) => ({
    ...state,
    showBalance: !state.showBalance
  })),
  
  // define a visibilidade do saldo
  on(BalanceActions.setBalanceVisibility, (state, { showBalance }) => ({
    ...state,
    showBalance
  })),
  
  // define o tipo de conta
  on(BalanceActions.setAccountType, (state, { accountType }) => ({
    ...state,
    accountType
  })),
  
  // limpa o erro
  on(BalanceActions.clearBalanceError, (state) => ({
    ...state,
    error: null
  }))
);

// formata o saldo
function formatBalance(amount: number): string {
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
} 