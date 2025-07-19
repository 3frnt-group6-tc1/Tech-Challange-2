import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-success',
  imports: [CommonModule],
  templateUrl: './icon-success.component.html',
  styleUrl: './icon-success.component.scss',
})
export class IconSuccessComponent {
  @Input() class: string = '';
}
