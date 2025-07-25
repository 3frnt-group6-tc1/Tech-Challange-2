import { Injectable, inject } from '@angular/core';
import { AccountService } from '../../shared/services/Account/account.service';
import { isCredit, isDebit, Transaction } from '../../shared/models/transaction';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as BalanceActions from './balance.actions';

@Injectable()
export class BalanceEffects {
  private readonly actions$ = inject(Actions);
  private readonly accountService = inject(AccountService);

  loadBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BalanceActions.loadBalance),
      switchMap(() =>
        this.accountService.getByUserId().pipe(
          map(({ result }) => {
            const transactions: Transaction[] = result.transactions ?? [];
            let balance = 0;
            transactions.forEach((t) => {
              if (isCredit(t.type)) {
                balance += t.amount;
              } else if (isDebit(t.type)) {
                balance -= t.amount;
              }
            });
            const accountType = result.account[0]?.type ?? 'Conta';
            return BalanceActions.loadBalanceSuccess({ balance, accountType });
          }),
          catchError(() =>
            of(
              BalanceActions.loadBalanceFailure({
                error: 'Erro ao carregar saldo. Tente novamente.'
              })
            )
          )
        )
      )
    )
  );

  constructor() {}
}
