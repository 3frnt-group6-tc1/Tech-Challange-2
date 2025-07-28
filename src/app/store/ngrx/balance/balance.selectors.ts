import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BalanceState } from './balance.state';
import { BALANCE_FEATURE_KEY } from './balance.reducer';

export const selectBalanceState = createFeatureSelector<BalanceState>(BALANCE_FEATURE_KEY);

export const selectBalance = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.balance
);

export const selectFormattedBalance = createSelector(
  selectBalance,
  (balance: number | null) => {
    if (balance === null) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(balance);
  }
);

export const selectAccountType = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.accountType
);

export const selectIsLoading = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.isLoading
);

export const selectShowBalance = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.showBalance
);

export const selectError = createSelector(
  selectBalanceState,
  (state: BalanceState) => state.error
);

export const selectBalanceInfo = createSelector(
  selectFormattedBalance,
  selectAccountType,
  selectIsLoading,
  selectShowBalance,
  selectError,
  (balance, accountType, isLoading, showBalance, error) => ({
    balance,
    accountType,
    isLoading,
    showBalance,
    error
  })
);


export const selectIsLowBalance = createSelector(
  selectBalance,
  (balance: number | null) => balance !== null && balance < 1000
);

export const selectBalanceStatus = createSelector(
  selectBalance,
  (balance: number | null) => {
    if (balance === null) return 'loading';
    if (balance < 0) return 'negative';
    if (balance < 1000) return 'low';
    return 'healthy';
  }
);

export const selectCanMakeTransaction = createSelector(
  selectBalance,
  (balance: number | null) => (amount: number) => {
    return balance !== null && balance >= amount;
  }
);
