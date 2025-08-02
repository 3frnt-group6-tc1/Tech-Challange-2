import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-icon-bar-chart',
  templateUrl: './icon-bar-chart.component.html',
  styleUrls: ['./icon-bar-chart.component.scss'],
})
export class IconBarChartComponent {
  @Input() class: string = '';
  @Input() width: string = '1em';
  @Input() height: string = '1em';
}
