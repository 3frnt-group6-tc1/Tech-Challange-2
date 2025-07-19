import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-shield',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-shield.component.html',
  styleUrl: './icon-shield.component.scss',
})
export class IconShieldComponent {
  @Input() class = '';
}
