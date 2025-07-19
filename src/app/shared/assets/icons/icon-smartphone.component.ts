import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-smartphone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-smartphone.component.html',
  styleUrl: './icon-smartphone.component.scss',
})
export class IconSmartphoneComponent {
  @Input() class = '';
}
