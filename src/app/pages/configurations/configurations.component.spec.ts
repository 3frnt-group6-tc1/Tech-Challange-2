import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { ConfigurationsComponent } from './configurations.component';
import { AuthService, AuthUser } from '../../shared/services/Auth/auth.service';
import { UserService } from '../../shared/services/User/user-service';
import { User } from '../../shared/models/user';

// Mock component for routing
@Component({ template: '' })
class MockComponent {}

describe('ConfigurationsComponent', () => {
  let component: ConfigurationsComponent;
  let fixture: ComponentFixture<ConfigurationsComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let mockCurrentUserSubject: BehaviorSubject<AuthUser | null>;
  let router: Router;

  const mockUser: AuthUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
  };

  const mockUserData: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    password: 'password123',
  };

  beforeEach(async () => {
    mockCurrentUserSubject = new BehaviorSubject<AuthUser | null>(null);

    const authSpy = jasmine.createSpyObj('AuthService', ['updateCurrentUser'], {
      currentUser$: mockCurrentUserSubject.asObservable(),
    });

    const userSpy = jasmine.createSpyObj('UserService', [
      'getById',
      'getAll',
      'update',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ConfigurationsComponent,
        ReactiveFormsModule,
        CommonModule,
        RouterTestingModule.withRoutes([
          { path: 'panel', component: MockComponent },
          { path: 'login', component: MockComponent },
        ]),
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationsComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with proper validators', () => {
    expect(component.userForm).toBeDefined();
    expect(component.userForm.get('name')).toBeDefined();
    expect(component.userForm.get('email')).toBeDefined();
    expect(component.userForm.get('currentPassword')).toBeDefined();
    expect(component.userForm.get('newPassword')).toBeDefined();
    expect(component.userForm.get('confirmPassword')).toBeDefined();
  });

  it('should load user data when currentUser is set', () => {
    userServiceSpy.getById.and.returnValue(of(mockUserData));

    mockCurrentUserSubject.next(mockUser);
    fixture.detectChanges();

    expect(userServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.userForm.get('name')?.value).toBe('Test User');
    expect(component.userForm.get('email')?.value).toBe('test@example.com');
  });

  it('should handle error when loading user data', () => {
    userServiceSpy.getById.and.returnValue(throwError('Error loading user'));

    mockCurrentUserSubject.next(mockUser);
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Erro ao carregar dados do usuário');
    expect(component.isLoading).toBe(false);
  });

  describe('form validation', () => {
    beforeEach(() => {
      mockCurrentUserSubject.next(mockUser);
      userServiceSpy.getById.and.returnValue(of(mockUserData));
      fixture.detectChanges();
    });

    it('should show error for empty name', () => {
      component.userForm.patchValue({ name: '' });
      component.userForm.get('name')?.markAsTouched();

      const errorMessage = component.getErrorMessage('name');
      expect(errorMessage).toBe('Nome é obrigatório');
    });

    it('should show error for short name', () => {
      component.userForm.patchValue({ name: 'a' });
      component.userForm.get('name')?.markAsTouched();

      const errorMessage = component.getErrorMessage('name');
      expect(errorMessage).toBe('Nome deve ter pelo menos 2 caracteres');
    });

    it('should show error for empty email', () => {
      component.userForm.patchValue({ email: '' });
      component.userForm.get('email')?.markAsTouched();

      const errorMessage = component.getErrorMessage('email');
      expect(errorMessage).toBe('Email é obrigatório');
    });

    it('should show error for invalid email', () => {
      component.userForm.patchValue({ email: 'invalid-email' });
      component.userForm.get('email')?.markAsTouched();

      const errorMessage = component.getErrorMessage('email');
      expect(errorMessage).toBe('Email inválido');
    });

    it('should show error for short new password', () => {
      component.userForm.patchValue({ newPassword: '123' });
      component.userForm.get('newPassword')?.markAsTouched();

      const errorMessage = component.getErrorMessage('newPassword');
      expect(errorMessage).toBe('Nova senha deve ter pelo menos 6 caracteres');
    });

    it('should show error when passwords do not match', () => {
      component.userForm.patchValue({
        newPassword: 'password123',
        confirmPassword: 'different123',
      });
      component.userForm.get('confirmPassword')?.markAsTouched();

      const errorMessage = component.getErrorMessage('confirmPassword');
      expect(errorMessage).toBe('As senhas não coincidem');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      mockCurrentUserSubject.next(mockUser);
      userServiceSpy.getById.and.returnValue(of(mockUserData));
      fixture.detectChanges();
    });

    it('should not submit if form is invalid', async () => {
      component.userForm.patchValue({
        name: '',
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(userServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should update user successfully without password change', async () => {
      const updatedUser = { ...mockUserData, name: 'Updated Name' };
      userServiceSpy.getAll.and.returnValue(of([]));
      userServiceSpy.update.and.returnValue(of(updatedUser));

      component.userForm.patchValue({
        name: 'Updated Name',
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(userServiceSpy.update).toHaveBeenCalledWith(
        '1',
        jasmine.objectContaining({
          name: 'Updated Name',
          email: 'test@example.com',
        })
      );
      expect(component.successMessage).toBe('Dados atualizados com sucesso!');
      expect(authServiceSpy.updateCurrentUser).toHaveBeenCalled();
    });

    it('should update user successfully with password change', async () => {
      const updatedUser = { ...mockUserData, name: 'Updated Name' };
      userServiceSpy.getAll.and.returnValue(of([]));
      userServiceSpy.update.and.returnValue(of(updatedUser));

      component.userForm.patchValue({
        name: 'Updated Name',
        email: 'test@example.com',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      await component.onSubmit();

      expect(userServiceSpy.update).toHaveBeenCalledWith(
        '1',
        jasmine.objectContaining({
          name: 'Updated Name',
          email: 'test@example.com',
          password: 'newpassword123',
        })
      );
      expect(component.successMessage).toBe('Dados atualizados com sucesso!');
    });

    it('should handle email already exists error', async () => {
      const existingUsers = [
        {
          id: '2',
          email: 'test@example.com',
          username: 'other',
          name: 'Other',
          password: 'pass',
        },
      ];
      userServiceSpy.getAll.and.returnValue(of(existingUsers));

      component.userForm.patchValue({
        name: 'Updated Name',
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.errorMessage).toBe(
        'Este email já está sendo usado por outro usuário'
      );
      expect(userServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should handle update error', async () => {
      userServiceSpy.getAll.and.returnValue(of([]));
      userServiceSpy.update.and.returnValue(throwError('Update failed'));

      component.userForm.patchValue({
        name: 'Updated Name',
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.errorMessage).toBe(
        'Erro ao atualizar dados. Tente novamente.'
      );
      expect(component.isLoading).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should check if field is invalid', () => {
      component.userForm.get('name')?.markAsTouched();
      component.userForm.get('name')?.setErrors({ required: true });

      expect(component.isFieldInvalid('name')).toBe(true);
    });

    it('should reset form', () => {
      component.errorMessage = 'Error';
      component.successMessage = 'Success';
      component.currentUser = mockUser;
      userServiceSpy.getById.and.returnValue(of(mockUserData));

      component.resetForm();

      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });
  });

  it('should clean up subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
