import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pie-chart.component.html',
})
export class PieChartComponent {
  @Input() totalEntries: number = 0;
  @Input() totalExits: number = 0;

  get totalTransactions(): number {
    return this.totalEntries + this.totalExits;
  }

  get entriesPercentage(): number {
    return this.totalTransactions > 0 ? (this.totalEntries / this.totalTransactions) * 100 : 0;
  }

  get exitsPercentage(): number {
    return this.totalTransactions > 0 ? (this.totalExits / this.totalTransactions) * 100 : 0;
  }

  get entriesPath(): string {
    if (this.totalTransactions === 0) return '';

    const percentage = this.entriesPercentage / 100;
    return this.createPath(0, percentage);
  }

  get exitsPath(): string {
    if (this.totalTransactions === 0) return '';

    const entriesPerc = this.entriesPercentage / 100;
    const exitsPerc = this.exitsPercentage / 100;
    return this.createPath(entriesPerc, entriesPerc + exitsPerc);
  }

  private createPath(startPercentage: number, endPercentage: number): string {
    const radius = 45;
    const centerX = 50;
    const centerY = 50;

    const startAngle = startPercentage * 2 * Math.PI - Math.PI / 2;
    const endAngle = endPercentage * 2 * Math.PI - Math.PI / 2;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = endPercentage - startPercentage > 0.5 ? 1 : 0;

    if (endPercentage - startPercentage === 1) {
      return `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX - 0.01} ${centerY - radius} Z`;
    }

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}