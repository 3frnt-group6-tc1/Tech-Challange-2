import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-error',
  imports: [CommonModule],
  templateUrl: './icon-error.component.html',
  styleUrl: './icon-error.component.scss',
})
export class IconErrorComponent {
  @Input() class: string = '';
}
