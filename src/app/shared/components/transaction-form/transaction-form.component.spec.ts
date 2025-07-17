import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { TransactionFormComponent } from './transaction-form.component';
import { TransactionService } from '../../services/Transaction/transaction-service';
import { S3UploadService } from '../../services/S3/s3-upload.service';
import { AuthService } from '../../services/Auth/auth.service';
import { Transaction, TransactionType } from '../../models/transaction';
import { User } from '../../models/user';
import { S3UploadResult, S3SignedUrlResponse } from '../../models/file';

describe('TransactionFormComponent', () => {
  let component: TransactionFormComponent;
  let fixture: ComponentFixture<TransactionFormComponent>;
  let transactionServiceSpy: jasmine.SpyObj<TransactionService>;
  let s3UploadServiceSpy: jasmine.SpyObj<S3UploadService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let mockCurrentUserSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123',
  };

  const mockTransaction: Transaction = {
    id: '1',
    accountId: 'account1',
    type: TransactionType.Exchange,
    amount: 100.5,
    from: 'Test Source',
    to: 'Test Destination',
    description: 'Test transaction',
    date: new Date(),
    anexo: 'test-file.pdf',
  };

  const mockUploadResult: S3UploadResult = {
    success: true,
    key: 'test-file-key',
    url: 'https://s3.amazonaws.com/test-file-key',
  };

  beforeEach(async () => {
    mockCurrentUserSubject = new BehaviorSubject<User | null>(null);

    const transactionSpy = jasmine.createSpyObj('TransactionService', [
      'create',
    ]);

    const s3UploadSpy = jasmine.createSpyObj('S3UploadService', [
      'validateFile',
      'uploadMultipleFiles',
      'deleteFile',
      'getSignedUrlForDownload',
    ]);

    const authSpy = jasmine.createSpyObj(
      'AuthService',
      ['getPrimaryAccountId'],
      {
        currentUser$: mockCurrentUserSubject.asObservable(),
      }
    );

    await TestBed.configureTestingModule({
      imports: [TransactionFormComponent, HttpClientTestingModule],
      providers: [
        { provide: TransactionService, useValue: transactionSpy },
        { provide: S3UploadService, useValue: s3UploadSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionFormComponent);
    component = fixture.componentInstance;
    transactionServiceSpy = TestBed.inject(
      TransactionService
    ) as jasmine.SpyObj<TransactionService>;
    s3UploadServiceSpy = TestBed.inject(
      S3UploadService
    ) as jasmine.SpyObj<S3UploadService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.form).toBeDefined();
    expect(component.form.type).toBe(TransactionType.Exchange);
    expect(component.form.amount).toBe(0);
    expect(component.valorTransacao).toBe('');
    expect(component.selectedFiles).toEqual([]);
    expect(component.uploadedFiles).toEqual([]);
    expect(component.showSuggestions).toBe(false);
    expect(component.submitStatus.success).toBe(false);
    expect(component.submitStatus.message).toBe('');
  });

  it('should have correct transaction options', () => {
    expect(component.transactionOptions).toEqual([
      { display: 'Receita (Câmbio de Moeda)', value: TransactionType.Exchange },
      { display: 'Despesa (DOC/TED)', value: TransactionType.Transfer },
      {
        display: 'Empréstimo (Empréstimo e Financiamento)',
        value: TransactionType.Loan,
      },
    ]);
  });

  it('should have correct category suggestions', () => {
    expect(component.categorySuggestions).toContain('Alimentação');
    expect(component.categorySuggestions).toContain('Transporte');
    expect(component.categorySuggestions).toContain('Lazer');
    expect(component.categorySuggestions.length).toBe(10);
  });

  describe('onTransactionTypeChange', () => {
    it('should update form type', () => {
      component.onTransactionTypeChange(TransactionType.Loan);
      expect(component.form.type).toBe(TransactionType.Loan);
    });
  });

  describe('onAmountChange', () => {
    it('should format amount correctly', () => {
      const event = {
        target: { value: '12345' },
      } as any;

      component.onAmountChange(event);

      expect(component.valorTransacao).toBe('123,45');
      expect(component.form.amount).toBe(123.45);
    });

    it('should handle zero amount', () => {
      const event = {
        target: { value: '0' },
      } as any;

      component.onAmountChange(event);

      expect(component.valorTransacao).toBe('0,00');
      expect(component.form.amount).toBe(0.0);
    });

    it('should limit to 12 digits', () => {
      const event = {
        target: { value: '123456789012345' },
      } as any;

      component.onAmountChange(event);

      expect(component.valorTransacao).toBe('1.234.567.890,12');
      expect(component.form.amount).toBe(1234567890.12);
    });
  });

  describe('onDescriptionChange', () => {
    it('should update form description and filter suggestions', () => {
      const event = {
        target: { value: 'ali' },
      } as any;

      component.onDescriptionChange(event);

      expect(component.form.description).toBe('ali');
      expect(component.filteredCategorySuggestions).toContain('Alimentação');
      expect(component.showSuggestions).toBe(true);
    });

    it('should limit suggestions to 5', () => {
      const event = {
        target: { value: 'a' },
      } as any;

      component.onDescriptionChange(event);

      expect(component.filteredCategorySuggestions.length).toBeLessThanOrEqual(
        5
      );
    });
  });

  describe('selectCategorySuggestion', () => {
    it('should select suggestion and hide suggestions', () => {
      component.selectCategorySuggestion('Alimentação');

      expect(component.form.description).toBe('Alimentação');
      expect(component.filteredCategorySuggestions).toEqual([]);
      expect(component.showSuggestions).toBe(false);
    });
  });

  describe('hideSuggestionsDelayed', () => {
    it('should hide suggestions after delay', (done) => {
      component.showSuggestions = true;
      component.hideSuggestionsDelayed();

      setTimeout(() => {
        expect(component.showSuggestions).toBe(false);
        done();
      }, 250);
    });
  });

  describe('getTransactionTypeLabel', () => {
    it('should return correct label for Exchange type', () => {
      const label = component.getTransactionTypeLabel(TransactionType.Exchange);
      expect(label).toBe('Câmbio de Moeda');
    });

    it('should return correct label for Transfer type', () => {
      const label = component.getTransactionTypeLabel(TransactionType.Transfer);
      expect(label).toBe('DOC/TED');
    });

    it('should return correct label for Loan type', () => {
      const label = component.getTransactionTypeLabel(TransactionType.Loan);
      expect(label).toBe('Empréstimo e Financiamento');
    });
  });

  describe('submitForm', () => {
    beforeEach(() => {
      component.form = {
        accountId: '',
        type: TransactionType.Exchange,
        amount: 100,
        from: 'Test Source',
        to: 'Test Destination',
        description: 'Test Description',
      };
      mockCurrentUserSubject.next(mockUser);
      authServiceSpy.getPrimaryAccountId.and.returnValue('account1');
    });

    it('should fail validation when required fields are missing', async () => {
      component.form.from = '';

      await component.submitForm();

      expect(component.submitStatus.success).toBe(false);
      expect(component.submitStatus.message).toBe(
        'Preencha todos os campos obrigatórios.'
      );
    });

    it('should fail when user is not authenticated', async () => {
      mockCurrentUserSubject.next(null);

      await component.submitForm();

      expect(component.submitStatus.success).toBe(false);
      expect(component.submitStatus.message).toBe('Usuário não autenticado.');
    });

    it('should fail when primary account is not found', async () => {
      authServiceSpy.getPrimaryAccountId.and.returnValue(null);

      await component.submitForm();

      expect(component.submitStatus.success).toBe(false);
      expect(component.submitStatus.message).toBe(
        'Erro: Conta principal não encontrada. Tente fazer login novamente.'
      );
    });

    it('should create transaction successfully without files', async () => {
      transactionServiceSpy.create.and.returnValue(of(mockTransaction));

      await component.submitForm();

      expect(transactionServiceSpy.create).toHaveBeenCalled();
      expect(component.submitStatus.success).toBe(true);
      expect(component.submitStatus.message).toBe(
        'Transação criada com sucesso!'
      );
    });

    it('should handle transaction creation error', async () => {
      transactionServiceSpy.create.and.returnValue(
        throwError('Creation error')
      );
      spyOn(console, 'error');

      await component.submitForm();

      expect(component.submitStatus.success).toBe(false);
      expect(component.submitStatus.message).toBe('Erro ao salvar transação.');
      expect(console.error).toHaveBeenCalledWith(
        'Error creating transaction:',
        'Creation error'
      );
    });

    it('should upload files before creating transaction', async () => {
      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      component.selectedFiles = [mockFile];

      s3UploadServiceSpy.validateFile.and.returnValue({ valid: true });
      s3UploadServiceSpy.uploadMultipleFiles.and.returnValue(
        of([mockUploadResult])
      );
      transactionServiceSpy.create.and.returnValue(of(mockTransaction));

      await component.submitForm();

      expect(s3UploadServiceSpy.validateFile).toHaveBeenCalledWith(
        mockFile,
        10,
        ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']
      );
      expect(s3UploadServiceSpy.uploadMultipleFiles).toHaveBeenCalledWith([
        mockFile,
      ]);
      expect(transactionServiceSpy.create).toHaveBeenCalled();
    });

    it('should fail when file validation fails', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [mockFile];

      s3UploadServiceSpy.validateFile.and.returnValue({
        valid: false,
        error: 'File too large',
      });

      await component.submitForm();

      expect(component.submitStatus.success).toBe(false);
      expect(component.submitStatus.message).toBe('File too large');
      expect(s3UploadServiceSpy.uploadMultipleFiles).not.toHaveBeenCalled();
    });

    it('should fail when file upload fails', async () => {
      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      component.selectedFiles = [mockFile];

      s3UploadServiceSpy.validateFile.and.returnValue({ valid: true });
      s3UploadServiceSpy.uploadMultipleFiles.and.returnValue(
        of([
          {
            success: false,
            key: '',
            url: '',
          },
        ])
      );

      await component.submitForm();

      expect(component.submitStatus.success).toBe(false);
      expect(component.submitStatus.message).toBe(
        'Erro ao fazer upload dos arquivos.'
      );
    });
  });

  describe('resetForm', () => {
    it('should reset form to initial state', () => {
      component.form.amount = 100;
      component.valorTransacao = '100,00';
      component.selectedFiles = [new File(['test'], 'test.pdf')];
      component.uploadedFiles = [mockUploadResult];

      component.resetForm();

      expect(component.form.amount).toBe(0);
      expect(component.valorTransacao).toBe('');
      expect(component.selectedFiles).toEqual([]);
      expect(component.uploadedFiles).toEqual([]);
    });

    it('should clear success message after delay', (done) => {
      component.submitStatus = { success: true, message: 'Success!' };

      component.resetForm();

      setTimeout(() => {
        expect(component.submitStatus.message).toBe('');
        done();
      }, 3100);
    });
  });

  describe('onFileSelected', () => {
    it('should add selected files', () => {
      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      const event = {
        target: {
          files: [mockFile],
        },
      } as any;

      component.onFileSelected(event);

      expect(component.selectedFiles).toContain(mockFile);
    });

    it('should handle empty file selection', () => {
      const event = {
        target: {
          files: null,
        },
      } as any;

      component.onFileSelected(event);

      expect(component.selectedFiles).toEqual([]);
    });
  });

  describe('removeFile', () => {
    it('should remove file from selected files', () => {
      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      component.selectedFiles = [mockFile];

      component.removeFile(0);

      expect(component.selectedFiles).toEqual([]);
    });

    it('should remove uploaded file and call S3 delete', () => {
      component.uploadedFiles = [mockUploadResult];
      s3UploadServiceSpy.deleteFile.and.returnValue(of({}));
      spyOn(console, 'log');

      component.removeFile(0);

      expect(s3UploadServiceSpy.deleteFile).toHaveBeenCalledWith(
        'test-file-key'
      );
      expect(component.uploadedFiles).toEqual([]);
    });

    it('should handle S3 delete error', () => {
      component.uploadedFiles = [mockUploadResult];
      s3UploadServiceSpy.deleteFile.and.returnValue(throwError('Delete error'));
      spyOn(console, 'error');

      component.removeFile(0);

      expect(console.error).toHaveBeenCalledWith(
        'Error removing file from S3:',
        'Delete error'
      );
    });
  });

  describe('allowOnlyNumbers', () => {
    it('should allow numeric keys', () => {
      const event = new KeyboardEvent('keydown', { key: '5' });
      spyOn(event, 'preventDefault');

      component.allowOnlyNumbers(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should prevent non-numeric keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      spyOn(event, 'preventDefault');

      component.allowOnlyNumbers(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('allowOnlyLetters', () => {
    it('should allow letter keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      spyOn(event, 'preventDefault');

      component.allowOnlyLetters(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should allow accented characters', () => {
      const event = new KeyboardEvent('keydown', { key: 'ã' });
      spyOn(event, 'preventDefault');

      component.allowOnlyLetters(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should allow spaces', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');

      component.allowOnlyLetters(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should prevent numeric keys', () => {
      const event = new KeyboardEvent('keydown', { key: '5' });
      spyOn(event, 'preventDefault');

      component.allowOnlyLetters(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should prevent special characters', () => {
      const event = new KeyboardEvent('keydown', { key: '@' });
      spyOn(event, 'preventDefault');

      component.allowOnlyLetters(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('getFileViewUrl', () => {
    it('should get signed URL and open in new window', () => {
      const mockResponse: S3SignedUrlResponse = {
        signedUrl: 'https://signed-url.com',
        key: 'test-file-key',
        bucket: 'test-bucket',
      };
      s3UploadServiceSpy.getSignedUrlForDownload.and.returnValue(
        of(mockResponse)
      );
      spyOn(window, 'open');

      component.getFileViewUrl('test-file-key');

      expect(s3UploadServiceSpy.getSignedUrlForDownload).toHaveBeenCalledWith(
        'test-file-key'
      );
      expect(window.open).toHaveBeenCalledWith(
        'https://signed-url.com',
        '_blank'
      );
    });

    it('should handle get URL error', () => {
      s3UploadServiceSpy.getSignedUrlForDownload.and.returnValue(
        throwError('URL error')
      );
      spyOn(console, 'error');

      component.getFileViewUrl('test-file-key');

      expect(console.error).toHaveBeenCalledWith(
        'Error getting file URL:',
        'URL error'
      );
    });
  });

  describe('getFileSize', () => {
    it('should format bytes correctly', () => {
      const file = new File([''], 'test.txt');
      Object.defineProperty(file, 'size', { value: 0 });
      expect(component.getFileSize(file)).toBe('0 Bytes');
    });

    it('should format KB correctly', () => {
      const file = new File([''], 'test.txt');
      Object.defineProperty(file, 'size', { value: 1024 });
      expect(component.getFileSize(file)).toBe('1 KB');
    });

    it('should format MB correctly', () => {
      const file = new File([''], 'test.txt');
      Object.defineProperty(file, 'size', { value: 1048576 });
      expect(component.getFileSize(file)).toBe('1 MB');
    });
  });

  describe('isImageFile', () => {
    it('should return true for image files', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(component.isImageFile(imageFile)).toBe(true);
    });

    it('should return false for non-image files', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(component.isImageFile(pdfFile)).toBe(false);
    });
  });
});
