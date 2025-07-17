import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Account,
  AccountStatement,
  AccountSummary,
} from '../../models/account';
import { apiConfig } from '../../../app.config';

export interface AccountStatementFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  minValue?: string;
  maxValue?: string;
  from?: string;
  to?: string;
  description?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl = apiConfig.baseUrl + apiConfig.accountsEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * Obtém a conta principal do usuário (primeira conta ativa)
   */
  getPrimaryAccountByUserId(): Observable<Account | null> {
    return new Observable((observer) => {
      this.getByUserId().subscribe({
        next: (response: AccountSummary) => {
          observer.next(response.result.account[0] || null);
          observer.complete();
        },
        error: (error) => observer.error(error),
      });
    });
  }

  /**
   * Busca contas por ID do usuário
   * GET /account
   */
  getByUserId(): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(this.apiUrl);
  }

  /**
   * Obtém extrato da conta
   * GET /account/{accountId}/statement
   */
  getStatement(
    accountId: string,
    filters?: AccountStatementFilters
  ): Observable<AccountStatement> {
    let params = new HttpParams();

    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    if (filters?.minValue) {
      params = params.set('minValue', filters.minValue);
    }

    if (filters?.maxValue) {
      params = params.set('maxValue', filters.maxValue);
    }

    if (filters?.from) {
      params = params.set('from', filters.from);
    }

    if (filters?.to) {
      params = params.set('to', filters.to);
    }

    if (filters?.description) {
      params = params.set('description', filters.description);
    }

    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }

    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<AccountStatement>(
      `${this.apiUrl}/${accountId}/statement`,
      { params }
    );
  }
}
