import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { InvestmentDashboardComponent } from '../../shared/components/investment-dashboard/investment-dashboard.component';
import { InvestmentSummaryComponent } from '../../shared/components/investment-summary/investment-summary.component';
import { InvestmentChartComponent } from '../../shared/components/investment-chart/investment-chart.component';
import { InvestmentService } from '../../shared/services/Investment/investment.service';
import { InvestmentTranslationService } from '../../shared/services/Investment/investment-translation.service';
import {
  Investment,
  InvestmentSummary,
  InvestmentFilters,
} from '../../shared/models/investment';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    InvestmentDashboardComponent,
    InvestmentSummaryComponent,
    InvestmentChartComponent,
  ],
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.scss'],
})
export class InvestmentsComponent implements OnInit, OnDestroy {
  investments: Investment[] = [];
  investmentSummary: InvestmentSummary | null = null;
  loading = false;
  error: string | null = null;
  showBalance = true; // Controla a visibilidade dos valores em todos os componentes filhos

  private destroy$ = new Subject<void>();

  constructor(
    private investmentService: InvestmentService,
    private translationService: InvestmentTranslationService
  ) {}

  ngOnInit(): void {
    // Carregar traduções primeiro, depois os investimentos
    this.translationService
      .loadTranslations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadInvestments();
        },
        error: (error) => {
          console.error('Erro ao carregar traduções:', error);
          this.error = 'Erro ao carregar traduções. Tente novamente.';
          this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega os investimentos do usuário
   */
  loadInvestments(filters?: InvestmentFilters): void {
    this.loading = true;
    this.error = null;

    this.investmentService.getInvestments(filters).subscribe({
      next: (response) => {
        if (response?.result) {
          this.investments = response.result.investments || [];
          this.investmentSummary = response.result.summary;
        } else {
          this.investments = [];
          this.investmentSummary = null;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar investimentos:', error);
        this.error = 'Erro ao carregar investimentos. Tente novamente.';
        this.loading = false;
      },
    });
  }

  /**
   * Aplica filtros nos investimentos
   */
  onFilterChange(filters: InvestmentFilters): void {
    this.loadInvestments(filters);
  }

  /**
   * Atualiza a lista após uma operação
   */
  onInvestmentUpdate(): void {
    this.loadInvestments();
  }

  /**
   * Alterna a visibilidade dos valores monetários
   */
  toggleBalance(): void {
    this.showBalance = !this.showBalance;
  }
}
