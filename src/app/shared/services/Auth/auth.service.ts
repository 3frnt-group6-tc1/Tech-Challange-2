import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { apiConfig } from '../../../app.config';
import { SafeStorageService } from '../Storage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  result: {
    token: string;
  };
  user?: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name?: string;
  accountId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = apiConfig.baseUrl + apiConfig.usersEndpoint;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private safeStorage: SafeStorageService
  ) {
    this.initializeAuth();
  }

  /**
   * Decode JWT token to extract user data
   */
  private decodeToken(token: string): AuthUser | null {
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decodedPayload = atob(
        payload.replace(/-/g, '+').replace(/_/g, '/')
      );
      const tokenData = this.safeStorage.safeParse(decodedPayload);

      // Extract user data from token
      return {
        id: tokenData.id,
        email: tokenData.email,
        username: tokenData.username,
        name: tokenData.name,
        accountId: tokenData.accountId,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get user data from current token
   */
  getUserFromToken(): AuthUser | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }

  /**
   * Initialize authentication state from session storage
   */
  private initializeAuth(): void {
    const token = this.getStoredToken();

    if (token) {
      // Try to get user data from token first
      const userData = this.decodeToken(token);
      if (userData) {
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
        // Update stored user data in case it's outdated
        this.safeStorage.setSessionItem(this.USER_KEY, userData);
      } else {
        // Fallback to stored user data
        const storedUser = this.getStoredUser();
        if (storedUser) {
          this.currentUserSubject.next(storedUser);
          this.isAuthenticatedSubject.next(true);
        }
      }
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth`, credentials, { headers })
      .pipe(
        tap((response) => {
          this.setSession(response);
        })
      );
  }

  /**
   * Logout user and clear session
   */
  logout(): void {
    this.clearSession();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get stored token from session storage
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored user from session storage
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get primary account ID from current user token
   */
  getPrimaryAccountId(): string | null {
    const currentUser = this.getCurrentUser();
    return currentUser?.accountId || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Set authentication session
   */
  private setSession(authResult: LoginResponse): void {
    sessionStorage.setItem(this.TOKEN_KEY, authResult.result.token);

    // Extract user data from token
    const userData = this.decodeToken(authResult.result.token);
    if (userData) {
      this.safeStorage.setSessionItem(this.USER_KEY, userData);
      this.currentUserSubject.next(userData);
    } else if (authResult.user) {
      // Fallback to user data from response if token decoding fails
      this.safeStorage.setSessionItem(this.USER_KEY, authResult.user);
      this.currentUserSubject.next(authResult.user);
    }

    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Clear authentication session
   */
  private clearSession(): void {
    this.safeStorage.removeSessionItem(this.TOKEN_KEY);
    this.safeStorage.removeSessionItem(this.USER_KEY);
  }

  /**
   * Get stored token
   */
  private getStoredToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored user
   */
  private getStoredUser(): AuthUser | null {
    return this.safeStorage.getSessionItem<AuthUser>(this.USER_KEY);
  }

  /**
   * Refresh token (if needed in the future)
   */
  refreshToken(): Observable<LoginResponse> {
    // Implementation depends on your backend's refresh token strategy
    throw new Error('Refresh token not implemented');
  }

  /**
   * Update current user data
   */
  updateCurrentUser(updatedUser: Partial<AuthUser>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newUserData = { ...currentUser, ...updatedUser };
      this.safeStorage.setSessionItem(this.USER_KEY, newUserData);
      this.currentUserSubject.next(newUserData);
    }
  }
}
