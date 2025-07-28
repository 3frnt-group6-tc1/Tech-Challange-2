import { createReducer, on } from '@ngrx/store';
import { BalanceState, initialBalanceState } from './balance.state';
import * as BalanceActions from './balance.actions';

export const BALANCE_FEATURE_KEY = 'balance';

export const balanceReducer = createReducer(
  initialBalanceState,
  
  on(BalanceActions.loadBalance, (state): BalanceState => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(BalanceActions.loadBalanceSuccess, (state, { balance, accountType }): BalanceState => ({
    ...state,
    balance,
    accountType,
    isLoading: false,
    error: null
  })),
  
  on(BalanceActions.loadBalanceFailure, (state, { error }): BalanceState => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(BalanceActions.toggleBalanceVisibility, (state): BalanceState => ({
    ...state,
    showBalance: !state.showBalance
  }))
);
