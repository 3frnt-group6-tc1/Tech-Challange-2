import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestmentDashboardComponent } from './investment-dashboard.component';
import { AccountService } from '../../services/Account/account.service';
import { AuthService } from '../../services/Auth/auth.service';
import { of, throwError } from 'rxjs';
import { Investment, InvestmentSummary } from '../../models/investment';
import { Account, AccountSummary } from '../../models/account';
import { AuthUser } from '../../services/Auth/auth.service';

describe('InvestmentDashboardComponent', () => {
  let component: InvestmentDashboardComponent;
  let fixture: ComponentFixture<InvestmentDashboardComponent>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser: AuthUser = {
    id: 'u1',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockAccount: Account = {
    id: 'acc1',
    userId: 'u1',
    type: 'Investimentos'
  };

  const mockAccountSummary: AccountSummary = {
    message: 'Success',
    result: {
      account: [mockAccount],
      transactions: [],
      cards: []
    }
  };

  const mockInvestments: Investment[] = [
    {
      _id: '1',
      type: 'CDB',
      category: 'Renda Fixa',
      value: 5000,
      name: 'CDB Bank A',
      accountId: {
        _id: 'acc1',
        type: 'Conta Corrente',
        accountNumber: '12345'
      },
      __v: 0,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      profit: 250,
      profitPercentage: 5,
      isMatured: false
    },
    {
      _id: '2',
      type: 'Ações',
      category: 'Renda Variável',
      value: 3000,
      name: 'Ações PETR4',
      accountId: {
        _id: 'acc1',
        type: 'Conta Corrente',
        accountNumber: '12345'
      },
      __v: 0,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      profit: -150,
      profitPercentage: -5,
      isMatured: false
    }
  ];

  const mockInvestmentSummary: InvestmentSummary = {
    totalValue: 8000,
    totalInitialValue: 7900,
    totalProfit: 100,
    totalProfitPercentage: 1.27,
    totalInvestments: 2,
    byCategory: []
  };

  beforeEach(async () => {
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['getByUserId']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [InvestmentDashboardComponent],
      providers: [
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentDashboardComponent);
    component = fixture.componentInstance;
    mockAccountService = TestBed.inject(AccountService) as jasmine.SpyObj<AccountService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    // Setup default mocks
    mockAuthService.getCurrentUser.and.returnValue(mockUser);
    mockAccountService.getByUserId.and.returnValue(of(mockAccountSummary));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.investments).toEqual([]);
    expect(component.investmentSummary).toBeNull();
    expect(component.loading).toBeFalse();
    expect(component.showBalance).toBeTrue();
    expect(component.userName).toBe('');
    expect(component.currentUser).toBeNull();
    expect(component.accountType).toBe('Investimentos');
    expect(component.isLoading).toBeTrue();
    expect(component.totalInvestmentValue).toBe(0);
  });

  it('should load user data on init', () => {
    component.ngOnInit();

    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    expect(component.currentUser).toEqual(mockUser);
    expect(component.userName).toBe('Test User');
  });

  it('should load account data when user is found', () => {
    component.ngOnInit();

    expect(mockAccountService.getByUserId).toHaveBeenCalled();
  });

  it('should set error message when user is not found', () => {
    mockAuthService.getCurrentUser.and.returnValue(null);

    component.ngOnInit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Usuário não encontrado');
  });

  it('should handle account service error', () => {
    const errorMessage = 'Account service error';
    mockAccountService.getByUserId.and.returnValue(throwError(() => new Error(errorMessage)));
    spyOn(console, 'error');

    component.ngOnInit();

    expect(console.error).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Erro ao carregar informações da conta');
    expect(component.isLoading).toBeFalse();
  });

  it('should set current date in Portuguese format', () => {
    component.ngOnInit();

    expect(component.currentDate).toBeDefined();
    expect(component.currentDate.length).toBeGreaterThan(0);
  });

  it('should update investment balance from summary', () => {
    component.investmentSummary = mockInvestmentSummary;
    component.ngOnChanges({
      investmentSummary: {
        currentValue: mockInvestmentSummary,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.totalInvestmentValue).toBe(8000);
    expect(component.balance).toContain('8.000');
  });

  it('should update investment balance from investments array', () => {
    component.investments = mockInvestments;
    component.ngOnChanges({
      investments: {
        currentValue: mockInvestments,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.totalInvestmentValue).toBe(8000);
  });

  it('should prioritize summary over investments for balance calculation', () => {
    component.investments = mockInvestments;
    component.investmentSummary = mockInvestmentSummary;
    
    component.ngOnChanges({
      investments: {
        currentValue: mockInvestments,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      },
      investmentSummary: {
        currentValue: mockInvestmentSummary,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.totalInvestmentValue).toBe(mockInvestmentSummary.totalValue);
  });

  it('should handle empty investments', () => {
    component.investments = [];
    component.investmentSummary = null;
    
    component.ngOnChanges({
      investments: {
        currentValue: [],
        previousValue: mockInvestments,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.totalInvestmentValue).toBe(0);
    expect(component.balance).toContain('0,00');
  });

  it('should update loading state', () => {
    component.loading = true;
    component.ngOnChanges({
      loading: {
        currentValue: true,
        previousValue: false,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.isLoading).toBeTrue();
  });

  it('should emit toggle balance event', () => {
    spyOn(component.toggleBalance, 'emit');

    component.onToggleBalance();

    expect(component.toggleBalance.emit).toHaveBeenCalled();
  });

  it('should format currency correctly', () => {
    const formatted = component['formatCurrency'](1500.50);
    expect(formatted).toContain('R$');
    expect(formatted).toContain('1.500,50');
  });

  it('should return investments correctly', () => {
    component.investments = mockInvestments;

    const result = component.getInvestments();

    expect(result).toEqual(mockInvestments);
  });

  it('should return investment summary correctly', () => {
    component.investmentSummary = mockInvestmentSummary;

    const result = component.getInvestmentSummary();

    expect(result).toEqual(mockInvestmentSummary);
  });

  it('should return total investment value correctly', () => {
    component.totalInvestmentValue = 5000;

    const result = component.getTotalInvestmentValue();

    expect(result).toBe(5000);
  });

  it('should return loading state correctly', () => {
    component.isLoading = true;

    const result = component.getIsLoading();

    expect(result).toBeTrue();
  });

  it('should load accounts data successfully', () => {
    component.ngOnInit();

    expect(component.accounts).toEqual([mockAccount]);
    expect(component.currentAccount).toEqual(mockAccount);
  });

  it('should handle missing account data', () => {
    const emptyAccountSummary: AccountSummary = {
      message: 'Success',
      result: {
        account: [],
        transactions: [],
        cards: []
      }
    };
    mockAccountService.getByUserId.and.returnValue(of(emptyAccountSummary));

    component.ngOnInit();

    expect(component.accounts).toEqual([]);
    expect(component.currentAccount).toBeNull();
  });

  it('should cleanup subscriptions on destroy', () => {
    const destroySpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle malformed account summary response', () => {
    const malformedResponse = {
      message: 'Success',
      result: null
    } as any;
    mockAccountService.getByUserId.and.returnValue(of(malformedResponse));

    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should handle undefined investments gracefully', () => {
    component.investments = undefined as any;
    
    expect(() => component.ngOnChanges({
      investments: {
        currentValue: undefined as any,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    })).not.toThrow();
    expect(component.totalInvestmentValue).toBe(0);
  });

  it('should handle zero balance correctly', () => {
    component.investmentSummary = {
      ...mockInvestmentSummary,
      totalValue: 0
    };
    
    component['updateInvestmentBalance']();

    expect(component.totalInvestmentValue).toBe(0);
    expect(component.balance).toContain('0,00');
  });
});
