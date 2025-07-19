import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-heart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-heart.component.html',
  styleUrl: './icon-heart.component.scss',
})
export class IconHeartComponent {
  @Input() class = '';
}
