import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { balanceReducer } from './balance.reducer';
import { initialState } from './balance.state';
import * as BalanceActions from './balance.actions';

describe('Balance Reducer', () => {
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: { balance: initialState }
        })
      ]
    });
    store = TestBed.inject(MockStore);
  });

  it('should return the initial state', () => {
    const action = { type: 'NOOP' };
    const result = balanceReducer(initialState, action);
    expect(result).toBe(initialState);
  });

  it('should handle loadBalance', () => {
    const action = BalanceActions.loadBalance();
    const result = balanceReducer(initialState, action);
    expect(result.isLoading).toBe(true);
    expect(result.error).toBe(null);
  });

  it('should handle loadBalanceSuccess', () => {
    const balance = 1000;
    const accountType = 'Conta Corrente';
    const action = BalanceActions.loadBalanceSuccess({ balance, accountType });
    const result = balanceReducer(initialState, action);
    expect(result.balance).toBe(balance);
    expect(result.accountType).toBe(accountType);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(null);
  });

  it('should handle loadBalanceFailure', () => {
    const error = 'Erro ao carregar dados';
    const action = BalanceActions.loadBalanceFailure({ error });
    const result = balanceReducer(initialState, action);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(error);
  });

  it('should handle toggleBalanceVisibility', () => {
    const action = BalanceActions.toggleBalanceVisibility();
    const result = balanceReducer(initialState, action);
    expect(result.showBalance).toBe(false);
  });

  it('should handle setBalanceVisibility', () => {
    const showBalance = false;
    const action = BalanceActions.setBalanceVisibility({ showBalance });
    const result = balanceReducer(initialState, action);
    expect(result.showBalance).toBe(showBalance);
  });

  it('should handle setAccountType', () => {
    const accountType = 'Conta Poupança';
    const action = BalanceActions.setAccountType({ accountType });
    const result = balanceReducer(initialState, action);
    expect(result.accountType).toBe(accountType);
  });

  it('should handle clearBalanceError', () => {
    const stateWithError = { ...initialState, error: 'Erro anterior' };
    const action = BalanceActions.clearBalanceError();
    const result = balanceReducer(stateWithError, action);
    expect(result.error).toBe(null);
  });
}); 