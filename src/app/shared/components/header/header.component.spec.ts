import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Component } from '@angular/core';

import { HeaderComponent } from './header.component';
import { ThemeService } from '../../services/Theme/theme.service';
import { UserService } from '../../services/User/user-service';
import { AuthService, AuthUser } from '../../services/Auth/auth.service';
import { User } from '../../models/user';

// Mock component for routing
@Component({ template: '' })
class MockComponent {}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let router: Router;
  let mockCurrentUserSubject: BehaviorSubject<AuthUser | null>;

  const mockAuthUser: AuthUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
  };

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    password: 'password123',
  };

  beforeEach(async () => {
    mockCurrentUserSubject = new BehaviorSubject<AuthUser | null>(null);

    const authSpy = jasmine.createSpyObj(
      'AuthService',
      ['getCurrentUser', 'isAuthenticated', 'logout'],
      {
        currentUser$: mockCurrentUserSubject.asObservable(),
      }
    );

    const userSpy = jasmine.createSpyObj('UserService', ['getById']);
    const themeSpy = jasmine.createSpyObj('ThemeService', ['toggleDarkMode']);

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule.withRoutes([
          { path: 'login', component: MockComponent },
          { path: 'panel', component: MockComponent },
          { path: 'register', component: MockComponent },
        ]),
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: ThemeService, useValue: themeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    themeServiceSpy = TestBed.inject(
      ThemeService
    ) as jasmine.SpyObj<ThemeService>;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isLoggedIn).toBe(false); // Default is false based on path
    expect(component.mobile).toBe(false);
    expect(component.tablet).toBe(false);
    expect(component.menuOpen).toBe(false);
    expect(component.userName).toBe('');
    expect(component.currentUser).toBe(null);
    expect(component.isLoading).toBe(true);
  });

  it('should update login state based on authentication and URL', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    component['updateLoginState']('/panel');

    expect(component.isLoggedIn).toBe(true);
  });

  it('should subscribe to current user and update userName', () => {
    mockCurrentUserSubject.next(mockAuthUser);
    component['subscribeToAuthUser']();

    expect(component.currentUser).toEqual(mockAuthUser);
    expect(component.userName).toBe('Test User');
  });

  it('should handle user without name by using username', () => {
    const userWithoutName = { ...mockAuthUser, name: '', username: 'testuser' };
    mockCurrentUserSubject.next(userWithoutName);
    component['subscribeToAuthUser']();

    expect(component.userName).toBe('testuser');
  });

  it('should toggle dark mode', () => {
    component.toggleDarkMode();
    expect(themeServiceSpy.toggleDarkMode).toHaveBeenCalled();
  });

  it('should check screen size correctly', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    component.checkScreen();
    expect(component.mobile).toBe(true);
    expect(component.tablet).toBe(false);

    // Mock window.innerWidth for tablet
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    component.checkScreen();
    expect(component.mobile).toBe(false);
    expect(component.tablet).toBe(true);

    // Mock window.innerWidth for desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1300,
    });

    component.checkScreen();
    expect(component.mobile).toBe(false);
    expect(component.tablet).toBe(false);
  });

  it('should toggle menu', () => {
    expect(component.menuOpen).toBe(false);

    component.toggleMenu();
    expect(component.menuOpen).toBe(true);

    component.toggleMenu();
    expect(component.menuOpen).toBe(false);
  });

  it('should close menu', () => {
    component.menuOpen = true;
    component.closeMenu();
    expect(component.menuOpen).toBe(false);
  });

  it('should navigate to panel when authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    spyOn(router, 'navigate');

    component.goToPanel();

    expect(router.navigate).toHaveBeenCalledWith(['/panel']);
  });

  it('should navigate to login when not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    spyOn(router, 'navigate');

    component.goToPanel();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to register', () => {
    spyOn(router, 'navigate');

    component.goToRegister();

    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should logout and navigate to login', () => {
    spyOn(router, 'navigate');

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should fetch user data successfully', () => {
    authServiceSpy.getCurrentUser.and.returnValue(mockAuthUser);
    userServiceSpy.getById.and.returnValue(of(mockUser));

    component.fetchUser();

    expect(userServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.userName).toBe('Test User');
    expect(component.isLoading).toBe(false);
  });

  it('should handle fetch user error', () => {
    authServiceSpy.getCurrentUser.and.returnValue(mockAuthUser);
    userServiceSpy.getById.and.returnValue(throwError('Error fetching user'));
    spyOn(console, 'error');

    component.fetchUser();

    expect(component.isLoading).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching user name:',
      'Error fetching user'
    );
  });

  it('should handle null current user in fetchUser', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);
    spyOn(console, 'error');

    component.fetchUser();

    expect(component.isLoading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('User not authenticated');
  });

  describe('getter methods', () => {
    beforeEach(() => {
      component.isLoggedIn = false;
      component.mobile = true;
      component.tablet = false;
      component.menuOpen = true;
    });

    it('should return correct value for showLandingMobileMenu', () => {
      expect(component.showLandingMobileMenu).toBe(true);

      component.isLoggedIn = true;
      expect(component.showLandingMobileMenu).toBe(false);
    });

    it('should return correct value for showLandingDesktopMenu', () => {
      component.mobile = false;
      expect(component.showLandingDesktopMenu).toBe(true);

      component.isLoggedIn = true;
      expect(component.showLandingDesktopMenu).toBe(false);
    });

    it('should return correct value for showLoggedMobileMenu', () => {
      component.isLoggedIn = true;
      expect(component.showLoggedMobileMenu).toBe(true);

      component.mobile = false;
      expect(component.showLoggedMobileMenu).toBe(false);
    });

    it('should return correct value for showLoggedTabletMenu', () => {
      component.isLoggedIn = true;
      component.tablet = true;
      expect(component.showLoggedTabletMenu).toBe(true);

      component.tablet = false;
      expect(component.showLoggedTabletMenu).toBe(false);
    });
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
