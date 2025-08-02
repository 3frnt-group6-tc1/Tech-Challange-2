import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Transaction, TransactionResponse } from '../../models/transaction';
import { apiConfig } from '../../../app.config';
import { TransactionEventService } from '../TransactionEvent/transaction-event.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = apiConfig.baseUrl + apiConfig.transactionsEndpoint;

  constructor(
    private http: HttpClient,
    private transactionEventService: TransactionEventService
  ) {}

  create(transaction: Transaction, accountId: string): Observable<Transaction> {
    if (!transaction.accountId) {
      transaction.accountId = accountId;
    }

    return this.http.post<TransactionResponse>(this.apiUrl, transaction).pipe(
      tap((createdTransaction: TransactionResponse) => {
        this.transactionEventService.notifyTransactionCreated(
          createdTransaction.result
        );
      }),
      map((createdTransaction: TransactionResponse) => createdTransaction.result)
    );
  }

  update(
    transactionId: string,
    transaction: Transaction,
    accountId: string
  ): Observable<TransactionResponse> {
    if (!transaction.accountId) {
      transaction.accountId = accountId;
    }

    return this.http
      .put<TransactionResponse>(`${this.apiUrl}/${transactionId}`, transaction)
      .pipe(
        tap((updatedTransaction: TransactionResponse) => {
          this.transactionEventService.notifyTransactionUpdated(
            updatedTransaction.result
          );
        })
      );
  }

  delete(transactionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${transactionId}`).pipe(
      tap(() => {
        this.transactionEventService.notifyTransactionDeleted(transactionId);
      })
    );
  }
}
