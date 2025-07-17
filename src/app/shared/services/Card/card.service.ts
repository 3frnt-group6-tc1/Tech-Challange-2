import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Card,
  CardResponse,
  CreateCardRequest,
  UpdateCardRequest,
  ToggleBlockRequest,
} from '../../models/card';
import { apiConfig } from '../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private apiUrl = apiConfig.baseUrl + apiConfig.cardsEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * Cria um novo cartão
   */
  createCard(cardData: CreateCardRequest): Observable<CardResponse> {
    return this.http.post<CardResponse>(this.apiUrl, cardData);
  }

  /**
   * Lista todos os cartões ou filtra por conta
   */
  getCards(accountId?: string): Observable<CardResponse> {
    let params = new HttpParams();
    if (accountId) {
      params = params.set('accountId', accountId);
    }
    return this.http.get<CardResponse>(this.apiUrl, { params });
  }

  /**
   * Busca um cartão específico por ID
   */
  getCardById(cardId: string): Observable<CardResponse> {
    return this.http.get<CardResponse>(`${this.apiUrl}/${cardId}`);
  }

  /**
   * Atualiza um cartão existente
   */
  updateCard(
    cardId: string,
    cardData: UpdateCardRequest
  ): Observable<CardResponse> {
    return this.http.put<CardResponse>(`${this.apiUrl}/${cardId}`, cardData);
  }

  /**
   * Exclui um cartão existente
   */
  deleteCard(cardId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${cardId}`);
  }

  /**
   * Bloqueia ou desbloqueia um cartão
   */
  toggleCardBlock(
    cardId: string,
    blockData: ToggleBlockRequest
  ): Observable<CardResponse> {
    return this.http.patch<CardResponse>(
      `${this.apiUrl}/${cardId}/toggle-block`,
      blockData
    );
  }
}
