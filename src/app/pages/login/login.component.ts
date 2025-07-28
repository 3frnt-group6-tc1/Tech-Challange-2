import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../shared/services/Auth/auth.service';
import { AuthFacade } from '../../store/ngrx/auth/auth.facade';
import { TextComponent } from '../../shared/components/text/text.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconEyeComponent } from '../../shared/assets/icons/icon-eye.component';
import { IconLogoComponent } from '../../shared/assets/icons/icon-logo.component';
import { IconErrorComponent } from '../../shared/assets/icons/icon-error.component';
import { IconLoadingComponent } from '../../shared/assets/icons/icon-loading.component';
import { take, filter, takeUntil, combineLatest } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TextComponent,
    ButtonComponent,
    IconEyeComponent,
    IconLogoComponent,
    IconErrorComponent,
    IconLoadingComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  credentials: LoginRequest = {
    email: '',
    password: '',
  };

  isLoading = false;
  errorMessage = '';
  showPassword = false;
  private destroy$ = new Subject<void>();

  constructor(private authFacade: AuthFacade, private router: Router) {}

  ngOnInit(): void {
    // If already authenticated, redirect to panel
    this.authFacade.isAuthenticated$.pipe(take(1)).subscribe((isAuth: boolean) => {
      if (isAuth) {
        this.router.navigate(['/panel']);
      }
    });

    this.authFacade.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((loading: boolean) => {
      this.isLoading = loading;
    });

    this.authFacade.error$.pipe(
      takeUntil(this.destroy$),
      filter((error: any) => !!error)
    ).subscribe((error: any) => {
      this.handleLoginError(error);
    });

    // Observar sucesso de autenticação
    this.authFacade.isAuthenticated$.pipe(
      takeUntil(this.destroy$),
      filter((isAuth: boolean) => isAuth && !this.isLoading)
    ).subscribe(() => {
      this.router.navigate(['/panel']);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.isFormValid()) {
      this.login();
    }
  }

  /**
   * Perform login
   */
  private login(): void {
    this.errorMessage = '';
    this.authFacade.login(this.credentials);
  }

  /**
   * Handle login errors
   */
  private handleLoginError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Email ou senha incorretos';
    } else if (error.status === 400) {
      this.errorMessage = 'Por favor, verifique os dados informados';
    } else if (error.status === 0) {
      this.errorMessage = 'Erro de conexão. Verifique sua internet';
    } else {
      this.errorMessage = 'Erro interno do servidor. Tente novamente';
    }
  }

  /**
   * Validate form
   */
  private isFormValid(): boolean {
    if (!this.credentials.email.trim()) {
      this.errorMessage = 'Email é obrigatório';
      return false;
    }

    if (!this.isValidEmail(this.credentials.email)) {
      this.errorMessage = 'Email inválido';
      return false;
    }

    if (!this.credentials.password.trim()) {
      this.errorMessage = 'Senha é obrigatória';
      return false;
    }

    if (this.credentials.password.length < 6) {
      this.errorMessage = 'Senha deve ter pelo menos 6 caracteres';
      return false;
    }

    return true;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage = '';
  }
}
