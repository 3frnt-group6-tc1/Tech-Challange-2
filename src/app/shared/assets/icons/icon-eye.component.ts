import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-eye',
  imports: [CommonModule],
  templateUrl: './icon-eye.component.html',
  styleUrl: './icon-eye.component.scss',
})
export class IconEyeComponent {
  @Input() class: string = '';
}
