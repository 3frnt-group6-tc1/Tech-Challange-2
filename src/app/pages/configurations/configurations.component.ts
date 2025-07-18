import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil, firstValueFrom, combineLatest } from 'rxjs';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { AuthService, AuthUser } from '../../shared/services/Auth/auth.service';
import { UserService } from '../../shared/services/User/user-service';
import { UserSettingsService } from '../../shared/services/UserSettings/user-settings.service';
import { ThemeService } from '../../shared/services/Theme/theme.service';
import { User, UserSettings } from '../../shared/models/user';

@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [LayoutComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.scss',
})
export class ConfigurationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userForm!: FormGroup;
  settingsForm!: FormGroup;
  currentUser: AuthUser | null = null;
  currentSettings: UserSettings | null = null;
  isLoading = false;
  isSettingsLoading = false;
  isSuccess = false;
  errorMessage = '';
  successMessage = '';
  settingsErrorMessage = '';
  settingsSuccessMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private userSettingsService: UserSettingsService,
    private themeService: ThemeService
  ) {
    this.initForm();
    this.initSettingsForm();
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        if (user) {
          this.loadUserData(user.id);
          this.loadUserSettings(user.id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.userForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        currentPassword: [''],
        newPassword: ['', [Validators.minLength(6)]],
        confirmPassword: [''],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private initSettingsForm(): void {
    this.settingsForm = this.fb.group({
      notifications: [true],
      language: ['pt-BR'],
      currency: ['BRL'],
      twoFactorAuth: [false],
      emailAlerts: [true],
      smsAlerts: [false],
      theme: ['light'],
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword?.value && confirmPassword?.value) {
      return newPassword.value === confirmPassword.value
        ? null
        : { passwordMismatch: true };
    }
    return null;
  }

  loadUserData(userId: string): void {
    this.isLoading = true;
    this.userService
      .getById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.userForm.patchValue({
            name: user.name || user.username || '',
            email: user.email,
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar dados do usuário:', error);
          this.errorMessage = 'Erro ao carregar dados do usuário';
          this.isLoading = false;
        },
      });
  }

  loadUserSettings(userId: string): void {
    this.isSettingsLoading = true;
    this.userSettingsService
      .getUserSettings(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.currentSettings = settings;
          this.settingsForm.patchValue(settings);
          this.isSettingsLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar configurações do usuário:', error);
          // Se não encontrar configurações, usar as padrões
          const defaultSettings = this.userSettingsService.getDefaultSettings();
          this.currentSettings = defaultSettings;
          this.settingsForm.patchValue(defaultSettings);
          this.isSettingsLoading = false;
        },
      });
  }

  private async checkEmailExists(
    email: string,
    currentUserId: string
  ): Promise<boolean> {
    try {
      const users = await firstValueFrom(this.userService.getAll());
      if (!Array.isArray(users)) return false;
      return users.some(
        (user) => user.email === email && user.id !== currentUserId
      );
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid || !this.currentUser) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.userForm.value;

    // Verificar se o email já existe
    const emailExists = await this.checkEmailExists(
      formValue.email,
      this.currentUser.id
    );
    if (emailExists) {
      this.errorMessage = 'Este email já está sendo usado por outro usuário';
      this.isLoading = false;
      return;
    }

    // Preparar dados para atualização
    const updateData: Partial<User> = {
      name: formValue.name,
      email: formValue.email,
    };

    // Se nova senha foi fornecida, incluir na atualização
    if (formValue.newPassword) {
      updateData.password = formValue.newPassword;
    }

    this.userService
      .update(this.currentUser.id, updateData as User)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          this.successMessage = 'Dados atualizados com sucesso!';
          this.isSuccess = true;

          // Limpar campos de senha
          this.userForm.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });

          // Atualizar dados do usuário no AuthService
          this.authService.updateCurrentUser({
            username: updatedUser.name || updatedUser.username || '',
            name: updatedUser.name,
            email: updatedUser.email,
          });

          this.isLoading = false;

          // Limpar mensagem de sucesso após 3 segundos
          setTimeout(() => {
            this.successMessage = '';
            this.isSuccess = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
          this.errorMessage = 'Erro ao atualizar dados. Tente novamente.';
          this.isLoading = false;
        },
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach((key) => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} é obrigatório`;
      }
      if (control.errors['email']) {
        return 'Email inválido';
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(
          fieldName
        )} deve ter pelo menos ${minLength} caracteres`;
      }
    }

    if (
      fieldName === 'confirmPassword' &&
      this.userForm.errors?.['passwordMismatch'] &&
      control?.touched
    ) {
      return 'As senhas não coincidem';
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      email: 'Email',
      currentPassword: 'Senha atual',
      newPassword: 'Nova senha',
      confirmPassword: 'Confirmar senha',
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!(control?.invalid && control.touched);
  }

  resetForm(): void {
    this.userForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    if (this.currentUser) {
      this.loadUserData(this.currentUser.id);
    }
  }

  async onSubmitSettings(): Promise<void> {
    if (this.settingsForm.invalid || !this.currentUser) {
      return;
    }

    this.isSettingsLoading = true;
    this.settingsErrorMessage = '';
    this.settingsSuccessMessage = '';

    const settingsValue = this.settingsForm.value as UserSettings;

    this.userSettingsService
      .updateUserSettings(this.currentUser.id, settingsValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedSettings) => {
          this.settingsSuccessMessage =
            'Configurações atualizadas com sucesso!';

          // Sync theme if it changed (check before updating currentSettings)
          if (updatedSettings.theme !== this.currentSettings?.theme) {
            this.themeService.setThemeFromUserSettings(updatedSettings.theme);
          }

          this.currentSettings = updatedSettings;

          this.isSettingsLoading = false;

          // Clear success message after 3 seconds
          setTimeout(() => {
            this.settingsSuccessMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Erro ao atualizar configurações:', error);
          this.settingsErrorMessage =
            'Erro ao atualizar configurações. Tente novamente.';
          this.isSettingsLoading = false;
        },
      });
  }

  onThemeChange(theme: string): void {
    // Apply theme immediately for better UX
    this.themeService.setThemeFromUserSettings(theme);

    if (this.currentUser) {
      // Update user settings in the API
      this.userSettingsService
        .updateTheme(this.currentUser.id, theme)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedSettings) => {
            this.currentSettings = updatedSettings;
          },
          error: (error) => {
            console.error('Erro ao atualizar tema:', error);
            // Theme was already applied locally, so user sees the change
            // but we show an error message for the failed sync
            this.settingsErrorMessage =
              'Erro ao sincronizar tema. Tema aplicado localmente.';
            setTimeout(() => {
              this.settingsErrorMessage = '';
            }, 3000);
          },
        });
    }
    // If no user is logged in, theme is saved to localStorage automatically
  }

  resetSettingsForm(): void {
    this.settingsForm.reset();
    this.settingsErrorMessage = '';
    this.settingsSuccessMessage = '';
    if (this.currentUser) {
      this.loadUserSettings(this.currentUser.id);
    }
  }
}
