import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../../services/Account/account.service';
import { AuthService, AuthUser } from '../../services/Auth/auth.service';
import {
  Transaction,
  isCredit,
  isDebit,
  TRANSACTION_TYPE_LABELS,
} from '../../models/transaction';
import { Account, AccountSummary } from '../../models/account';
import { Card } from '../../models/card';
import { TransactionData } from '../../models/transaction-data';
import { TransactionEventService } from '../../services/TransactionEvent/transaction-event.service';
import { TransactionChartComponent } from '../../components/transaction-chart/transaction-chart.component';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { IconEyeComponent } from '../../assets/icons/icon-eye.component';
import { IconBarChartComponent } from '../../assets/icons/icon-bar-chart.component';
import { IconPieChartComponent } from '../../assets/icons/icon-pie-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TransactionChartComponent,
    PieChartComponent,
    IconEyeComponent,
    IconBarChartComponent,
    IconPieChartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName: string = '';
  currentUser: AuthUser | null = null;
  currentDate: string = '';
  currentMonthName: string = '';
  balance: string = '';
  accountType: string = 'Conta Corrente';
  totalEntries: string = '';
  totalExits: string = '';
  totalEntriesNumber: number = 0;
  totalExitsNumber: number = 0;
  transactionTypeLabels = TRANSACTION_TYPE_LABELS;

  showBalance: boolean = true;
  isLoading: boolean = true;

  // Dados da conta
  accounts: Account[] = [];
  currentAccount: Account | null = null;
  cards: Card[] = [];

  transactionData: TransactionData[] = [];
  transactions: Transaction[] = [];
  currentMonthTransactions: Transaction[] = [];
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

  chartType: 'bar' | 'pie' = 'bar';

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private transactionEventService: TransactionEventService
  ) {}

  ngOnInit(): void {
    this.setCurrentDate();
    this.subscribeToAuthUser();
    this.subscribeToTransactionEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeToTransactionEvents(): void {
    this.transactionEventService.transactionCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transaction) => {
        this.transactions = [...this.transactions, transaction];
        this.filterCurrentMonthTransactions();
        this.updateDashboardData();
      });

    this.transactionEventService.transactionUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transaction) => {
        this.transactions = this.transactions.map((t) =>
          t.id === transaction.id ? transaction : t
        );
        this.filterCurrentMonthTransactions();
        this.updateDashboardData();
      });

    this.transactionEventService.transactionDeleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transactionId) => {
        const deletedTransaction = this.transactions.find(
          (t) => t.id === transactionId
        );
        if (deletedTransaction) {
          this.transactions = this.transactions.filter(
            (t) => t.id !== transactionId
          );
          this.filterCurrentMonthTransactions();
          this.updateDashboardData();
        }
      });
  }

  setCurrentDate(): void {
    const weekDays = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];

    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const today = new Date();
    const weekDay = weekDays[today.getDay()];
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hour = String(today.getHours()).padStart(2, '0');
    const minute = String(today.getMinutes()).padStart(2, '0');

    this.currentDate = `${weekDay}, ${day}/${month}/${year} ${hour}:${minute}`;
    this.currentMonthName = months[today.getMonth()];
  }

  private subscribeToAuthUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: AuthUser | null) => {
        this.currentUser = user;
        if (user) {
          this.successUser(user);
        }
      });
  }

  successUser(user: AuthUser): void {
    this.errorMessage = '';
    this.userName = user.name || user.username;
    this.fetchAccountData();
  }

  fetchAccountData(): void {
    this.accountService.getByUserId().subscribe({
      next: (response: AccountSummary) => {
        this.accounts = response.result.account;
        this.transactions = response.result.transactions;
        this.cards = response.result.cards;

        // Define a conta principal (primeira conta)
        this.currentAccount = this.accounts[0];
        this.accountType = this.currentAccount.type;

        this.filterCurrentMonthTransactions();
        this.successTransaction();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao buscar dados da conta.';
        console.error('Error fetching account data:', error);
      },
    });
  }

  filterCurrentMonthTransactions(): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    this.currentMonthTransactions = this.transactions.filter((transaction) => {
      const transactionDate = transaction.date
        ? new Date(transaction.date)
        : new Date();
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });
  }

  successTransaction(): void {
    this.updateDashboardData();
  }

  updateDashboardData(): void {
    let totalEntries = 0;
    let totalExits = 0;

    this.currentMonthTransactions.forEach((transaction) => {
      if (isCredit(transaction.type)) {
        totalEntries += transaction.amount;
      }
      if (isDebit(transaction.type)) {
        totalExits += transaction.amount * -1;
      }
    });

    this.totalEntriesNumber = totalEntries;
    this.totalExitsNumber = totalExits;
    this.totalEntries = this.formatBalance(totalEntries);
    this.totalExits = this.formatBalance(totalExits);
    this.balance = this.formatBalance(totalEntries - totalExits);

    const weeklyData: { [key: string]: { entries: number; exits: number } } = {
      '1': { entries: 0, exits: 0 },
      '2': { entries: 0, exits: 0 },
      '3': { entries: 0, exits: 0 },
      '4': { entries: 0, exits: 0 },
    };

    this.currentMonthTransactions.forEach((transaction) => {
      const date = transaction.date ? new Date(transaction.date) : new Date();
      const dayOfMonth = date.getDate();

      let week = '1';
      if (dayOfMonth >= 1 && dayOfMonth <= 7) {
        week = '1';
      } else if (dayOfMonth >= 8 && dayOfMonth <= 14) {
        week = '2';
      } else if (dayOfMonth >= 15 && dayOfMonth <= 21) {
        week = '3';
      } else {
        week = '4';
      }

      if (isCredit(transaction.type)) {
        weeklyData[week].entries += transaction.amount;
      }
      if (isDebit(transaction.type)) {
        weeklyData[week].exits += transaction.amount;
      }
    });

    this.transactionData = Object.entries(weeklyData).map(([day, data]) => ({
      day: `Semana ${day}`,
      entries: data.entries,
      exits: data.exits * -1,
    }));
  }

  formatBalance(amount: number): string {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  toggleBalance(): void {
    this.showBalance = !this.showBalance;
  }

  setChartType(type: 'bar' | 'pie'): void {
    this.chartType = type;
  }
}
