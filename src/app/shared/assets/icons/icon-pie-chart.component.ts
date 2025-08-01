import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-icon-pie-chart',
  templateUrl: './icon-pie-chart.component.html',
  styleUrls: ['./icon-pie-chart.component.scss'],
})
export class IconPieChartComponent {
  @Input() class: string = '';
  @Input() width: string = '1em';
  @Input() height: string = '1em';
}
