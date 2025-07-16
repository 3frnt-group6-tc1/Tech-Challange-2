import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextComponent } from '../text/text.component';
import { IconArrowPencilComponent } from '../../assets/icons/icon-arrow-pencil.component';
import { IconBinComponent } from '../../assets/icons/icon-bin.component';
import { IconDollarComponent } from '../../assets/icons/icon-dollar.component';
import { IconArrowDownLeftComponent } from '../../assets/icons/icon-arrow-down-left.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeleteModalComponent } from '../modal/delete-modal.component';
import { EditModalComponent } from '../modal/edit-modal.component';
import { S3UploadService } from '../../services/S3/s3-upload.service';

import {
  Transaction,
  TransactionType,
  isCredit,
  isDebit,
  TRANSACTION_TYPE_LABELS,
  Attachment,
} from '../../models/transaction';
import { TransactionService } from '../../services/Transaction/transaction-service';
import { AuthService } from '../../services/Auth/auth.service';
import { TransactionEventService } from '../../services/TransactionEvent/transaction-event.service';
import { IconArrowRightComponent } from '../../assets/icons/icon-arrow-right.component';
import { BrlPipe } from '../../pipes/brl.pipe';
import { FormsModule } from '@angular/forms';
import { IconClipComponent } from '../../assets/icons/icon-clip.component';
import {
  AccountService,
  AccountStatementFilters,
} from '../../services/Account/account.service';
import { AccountStatement } from '../../models/account';

@Component({
  selector: 'app-statement',
  standalone: true,
  imports: [
    CommonModule,
    TextComponent,
    IconArrowPencilComponent,
    IconBinComponent,
    IconDollarComponent,
    IconArrowDownLeftComponent,
    IconArrowRightComponent,
    DeleteModalComponent,
    EditModalComponent,
    BrlPipe,
    FormsModule,
    IconClipComponent,
  ],
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.scss'],
})
export class StatementComponent implements OnInit, OnDestroy {
  @Input() showDetails = true;
  @Input() showAllTransactions = false;
  @Input() customTitle = 'Transações';
  @Input() showLastTransactionsSubtitle = false;
  @Input() swapColumns = false;
  transactions: Transaction[] = [];
  transactionLabels = TRANSACTION_TYPE_LABELS;
  isLoading = false;

  // Propriedades para paginação e scroll infinito
  currentPage = 1;
  itemsPerPage = 10;
  isLoadingMore = false;
  allTransactionsLoaded = false;
  totalTransactions = 0;
  filteredTransactions: Transaction[] = [];

  private destroy$ = new Subject<void>();
  isModalOpen = false;
  transactionToDelete: string | null = null;
  showAlert = false;
  alertMessage = '';
  isEditModalOpen = false;
  transactionToEdit: Transaction | null = null;
  loadingAttachment = false;

  // Filtros para a API de Account Statement
  // Filtros básicos: accountId (path), startDate, endDate, type (deposito, saque, transferencia)
  // Filtros adicionais: minValue, maxValue, from, to, description
  filters = {
    startDate: '',
    endDate: '',
    type: '', // deposito, saque, transferencia
    minValue: '',
    maxValue: '',
    from: '',
    to: '',
    description: '',
  };

  get transactionTypeKeys(): string[] {
    return ['deposito', 'saque', 'transferencia'];
  }

  get recentTransactions(): Transaction[] {
    // Se showAllTransactions for true, usa paginação; senão mostra apenas 6 transações
    if (this.showAllTransactions) {
      const itemsToShow = this.currentPage * this.itemsPerPage;
      this.allTransactionsLoaded =
        itemsToShow >= this.filteredTransactions.length;
      return this.filteredTransactions.slice(0, itemsToShow);
    } else {
      return this.filteredTransactions.slice(0, 6);
    }
  }

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
    private transactionEventService: TransactionEventService,
    private s3UploadService: S3UploadService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.resetPagination();
    this.loadUserTransactions();

