import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BalanceState } from './balance.state';

// Feature selector
export const selectBalanceState = createFeatureSelector<BalanceState>('balance');

// Selectors específicos
export const selectBalance = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.balance
);

export const selectFormattedBalance = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.formattedBalance
);

export const selectShowBalance = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.showBalance
);

export const selectAccountType = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.accountType
);

export const selectBalanceIsLoading = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.isLoading
);

export const selectBalanceError = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.error
);

// Selector combinado para o saldo visível
export const selectVisibleBalance = createSelector(
  selectFormattedBalance,
  selectShowBalance,
  (formattedBalance, showBalance) => showBalance ? formattedBalance : '****'
);

// Selector para verificar se há erro
export const selectHasBalanceError = createSelector(
  selectBalanceError,
  (error) => error !== null
); 