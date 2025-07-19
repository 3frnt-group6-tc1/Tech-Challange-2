import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-loading',
  imports: [CommonModule],
  templateUrl: './icon-loading.component.html',
  styleUrl: './icon-loading.component.scss',
})
export class IconLoadingComponent {
  @Input() class: string = '';
}
