import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { UserService } from '../../shared/services/User/user-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let router: Router;
  let routerSpy: jasmine.Spy;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const userSpy = jasmine.createSpyObj('UserService', ['create', 'getAll']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        FormsModule,
        CommonModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to panel if already authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledWith(['/panel']);
  });

  it('should not redirect if not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    component.ngOnInit();

    expect(routerSpy).not.toHaveBeenCalled();
  });

  describe('form validation', () => {
    it('should show error for empty name', () => {
      component.credentials.name = '';
      component.credentials.username = 'testuser';
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Nome completo é obrigatório');
    });

    it('should show error for short name', () => {
      component.credentials.name = 'a';
      component.credentials.username = 'testuser';
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe(
        'Nome completo deve ter pelo menos 2 caracteres'
      );
    });

    it('should show error for empty username', () => {
      component.credentials.name = 'Test User';
      component.credentials.username = '';
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Nome de usuário é obrigatório');
    });

    it('should show error for short username', () => {
      component.credentials.name = 'Test User';
      component.credentials.username = 'ab';
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe(
        'Nome de usuário deve ter pelo menos 3 caracteres'
      );
    });

    it('should show error for empty email', () => {
      component.credentials.name = 'Test User';
      component.credentials.username = 'testuser';
      component.credentials.email = '';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Email é obrigatório');
    });

    it('should show error for invalid email', () => {
      component.credentials.name = 'Test User';
      component.credentials.username = 'testuser';
      component.credentials.email = 'invalid-email';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Email inválido');
    });

    it('should show error for empty password', () => {
      component.credentials.name = 'Test User';
      component.credentials.username = 'testuser';
      component.credentials.email = 'test@example.com';
      component.credentials.password = '';
      component.confirmPassword = '';

      component.onSubmit();

      expect(component.errorMessage).toBe('Senha é obrigatória');
    });

    it('should show error for short password', () => {
      component.credentials.name = 'Test User';
      component.credentials.username = 'testuser';
      component.credentials.email = 'test@example.com';
      component.credentials.password = '123';
      component.confirmPassword = '123';

      component.onSubmit();

      expect(component.errorMessage).toBe(
        'Senha deve ter pelo menos 6 caracteres'
      );
    });

    it('should show error for empty confirm password', () => {
      component.credentials.name = 'Test User';
      component.credentials.username = 'testuser';
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.confirmPassword = '';

      component.onSubmit();

      expect(component.errorMessage).toBe('Confirmação de senha é obrigatória');
    });

    it('should show error for password mismatch', () => {
      component.credentials.name = 'Test User';
      component.credentials.username = 'testuser';
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'different123';

      component.onSubmit();

      expect(component.errorMessage).toBe('As senhas não coincidem');
    });
  });

  describe('register', () => {
    beforeEach(() => {
      component.credentials.name = 'Test User';
      component.credentials.username = 'testuser';
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.confirmPassword = 'password123';

      // Mock getAll to return empty array (no existing users)
      userServiceSpy.getAll.and.returnValue(of([]));
    });

    it('should register successfully and redirect', async () => {
      const mockResponse = {
        id: '1',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      userServiceSpy.create.and.returnValue(of(mockResponse));
      jasmine.clock().install();

      await component.onSubmit();

      expect(userServiceSpy.create).toHaveBeenCalledWith({
        id: '',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(component.isLoading).toBe(false);
      expect(component.successMessage).toBe(
        'Conta criada com sucesso! Redirecionando para o login...'
      );

      jasmine.clock().tick(2001);
      expect(routerSpy).toHaveBeenCalledWith(['/login']);

      jasmine.clock().uninstall();
    });

    it('should handle email already exists', async () => {
      // Mock getAll to return user with same email
      const existingUsers = [
        {
          id: '1',
          name: 'Existing User',
          username: 'existing',
          email: 'test@example.com',
          password: 'password',
        },
      ];
      userServiceSpy.getAll.and.returnValue(of(existingUsers));

      await component.onSubmit();

      expect(component.errorMessage).toBe(
        'Este email já está sendo usado por outro usuário'
      );
      expect(component.isLoading).toBe(false);
    });

    it('should handle 409 error (email already exists)', async () => {
      userServiceSpy.create.and.returnValue(throwError({ status: 409 }));

      await component.onSubmit();

      expect(component.errorMessage).toBe('Este email já está em uso');
      expect(component.isLoading).toBe(false);
    });

    it('should handle 400 error', async () => {
      userServiceSpy.create.and.returnValue(throwError({ status: 400 }));

      await component.onSubmit();

      expect(component.errorMessage).toBe(
        'Por favor, verifique os dados informados'
      );
      expect(component.isLoading).toBe(false);
    });

    it('should handle connection error', async () => {
      userServiceSpy.create.and.returnValue(throwError({ status: 0 }));

      await component.onSubmit();

      expect(component.errorMessage).toBe(
        'Erro de conexão. Verifique sua internet'
      );
      expect(component.isLoading).toBe(false);
    });

    it('should handle server error', async () => {
      userServiceSpy.create.and.returnValue(throwError({ status: 500 }));

      await component.onSubmit();

      expect(component.errorMessage).toBe(
        'Erro interno do servidor. Tente novamente'
      );
      expect(component.isLoading).toBe(false);
    });
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBe(false);

    component.togglePasswordVisibility();

    expect(component.showPassword).toBe(true);
  });

  it('should toggle confirm password visibility', () => {
    expect(component.showConfirmPassword).toBe(false);

    component.toggleConfirmPasswordVisibility();

    expect(component.showConfirmPassword).toBe(true);
  });

  it('should clear error message', () => {
    component.errorMessage = 'Some error';

    component.clearError();

    expect(component.errorMessage).toBe('');
  });

  it('should clear success message', () => {
    component.successMessage = 'Some success';

    component.clearSuccess();

    expect(component.successMessage).toBe('');
  });
});
