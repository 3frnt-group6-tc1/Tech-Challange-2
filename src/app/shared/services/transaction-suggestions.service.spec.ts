
import { TestBed } from '@angular/core/testing';
import { TransactionSuggestionsService } from './transaction-suggestions.service';
import { TransactionType } from '../models/transaction';

describe('TransactionSuggestionsService', () => {
  let service: TransactionSuggestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionSuggestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFilteredSuggestions', () => {
    it('should return empty array when input is less than 2 characters', () => {
      const result = service.getFilteredSuggestions(TransactionType.Exchange, 'C');
      expect(result).toEqual([]);
    });

    it('should return empty array when input is empty', () => {
      const result = service.getFilteredSuggestions(TransactionType.Exchange, '');
      expect(result).toEqual([]);
    });

    it('should filter suggestions based on input for Exchange type', () => {
      const result = service.getFilteredSuggestions(TransactionType.Exchange, 'USD');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(suggestion => suggestion.includes('USD'))).toBeTruthy();
    });

    it('should filter suggestions based on input for Loan type', () => {
      const result = service.getFilteredSuggestions(TransactionType.Loan, 'Empréstimo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(suggestion => suggestion.includes('Empréstimo'))).toBeTruthy();
    });

    it('should filter suggestions based on input for Transfer type', () => {
      const result = service.getFilteredSuggestions(TransactionType.Transfer, 'TED');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(suggestion => suggestion.includes('TED'))).toBeTruthy();
    });

    it('should return maximum 5 suggestions', () => {
      const result = service.getFilteredSuggestions(TransactionType.Exchange, 'Câmbio');
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should handle normalized strings with accents', () => {
      const result = service.getFilteredSuggestions(TransactionType.Exchange, 'cambio');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const result = service.getFilteredSuggestions(TransactionType.Exchange, 'usd');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getAllSuggestions', () => {
    it('should return all suggestions for Exchange type', () => {
      const result = service.getAllSuggestions(TransactionType.Exchange);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Câmbio: Compra de USD para viagem');
    });

    it('should return all suggestions for Loan type', () => {
      const result = service.getAllSuggestions(TransactionType.Loan);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Empréstimo: Recebimento de crédito pessoal');
    });

    it('should return all suggestions for Transfer type', () => {
      const result = service.getAllSuggestions(TransactionType.Transfer);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('TED: Transferência para pagamento de aluguel');
    });
  });

  describe('addCustomSuggestion', () => {
    it('should add new custom suggestion', () => {
      const customSuggestion = 'Custom Exchange Test';
      service.addCustomSuggestion(TransactionType.Exchange, customSuggestion);

      const allSuggestions = service.getAllSuggestions(TransactionType.Exchange);
      expect(allSuggestions).toContain(customSuggestion);
    });

    it('should not add duplicate suggestions', () => {
      const customSuggestion = 'Duplicate Test';
      service.addCustomSuggestion(TransactionType.Exchange, customSuggestion);
      service.addCustomSuggestion(TransactionType.Exchange, customSuggestion);

      const allSuggestions = service.getAllSuggestions(TransactionType.Exchange);
      const occurrences = allSuggestions.filter(s => s === customSuggestion).length;
      expect(occurrences).toBe(1);
    });

    it('should initialize suggestions array if not exists', () => {
      const mockType = 'MOCK_TYPE' as TransactionType;
      const customSuggestion = 'Mock suggestion';

      service.addCustomSuggestion(mockType, customSuggestion);
      const result = service.getAllSuggestions(mockType);

      expect(result).toContain(customSuggestion);
    });
  });
});