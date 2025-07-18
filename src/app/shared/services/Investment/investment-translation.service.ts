import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { InvestmentService } from './investment.service';
import { InvestmentType, InvestmentCategory } from '../../models/investment';

export interface TranslatedInvestmentData {
  types: Map<string, string>;
  categories: Map<string, string>;
  riskLevels: Map<string, string>;
}

@Injectable({
  providedIn: 'root',
})
export class InvestmentTranslationService {
  private translationDataSubject =
    new BehaviorSubject<TranslatedInvestmentData>({
      types: new Map(),
      categories: new Map(),
      riskLevels: new Map(),
    });

  private translationData$ = this.translationDataSubject.asObservable();
  private isLoaded = false;

  constructor(private investmentService: InvestmentService) {}

  /**
   * Carrega os dados de tradução do endpoint getInvestmentTypes
   */
  loadTranslations(): Observable<TranslatedInvestmentData> {
    if (this.isLoaded) {
      return this.translationData$;
    }

    return this.investmentService.getInvestmentTypes().pipe(
      map((response) => {
        const translationData: TranslatedInvestmentData = {
          types: new Map(),
          categories: new Map(),
          riskLevels: new Map(),
        };

        // Mapear tipos
        if (response.result.types) {
          response.result.types.forEach((type: InvestmentType) => {
            translationData.types.set(type.value, type.label);
          });
        }

        // Mapear categorias
        if (response.result.categories) {
          response.result.categories.forEach((category: InvestmentCategory) => {
            translationData.categories.set(category.value, category.label);
          });
        }

        // Mapear níveis de risco
        if (response.result.riskLevels) {
          response.result.riskLevels.forEach((riskLevel) => {
            translationData.riskLevels.set(riskLevel.value, riskLevel.label);
          });
        }

        this.translationDataSubject.next(translationData);
        this.isLoaded = true;
        return translationData;
      }),
      catchError((error) => {
        console.error('Erro ao carregar traduções de investimento:', error);
        return of(this.translationDataSubject.value);
      })
    );
  }

  /**
   * Traduz um tipo de investimento
   */
  translateType(type: string): Observable<string> {
    return this.getTranslationData().pipe(
      map((data) => data.types.get(type) || type)
    );
  }

  /**
   * Traduz uma categoria de investimento
   */
  translateCategory(category: string): Observable<string> {
    return this.getTranslationData().pipe(
      map((data) => data.categories.get(category) || category)
    );
  }

  /**
   * Traduz um nível de risco
   */
  translateRiskLevel(riskLevel: string): Observable<string> {
    return this.getTranslationData().pipe(
      map((data) => data.riskLevels.get(riskLevel) || riskLevel)
    );
  }

  /**
   * Traduz um tipo de investimento de forma síncrona (se já carregado)
   */
  translateTypeSync(type: string): string {
    return this.translationDataSubject.value.types.get(type) || type;
  }

  /**
   * Traduz uma categoria de investimento de forma síncrona (se já carregado)
   */
  translateCategorySync(category: string): string {
    return (
      this.translationDataSubject.value.categories.get(category) || category
    );
  }

  /**
   * Traduz um nível de risco de forma síncrona (se já carregado)
   */
  translateRiskLevelSync(riskLevel: string): string {
    return (
      this.translationDataSubject.value.riskLevels.get(riskLevel) || riskLevel
    );
  }

  /**
   * Obtém os dados de tradução, carregando-os se necessário
   */
  private getTranslationData(): Observable<TranslatedInvestmentData> {
    if (!this.isLoaded) {
      return this.loadTranslations();
    }
    return this.translationData$;
  }

  /**
   * Obtém todos os tipos traduzidos
   */
  getTranslatedTypes(): Observable<{ value: string; label: string }[]> {
    return this.getTranslationData().pipe(
      map((data) => {
        return Array.from(data.types.entries()).map(([value, label]) => ({
          value,
          label,
        }));
      })
    );
  }

  /**
   * Obtém todas as categorias traduzidas
   */
  getTranslatedCategories(): Observable<{ value: string; label: string }[]> {
    return this.getTranslationData().pipe(
      map((data) => {
        return Array.from(data.categories.entries()).map(([value, label]) => ({
          value,
          label,
        }));
      })
    );
  }

  /**
   * Obtém todos os níveis de risco traduzidos
   */
  getTranslatedRiskLevels(): Observable<{ value: string; label: string }[]> {
    return this.getTranslationData().pipe(
      map((data) => {
        return Array.from(data.riskLevels.entries()).map(([value, label]) => ({
          value,
          label,
        }));
      })
    );
  }

  /**
   * Força o recarregamento das traduções
   */
  reloadTranslations(): Observable<TranslatedInvestmentData> {
    this.isLoaded = false;
    return this.loadTranslations();
  }
}
