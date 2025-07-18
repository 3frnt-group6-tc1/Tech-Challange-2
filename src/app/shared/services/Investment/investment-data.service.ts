import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Investment, InvestmentSummary } from '../../models/investment';

@Injectable({
  providedIn: 'root',
})
export class InvestmentDataService {
  private investmentsSubject = new BehaviorSubject<Investment[]>([]);
  private summarySubject = new BehaviorSubject<InvestmentSummary | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public investments$ = this.investmentsSubject.asObservable();
  public summary$ = this.summarySubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Atualiza os dados de investimentos
   */
  updateInvestments(investments: Investment[]): void {
    this.investmentsSubject.next(investments);
  }

  /**
   * Atualiza o resumo dos investimentos
   */
  updateSummary(summary: InvestmentSummary): void {
    this.summarySubject.next(summary);
  }

  /**
   * Atualiza o estado de loading
   */
  updateLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Obtém os investimentos atuais
   */
  getCurrentInvestments(): Investment[] {
    return this.investmentsSubject.value;
  }

  /**
   * Obtém o resumo atual
   */
  getCurrentSummary(): InvestmentSummary | null {
    return this.summarySubject.value;
  }

  /**
   * Limpa os dados
   */
  clearData(): void {
    this.investmentsSubject.next([]);
    this.summarySubject.next(null);
    this.loadingSubject.next(false);
  }
}
