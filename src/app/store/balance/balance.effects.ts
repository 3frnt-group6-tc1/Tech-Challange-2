import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, tap } from 'rxjs/operators';
import { AccountService } from '../../shared/services/Account/account.service';
import * as BalanceActions from './balance.actions';

@Injectable()
export class BalanceEffects {
  // Inject AccountService using inject() function for better tree-shaking
  private accountService = inject(AccountService);
  private actions$ = inject(Actions);

  // Log service injection for debugging
  constructor() {
    console.log('BalanceEffects initialized');
    console.log('AccountService available:', !!this.accountService);
  }

  // carrega o saldo
  loadBalance$ = createEffect(() => this.actions$.pipe(
    ofType(BalanceActions.loadBalance),
    tap(() => console.log('loadBalance action received')),
    mergeMap(() => {
      console.log('Calling accountService.getByUserId()');
      return this.accountService.getByUserId().pipe(
        tap(response => console.log('Received response from accountService', response)),
        map(response => {
          if (!response?.result?.account?.[0]) {
            throw new Error('Invalid account data received');
          }
          const account = response.result.account[0];
          const balance = this.calculateBalance(response.result.transactions || []);
          return BalanceActions.loadBalanceSuccess({
            balance,
            accountType: account.type
          });
        }),
        catchError(error => {
          console.error('Error in loadBalance$ effect:', error);
          return of(BalanceActions.loadBalanceFailure({
            error: 'Erro ao carregar dados da conta: ' + (error.message || 'Erro desconhecido')
          }));
        })
      );
    })
  ));

  // atualiza o saldo
  updateBalance$ = createEffect(() => this.actions$.pipe(
    ofType(BalanceActions.updateBalance),
    switchMap(({ balance }) => 
      of(BalanceActions.updateBalanceSuccess({ balance }))
    )
  ));

  // calculo o saldo baseado nas transações
  private calculateBalance(transactions: any[] = []): number {
    if (!Array.isArray(transactions)) {
      console.warn('Transactions is not an array:', transactions);
      return 0;
    }

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

    return totalEntries - totalExits;
  }

  // verificar tipo de transação
  private isCredit(type: string): boolean {
    return ['CREDIT', 'TRANSFER_IN', 'PIX_IN'].includes(type);
  }

  private isDebit(type: string): boolean {
    return ['DEBIT', 'TRANSFER_OUT', 'PIX_OUT', 'PAYMENT'].includes(type);
  }
}