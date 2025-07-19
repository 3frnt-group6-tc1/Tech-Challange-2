import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-arrow-right',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-arrow-right.component.html',
  styleUrl: './icon-arrow-right.component.scss',
})
export class IconArrowRightComponent {
  @Input() class = '';
}
