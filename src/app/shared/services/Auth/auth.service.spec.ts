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
import { apiConfig } from '../../../app.config';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let safeStorageService: jasmine.SpyObj<SafeStorageService>;

  const mockAuthUser: AuthUser = {
    id: '123',
    email: 'test@test.com',
    username: 'testuser',
    name: 'Test User',
    accountId: 'acc123',
  };

  const mockLoginResponse: LoginResponse = {
    message: 'Login successful',
    result: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJuYW1lIjoiVGVzdCBVc2VyIiwiYWNjb3VudElkIjoiYWNjMTIzIn0.test',
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

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: SafeStorageService, useValue: safeStorageSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    safeStorageService = TestBed.inject(
      SafeStorageService
    ) as jasmine.SpyObj<SafeStorageService>;

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

      service.login(credentials).subscribe((response) => {
        expect(response).toEqual(mockLoginResponse);
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getCurrentUser()).toEqual(mockAuthUser);
        expect(service.getPrimaryAccountId()).toBe('acc123');
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
    it('should clear session and reset authentication state', () => {
      // Set up authenticated state first
      service['currentUserSubject'].next(mockAuthUser);
      service['isAuthenticatedSubject'].next(true);

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('getPrimaryAccountId', () => {
    it('should return account ID from current user', () => {
      service['currentUserSubject'].next(mockAuthUser);

      const result = service.getPrimaryAccountId();

      expect(result).toBe('acc123');
    });

    it('should return null when no user is authenticated', () => {
      const result = service.getPrimaryAccountId();

      expect(result).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('should decode JWT token correctly', () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJuYW1lIjoiVGVzdCBVc2VyIiwiYWNjb3VudElkIjoiYWNjMTIzIn0.test';

      // Mock safeParse to return decoded data
      safeStorageService.safeParse.and.returnValue({
        id: '123',
        email: 'test@test.com',
        username: 'testuser',
        name: 'Test User',
        accountId: 'acc123',
      });

      const result = service['decodeToken'](token);

      expect(result).toEqual(mockAuthUser);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token';

      const result = service['decodeToken'](invalidToken);

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return authentication state', () => {
      service['isAuthenticatedSubject'].next(true);

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      service['currentUserSubject'].next(mockAuthUser);

      const result = service.getCurrentUser();

      expect(result).toEqual(mockAuthUser);
    });
  });

  describe('getToken', () => {
    it('should return token from sessionStorage', () => {
      const token = 'test-token';
      spyOn(sessionStorage, 'getItem').and.returnValue(token);

      const result = service.getToken();

      expect(result).toBe(token);
      expect(sessionStorage.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('should return null when no token exists', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null);

      const result = service.getToken();

      expect(result).toBeNull();
    });
  });

  describe('updateCurrentUser', () => {
    it('should update current user data', () => {
      service['currentUserSubject'].next(mockAuthUser);

      const updatedData = { name: 'Updated Name' };
      service.updateCurrentUser(updatedData);

      const updatedUser = service.getCurrentUser();
      expect(updatedUser!.name).toBe('Updated Name');
      expect(safeStorageService.setSessionItem).toHaveBeenCalled();
    });

    it('should not update when no current user exists', () => {
      service.updateCurrentUser({ name: 'Updated Name' });

      expect(safeStorageService.setSessionItem).not.toHaveBeenCalled();
    });
  });

  describe('Observable streams', () => {
    it('should emit current user changes', (done) => {
      service.currentUser$.subscribe((user) => {
        if (user) {
          expect(user).toEqual(mockAuthUser);
          done();
        }
      });

      service['currentUserSubject'].next(mockAuthUser);
    });

    it('should emit authentication state changes', (done) => {
      service.isAuthenticated$.subscribe((isAuth) => {
        if (isAuth) {
          expect(isAuth).toBe(true);
          done();
        }
      });

      service['isAuthenticatedSubject'].next(true);
    });
  });
});
