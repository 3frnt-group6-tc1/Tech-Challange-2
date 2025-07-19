import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-card',
  imports: [CommonModule],
  templateUrl: './icon-card.component.html',
  styleUrl: './icon-card.component.scss',
})
export class IconCardComponent {
  @Input() class = '';
}
