import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { AccountService } from '../../shared/services/Account/account.service';
import * as BalanceActions from './balance.actions';

@Injectable()
export class BalanceEffects {

  // carrega o saldo
  loadBalance$ = createEffect(() => this.actions$.pipe(
    ofType(BalanceActions.loadBalance),
    mergeMap(() => this.accountService.getByUserId()
      .pipe(
        map(response => {
          const account = response.result.account[0];
          const balance = this.calculateBalance(response.result.transactions);
          return BalanceActions.loadBalanceSuccess({
            balance,
            accountType: account.type
          });
        }),
        catchError(error => of(BalanceActions.loadBalanceFailure({
          error: 'Erro ao carregar dados da conta'
        })))
      ))
  ));

  // atualiza o saldo
  updateBalance$ = createEffect(() => this.actions$.pipe(
    ofType(BalanceActions.updateBalance),
    switchMap(({ balance }) => 
      of(BalanceActions.updateBalanceSuccess({ balance }))
    )
  ));

  constructor(
    private actions$: Actions,
    private accountService: AccountService
  ) {}

  // calculo o saldo baseado nas transações
  private calculateBalance(transactions: any[]): number {
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