import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CardService } from './card.service';
import {
  Card,
  CardResponse,
  CreateCardRequest,
  UpdateCardRequest,
  ToggleBlockRequest,
} from '../../models/card';
import { apiConfig } from '../../../app.config';

describe('CardService', () => {
  let service: CardService;
  let httpMock: HttpTestingController;

  const mockCard: Card = {
    id: 'card123',
    accountId: 'acc123',
    type: 'credit',
    is_blocked: false,
    number: '1234567890123456',
    dueDate: '2025-12-31',
    functions: 'contactless',
    cvc: '123',
    paymentDate: '2025-01-15',
    name: 'Test Card',
  };

  const mockCardResponse: CardResponse = {
    message: 'Success',
    result: mockCard,
  };

  const mockCardsResponse: CardResponse = {
    message: 'Success',
    result: [mockCard],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CardService],
    });

    service = TestBed.inject(CardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCard', () => {
    it('should create a new card', () => {
      const createRequest: CreateCardRequest = {
        accountId: 'acc123',
        type: 'credit',
        number: '1234567890123456',
        dueDate: '2025-12-31',
        functions: 'contactless',
        cvc: '123',
        paymentDate: '2025-01-15',
        name: 'Test Card',
      };

      service.createCard(createRequest).subscribe((response) => {
        expect(response).toEqual(mockCardResponse);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockCardResponse);
    });

    it('should handle create card error', () => {
      const createRequest: CreateCardRequest = {
        accountId: 'acc123',
        type: 'credit',
        number: '1234567890123456',
        dueDate: '2025-12-31',
        functions: 'contactless',
        cvc: '123',
        paymentDate: '2025-01-15',
        name: 'Test Card',
      };

      const errorResponse = { status: 400, statusText: 'Bad Request' };

      service.createCard(createRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}`
      );
      req.flush('Bad Request', errorResponse);
    });
  });

  describe('getCards', () => {
    it('should get all cards when no accountId is provided', () => {
      service.getCards().subscribe((response) => {
        expect(response).toEqual(mockCardsResponse);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockCardsResponse);
    });

    it('should get cards filtered by accountId', () => {
      const accountId = 'acc123';

      service.getCards(accountId).subscribe((response) => {
        expect(response).toEqual(mockCardsResponse);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}?accountId=${accountId}`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('accountId')).toBe(accountId);
      req.flush(mockCardsResponse);
    });

    it('should handle get cards error', () => {
      const errorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
      };

      service.getCards().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}`
      );
      req.flush('Internal Server Error', errorResponse);
    });
  });

  describe('getCardById', () => {
    it('should get a specific card by ID', () => {
      const cardId = 'card123';

      service.getCardById(cardId).subscribe((response) => {
        expect(response).toEqual(mockCardResponse);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}/${cardId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCardResponse);
    });

    it('should handle get card by ID error', () => {
      const cardId = 'nonexistent';
      const errorResponse = { status: 404, statusText: 'Not Found' };

      service.getCardById(cardId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}/${cardId}`
      );
      req.flush('Not Found', errorResponse);
    });
  });

  describe('updateCard', () => {
    it('should update a card', () => {
      const cardId = 'card123';
      const updateRequest: UpdateCardRequest = {
        name: 'Updated Card Name',
        is_blocked: true,
      };

      const updatedCardResponse: CardResponse = {
        message: 'Success',
        result: { ...mockCard, ...updateRequest },
      };

      service.updateCard(cardId, updateRequest).subscribe((response) => {
        expect(response).toEqual(updatedCardResponse);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}/${cardId}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(updatedCardResponse);
    });

    it('should handle update card error', () => {
      const cardId = 'card123';
      const updateRequest: UpdateCardRequest = {
        name: 'Updated Card Name',
      };
      const errorResponse = { status: 400, statusText: 'Bad Request' };

      service.updateCard(cardId, updateRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}/${cardId}`
      );
      req.flush('Bad Request', errorResponse);
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', () => {
      const cardId = 'card123';
      const deleteResponse = { message: 'Card deleted successfully' };

      service.deleteCard(cardId).subscribe((response) => {
        expect(response).toEqual(deleteResponse);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}/${cardId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(deleteResponse);
    });

    it('should handle delete card error', () => {
      const cardId = 'card123';
      const errorResponse = { status: 404, statusText: 'Not Found' };

      service.deleteCard(cardId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}/${cardId}`
      );
      req.flush('Not Found', errorResponse);
    });
  });

  describe('toggleCardBlock', () => {
    it('should toggle card block status', () => {
      const cardId = 'card123';
      const blockRequest: ToggleBlockRequest = {
        is_blocked: true,
      };

      const blockedCardResponse: CardResponse = {
        message: 'Success',
        result: { ...mockCard, is_blocked: true },
      };

      service.toggleCardBlock(cardId, blockRequest).subscribe((response) => {
        expect(response).toEqual(blockedCardResponse);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}/${cardId}/toggle-block`
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(blockRequest);
      req.flush(blockedCardResponse);
    });

    it('should unblock a card', () => {
      const cardId = 'card123';
      const unblockRequest: ToggleBlockRequest = {
        is_blocked: false,
      };

      const unblockedCardResponse: CardResponse = {
        message: 'Success',
        result: { ...mockCard, is_blocked: false },
      };

      service.toggleCardBlock(cardId, unblockRequest).subscribe((response) => {
        expect(response).toEqual(unblockedCardResponse);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}/${cardId}/toggle-block`
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(unblockRequest);
      req.flush(unblockedCardResponse);
    });

    it('should handle toggle card block error', () => {
      const cardId = 'card123';
      const blockRequest: ToggleBlockRequest = {
        is_blocked: true,
      };
      const errorResponse = { status: 400, statusText: 'Bad Request' };

      service.toggleCardBlock(cardId, blockRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.cardsEndpoint}/${cardId}/toggle-block`
      );
      req.flush('Bad Request', errorResponse);
    });
  });
});
