import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
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
    const themeSpy = jasmine.createSpyObj('ThemeService', [
      'toggleDarkMode',
      'getCurrentTheme',
    ]);

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

    // Setup default spy returns
    authSpy.isAuthenticated.and.returnValue(false);
    themeSpy.getCurrentTheme.and.returnValue('light');

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
    expect(component.mobile).toBe(false);
    expect(component.tablet).toBe(false);
    expect(component.menuOpen).toBe(false);
    expect(component.userName).toBe('');
    expect(component.currentUser).toBe(null);
    expect(component.isLoading).toBe(true);
  });

  it('should subscribe to current user and update userName', fakeAsync(() => {
    fixture.detectChanges();
    mockCurrentUserSubject.next(mockAuthUser);
    fixture.detectChanges();
    tick();

    expect(component.currentUser).toEqual(mockAuthUser);
    expect(component.userName).toBe('Test User');
  }));

  it('should handle user without name by using username', fakeAsync(() => {
    fixture.detectChanges();
    const userWithoutName = { ...mockAuthUser, name: '', username: 'testuser' };
    mockCurrentUserSubject.next(userWithoutName);
    fixture.detectChanges();
    tick();

    expect(component.userName).toBe('testuser');
  }));

  it('should fetch user details when authenticated', fakeAsync(() => {
    authServiceSpy.getCurrentUser.and.returnValue(mockAuthUser);
    userServiceSpy.getById.and.returnValue(of(mockUser));

    component.fetchUser();
    tick();

    expect(userServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.userName).toBe('Test User');
    expect(component.isLoading).toBe(false);
  }));

  it('should toggle dark mode', () => {
    spyOn(window.parent, 'postMessage');

    component.toggleDarkMode();

    expect(themeServiceSpy.toggleDarkMode).toHaveBeenCalled();
    expect(themeServiceSpy.getCurrentTheme).toHaveBeenCalled();
    expect(window.parent.postMessage).toHaveBeenCalledWith(
      {
        type: 'theme',
        theme: 'light',
      },
      jasmine.any(String)
    );
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

  describe('fetchUser', () => {
    it('should handle error cases', () => {
      authServiceSpy.getCurrentUser.and.returnValue(mockAuthUser);
      userServiceSpy.getById.and.returnValue(
        throwError(() => 'Error fetching user')
      );
      spyOn(console, 'error');

      component.fetchUser();

      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching user name:',
        'Error fetching user'
      );
    });

    it('should handle null current user', () => {
      authServiceSpy.getCurrentUser.and.returnValue(null);
      spyOn(console, 'error');

      component.fetchUser();

      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('User not authenticated');
    });
  });

  it('should handle theme change and notify parent window', () => {
    spyOn(window.parent, 'postMessage');
    themeServiceSpy.getCurrentTheme.and.returnValue('dark');

    component.toggleDarkMode();

    expect(themeServiceSpy.toggleDarkMode).toHaveBeenCalled();
    expect(themeServiceSpy.getCurrentTheme).toHaveBeenCalled();
    expect(window.parent.postMessage).toHaveBeenCalledWith(
      { type: 'theme', theme: 'dark' },
      jasmine.any(String)
    );
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    spyOn(document, 'removeEventListener');
    spyOn(window, 'removeEventListener');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
    expect(document.removeEventListener).toHaveBeenCalledWith(
      'click',
      component['clickListener'],
      true
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'resize',
      component['resizeListener']
    );
  });
});
