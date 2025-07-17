import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  AuthService,
  LoginRequest,
  LoginResponse,
  AuthUser,
} from './auth.service';
import { SafeStorageService } from '../Storage/safe-storage.service';
import { AccountService } from '../Account/account.service';
import { apiConfig } from '../../../app.config';
import { Account } from '../../models/account';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let safeStorageService: jasmine.SpyObj<SafeStorageService>;
  let accountService: jasmine.SpyObj<AccountService>;

  const mockAuthUser: AuthUser = {
    id: '123',
    email: 'test@test.com',
    username: 'testuser',
    name: 'Test User',
  };

  const mockAccount: Account = {
    id: 'acc123',
    userId: '123',
    type: 'checking',
  };

  const mockLoginResponse: LoginResponse = {
    message: 'Login successful',
    result: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJuYW1lIjoiVGVzdCBVc2VyIn0.test',
    },
    user: mockAuthUser,
  };

  beforeEach(() => {
    const safeStorageSpy = jasmine.createSpyObj('SafeStorageService', [
      'setSessionItem',
      'getSessionItem',
      'removeSessionItem',
      'safeParse',
    ]);

    const accountServiceSpy = jasmine.createSpyObj('AccountService', [
      'getPrimaryAccountByUserId',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: SafeStorageService, useValue: safeStorageSpy },
        { provide: AccountService, useValue: accountServiceSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    safeStorageService = TestBed.inject(
      SafeStorageService
    ) as jasmine.SpyObj<SafeStorageService>;
    accountService = TestBed.inject(
      AccountService
    ) as jasmine.SpyObj<AccountService>;

    // Clear session storage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and set session', () => {
      const credentials: LoginRequest = {
        email: 'test@test.com',
        password: 'password123',
      };

      accountService.getPrimaryAccountByUserId.and.returnValue(of(mockAccount));

      service.login(credentials).subscribe((response) => {
        expect(response).toEqual(mockLoginResponse);
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getCurrentUser()).toEqual(mockAuthUser);
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.usersEndpoint}/auth`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(mockLoginResponse);
    });

    it('should handle login error', () => {
      const credentials: LoginRequest = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      const errorResponse = { status: 401, statusText: 'Unauthorized' };

      service.login(credentials).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(
        `${apiConfig.baseUrl}${apiConfig.usersEndpoint}/auth`
      );
      req.flush('Unauthorized', errorResponse);
    });
  });

  describe('logout', () => {
    it('should logout and clear session', () => {
      // Set up authenticated state
      service['currentUserSubject'].next(mockAuthUser);
      service['isAuthenticatedSubject'].next(true);
      service['primaryAccountSubject'].next(mockAccount);

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
      expect(service.getPrimaryAccount()).toBeNull();
      expect(safeStorageService.removeSessionItem).toHaveBeenCalledWith(
        'auth_token'
      );
      expect(safeStorageService.removeSessionItem).toHaveBeenCalledWith(
        'auth_user'
      );
      expect(safeStorageService.removeSessionItem).toHaveBeenCalledWith(
        'primary_account'
      );
    });
  });

  describe('getToken', () => {
    it('should return token from session storage', () => {
      const token = 'test-token';
      sessionStorage.setItem('auth_token', token);

      const result = service.getToken();

      expect(result).toBe(token);
    });

    it('should return null when no token exists', () => {
      const result = service.getToken();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      service['currentUserSubject'].next(mockAuthUser);

      const result = service.getCurrentUser();

      expect(result).toEqual(mockAuthUser);
    });

    it('should return null when no user is set', () => {
      const result = service.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('getPrimaryAccount', () => {
    it('should return primary account', () => {
      service['primaryAccountSubject'].next(mockAccount);

      const result = service.getPrimaryAccount();

      expect(result).toEqual(mockAccount);
    });

    it('should return null when no account is set', () => {
      const result = service.getPrimaryAccount();

      expect(result).toBeNull();
    });
  });

  describe('getPrimaryAccountId', () => {
    it('should return primary account ID', () => {
      service['primaryAccountSubject'].next(mockAccount);

      const result = service.getPrimaryAccountId();

      expect(result).toBe(mockAccount.id);
    });

    it('should return null when no account is set', () => {
      const result = service.getPrimaryAccountId();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return authentication status', () => {
      service['isAuthenticatedSubject'].next(true);

      const result = service.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when not authenticated', () => {
      service['isAuthenticatedSubject'].next(false);

      const result = service.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('decodeToken', () => {
    it('should decode valid JWT token', () => {
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJuYW1lIjoiVGVzdCBVc2VyIn0.test';

      safeStorageService.safeParse.and.returnValue({
        id: '123',
        email: 'test@test.com',
        username: 'testuser',
        name: 'Test User',
      });

      const result = service['decodeToken'](validToken);

      expect(result).toEqual(mockAuthUser);
    });

    it('should return null for invalid token format', () => {
      const invalidToken = 'invalid.token';

      const result = service['decodeToken'](invalidToken);

      expect(result).toBeNull();
    });

    it('should return null when token decoding fails', () => {
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJuYW1lIjoiVGVzdCBVc2VyIn0.test';

      safeStorageService.safeParse.and.throwError('Parse error');

      const result = service['decodeToken'](validToken);

      expect(result).toBeNull();
    });
  });

  describe('getUserFromToken', () => {
    it('should return user data from valid token', () => {
      const token = 'valid-token';
      sessionStorage.setItem('auth_token', token);

      spyOn(service, 'decodeToken' as any).and.returnValue(mockAuthUser);

      const result = service.getUserFromToken();

      expect(result).toEqual(mockAuthUser);
    });

    it('should return null when no token exists', () => {
      const result = service.getUserFromToken();

      expect(result).toBeNull();
    });
  });

  describe('initializeAuth', () => {
    it('should initialize auth state from valid token', () => {
      const token = 'valid-token';
      sessionStorage.setItem('auth_token', token);

      spyOn(service, 'decodeToken' as any).and.returnValue(mockAuthUser);
      accountService.getPrimaryAccountByUserId.and.returnValue(of(mockAccount));

      service['initializeAuth']();

      expect(service.getCurrentUser()).toEqual(mockAuthUser);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should fallback to stored user data when token decoding fails', () => {
      const token = 'invalid-token';
      sessionStorage.setItem('auth_token', token);

      spyOn(service, 'decodeToken' as any).and.returnValue(null);
      safeStorageService.getSessionItem.and.returnValue(mockAuthUser);
      accountService.getPrimaryAccountByUserId.and.returnValue(of(mockAccount));

      service['initializeAuth']();

      expect(service.getCurrentUser()).toEqual(mockAuthUser);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('loadPrimaryAccount', () => {
    it('should load primary account from API', () => {
      accountService.getPrimaryAccountByUserId.and.returnValue(of(mockAccount));

      service['loadPrimaryAccount']('123');

      expect(accountService.getPrimaryAccountByUserId).toHaveBeenCalled();
      expect(service.getPrimaryAccount()).toEqual(mockAccount);
    });

    it('should handle error when loading primary account', () => {
      accountService.getPrimaryAccountByUserId.and.returnValue(
        throwError('API Error')
      );
      spyOn(console, 'error');

      service['loadPrimaryAccount']('123');

      expect(console.error).toHaveBeenCalledWith(
        'Error loading primary account:',
        'API Error'
      );
    });

    it('should use stored account if it exists for the same user', () => {
      safeStorageService.getSessionItem.and.returnValue(mockAccount);

      service['loadPrimaryAccount']('123');

      expect(service.getPrimaryAccount()).toEqual(mockAccount);
      expect(accountService.getPrimaryAccountByUserId).not.toHaveBeenCalled();
    });
  });

  describe('updateCurrentUser', () => {
    it('should update current user data', () => {
      service['currentUserSubject'].next(mockAuthUser);

      const updatedData = { name: 'Updated Name' };
      service.updateCurrentUser(updatedData);

      const expectedUser = { ...mockAuthUser, ...updatedData };
      expect(service.getCurrentUser()).toEqual(expectedUser);
      expect(safeStorageService.setSessionItem).toHaveBeenCalledWith(
        'auth_user',
        expectedUser
      );
    });

    it('should not update when no current user exists', () => {
      service.updateCurrentUser({ name: 'Updated Name' });

      expect(safeStorageService.setSessionItem).not.toHaveBeenCalled();
    });
  });

  describe('observables', () => {
    it('should emit current user changes', (done) => {
      service.currentUser$.subscribe((user) => {
        if (user) {
          expect(user).toEqual(mockAuthUser);
          done();
        }
      });

      service['currentUserSubject'].next(mockAuthUser);
    });

    it('should emit authentication status changes', (done) => {
      service.isAuthenticated$.subscribe((isAuth) => {
        if (isAuth) {
          expect(isAuth).toBe(true);
          done();
        }
      });

      service['isAuthenticatedSubject'].next(true);
    });

    it('should emit primary account changes', (done) => {
      service.primaryAccount$.subscribe((account) => {
        if (account) {
          expect(account).toEqual(mockAccount);
          done();
        }
      });

      service['primaryAccountSubject'].next(mockAccount);
    });
  });
});
