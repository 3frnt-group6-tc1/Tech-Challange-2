import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AccountService, AccountStatementFilters } from './account.service';
import {
  Account,
  AccountStatement,
  AccountSummary,
} from '../../models/account';
import { apiConfig } from '../../../app.config';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  const mockAccount: Account = {
    id: 'acc123',
    userId: '123',
    type: 'checking',
  };

  const mockAccountSummary: AccountSummary = {
    message: 'Success',
    result: {
      account: [mockAccount],
      transactions: [],
      cards: [],
    },
  };

  const mockAccountStatement: AccountStatement = {
    message: 'Success',
    result: {
      transactions: [],
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AccountService],
    });

    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPrimaryAccountByUserId', () => {
    it('should return the first account as primary account', (done) => {
      service.getPrimaryAccountByUserId().subscribe((account) => {
        expect(account).toEqual(mockAccount);
        done();
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAccountSummary);
    });

    it('should return null when no accounts exist', (done) => {
      const emptyAccountSummary: AccountSummary = {
        message: 'Success',
        result: {
          account: [],
          transactions: [],
          cards: [],
        },
      };

      service.getPrimaryAccountByUserId().subscribe((account) => {
        expect(account).toBeNull();
        done();
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}`
      );
      req.flush(emptyAccountSummary);
    });

    it('should handle error when getting primary account', (done) => {
      const errorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
      };

      service.getPrimaryAccountByUserId().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}`
      );
      req.flush('Internal Server Error', errorResponse);
    });
  });

  describe('getByUserId', () => {
    it('should get accounts by user ID', () => {
      service.getByUserId().subscribe((response) => {
        expect(response).toEqual(mockAccountSummary);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAccountSummary);
    });

    it('should handle error when getting accounts by user ID', () => {
      const errorResponse = { status: 404, statusText: 'Not Found' };

      service.getByUserId().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}`
      );
      req.flush('Not Found', errorResponse);
    });
  });

  describe('getStatement', () => {
    it('should get account statement without filters', () => {
      const accountId = 'acc123';

      service.getStatement(accountId).subscribe((response) => {
        expect(response).toEqual(mockAccountStatement);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}/${accountId}/statement`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockAccountStatement);
    });

    it('should get account statement with all filters', () => {
      const accountId = 'acc123';
      const filters: AccountStatementFilters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        type: 'credit',
        minValue: '100',
        maxValue: '1000',
        from: 'sender123',
        to: 'receiver456',
        description: 'payment',
        page: 1,
        limit: 10,
      };

      service.getStatement(accountId, filters).subscribe((response) => {
        expect(response).toEqual(mockAccountStatement);
      });

      const expectedUrl = `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}/${accountId}/statement`;
      const req = httpMock.expectOne((request) => {
        return request.url === expectedUrl && request.method === 'GET';
      });

      // Verify all parameters are set correctly
      expect(req.request.params.get('startDate')).toBe('2024-01-01');
      expect(req.request.params.get('endDate')).toBe('2024-12-31');
      expect(req.request.params.get('type')).toBe('credit');
      expect(req.request.params.get('minValue')).toBe('100');
      expect(req.request.params.get('maxValue')).toBe('1000');
      expect(req.request.params.get('from')).toBe('sender123');
      expect(req.request.params.get('to')).toBe('receiver456');
      expect(req.request.params.get('description')).toBe('payment');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('10');

      req.flush(mockAccountStatement);
    });

    it('should get account statement with partial filters', () => {
      const accountId = 'acc123';
      const filters: AccountStatementFilters = {
        startDate: '2024-01-01',
        type: 'credit',
        page: 1,
      };

      service.getStatement(accountId, filters).subscribe((response) => {
        expect(response).toEqual(mockAccountStatement);
      });

      const expectedUrl = `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}/${accountId}/statement`;
      const req = httpMock.expectOne((request) => {
        return request.url === expectedUrl && request.method === 'GET';
      });

      // Verify only provided parameters are set
      expect(req.request.params.get('startDate')).toBe('2024-01-01');
      expect(req.request.params.get('type')).toBe('credit');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('endDate')).toBeNull();
      expect(req.request.params.get('minValue')).toBeNull();
      expect(req.request.params.get('maxValue')).toBeNull();
      expect(req.request.params.get('from')).toBeNull();
      expect(req.request.params.get('to')).toBeNull();
      expect(req.request.params.get('description')).toBeNull();
      expect(req.request.params.get('limit')).toBeNull();

      req.flush(mockAccountStatement);
    });

    it('should handle empty filters object', () => {
      const accountId = 'acc123';
      const filters: AccountStatementFilters = {};

      service.getStatement(accountId, filters).subscribe((response) => {
        expect(response).toEqual(mockAccountStatement);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}/${accountId}/statement`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockAccountStatement);
    });

    it('should handle error when getting account statement', () => {
      const accountId = 'acc123';
      const errorResponse = { status: 403, statusText: 'Forbidden' };

      service.getStatement(accountId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}/${accountId}/statement`
      );
      req.flush('Forbidden', errorResponse);
    });

    it('should handle filters with undefined values', () => {
      const accountId = 'acc123';
      const filters: AccountStatementFilters = {
        startDate: '2024-01-01',
        endDate: undefined,
        type: 'credit',
        minValue: undefined,
        page: 1,
        limit: undefined,
      };

      service.getStatement(accountId, filters).subscribe((response) => {
        expect(response).toEqual(mockAccountStatement);
      });

      const expectedUrl = `${apiConfig.baseUrl}${apiConfig.accountsEndpoint}/${accountId}/statement`;
      const req = httpMock.expectOne((request) => {
        return request.url === expectedUrl && request.method === 'GET';
      });

      // Verify only defined parameters are set
      expect(req.request.params.get('startDate')).toBe('2024-01-01');
      expect(req.request.params.get('type')).toBe('credit');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('endDate')).toBeNull();
      expect(req.request.params.get('minValue')).toBeNull();
      expect(req.request.params.get('limit')).toBeNull();

      req.flush(mockAccountStatement);
    });
  });
});
