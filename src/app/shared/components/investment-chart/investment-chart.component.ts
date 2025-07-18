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
import { Investment } from '../../models/investment';
import { InvestmentTranslationService } from '../../services/Investment/investment-translation.service';

interface InvestmentCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-investment-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-chart.component.html',
  styleUrls: ['./investment-chart.component.scss'],
})
export class InvestmentChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() investments: Investment[] = [];
  @Input() loading: boolean = false;
  @Input() showBalance: boolean = true;

  categories: InvestmentCategory[] = [];
  totalValue = 0;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(private translationService: InvestmentTranslationService) {}

  ngOnInit(): void {
    // Carregar traduções primeiro
    this.translationService
      .loadTranslations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateChartData(this.investments);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['investments'] || changes['loading']) {
      this.isLoading = this.loading;
      this.updateChartData(this.investments);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateChartData(investments: Investment[]): void {
    if (investments.length === 0) {
      this.categories = [];
      this.totalValue = 0;
      return;
    }

    this.totalValue = investments.reduce((total, inv) => total + inv.value, 0);

    // Agrupar por tipo
    const typeGroups: { [key: string]: number } = {};

    // Palette de cores para serem atribuídas aleatoriamente
    const availableColors = [
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

    investments.forEach((inv) => {
      const translatedType = this.translationService.translateTypeSync(
        inv.type
      );
      if (!typeGroups[translatedType]) {
        typeGroups[translatedType] = 0;
      }
      typeGroups[translatedType] += inv.value;
    });

    this.categories = Object.entries(typeGroups).map(
      ([type, value], index) => ({
        name: type,
        value: value,
        percentage: (value / this.totalValue) * 100,
        color: availableColors[index % availableColors.length], // Cor baseada no índice da categoria
      })
    );
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  // Gera o path do SVG para cada segmento do gráfico pizza
  getSegmentPath(startAngle: number, endAngle: number): string {
    const centerX = 75;
    const centerY = 75;
    const radius = 60;
    const innerRadius = 30; // Para criar o buraco no meio

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(startAngle);
    const y4 = centerY + innerRadius * Math.sin(startAngle);

    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';

    return [
      'M',
      x1,
      y1,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      1,
      x2,
      y2,
      'L',
      x3,
      y3,
      'A',
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      0,
      x4,
      y4,
      'Z',
    ].join(' ');
  }

  // Calcula os ângulos para cada segmento
  getSegmentData() {
    let currentAngle = -Math.PI / 2; // Começar no topo

    return this.categories.map((category) => {
      const startAngle = currentAngle;
      const segmentAngle = (category.percentage / 100) * 2 * Math.PI;
      const endAngle = currentAngle + segmentAngle;
      currentAngle = endAngle;

      return {
        ...category,
        path: this.getSegmentPath(startAngle, endAngle),
      };
    });
  }
}
