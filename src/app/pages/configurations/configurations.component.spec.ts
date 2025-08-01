import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject, Subject } from 'rxjs';

import { ConfigurationsComponent } from './configurations.component';
import { AuthService, AuthUser } from '../../shared/services/Auth/auth.service';
import { UserService } from '../../shared/services/User/user-service';
import { UserSettingsService } from '../../shared/services/UserSettings/user-settings.service';
import { ThemeService } from '../../shared/services/Theme/theme.service';
import { User, UserSettings } from '../../shared/models/user';

describe('ConfigurationsComponent', () => {
  let component: ConfigurationsComponent;
  let fixture: ComponentFixture<ConfigurationsComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockUserSettingsService: jasmine.SpyObj<UserSettingsService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let currentUserSubject: BehaviorSubject<AuthUser | null>;

  const mockAuthUser: AuthUser = {
    id: '1',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUserSettings: UserSettings = {
    notifications: true,
    language: 'pt-BR',
    currency: 'BRL',
    twoFactorAuth: false,
    emailAlerts: true,
    smsAlerts: false,
    theme: 'light',
  };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<AuthUser | null>(mockAuthUser);

    const authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['updateCurrentUser', 'isAuthenticated'],
      {
        currentUser$: currentUserSubject.asObservable(),
      }
    );
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getById',
      'update',
      'getAll',
    ]);
    const userSettingsServiceSpy = jasmine.createSpyObj('UserSettingsService', [
      'getUserSettings',
      'updateUserSettings',
      'getDefaultSettings',
      'updateTheme',
    ]);
    const themeServiceSpy = jasmine.createSpyObj('ThemeService', [
      'setThemeFromUserSettings',
    ]);

    const routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate', 'createUrlTree', 'serializeUrl'],
      {
        url: '/configurations',
        events: new Subject(),
      }
    );

    await TestBed.configureTestingModule({
      imports: [ConfigurationsComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: UserSettingsService, useValue: userSettingsServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
            params: of({}),
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationsComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(
      AuthService
    ) as jasmine.SpyObj<AuthService>;
    mockUserService = TestBed.inject(
      UserService
    ) as jasmine.SpyObj<UserService>;
    mockUserSettingsService = TestBed.inject(
      UserSettingsService
    ) as jasmine.SpyObj<UserSettingsService>;
    mockThemeService = TestBed.inject(
      ThemeService
    ) as jasmine.SpyObj<ThemeService>;

    const mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockRouter.createUrlTree.and.returnValue({} as any);
    mockRouter.serializeUrl.and.returnValue('/mock-url');

    // Setup default spy returns
    mockUserService.getById.and.returnValue(of(mockUser));
    mockUserService.update.and.returnValue(of(mockUser));
    mockUserService.getAll.and.returnValue(of([mockUser]));
    mockUserSettingsService.getUserSettings.and.returnValue(
      of(mockUserSettings)
    );
    mockUserSettingsService.updateUserSettings.and.returnValue(
      of(mockUserSettings)
    );
    mockUserSettingsService.getDefaultSettings.and.returnValue(
      mockUserSettings
    );
    mockUserSettingsService.updateTheme.and.returnValue(of(mockUserSettings));
  });

  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize user form with default validators', () => {
      // The form should be loaded with current user data, not empty
      expect(component.userForm.get('name')?.value).toBe('Test User');
      expect(component.userForm.get('email')?.value).toBe('test@example.com');
      expect(component.userForm.get('currentPassword')?.value).toBe('');
      expect(component.userForm.get('newPassword')?.value).toBe('');
      expect(component.userForm.get('confirmPassword')?.value).toBe('');
    });

    it('should initialize settings form with default values', () => {
      expect(component.settingsForm.get('notifications')?.value).toBe(true);
      expect(component.settingsForm.get('language')?.value).toBe('pt-BR');
      expect(component.settingsForm.get('currency')?.value).toBe('BRL');
      expect(component.settingsForm.get('twoFactorAuth')?.value).toBe(false);
      expect(component.settingsForm.get('emailAlerts')?.value).toBe(true);
      expect(component.settingsForm.get('smsAlerts')?.value).toBe(false);
      expect(component.settingsForm.get('theme')?.value).toBe('light');
    });

    it('should set loading states to false initially', () => {
      expect(component.isLoading).toBe(false);
      expect(component.isSettingsLoading).toBe(false);
    });

    it('should set success and error messages to empty initially', () => {
      expect(component.isSuccess).toBe(false);
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
      expect(component.settingsErrorMessage).toBe('');
      expect(component.settingsSuccessMessage).toBe('');
    });

    it('should subscribe to currentUser$ and load data when user is available', () => {
      spyOn(component, 'loadUserData');
      spyOn(component, 'loadUserSettings');

      component.ngOnInit();

      expect(component.currentUser).toEqual(mockAuthUser);
      expect(component.loadUserData).toHaveBeenCalledWith('1');
      expect(component.loadUserSettings).toHaveBeenCalledWith('1');
    });
  });

  describe('Data Loading', () => {
    it('should load user data successfully', () => {
      component.loadUserData('1');

      expect(mockUserService.getById).toHaveBeenCalledWith('1');
      expect(component.userForm.get('name')?.value).toBe('Test User');
      expect(component.userForm.get('email')?.value).toBe('test@example.com');
      expect(component.isLoading).toBe(false);
    });

    it('should handle user data loading error', () => {
      mockUserService.getById.and.returnValue(
        throwError(() => new Error('Load error'))
      );
      spyOn(console, 'error');

      component.loadUserData('1');

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao carregar dados do usuário:',
        jasmine.any(Error)
      );
      expect(component.errorMessage).toBe('Erro ao carregar dados do usuário');
      expect(component.isLoading).toBe(false);
    });

    it('should load user settings successfully', () => {
      component.loadUserSettings('1');

      expect(mockUserSettingsService.getUserSettings).toHaveBeenCalledWith('1');
      expect(component.currentSettings).toEqual(mockUserSettings);
      expect(component.settingsForm.get('notifications')?.value).toBe(true);
      expect(component.settingsForm.get('language')?.value).toBe('pt-BR');
      expect(component.isSettingsLoading).toBe(false);
    });

    it('should use default settings when loading fails', () => {
      mockUserSettingsService.getUserSettings.and.returnValue(
        throwError(() => new Error('Settings error'))
      );
      spyOn(console, 'error');

      component.loadUserSettings('1');

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao carregar configurações do usuário:',
        jasmine.any(Error)
      );
      expect(mockUserSettingsService.getDefaultSettings).toHaveBeenCalled();
      expect(component.currentSettings).toEqual(mockUserSettings);
      expect(component.isSettingsLoading).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields in user form', () => {
      component.userForm.get('name')?.setValue('');
      component.userForm.get('email')?.setValue('');
      component.userForm.get('name')?.markAsTouched();
      component.userForm.get('email')?.markAsTouched();

      expect(component.userForm.get('name')?.hasError('required')).toBe(true);
      expect(component.userForm.get('email')?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      component.userForm.get('email')?.setValue('invalid-email');
      expect(component.userForm.get('email')?.hasError('email')).toBe(true);

      component.userForm.get('email')?.setValue('valid@email.com');
      expect(component.userForm.get('email')?.hasError('email')).toBe(false);
    });

    it('should validate password confirmation', () => {
      component.userForm.get('newPassword')?.setValue('password123');
      component.userForm.get('confirmPassword')?.setValue('different');

      expect(component.userForm.hasError('passwordMismatch')).toBe(true);

      component.userForm.get('confirmPassword')?.setValue('password123');
      expect(component.userForm.hasError('passwordMismatch')).toBe(false);
    });

    it('should validate minimum length for fields', () => {
      component.userForm.get('name')?.setValue('A');
      expect(component.userForm.get('name')?.hasError('minlength')).toBe(true);

      component.userForm.get('newPassword')?.setValue('123');
      expect(component.userForm.get('newPassword')?.hasError('minlength')).toBe(
        true
      );
    });
  });

  describe('User Form Submission', () => {
    beforeEach(() => {
      component.currentUser = mockAuthUser;
      component.userForm.patchValue({
        name: 'Updated User',
        email: 'updated@example.com',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });
    });

    it('should submit user form successfully', async () => {
      await component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(mockUserService.update).toHaveBeenCalledWith(
        '1',
        jasmine.objectContaining({
          name: 'Updated User',
          email: 'updated@example.com',
          password: 'newpassword123',
        })
      );
      expect(component.successMessage).toBe('Dados atualizados com sucesso!');
      expect(component.isSuccess).toBe(true);
      expect(mockAuthService.updateCurrentUser).toHaveBeenCalled();
    });

    it('should handle email already exists error', async () => {
      const existingUser = {
        ...mockUser,
        id: '2',
        email: 'updated@example.com',
      };
      mockUserService.getAll.and.returnValue(of([mockUser, existingUser]));

      await component.onSubmit();

      expect(component.errorMessage).toBe(
        'Este email já está sendo usado por outro usuário'
      );
      expect(component.isLoading).toBe(false);
      expect(mockUserService.update).not.toHaveBeenCalled();
    });

    it('should handle user form submission error', async () => {
      mockUserService.update.and.returnValue(
        throwError(() => new Error('Update error'))
      );

      await component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe(
        'Erro ao atualizar dados. Tente novamente.'
      );
    });

    it('should not submit if user form is invalid', async () => {
      component.userForm.get('email')?.setValue('invalid-email');

      await component.onSubmit();

      expect(mockUserService.update).not.toHaveBeenCalled();
    });

    it('should not submit if no current user', async () => {
      component.currentUser = null;

      await component.onSubmit();

      expect(mockUserService.update).not.toHaveBeenCalled();
    });

    it('should clear password fields after successful submission', async () => {
      await component.onSubmit();

      expect(component.userForm.get('currentPassword')?.value).toBe('');
      expect(component.userForm.get('newPassword')?.value).toBe('');
      expect(component.userForm.get('confirmPassword')?.value).toBe('');
    });

    it('should clear success message after timeout', (done) => {
      component.onSubmit().then(() => {
        expect(component.successMessage).toBe('Dados atualizados com sucesso!');

        setTimeout(() => {
          expect(component.successMessage).toBe('');
          expect(component.isSuccess).toBe(false);
          done();
        }, 3100);
      });
    });
  });

  describe('Settings Form Submission', () => {
    beforeEach(() => {
      component.currentUser = mockAuthUser;
      component.settingsForm.patchValue({
        notifications: false,
        language: 'en-US',
        currency: 'USD',
        twoFactorAuth: true,
        emailAlerts: false,
        smsAlerts: true,
        theme: 'dark',
      });
    });

    it('should submit settings form successfully', async () => {
      await component.onSubmitSettings();

      expect(component.isSettingsLoading).toBe(false);
      expect(mockUserSettingsService.updateUserSettings).toHaveBeenCalledWith(
        '1',
        {
          notifications: false,
          language: 'en-US',
          currency: 'USD',
          twoFactorAuth: true,
          emailAlerts: false,
          smsAlerts: true,
          theme: 'dark',
        }
      );
      expect(component.settingsSuccessMessage).toBe(
        'Configurações atualizadas com sucesso!'
      );
    });

    it('should handle settings form submission error', async () => {
      mockUserSettingsService.updateUserSettings.and.returnValue(
        throwError(() => new Error('Settings error'))
      );

      await component.onSubmitSettings();

      expect(component.isSettingsLoading).toBe(false);
      expect(component.settingsErrorMessage).toBe(
        'Erro ao atualizar configurações. Tente novamente.'
      );
    });

    it('should not submit if settings form is invalid', async () => {
      component.settingsForm.get('language')?.setValue('');
      component.settingsForm.get('language')?.setErrors({ required: true });

      await component.onSubmitSettings();

      expect(mockUserSettingsService.updateUserSettings).not.toHaveBeenCalled();
    });

    it('should not submit if no current user', async () => {
      component.currentUser = null;

      await component.onSubmitSettings();

      expect(mockUserSettingsService.updateUserSettings).not.toHaveBeenCalled();
    });

    it('should sync theme when settings are updated', async () => {
      const updatedSettings = { ...mockUserSettings, theme: 'dark' };
      mockUserSettingsService.updateUserSettings.and.returnValue(
        of(updatedSettings)
      );
      component.currentSettings = mockUserSettings; // Set initial theme to 'light'

      // Set the form with the new theme value
      component.settingsForm.patchValue({ theme: 'dark' });

      await component.onSubmitSettings();

      expect(mockThemeService.setThemeFromUserSettings).toHaveBeenCalledWith(
        'dark'
      );
    });

    it('should clear success message after timeout', (done) => {
      component.onSubmitSettings().then(() => {
        expect(component.settingsSuccessMessage).toBe(
          'Configurações atualizadas com sucesso!'
        );

        setTimeout(() => {
          expect(component.settingsSuccessMessage).toBe('');
          done();
        }, 3100);
      });
    });
  });

  describe('Theme Management', () => {
    beforeEach(() => {
      component.currentUser = mockAuthUser;
    });

    it('should apply theme immediately and update user settings', () => {
      component.onThemeChange('dark');

      expect(mockThemeService.setThemeFromUserSettings).toHaveBeenCalledWith(
        'dark'
      );
      expect(mockUserSettingsService.updateTheme).toHaveBeenCalledWith(
        '1',
        'dark'
      );
    });

    it('should handle theme update error gracefully', () => {
      mockUserSettingsService.updateTheme.and.returnValue(
        throwError(() => new Error('Theme error'))
      );
      spyOn(console, 'error');

      component.onThemeChange('dark');

      expect(mockThemeService.setThemeFromUserSettings).toHaveBeenCalledWith(
        'dark'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Erro ao atualizar tema:',
        jasmine.any(Error)
      );
      expect(component.settingsErrorMessage).toBe(
        'Erro ao sincronizar tema. Tema aplicado localmente.'
      );
    });

    it('should apply theme even when no user is logged in', () => {
      component.currentUser = null;

      component.onThemeChange('dark');

      expect(mockThemeService.setThemeFromUserSettings).toHaveBeenCalledWith(
        'dark'
      );
      expect(mockUserSettingsService.updateTheme).not.toHaveBeenCalled();
    });
  });

  describe('Error Messages', () => {
    it('should return correct error messages for form fields', () => {
      component.userForm.get('name')?.setValue('');
      component.userForm.get('name')?.markAsTouched();

      expect(component.getErrorMessage('name')).toBe('Nome é obrigatório');

      component.userForm.get('email')?.setValue('invalid');
      component.userForm.get('email')?.markAsTouched();

      expect(component.getErrorMessage('email')).toBe('Email inválido');
    });

    it('should return password mismatch error', () => {
      component.userForm.get('newPassword')?.setValue('password123');
      component.userForm.get('confirmPassword')?.setValue('different');
      component.userForm.get('confirmPassword')?.markAsTouched();

      expect(component.getErrorMessage('confirmPassword')).toBe(
        'As senhas não coincidem'
      );
    });

    it('should check if field is invalid correctly', () => {
      component.userForm.get('name')?.setValue('');
      component.userForm.get('name')?.markAsTouched();

      expect(component.isFieldInvalid('name')).toBe(true);

      component.userForm.get('name')?.setValue('Valid Name');

      expect(component.isFieldInvalid('name')).toBe(false);
    });
  });

  describe('Form Reset', () => {
    it('should reset user form and clear messages', () => {
      component.currentUser = mockAuthUser;
      component.errorMessage = 'Some error';
      component.successMessage = 'Some success';
      spyOn(component, 'loadUserData');

      component.resetForm();

      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
      expect(component.loadUserData).toHaveBeenCalledWith('1');
    });

    it('should reset settings form and clear messages', () => {
      component.currentUser = mockAuthUser;
      component.settingsErrorMessage = 'Some error';
      component.settingsSuccessMessage = 'Some success';
      spyOn(component, 'loadUserSettings');

      component.resetSettingsForm();

      expect(component.settingsErrorMessage).toBe('');
      expect(component.settingsSuccessMessage).toBe('');
      expect(component.loadUserSettings).toHaveBeenCalledWith('1');
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
