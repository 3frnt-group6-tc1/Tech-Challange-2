import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { CardService } from '../../shared/services/Card/card.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { Card, CreateCardRequest } from '../../shared/models/card';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss',
})
export class CardsComponent implements OnInit, OnDestroy {
  private cardService = inject(CardService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  cards: Card[] = [];
  loading = false;
  showCreateForm = false;
  selectedCard: Card | null = null;
  flippedCards: Set<string> = new Set();

  cardForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['credit', [Validators.required]],
    number: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    dueDate: ['', [Validators.required]],
    paymentDate: ['', [Validators.required]],
    functions: ['credit,debit,withdraw', [Validators.required]],
  });

  ngOnInit() {
    // Wait for current user to be available before loading cards
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user && user.accountId) {
          this.loadCards();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCards() {
    this.loading = true;
    const accountId = this.authService.getPrimaryAccountId();

    if (!accountId) {
      console.warn(
        'Primary account not loaded yet, waiting for account data...'
      );
      this.loading = false;
      return;
    }

    this.cardService.getCards(accountId).subscribe({
      next: (response) => {
        this.cards = Array.isArray(response.result)
          ? response.result
          : [response.result];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cards:', error);
        this.loading = false;
      },
    });
  }

  onCreateCard() {
    if (this.cardForm.valid) {
      const accountId = this.authService.getPrimaryAccountId();

      if (!accountId) {
        console.warn('Primary account not loaded yet, cannot create card');
        return;
      }

      const cardData: CreateCardRequest = {
        ...this.cardForm.value,
        accountId,
      };

      this.loading = true;
      this.cardService.createCard(cardData).subscribe({
        next: (response) => {
          this.cards.push(response.result as Card);
          this.cardForm.reset();
          this.showCreateForm = false;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating card:', error);
          this.loading = false;
        },
      });
    }
  }

  onToggleBlock(card: Card) {
    if (!card.id) return;

    this.cardService
      .toggleCardBlock(card.id, { is_blocked: !card.is_blocked })
      .subscribe({
        next: (response) => {
          const updatedCard = response.result as Card;
          const index = this.cards.findIndex((c) => c.id === card.id);
          if (index !== -1) {
            this.cards[index] = updatedCard;
          }
        },
        error: (error) => {
          console.error('Error toggling card block:', error);
        },
      });
  }

  onDeleteCard(card: Card) {
    if (!card.id) return;

    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      this.cardService.deleteCard(card.id).subscribe({
        next: () => {
          this.cards = this.cards.filter((c) => c.id !== card.id);
        },
        error: (error) => {
          console.error('Error deleting card:', error);
        },
      });
    }
  }

  flipCard(cardId: string) {
    if (this.flippedCards.has(cardId)) {
      this.flippedCards.delete(cardId);
    } else {
      this.flippedCards.add(cardId);
    }
  }

  isCardFlipped(cardId: string): boolean {
    return this.flippedCards.has(cardId);
  }

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

  trackByCardId(index: number, card: Card): string {
    return card.id || index.toString();
  }
}
