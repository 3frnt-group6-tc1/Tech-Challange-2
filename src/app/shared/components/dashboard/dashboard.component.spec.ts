import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AccountService } from '../../services/Account/account.service';
import { AuthService } from '../../services/Auth/auth.service';
import { TransactionEventService } from '../../services/TransactionEvent/transaction-event.service';
import { of, throwError, Subject } from 'rxjs';
import { Transaction, TransactionType } from '../../models/transaction';
import { systemConfig } from '../../../app.config';
import { Account, AccountSummary } from '../../models/account';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let accountServiceMock: jasmine.SpyObj<AccountService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let transactionEventServiceMock: {
    transactionCreated$: Subject<Transaction>;
    transactionUpdated$: Subject<Transaction>;
    transactionDeleted$: Subject<string>;
  };

  const mockUser = {
    id: 'u1',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockAccount: Account = {
    id: 'acc1',
    userId: 'u1',
    type: 'Conta Corrente',
  };

  const mockAccountSummary: AccountSummary = {
    message: 'Success',
    result: {
      account: [mockAccount],
      transactions: [
        {
          id: '1',
          accountId: 'u1',
          type: TransactionType.Exchange,
          amount: 200,
          description: 'Salary',
          date: new Date('2023-01-05'),
          from: 'account1',
          to: 'account2',
        },
        {
          id: '2',
          accountId: 'u1',
          type: TransactionType.Loan,
          amount: 500,
          description: 'Loan',
          date: new Date('2023-01-10'),
          from: 'account1',
          to: 'account2',
        },
        {
          id: '3',
          accountId: 'u1',
          type: TransactionType.Transfer,
          amount: 300,
          description: 'Bills',
          date: new Date('2023-01-20'),
          from: 'account1',
          to: 'account2',
        },
      ],
      cards: [],
    },
  };

  beforeEach(async () => {
    accountServiceMock = jasmine.createSpyObj('AccountService', [
      'getByUserId',
    ]);
    authServiceMock = jasmine.createSpyObj('AuthService', ['currentUser$']);

    transactionEventServiceMock = {
      transactionCreated$: new Subject<Transaction>(),
      transactionUpdated$: new Subject<Transaction>(),
      transactionDeleted$: new Subject<string>(),
    };

    authServiceMock.currentUser$ = of(mockUser);
    accountServiceMock.getByUserId.and.returnValue(of(mockAccountSummary));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AccountService, useValue: accountServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: TransactionEventService,
          useValue: transactionEventServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    jasmine.clock().install();
    const baseTime = new Date(2023, 0, 15, 10, 30);
    jasmine.clock().mockDate(baseTime);

    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should set current date on init', () => {
      expect(component.currentDate).toContain('15/01/2023 10:30');
    });

    it('should fetch account data on init', () => {
      expect(accountServiceMock.getByUserId).toHaveBeenCalled();
      expect(component.userName).toBe('Test User');
    });

    it('should load transactions after account data is fetched', () => {
      expect(component.transactions.length).toBe(3);
    });

    it('should calculate balance correctly on init', () => {
      // Use normalized formatting to avoid invisible character issues
      expect(component.balance.replace(/\s/g, '')).toBe(
        'R$400,00'.replace(/\s/g, '')
      );
    });

    it('should calculate total entries correctly', () => {
      expect(component.totalEntries.replace(/\s/g, '')).toBe(
        'R$700,00'.replace(/\s/g, '')
      );
    });

    it('should calculate total exits correctly', () => {
      expect(component.totalExits.replace(/\s/g, '')).toBe(
        'R$300,00'.replace(/\s/g, '')
      );
    });

    it('should organize transactions into weekly data', () => {
      expect(component.transactionData.length).toBe(4);

      const week1 = component.transactionData.find((d) => d.day === 'Semana 1');
      expect(week1?.entries).toBe(200);
      expect(week1?.exits).toBe(0);

      const week2 = component.transactionData.find((d) => d.day === 'Semana 2');
      expect(week2?.entries).toBe(500);
      expect(week2?.exits).toBe(0);

      const week3 = component.transactionData.find((d) => d.day === 'Semana 3');
      expect(week3?.entries).toBe(0);
      expect(week3?.exits).toBe(300);
    });
  });

  describe('Error Handling', () => {
    it('should handle account fetch error', fakeAsync(() => {
      accountServiceMock.getByUserId.and.returnValue(
        throwError(() => new Error('Account fetch error'))
      );

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('Erro ao buscar dados da conta.');
    }));
  });

  describe('Transaction Events', () => {
    it('should handle new transaction events', () => {
      const newTransaction: Transaction = {
        id: '4',
        accountId: 'u1',
        type: TransactionType.Exchange,
        amount: 150,
        description: 'New Income',
        date: new Date('2023-01-25'),
        from: 'account1',
        to: 'account2',
      };

      expect(component.transactions.length).toBe(3);
      expect(component.balance.replace(/\s/g, '')).toBe(
        'R$400,00'.replace(/\s/g, '')
      );

      transactionEventServiceMock.transactionCreated$.next(newTransaction);

      expect(component.transactions.length).toBe(4);
      expect(component.balance.replace(/\s/g, '')).toBe(
        'R$550,00'.replace(/\s/g, '')
      );

      const week4 = component.transactionData.find((d) => d.day === 'Semana 4');
      expect(week4?.entries).toBe(150);
    });

    it('should handle transaction update events', () => {
      const updatedTransaction: Transaction = {
        id: '1',
        accountId: 'u1',
        type: TransactionType.Exchange,
        amount: 300,
        description: 'Updated Salary',
        date: new Date('2023-01-05'),
        from: 'account1',
        to: 'account2',
      };

      expect(component.totalEntries.replace(/\s/g, '')).toBe(
        'R$700,00'.replace(/\s/g, '')
      );

      transactionEventServiceMock.transactionUpdated$.next(updatedTransaction);

      expect(component.totalEntries.replace(/\s/g, '')).toBe(
        'R$800,00'.replace(/\s/g, '')
      );
      expect(component.balance.replace(/\s/g, '')).toBe(
        'R$500,00'.replace(/\s/g, '')
      );
    });

    it('should handle transaction delete events', () => {
      expect(component.transactions.length).toBe(3);
      expect(component.totalEntries.replace(/\s/g, '')).toBe(
        'R$700,00'.replace(/\s/g, '')
      );

      transactionEventServiceMock.transactionDeleted$.next('1');

      expect(component.transactions.length).toBe(2);
      expect(component.totalEntries.replace(/\s/g, '')).toBe(
        'R$500,00'.replace(/\s/g, '')
      );
      expect(component.balance.replace(/\s/g, '')).toBe(
        'R$200,00'.replace(/\s/g, '')
      );
    });

    it('should add transaction events regardless of user', () => {
      const otherUserTransaction: Transaction = {
        id: '5',
        accountId: 'different-user-id',
        type: TransactionType.Exchange,
        amount: 100,
        description: 'Other User Income',
        date: new Date(),
        from: 'account1',
        to: 'account2',
      };

      expect(component.transactions.length).toBe(3);

      transactionEventServiceMock.transactionCreated$.next(
        otherUserTransaction
      );
      expect(component.transactions.length).toBe(4);

      transactionEventServiceMock.transactionUpdated$.next({
        ...otherUserTransaction,
        amount: 200,
      });
      expect(component.transactions.length).toBe(4);

      transactionEventServiceMock.transactionDeleted$.next('5');
      expect(component.transactions.length).toBe(3);
    });
  });

  describe('UI Interactions', () => {
    it('should toggle balance visibility', () => {
      expect(component.showBalance).toBeTrue();

      component.toggleBalance();
      expect(component.showBalance).toBeFalse();

      component.toggleBalance();
      expect(component.showBalance).toBeTrue();
    });
  });

  describe('Helper Functions', () => {
    it('should format balance correctly', () => {
      expect(component.formatBalance(1234.56).replace(/\s/g, '')).toBe(
        'R$1.234,56'.replace(/\s/g, '')
      );
      expect(component.formatBalance(0).replace(/\s/g, '')).toBe(
        'R$0,00'.replace(/\s/g, '')
      );
      expect(component.formatBalance(-1000).replace(/\s/g, '')).toBe(
        '-R$1.000,00'.replace(/\s/g, '')
      );
    });

    it('should set current date with correct format', () => {
      component.setCurrentDate();
      // Modify the regex to account for "Domingo" without the -feira suffix
      expect(component.currentDate).toMatch(
        /^[A-Za-z\u00C0-\u00FF]+(-feira)?, \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/
      );
    });
  });
});
