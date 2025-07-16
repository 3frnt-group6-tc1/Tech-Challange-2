import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';
import { apiConfig } from '../../../app.config';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user and store session', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
        },
      };

      service.login(loginRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(service.getToken()).toBe('mock-jwt-token');
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getCurrentUser()).toEqual(mockResponse.user);
      });

      const req = httpMock.expectOne(`${apiConfig.baseUrl}/user/auth`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear session and update state', () => {
      // Set up authenticated state
      sessionStorage.setItem('auth_token', 'test-token');
      sessionStorage.setItem(
        'auth_user',
        JSON.stringify({
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
        })
      );

      service.logout();

      expect(sessionStorage.getItem('auth_token')).toBeNull();
      expect(sessionStorage.getItem('auth_user')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return stored token', () => {
      sessionStorage.setItem('auth_token', 'stored-token');
      expect(service.getToken()).toBe('stored-token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is stored', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when token and user are stored', () => {
      sessionStorage.setItem('auth_token', 'test-token');
      sessionStorage.setItem(
        'auth_user',
        JSON.stringify({
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
        })
      );

      // Create new service instance to trigger initialization
      const newService = TestBed.inject(AuthService);
      expect(newService.isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is stored', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return stored user', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
      };

      sessionStorage.setItem('auth_user', JSON.stringify(user));
      sessionStorage.setItem('auth_token', 'test-token');

      // Create new service instance to trigger initialization
      const newService = TestBed.inject(AuthService);
      expect(newService.getCurrentUser()).toEqual(user);
    });
  });
});
