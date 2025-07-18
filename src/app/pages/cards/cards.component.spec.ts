import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CardsComponent } from './cards.component';
import { CardService } from '../../shared/services/Card/card.service';
import { AuthService, AuthUser } from '../../shared/services/Auth/auth.service';
import {
  Card,
  CardResponse,
  CreateCardRequest,
} from '../../shared/models/card';
import { Account } from '../../shared/models/account';

describe('CardsComponent', () => {
  let component: CardsComponent;
  let fixture: ComponentFixture<CardsComponent>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let mockCurrentUserSubject: BehaviorSubject<AuthUser | null>;

  const mockAuthUser: AuthUser = {
    id: 'user1',
    email: 'test@test.com',
    username: 'testuser',
    name: 'Test User',
    accountId: '1',
  };

  const mockCard: Card = {
    id: '1',
    accountId: '1',
    type: 'credit',
    is_blocked: false,
    number: '1234567890123456',
    dueDate: '2025-12-01',
    functions: 'credit,debit,withdraw',
    cvc: '123',
    paymentDate: '2025-01-15',
    name: 'Test Card',
  };

  const mockCardResponse: CardResponse = {
    message: 'Success',
    result: [mockCard],
  };

  beforeEach(async () => {
    mockCurrentUserSubject = new BehaviorSubject<AuthUser | null>(null);

    const cardSpy = jasmine.createSpyObj('CardService', [
      'getCards',
      'createCard',
      'toggleCardBlock',
      'deleteCard',
    ]);

    const authSpy = jasmine.createSpyObj(
      'AuthService',
      ['getPrimaryAccountId'],
      {
        currentUser$: mockCurrentUserSubject.asObservable(),
      }
    );

    await TestBed.configureTestingModule({
      imports: [
        CardsComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        FormBuilder,
        { provide: CardService, useValue: cardSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardsComponent);
    component = fixture.componentInstance;
    cardServiceSpy = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.cards).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.showCreateForm).toBe(false);
    expect(component.selectedCard).toBe(null);
    expect(component.flippedCards.size).toBe(0);
    expect(component.cardForm).toBeDefined();
  });

  it('should initialize card form with correct validators', () => {
    const form = component.cardForm;

    expect(form.get('name')?.hasError('required')).toBe(true);
    expect(form.get('type')?.value).toBe('credit');
    expect(form.get('number')?.hasError('required')).toBe(true);
    expect(form.get('cvc')?.hasError('required')).toBe(true);
    expect(form.get('dueDate')?.hasError('required')).toBe(true);
    expect(form.get('paymentDate')?.hasError('required')).toBe(true);
    expect(form.get('functions')?.value).toBe('credit,debit,withdraw');
  });

  it('should load cards when primary account is available', () => {
    authServiceSpy.getPrimaryAccountId.and.returnValue('1');
    cardServiceSpy.getCards.and.returnValue(of(mockCardResponse));

    mockCurrentUserSubject.next(mockAuthUser);
    fixture.detectChanges();

    expect(cardServiceSpy.getCards).toHaveBeenCalledWith('1');
    expect(component.cards).toEqual([mockCard]);
    expect(component.loading).toBe(false);
  });

  it('should handle cards response with single card result', () => {
    const singleCardResponse: CardResponse = {
      message: 'Success',
      result: mockCard,
    };

    authServiceSpy.getPrimaryAccountId.and.returnValue('1');
    cardServiceSpy.getCards.and.returnValue(of(singleCardResponse));

    mockCurrentUserSubject.next(mockAuthUser);
    fixture.detectChanges();

    expect(component.cards).toEqual([mockCard]);
  });

  it('should handle error when loading cards', () => {
    authServiceSpy.getPrimaryAccountId.and.returnValue('1');
    cardServiceSpy.getCards.and.returnValue(throwError('Error loading cards'));
    spyOn(console, 'error');

    mockCurrentUserSubject.next(mockAuthUser);
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      'Error loading cards:',
      'Error loading cards'
    );
  });

  it('should not load cards when no primary account is available', () => {
    authServiceSpy.getPrimaryAccountId.and.returnValue(null);
    spyOn(console, 'warn');

    component.loadCards();

    expect(cardServiceSpy.getCards).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      'Primary account not loaded yet, waiting for account data...'
    );
  });

  it('should create card successfully', () => {
    const createCardResponse: CardResponse = {
      message: 'Card created',
      result: mockCard,
    };

    authServiceSpy.getPrimaryAccountId.and.returnValue('1');
    cardServiceSpy.createCard.and.returnValue(of(createCardResponse));

    // Fill form with valid data
    component.cardForm.patchValue({
      name: 'Test Card',
      type: 'credit',
      number: '1234567890123456',
      cvc: '123',
      dueDate: '2025-12-01',
      paymentDate: '2025-01-15',
      functions: 'credit,debit,withdraw',
    });

    component.onCreateCard();

    const expectedCardData: CreateCardRequest = {
      name: 'Test Card',
      type: 'credit',
      number: '1234567890123456',
      cvc: '123',
      dueDate: '2025-12-01',
      paymentDate: '2025-01-15',
      functions: 'credit,debit,withdraw',
      accountId: '1',
    };

    expect(cardServiceSpy.createCard).toHaveBeenCalledWith(expectedCardData);
    expect(component.cards).toContain(mockCard);
    expect(component.showCreateForm).toBe(false);
    expect(component.loading).toBe(false);
  });

  it('should not create card when form is invalid', () => {
    component.onCreateCard();

    expect(cardServiceSpy.createCard).not.toHaveBeenCalled();
  });

  it('should not create card when no primary account is available', () => {
    authServiceSpy.getPrimaryAccountId.and.returnValue(null);
    spyOn(console, 'warn');

    // Fill form with valid data
    component.cardForm.patchValue({
      name: 'Test Card',
      type: 'credit',
      number: '1234567890123456',
      cvc: '123',
      dueDate: '2025-12-01',
      paymentDate: '2025-01-15',
      functions: 'credit,debit,withdraw',
    });

    component.onCreateCard();

    expect(cardServiceSpy.createCard).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      'Primary account not loaded yet, cannot create card'
    );
  });

  it('should handle error when creating card', () => {
    authServiceSpy.getPrimaryAccountId.and.returnValue('1');
    cardServiceSpy.createCard.and.returnValue(
      throwError('Error creating card')
    );
    spyOn(console, 'error');

    // Fill form with valid data
    component.cardForm.patchValue({
      name: 'Test Card',
      type: 'credit',
      number: '1234567890123456',
      cvc: '123',
      dueDate: '2025-12-01',
      paymentDate: '2025-01-15',
      functions: 'credit,debit,withdraw',
    });

    component.onCreateCard();

    expect(component.loading).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      'Error creating card:',
      'Error creating card'
    );
  });

  it('should toggle card block status', () => {
    const blockedCard = { ...mockCard, is_blocked: true };
    const updateResponse: CardResponse = {
      message: 'Card updated',
      result: blockedCard,
    };

    component.cards = [mockCard];
    cardServiceSpy.toggleCardBlock.and.returnValue(of(updateResponse));

    component.onToggleBlock(mockCard);

    expect(cardServiceSpy.toggleCardBlock).toHaveBeenCalledWith('1', {
      is_blocked: true,
    });
    expect(component.cards[0]).toEqual(blockedCard);
  });

  it('should not toggle block for card without id', () => {
    const cardWithoutId = { ...mockCard, id: undefined };

    component.onToggleBlock(cardWithoutId);

    expect(cardServiceSpy.toggleCardBlock).not.toHaveBeenCalled();
  });

  it('should handle error when toggling card block', () => {
    component.cards = [mockCard];
    cardServiceSpy.toggleCardBlock.and.returnValue(
      throwError('Error toggling block')
    );
    spyOn(console, 'error');

    component.onToggleBlock(mockCard);

    expect(console.error).toHaveBeenCalledWith(
      'Error toggling card block:',
      'Error toggling block'
    );
  });

  it('should delete card after confirmation', () => {
    component.cards = [mockCard];
    cardServiceSpy.deleteCard.and.returnValue(
      of({ message: 'Card deleted', result: mockCard })
    );
    spyOn(window, 'confirm').and.returnValue(true);

    component.onDeleteCard(mockCard);

    expect(window.confirm).toHaveBeenCalledWith(
      'Tem certeza que deseja excluir este cartão?'
    );
    expect(cardServiceSpy.deleteCard).toHaveBeenCalledWith('1');
    expect(component.cards).toEqual([]);
  });

  it('should not delete card when confirmation is cancelled', () => {
    component.cards = [mockCard];
    spyOn(window, 'confirm').and.returnValue(false);

    component.onDeleteCard(mockCard);

    expect(cardServiceSpy.deleteCard).not.toHaveBeenCalled();
    expect(component.cards).toEqual([mockCard]);
  });

  it('should not delete card without id', () => {
    const cardWithoutId = { ...mockCard, id: undefined };

    component.onDeleteCard(cardWithoutId);

    expect(cardServiceSpy.deleteCard).not.toHaveBeenCalled();
  });

  it('should handle error when deleting card', () => {
    component.cards = [mockCard];
    cardServiceSpy.deleteCard.and.returnValue(
      throwError('Error deleting card')
    );
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(console, 'error');

    component.onDeleteCard(mockCard);

    expect(console.error).toHaveBeenCalledWith(
      'Error deleting card:',
      'Error deleting card'
    );
  });

  it('should flip card', () => {
    expect(component.isCardFlipped('1')).toBe(false);

    component.flipCard('1');
    expect(component.isCardFlipped('1')).toBe(true);

    component.flipCard('1');
    expect(component.isCardFlipped('1')).toBe(false);
  });

  it('should format card number correctly', () => {
    const result = component.formatCardNumber('1234567890123456');
    expect(result).toBe('1234 5678 9012 3456');
  });

  it('should format expiry date correctly', () => {
    const result = component.formatExpiryDate('2025-11-15');
    expect(result).toBe('11/25');
  });

  describe('getCardBrand', () => {
    it('should return visa for cards starting with 4', () => {
      expect(component.getCardBrand('4111111111111111')).toBe('visa');
    });

    it('should return mastercard for cards starting with 51-55', () => {
      expect(component.getCardBrand('5111111111111111')).toBe('mastercard');
      expect(component.getCardBrand('5511111111111111')).toBe('mastercard');
    });

    it('should return amex for cards starting with 34 or 37', () => {
      expect(component.getCardBrand('341111111111111')).toBe('amex');
      expect(component.getCardBrand('371111111111111')).toBe('amex');
    });

    it('should return generic for unknown card types', () => {
      expect(component.getCardBrand('6111111111111111')).toBe('generic');
    });
  });

  it('should return correct gradient for card types', () => {
    expect(component.getCardGradient('credit')).toBe(
      'from-blue-600 via-purple-600 to-indigo-700'
    );
    expect(component.getCardGradient('debit')).toBe(
      'from-green-600 via-teal-600 to-emerald-700'
    );
  });

  it('should track cards by id', () => {
    expect(component.trackByCardId(0, mockCard)).toBe('1');

    const cardWithoutId = { ...mockCard, id: undefined };
    expect(component.trackByCardId(5, cardWithoutId)).toBe('5');
  });

  it('should validate card number pattern', () => {
    const numberControl = component.cardForm.get('number');

    numberControl?.setValue('123');
    expect(numberControl?.hasError('pattern')).toBe(true);

    numberControl?.setValue('1234567890123456');
    expect(numberControl?.hasError('pattern')).toBe(false);
  });

  it('should validate cvc pattern', () => {
    const cvcControl = component.cardForm.get('cvc');

    cvcControl?.setValue('12');
    expect(cvcControl?.hasError('pattern')).toBe(true);

    cvcControl?.setValue('123');
    expect(cvcControl?.hasError('pattern')).toBe(false);

    cvcControl?.setValue('1234');
    expect(cvcControl?.hasError('pattern')).toBe(false);
  });

  it('should validate name minimum length', () => {
    const nameControl = component.cardForm.get('name');

    nameControl?.setValue('A');
    expect(nameControl?.hasError('minlength')).toBe(true);

    nameControl?.setValue('AB');
    expect(nameControl?.hasError('minlength')).toBe(false);
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
