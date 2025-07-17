import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card';

@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-container" [class.flipped]="isFlipped">
      <!-- Front of Card -->
      <div
        class="card-face card-front bg-gradient-to-br {{
          getCardGradient(card.type)
        }} text-white rounded-2xl shadow-2xl p-6 h-56 relative overflow-hidden"
      >
        <!-- Card Brand -->
        <div class="flex justify-between items-start mb-8">
          <div class="text-lg font-bold">
            {{ card.type === 'credit' ? 'CRÉDITO' : 'DÉBITO' }}
          </div>
          <div class="text-right">
            <div class="text-xs opacity-75">
              {{ getCardBrand(card.number).toUpperCase() }}
            </div>
            <div
              *ngIf="card.is_blocked"
              class="text-xs bg-red-500 px-2 py-1 rounded mt-1 status-blocked"
            >
              BLOQUEADO
            </div>
          </div>
        </div>

        <!-- Card Chip -->
        <div class="chip w-12 h-8 mb-4"></div>

        <!-- Card Number -->
        <div class="text-xl font-mono tracking-wider mb-6">
          {{ formatCardNumber(card.number) }}
        </div>

        <!-- Card Holder and Expiry -->
        <div class="flex justify-between items-end">
          <div>
            <div class="text-xs opacity-75 mb-1">PORTADOR</div>
            <div class="font-semibold text-sm uppercase">{{ card.name }}</div>
          </div>
          <div class="text-right">
            <div class="text-xs opacity-75 mb-1">VÁLIDO ATÉ</div>
            <div class="font-mono text-sm">
              {{ formatExpiryDate(card.dueDate) }}
            </div>
          </div>
        </div>

        <!-- Decorative Elements -->
        <div
          class="absolute top-4 right-4 w-12 h-8 bg-white bg-opacity-20 rounded"
        ></div>
        <div
          class="absolute bottom-4 right-4 w-8 h-8 bg-white bg-opacity-10 rounded-full"
        ></div>
        <div
          class="absolute top-1/2 right-8 w-6 h-6 bg-white bg-opacity-10 rounded-full"
        ></div>
      </div>

      <!-- Back of Card -->
      <div
        class="card-face card-back bg-gradient-to-br {{
          getCardGradient(card.type)
        }} text-white rounded-2xl shadow-2xl p-6 h-56 relative overflow-hidden"
      >
        <!-- Magnetic Stripe -->
        <div class="magnetic-stripe w-full h-12 mb-6 rounded"></div>

        <!-- Signature Strip -->
        <div class="bg-white h-8 mb-4 relative">
          <div class="absolute right-2 top-1 text-black text-xs font-mono">
            {{ card.cvc }}
          </div>
        </div>

        <!-- Card Info -->
        <div class="space-y-2 text-xs">
          <div><strong>Funções:</strong> {{ card.functions }}</div>
          <div>
            <strong>Vencimento:</strong> {{ formatExpiryDate(card.dueDate) }}
          </div>
          <div>
            <strong>Pagamento:</strong> {{ formatExpiryDate(card.paymentDate) }}
          </div>
        </div>

        <!-- Bank Info -->
        <div class="absolute bottom-4 left-6 text-xs opacity-75">TECH BANK</div>

        <!-- Security Features -->
        <div class="absolute bottom-4 right-6 text-xs opacity-75">
          <div>VISA</div>
          <div class="text-[8px]">ELECTRON</div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./card-display.component.scss'],
})
export class CardDisplayComponent {
  @Input() card!: Card;
  @Input() isFlipped = false;
  @Output() flip = new EventEmitter<void>();

  formatCardNumber(number: string): string {
    return number.replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiryDate(date: string): string {
    const dateObj = new Date(date);
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }

  getCardBrand(number: string): string {
    const firstDigit = number.charAt(0);
    const firstTwoDigits = number.substring(0, 2);

    if (firstDigit === '4') return 'visa';
    if (firstTwoDigits >= '51' && firstTwoDigits <= '55') return 'mastercard';
    if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'amex';

    return 'generic';
  }

  getCardGradient(type: string): string {
    return type === 'credit'
      ? 'from-blue-600 via-purple-600 to-indigo-700'
      : 'from-green-600 via-teal-600 to-emerald-700';
  }

  onFlip() {
    this.flip.emit();
  }
}
