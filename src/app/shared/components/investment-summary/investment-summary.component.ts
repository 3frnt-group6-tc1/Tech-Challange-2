import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Investment,
  InvestmentSummary as ApiInvestmentSummary,
} from '../../models/investment';
import { InvestmentTranslationService } from '../../services/Investment/investment-translation.service';

interface InvestmentCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface DisplayInvestmentSummary {
  totalValue: number;
  totalProfit: number;
  profitPercentage: number;
  categories: InvestmentCategory[];
}

@Component({
  selector: 'app-investment-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-summary.component.html',
  styleUrls: ['./investment-summary.component.scss'],
})
export class InvestmentSummaryComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() investments: Investment[] = [];
  @Input() investmentSummary: ApiInvestmentSummary | null = null;
  @Input() loading: boolean = false;
  @Input() showBalance: boolean = true;

  displaySummary: DisplayInvestmentSummary = {
    totalValue: 0,
    totalProfit: 0,
    profitPercentage: 0,
    categories: [],
  };

  // Palette de cores para serem atribuídas por índice
  private availableColors = [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#8B5CF6', // purple-500
    '#F59E0B', // yellow-500
    '#EF4444', // red-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#6366F1', // indigo-500
    '#14B8A6', // teal-500
    '#A855F7', // violet-500
  ];

  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(private translationService: InvestmentTranslationService) {}

  ngOnInit(): void {
    // Carregar traduções primeiro
    this.translationService
      .loadTranslations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateDisplaySummary();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['investments'] ||
      changes['investmentSummary'] ||
      changes['loading']
    ) {
      this.isLoading = this.loading;
      this.updateDisplaySummary();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Atualiza o resumo baseado nos dados atuais
   */
  private updateDisplaySummary(): void {
    if (this.investmentSummary) {
      this.updateSummaryFromApi(this.investmentSummary);
    } else if (this.investments && this.investments.length > 0) {
      this.updateSummaryFromInvestments(this.investments);
    } else {
      this.resetSummary();
    }

    // Validar se as percentagens estão corretas
    const totalPercentage = this.displaySummary.categories.reduce(
      (sum, cat) => sum + cat.percentage,
      0
    );
  }

  /**
   * Atualiza o resumo baseado nos dados da API
   */
  private updateSummaryFromApi(summary: ApiInvestmentSummary): void {
    this.displaySummary = {
      totalValue: summary.totalValue,
      totalProfit: summary.totalProfit,
      profitPercentage:
        summary.totalValue > 0
          ? (summary.totalProfit / summary.totalValue) * 100
          : 0,
      categories: this.generateCategoriesFromInvestments(
        this.investments,
        summary.totalValue
      ),
    };
  }

  /**
   * Atualiza o resumo calculando a partir dos investimentos
   */
  private updateSummaryFromInvestments(investments: Investment[]): void {
    if (!investments || investments.length === 0) {
      this.resetSummary();
      return;
    }

    // Filtrar investimentos válidos (com valor definido)
    const validInvestments = investments.filter(
      (inv) => inv && typeof inv.value === 'number' && inv.value > 0
    );

    if (validInvestments.length === 0) {
      this.resetSummary();
      return;
    }

    const totalValue = validInvestments.reduce(
      (total: number, inv: Investment) => total + (inv.value || 0),
      0
    );

    // Calcula lucro total baseado nos dados disponíveis
    const totalProfit = validInvestments.reduce(
      (total: number, inv: Investment) => total + (inv.profit || 0),
      0
    );

    this.displaySummary = {
      totalValue,
      totalProfit,
      profitPercentage: totalValue > 0 ? (totalProfit / totalValue) * 100 : 0,
      categories: this.generateCategoriesFromInvestments(
        validInvestments,
        totalValue
      ),
    };
  }

  /**
   * Gera categorias dinamicamente baseadas nos tipos de investimentos
   */
  private generateCategoriesFromInvestments(
    investments: Investment[],
    totalValue: number
  ): InvestmentCategory[] {
    if (!investments || investments.length === 0 || totalValue <= 0) {
      return [];
    }

    // Agrupar por categoria
    const categoryGroups: { [key: string]: number } = {};

    investments.forEach((inv) => {
      const categoryName =
        this.translationService.translateCategorySync(inv.category) || 'Outros';
      if (!categoryGroups[categoryName]) {
        categoryGroups[categoryName] = 0;
      }
      categoryGroups[categoryName] += inv.value || 0;
    });

    // Converter para array de categorias com cores por índice
    const categories = Object.entries(categoryGroups).map(
      ([category, value], index) => {
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

        return {
          name: category,
          value: value,
          percentage: Math.round(percentage * 100) / 100, // Arredondar para 2 casas decimais
          color: this.availableColors[index % this.availableColors.length],
        };
      }
    );

    // Ordenar por valor decrescente para melhor visualização
    return categories.sort((a, b) => b.value - a.value);
  }

  /**
   * Reseta o resumo para valores iniciais
   */
  private resetSummary(): void {
    this.displaySummary = {
      totalValue: 0,
      totalProfit: 0,
      profitPercentage: 0,
      categories: [],
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  }

  /**
   * Obtém a classe CSS para exibição do lucro
   */
  getProfitClass(): string {
    if (this.displaySummary.totalProfit > 0) {
      return 'text-green-600';
    } else if (this.displaySummary.totalProfit < 0) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  }

  /**
   * Obtém o ícone para exibição do lucro
   */
  getProfitIcon(): string {
    if (this.displaySummary.totalProfit > 0) {
      return '↗';
    } else if (this.displaySummary.totalProfit < 0) {
      return '↘';
    }
    return '→';
  }
}
