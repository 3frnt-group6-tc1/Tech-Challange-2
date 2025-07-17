import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'isAuthenticated',
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule, CommonModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to panel if already authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    component.ngOnInit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/panel']);
  });

  it('should not redirect if not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    component.ngOnInit();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  describe('form validation', () => {
    it('should show error for empty email', () => {
      component.credentials.email = '';
      component.credentials.password = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Email é obrigatório');
    });

    it('should show error for invalid email', () => {
      component.credentials.email = 'invalid-email';
      component.credentials.password = 'password123';

      component.onSubmit();

      expect(component.errorMessage).toBe('Email inválido');
    });

    it('should show error for empty password', () => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = '';

      component.onSubmit();

      expect(component.errorMessage).toBe('Senha é obrigatória');
    });

    it('should show error for short password', () => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = '123';

      component.onSubmit();

      expect(component.errorMessage).toBe(
        'Senha deve ter pelo menos 6 caracteres'
      );
    });
  });

  describe('login', () => {
    beforeEach(() => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
    });

    it('should login successfully and redirect', () => {
      const mockResponse = {
        message: 'Login successful',
        result: {
          token: 'mock-token',
        },
        user: { id: '1', email: 'test@example.com', username: 'test' },
      };
      authServiceSpy.login.and.returnValue(of(mockResponse));

      component.onSubmit();

      expect(authServiceSpy.login).toHaveBeenCalledWith(component.credentials);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/panel']);
      expect(component.isLoading).toBe(false);
    });

    it('should handle 401 error', () => {
      authServiceSpy.login.and.returnValue(throwError({ status: 401 }));

      component.onSubmit();

      expect(component.errorMessage).toBe('Email ou senha incorretos');
      expect(component.isLoading).toBe(false);
    });

    it('should handle 400 error', () => {
      authServiceSpy.login.and.returnValue(throwError({ status: 400 }));

      component.onSubmit();

      expect(component.errorMessage).toBe(
        'Por favor, verifique os dados informados'
      );
      expect(component.isLoading).toBe(false);
    });

    it('should handle connection error', () => {
      authServiceSpy.login.and.returnValue(throwError({ status: 0 }));

      component.onSubmit();

      expect(component.errorMessage).toBe(
        'Erro de conexão. Verifique sua internet'
      );
      expect(component.isLoading).toBe(false);
    });

    it('should handle server error', () => {
      authServiceSpy.login.and.returnValue(throwError({ status: 500 }));

      component.onSubmit();

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

  it('should clear error message', () => {
    component.errorMessage = 'Some error';

    component.clearError();

    expect(component.errorMessage).toBe('');
  });
});
