import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { 
  selectBalance, 
  selectFormattedBalance, 
  selectShowBalance, 
  selectAccountType, 
  selectBalanceIsLoading, 
  selectBalanceError,
  selectVisibleBalance,
  selectHasBalanceError
} from './balance.selectors';
import * as BalanceActions from './balance.actions';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {

  constructor(private store: Store) {}

  // Observables
  get balance$() { return this.store.select(selectBalance); }
  get formattedBalance$() { return this.store.select(selectFormattedBalance); }
  get showBalance$() { return this.store.select(selectShowBalance); }
  get accountType$() { return this.store.select(selectAccountType); }
  get isLoading$() { return this.store.select(selectBalanceIsLoading); }
  get error$() { return this.store.select(selectBalanceError); }
  get visibleBalance$() { return this.store.select(selectVisibleBalance); }
  get hasError$() { return this.store.select(selectHasBalanceError); }

  // Actions
  loadBalance(): void {
    this.store.dispatch(BalanceActions.loadBalance());
  }

  updateBalance(balance: number): void {
    this.store.dispatch(BalanceActions.updateBalance({ balance }));
  }

  toggleBalanceVisibility(): void {
    this.store.dispatch(BalanceActions.toggleBalanceVisibility());
  }

  setBalanceVisibility(showBalance: boolean): void {
    this.store.dispatch(BalanceActions.setBalanceVisibility({ showBalance }));
  }

  setAccountType(accountType: string): void {
    this.store.dispatch(BalanceActions.setAccountType({ accountType }));
  }

  clearError(): void {
    this.store.dispatch(BalanceActions.clearBalanceError());
  }

  // calcular e atualizar o saldo baseado em transações
  calculateAndUpdateBalance(transactions: any[]): void {
    let totalEntries = 0;
    let totalExits = 0;

    transactions.forEach((transaction) => {
      if (this.isCredit(transaction.type)) {
        totalEntries += transaction.amount;
      }
      if (this.isDebit(transaction.type)) {
        totalExits += transaction.amount * -1;
      }
    });

    const balance = totalEntries - totalExits;
    this.updateBalance(balance);
  }

  // verificar tipo de transação
  private isCredit(type: string): boolean {
    return ['CREDIT', 'TRANSFER_IN', 'PIX_IN'].includes(type);
  }

  private isDebit(type: string): boolean {
    return ['DEBIT', 'TRANSFER_OUT', 'PIX_OUT', 'PAYMENT'].includes(type);
  }
} 