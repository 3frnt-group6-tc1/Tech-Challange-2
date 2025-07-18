import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../../services/Account/account.service';
import { AuthService, AuthUser } from '../../services/Auth/auth.service';
import { Account, AccountSummary } from '../../models/account';
import { Investment, InvestmentSummary } from '../../models/investment';

@Component({
  selector: 'app-investment-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-dashboard.component.html',
  styleUrls: ['./investment-dashboard.component.scss'],
})
export class InvestmentDashboardComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() investments: Investment[] = [];
  @Input() investmentSummary: InvestmentSummary | null = null;
  @Input() loading: boolean = false;
  @Input() showBalance: boolean = true;
  @Output() toggleBalance = new EventEmitter<void>();

  userName: string = '';
  currentUser: AuthUser | null = null;
  currentDate: string = '';
  balance: string = '';
  accountType: string = 'Investimentos';
  isLoading: boolean = true;
  errorMessage: string = '';

  // Dados da conta
  accounts: Account[] = [];
  currentAccount: Account | null = null;

  // Valor total calculado
  totalInvestmentValue: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setCurrentDate();
    this.loadUserData();
    this.updateInvestmentBalance();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['investments'] ||
      changes['investmentSummary'] ||
      changes['loading']
    ) {
      this.isLoading = this.loading;
      this.updateInvestmentBalance();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setCurrentDate(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    this.currentDate = now.toLocaleDateString('pt-BR', options);
  }

  private loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.userName = this.currentUser.name || '';
      this.loadAccountData();
    } else {
      this.isLoading = false;
      this.errorMessage = 'Usuário não encontrado';
    }
  }

  private updateInvestmentBalance(): void {
    if (this.investmentSummary) {
      this.totalInvestmentValue = this.investmentSummary.totalValue;
    } else if (this.investments.length > 0) {
      this.totalInvestmentValue = this.investments.reduce(
        (total, inv) => total + inv.value,
        0
      );
    } else {
      this.totalInvestmentValue = 0;
    }

    this.balance = this.formatCurrency(this.totalInvestmentValue);
  }

  private loadAccountData(): void {
    this.accountService
      .getByUserId()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AccountSummary) => {
          if (response?.result?.account) {
            this.accounts = response.result.account;
            this.currentAccount = this.accounts[0] || null;
          }
          // O balance agora será atualizado pelos dados de investimento
          this.updateInvestmentBalance();
        },
        error: (error: any) => {
          console.error('Erro ao carregar dados da conta:', error);
          this.errorMessage = 'Erro ao carregar informações da conta';
          this.isLoading = false;
        },
      });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  onToggleBalance(): void {
    this.toggleBalance.emit();
  }

  // Métodos para exposição de dados aos componentes filhos
  getInvestments(): Investment[] {
    return this.investments;
  }

  getInvestmentSummary(): InvestmentSummary | null {
    return this.investmentSummary;
  }

  getTotalInvestmentValue(): number {
    return this.totalInvestmentValue;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }
}
