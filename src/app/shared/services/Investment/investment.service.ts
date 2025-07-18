import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Investment,
  InvestmentResponse,
  InvestmentTypesResponse,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  TransferToInvestmentRequest,
  RedeemInvestmentRequest,
  InvestmentFilters,
} from '../../models/investment';
import { apiConfig } from '../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class InvestmentService {
  private apiUrl = apiConfig.baseUrl + apiConfig.investmentsEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os investimentos do usuário autenticado
   * GET /investments
   */
  getInvestments(filters?: InvestmentFilters): Observable<InvestmentResponse> {
    let params = new HttpParams();

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    if (filters?.name) {
      params = params.set('name', filters.name);
    }

    if (filters?.isMatured !== undefined) {
      params = params.set('isMatured', filters.isMatured.toString());
    }

    return this.http.get<InvestmentResponse>(this.apiUrl, { params });
  }

  /**
   * Busca tipos e categorias de investimentos disponíveis
   * GET /investments/types
   */
  getInvestmentTypes(): Observable<InvestmentTypesResponse> {
    return this.http.get<InvestmentTypesResponse>(`${this.apiUrl}/types`);
  }

  /**
   * Busca um investimento específico por ID
   * GET /investments/{id}
   */
  getInvestmentById(
    id: string
  ): Observable<{ message: string; result: Investment }> {
    return this.http.get<{ message: string; result: Investment }>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Cria um novo investimento
   * POST /investments
   */
  createInvestment(
    investment: CreateInvestmentRequest
  ): Observable<{ message: string; result: Investment }> {
    return this.http.post<{ message: string; result: Investment }>(
      this.apiUrl,
      investment
    );
  }

  /**
   * Atualiza um investimento existente
   * PUT /investments/{id}
   */
  updateInvestment(
    id: string,
    investment: UpdateInvestmentRequest
  ): Observable<{ message: string; result: Investment }> {
    return this.http.put<{ message: string; result: Investment }>(
      `${this.apiUrl}/${id}`,
      investment
    );
  }

  /**
   * Remove um investimento
   * DELETE /investments/{id}
   */
  deleteInvestment(id: string): Observable<{
    message: string;
    result: { id: string; name: string; value: number };
  }> {
    return this.http.delete<{
      message: string;
      result: { id: string; name: string; value: number };
    }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Transfere dinheiro da conta para um investimento
   * POST /investments/transfer
   */
  transferToInvestment(transfer: TransferToInvestmentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, transfer);
  }

  /**
   * Realiza resgate de um investimento (parcial ou total)
   * POST /investments/redeem
   */
  redeemInvestment(redeem: RedeemInvestmentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/redeem`, redeem);
  }
}
