import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { TextComponent } from '../text/text.component';
import { InputComponent } from '../input/input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/Transaction/transaction-service';
import { S3UploadService } from '../../services/S3/s3-upload.service';
import {
  Transaction,
  TRANSACTION_TYPE_LABELS,
  TransactionType,
} from '../../models/transaction';
import { AuthService } from '../../services/Auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { S3UploadResult } from '../../models/file';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  standalone: true,
  imports: [
    ButtonComponent,
    TextComponent,
    InputComponent,
    CommonModule,
    FormsModule,
  ],
})
export class TransactionFormComponent implements OnInit {
  transactionOptions = [
    { display: 'Receita (Câmbio de Moeda)', value: TransactionType.Exchange },
    { display: 'Despesa (DOC/TED)', value: TransactionType.Transfer },
    {
      display: 'Empréstimo (Empréstimo e Financiamento)',
      value: TransactionType.Loan,
    },
  ];

  private descriptionSuggestionsMap: { [key in TransactionType]: string[] } = {
    [TransactionType.Exchange]: [
      'Câmbio: Compra de USD para viagem',
      'Câmbio: Venda de EUR de retorno',
      'Câmbio: Remessa internacional para investimento (USD)',
      'Câmbio: Recebimento de pagamento PJ do exterior (GBP)',
      'Câmbio: Conversão BRL para EUR para despesas',
      'Câmbio: Resgate de USD de conta global',
      'Câmbio: Compra de EUR para mensalidade curso',
      'Câmbio: Venda de JPY',
      'Câmbio: Recebimento de pensão do exterior',
      'Câmbio: Transferência entre contas (BRL para USD)',
      'Câmbio: Pagamento de serviço internacional (streaming)',
    ],
    [TransactionType.Loan]: [
      'Empréstimo: Recebimento de crédito pessoal',
      'Financiamento: Parcela mensal de imóvel',
      'Empréstimo: Amortização de dívida de carro',
      'Financiamento: Recebimento de crédito estudantil',
      'Empréstimo: Pagamento de juros de cheque especial',
      'Financiamento: Parcela de reforma residencial',
      'Empréstimo: Quitação antecipada de empréstimo',
      'Financiamento: Entrada de veículo novo',
      'Empréstimo: Pagamento de parcela consignado',
      'Financiamento: Parcela de maquinário (PJ)',
      'Empréstimo: Juros sobre financiamento agrícola',
    ],
    [TransactionType.Transfer]: [
      'TED: Transferência para pagamento de aluguel',
      'DOC: Pagamento de conta de luz',
      'TED: Envio para familiar (mesmo banco)',
      'DOC: Pagamento de fornecedor (serviços)',
      'TED: Transferência para corretora (aporte em fundos)',
      'TED: Recebimento de reembolso de amigo',
      'DOC: Pagamento de internet mensal',
      'TED: Transferência entre contas próprias (diferentes bancos)',
      'TED: Reembolso de despesas de viagem',
      'DOC: Pagamento de mensalidade escolar',
      'TED: Compra online (transferência direta para vendedor)',
    ],
  };

  filteredDescriptionSuggestions: string[] = [];
  showSuggestions = false;

  form: Transaction = this.createEmptyForm();
  valorTransacao: string = '';

  submitStatus: {
    success: boolean;
    message: string;
  } = {
    success: false,
    message: '',
  };

  selectedFiles: File[] = [];
  uploadedFiles: S3UploadResult[] = [];

  private createEmptyForm(): Transaction {
    return {
      accountId: '',
      type: TransactionType.Exchange,
      amount: 0,
      from: '',
      to: '',
      description: '',
      anexo: '',
    };
  }

  constructor(
    private transactionService: TransactionService,
    private s3UploadService: S3UploadService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.onDescriptionChange({ target: { value: this.form.description } } as unknown as Event);
  }

  onTransactionTypeChange(value: TransactionType): void {
    this.form.type = value;
    this.onDescriptionChange({ target: { value: this.form.description } } as unknown as Event);
  }

  onAmountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 12);

    while (value.length < 3) value = '0' + value;

    const cents = value.slice(-2);
    let integer = value.slice(0, -2);
    integer = integer.replace(/^0+/, '') || '0';
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const formatted = `${integer},${cents}`;
    this.valorTransacao = formatted;
    this.form.amount = Number(integer.replace(/\./g, '') + '.' + cents);
  }

  onDescriptionChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.description = input.value;

    const inputValue = input.value.toLowerCase();
    const currentTransactionType = this.form.type;

    const relevantSuggestions = this.descriptionSuggestionsMap[currentTransactionType] || [];

    this.filteredDescriptionSuggestions = relevantSuggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(inputValue))
      .slice(0, 7);
    this.showSuggestions = inputValue.length > 0 && this.filteredDescriptionSuggestions.length > 0;
  }

  selectCategorySuggestion(suggestion: string): void {
    this.form.description = suggestion;
    this.filteredDescriptionSuggestions = []; // Limpa as sugestões após a seleção
    this.showSuggestions = false;
  }

  hideSuggestionsDelayed(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  getTransactionTypeLabel(type: TransactionType): string {
    const labels = Object.entries(TRANSACTION_TYPE_LABELS).find(
      ([_, value]) => value === type
    );
    return labels ? labels[0] : type;
  }

  async submitForm(): Promise<void> {
    if (
      !this.form.type ||
      !this.form.amount ||
      !this.form.from?.trim() ||
      !this.form.to?.trim()
    ) {
      this.submitStatus = {
        success: false,
        message: 'Preencha todos os campos obrigatórios.',
      };
      return;
    }

    this.submitStatus = { success: true, message: 'Processando transação...' };

    try {
      if (this.selectedFiles.length > 0) {
        this.submitStatus.message = 'Fazendo upload dos arquivos...';

        // Validate files before upload
        for (const file of this.selectedFiles) {
          const validation = this.s3UploadService.validateFile(file, 10, [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'text/plain',
          ]);
          if (!validation.valid) {
            this.submitStatus = {
              success: false,
              message: validation.error || 'Arquivo inválido',
            };
            return;
          }
        }

        // Upload files to S3
        const uploadResults = await firstValueFrom(
          this.s3UploadService.uploadMultipleFiles(this.selectedFiles)
        );

        if (!uploadResults || uploadResults.some((result) => !result.success)) {
          this.submitStatus = {
            success: false,
            message: 'Erro ao fazer upload dos arquivos.',
          };
          return;
        }

        this.uploadedFiles = uploadResults;
      }

      this.submitStatus.message = 'Salvando transação...';

      const currentUser = await firstValueFrom(this.authService.currentUser$);
      if (!currentUser) {
        this.submitStatus = {
          success: false,
          message: 'Usuário não autenticado.',
        };
        return;
      }

      // Get account ID for the transaction
      const accountId = this.authService.getPrimaryAccountId();
      if (!accountId) {
        this.submitStatus = {
          success: false,
          message:
            'Erro: Conta principal não encontrada. Tente fazer login novamente.',
        };
        return;
      }

      const transaction: Transaction = {
        type: this.form.type,
        amount: this.form.amount,
        description: this.form.description,
        accountId: accountId,
        from: this.form.from,
        to: this.form.to,
        anexo:
          this.form.anexo ||
          (this.uploadedFiles.length > 0
            ? this.uploadedFiles[0].key
            : undefined),
      };

      this.transactionService.create(transaction, accountId).subscribe({
        next: () => {
          this.submitStatus = {
            success: true,
            message: 'Transação criada com sucesso!',
          };
          this.resetForm();
        },
        error: (error) => {
          this.submitStatus = {
            success: false,
            message: 'Erro ao salvar transação.',
          };
          console.error('Error creating transaction:', error);
        },
      });
    } catch (error) {
      this.submitStatus = {
        success: false,
        message: 'Erro inesperado ao processar transação.',
      };
      console.error(error);
    }
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.valorTransacao = '';
    this.selectedFiles = [];
    this.uploadedFiles = [];
    this.onTransactionTypeChange(this.form.type);
    setTimeout(() => {
      if (this.submitStatus.success) this.submitStatus.message = '';
    }, 3000);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles.push(...Array.from(input.files));
    }
  }

  removeFile(index: number): void {
    // If file was already uploaded to S3, optionally delete it
    if (this.uploadedFiles[index]) {
      const uploadedFile = this.uploadedFiles[index];
      this.s3UploadService.deleteFile(uploadedFile.key).subscribe({
        next: () => console.log('File removed from S3'),
        error: (err) => console.error('Error removing file from S3:', err),
      });
      this.uploadedFiles.splice(index, 1);
    }

    this.selectedFiles.splice(index, 1);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const isNumber = /^[0-9]$/;
    if (!isNumber.test(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const regex = /^[a-zA-ZÀ-ÿ\s]*$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  getFileViewUrl(fileKey: string): void {
    this.s3UploadService.getSignedUrlForDownload(fileKey).subscribe({
      next: (response) => {
        window.open(response.signedUrl, '_blank');
      },
      error: (err) => {
        console.error('Error getting file URL:', err);
      },
    });
  }

  getFileSize(file: File): string {
    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }
}