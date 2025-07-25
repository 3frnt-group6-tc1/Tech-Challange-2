import { createAction, props } from '@ngrx/store';

export const loadBalance = createAction(
  '[Balance] Load Balance'
);

export const loadBalanceSuccess = createAction(
  '[Balance] Load Balance Success',
  props<{ balance: number; accountType: string }>()
);

export const loadBalanceFailure = createAction(
  '[Balance] Load Balance Failure',
  props<{ error: string }>()
);

export const toggleBalanceVisibility = createAction(
  '[Balance] Toggle Balance Visibility'
);
