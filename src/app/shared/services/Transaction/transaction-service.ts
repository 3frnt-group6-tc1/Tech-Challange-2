import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Transaction } from '../../models/transaction';
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

    return this.http.post<Transaction>(this.apiUrl, transaction).pipe(
      tap((createdTransaction) => {
        this.transactionEventService.notifyTransactionCreated(
          createdTransaction
        );
      })
    );
  }

  update(
    transactionId: string,
    transaction: Transaction,
    accountId: string
  ): Observable<Transaction> {
    if (!transaction.accountId) {
      transaction.accountId = accountId;
    }

    return this.http
      .put<Transaction>(`${this.apiUrl}/${transactionId}`, transaction)
      .pipe(
        tap((updatedTransaction) => {
          this.transactionEventService.notifyTransactionUpdated(
            updatedTransaction
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