    this.transactionEventService.transactionCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transaction) => {
        // Reaplica os filtros para incluir a nova transação
        this.resetPagination();
        this.loadUserTransactions();
      });

    this.transactionEventService.transactionUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transaction) => {
        // Reaplica os filtros para refletir a atualização
        this.loadUserTransactions();
      });

    this.transactionEventService.transactionDeleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transactionId) => {
        // Remove localmente e reaplica filtros
        this.filteredTransactions = this.filteredTransactions.filter(
          (t) => t.id !== transactionId
        );
        this.resetPagination();
        this.loadUserTransactions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Métodos para controle de paginação e scroll infinito
  resetPagination(): void {
    this.currentPage = 1;
    this.allTransactionsLoaded = false;
    this.isLoadingMore = false;
  }

  loadMore(): void {
    if (this.isLoadingMore || this.allTransactionsLoaded) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not authenticated');
      return;
    }

    this.isLoadingMore = true;
    const accountId = this.authService.getPrimaryAccountId();

    const filterParams = {
      startDate: this.filters.startDate || undefined,
      endDate: this.filters.endDate || undefined,
      type: this.filters.type || undefined,
      minValue: this.filters.minValue || undefined,
      maxValue: this.filters.maxValue || undefined,
      from: this.filters.from || undefined,
      to: this.filters.to || undefined,
      description: this.filters.description || undefined,
      page: this.currentPage + 1,
      limit: this.itemsPerPage,
    };

    setTimeout(() => {
      this.accountService
        .getStatement(accountId ?? '', filterParams)
        .subscribe({
          next: (accountStatement: AccountStatement) => {
            const newTransactions = accountStatement?.result?.transactions
              ? accountStatement.result.transactions
              : [];
            if (newTransactions.length < this.itemsPerPage) {
              this.allTransactionsLoaded = true;
            }

            // Adiciona as novas transações sem duplicatas
            const existingIds = new Set(
              this.filteredTransactions.map((t) => t.id)
            );
            const uniqueNewTransactions = newTransactions.filter(
              (t: Transaction) => !existingIds.has(t.id)
            );

            this.filteredTransactions = [
              ...this.filteredTransactions,
              ...uniqueNewTransactions,
            ];
            this.currentPage++;
            this.isLoadingMore = false;
          },
          error: (error: any) => {
            this.isLoadingMore = false;
            console.error('Error loading more transactions:', error);
          },
        });
    }, 3000);
  }

  onFiltersChange(): void {
    this.resetPagination();
    this.loadUserTransactions();
  }

  loadUserTransactions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not authenticated');
      return;
    }

    const accountId = this.authService.getPrimaryAccountId();

    if (!accountId) {
      console.error('Account not setted');
      return;
    }

    this.isLoading = true;

    const filterParams = {
      startDate: this.filters.startDate || undefined,
      endDate: this.filters.endDate || undefined,
      type: this.filters.type || undefined,
      minValue: this.filters.minValue || undefined,
      maxValue: this.filters.maxValue || undefined,
      from: this.filters.from || undefined,
      to: this.filters.to || undefined,
      description: this.filters.description || undefined,
    };

    this.accountService.getStatement(accountId ?? '', filterParams).subscribe({
      next: (accountStatement: AccountStatement) => {
        const transactions = accountStatement?.result?.transactions;
        this.filteredTransactions = transactions.filter((t) => t.id);
        this.totalTransactions = this.filteredTransactions.length;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error fetching account statement:', error);
      },
    });
  }

  isDeposit(transaction: Transaction): boolean {
    return isCredit(transaction.type);
  }

  isWithdraw(transaction: Transaction): boolean {
    return isDebit(transaction.type);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) {
      return new Date().toLocaleDateString();
    }
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  }

  getTransactionTypeLabel(type: TransactionType): string {
    const entry = Object.entries(TRANSACTION_TYPE_LABELS).find(
      ([_, value]) => value === type
    );

    return entry ? entry[0] : type;
  }

  openDeleteModal(id: string): void {
    this.transactionToDelete = id;
    this.isModalOpen = true;
  }

  onConfirmDelete(): void {
    if (this.transactionToDelete) {
      this.deleteTransaction(this.transactionToDelete);
      this.isModalOpen = false;
      this.transactionToDelete = null;
      this.showAlert = true;
      this.alertMessage = 'Transação deletada com sucesso!';
      setTimeout(() => {
        this.showAlert = false;
      }, 2000);
    }
  }

  onCancelDelete(): void {
    this.isModalOpen = false;
    this.transactionToDelete = null;
  }

  deleteTransaction(id: string): void {
    if (!id) return;

    this.transactionService.delete(id).subscribe({
      next: () => {
        // The transaction will be removed via the subscription to transactionDeleted$
        console.log('Transaction deleted', id);
      },
      error: (error) => {
        console.error('Error deleting transaction:', error);
      },
    });
  }

  openEditModal(transaction: Transaction): void {
    this.transactionToEdit = transaction;
    this.isEditModalOpen = true;
  }

  onSaveEdit(updatedTransaction: {
    id: string;
    value: number;
    from: string;
    to: string;
    description: string;
  }): void {
    if (this.transactionToEdit) {
      const updated = {
        ...this.transactionToEdit,
        ...updatedTransaction,
      };

      // Get account ID for the transaction update
      const accountId = this.authService.getPrimaryAccountId();
      if (!accountId) {
        console.error('Account ID not found');
        return;
      }

      this.transactionService.update(updated.id, updated, accountId).subscribe({
        next: () => {
          this.isEditModalOpen = false;
          this.transactionToEdit = null;
          this.showAlert = true;
          this.alertMessage = 'Transação atualizada com sucesso!';
          setTimeout(() => {
            this.showAlert = false;
          }, 2000);
        },
        error: (error) => {
          console.error('Error updating transaction:', error);
        },
      });
    }
  }

  onCancelEdit(): void {
    this.isEditModalOpen = false;
    this.transactionToEdit = null;
  }

  editTransaction(id: string): void {
    const transaction = this.filteredTransactions.find((t) => t.id === id);
    if (transaction) {
      this.openEditModal(transaction);
    }
  }

  hasViewableAttachments(anexo?: string): boolean {
    if (!anexo || anexo.length === 0) return false;
    return !!anexo;
  }

  openAttachment(anexo?: string): void {
    if (!anexo || anexo.length === 0) return;

    this.loadingAttachment = true;
    this.s3UploadService.getSignedUrlForDownload(anexo).subscribe({
      next: (response) => {
        this.openFileInNewTab(response.signedUrl, anexo);
        this.loadingAttachment = false;
      },
      error: (err) => {
        console.error('Error getting signed URL for file:', err);
        this.loadingAttachment = false;
      },
    });
  }

  private openFileInNewTab(fileUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
