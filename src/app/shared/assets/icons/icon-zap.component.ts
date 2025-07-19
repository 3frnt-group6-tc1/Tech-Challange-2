import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-zap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-zap.component.html',
  styleUrl: './icon-zap.component.scss',
})
export class IconZapComponent {
  @Input() class = '';
}
