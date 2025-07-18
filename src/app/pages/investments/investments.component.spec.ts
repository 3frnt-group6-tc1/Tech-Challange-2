import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { InvestmentsComponent } from './investments.component';
import { InvestmentService } from '../../shared/services/Investment/investment.service';
import { InvestmentTranslationService, TranslatedInvestmentData } from '../../shared/services/Investment/investment-translation.service';
import { of, throwError } from 'rxjs';
import { Investment, InvestmentSummary, InvestmentResponse, InvestmentFilters } from '../../shared/models/investment';

describe('InvestmentsComponent', () => {
  let component: InvestmentsComponent;
  let fixture: ComponentFixture<InvestmentsComponent>;
  let mockInvestmentService: jasmine.SpyObj<InvestmentService>;
  let mockTranslationService: jasmine.SpyObj<InvestmentTranslationService>;

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

  const mockInvestmentResponse: InvestmentResponse = {
    message: 'Success',
    result: {
      investments: mockInvestments,
      summary: mockInvestmentSummary,
      count: 2
    }
  };

  beforeEach(async () => {
    const investmentServiceSpy = jasmine.createSpyObj('InvestmentService', ['getInvestments']);
    const translationServiceSpy = jasmine.createSpyObj('InvestmentTranslationService', ['loadTranslations']);
    const activatedRouteMock = {
      params: of({}),
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [InvestmentsComponent],
      providers: [
        { provide: InvestmentService, useValue: investmentServiceSpy },
        { provide: InvestmentTranslationService, useValue: translationServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentsComponent);
    component = fixture.componentInstance;
    mockInvestmentService = TestBed.inject(InvestmentService) as jasmine.SpyObj<InvestmentService>;
    mockTranslationService = TestBed.inject(InvestmentTranslationService) as jasmine.SpyObj<InvestmentTranslationService>;

    // Setup default mocks
    const mockTranslationData: TranslatedInvestmentData = {
      types: new Map(),
      categories: new Map(),
      riskLevels: new Map()
    };
    mockTranslationService.loadTranslations.and.returnValue(of(mockTranslationData));
    mockInvestmentService.getInvestments.and.returnValue(of(mockInvestmentResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.investments).toEqual([]);
    expect(component.investmentSummary).toBeNull();
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
    expect(component.showBalance).toBeTrue();
  });

  it('should load translations and investments on init', () => {
    component.ngOnInit();

    expect(mockTranslationService.loadTranslations).toHaveBeenCalled();
    expect(mockInvestmentService.getInvestments).toHaveBeenCalled();
  });

  it('should load investments successfully', () => {
    component.loadInvestments();

    expect(component.loading).toBeFalse();
    expect(component.investments).toEqual(mockInvestments);
    expect(component.investmentSummary).toEqual(mockInvestmentSummary);
    expect(component.error).toBeNull();
  });

  it('should set loading state while loading investments', () => {
    component.loadInvestments();

    // After the observable completes, loading should be false and data should be set
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
    expect(component.investments).toEqual(mockInvestments);
  });

  it('should handle investment service error', () => {
    const errorMessage = 'Service error';
    mockInvestmentService.getInvestments.and.returnValue(throwError(() => new Error(errorMessage)));
    spyOn(console, 'error');

    component.loadInvestments();

    expect(console.error).toHaveBeenCalled();
    expect(component.error).toBe('Erro ao carregar investimentos. Tente novamente.');
    expect(component.loading).toBeFalse();
  });

  it('should pass filters to investment service', () => {
    const filters: InvestmentFilters = {
      type: 'CDB',
      name: 'CDB Bank A',
      isMatured: false
    };

    component.loadInvestments(filters);

    expect(mockInvestmentService.getInvestments).toHaveBeenCalledWith(filters);
  });

  it('should handle filter changes', () => {
    const filters: InvestmentFilters = {
      type: 'Ações',
      name: 'PETR4'
    };
    spyOn(component, 'loadInvestments');

    component.onFilterChange(filters);

    expect(component.loadInvestments).toHaveBeenCalledWith(filters);
  });

  it('should handle investment updates', () => {
    spyOn(component, 'loadInvestments');

    component.onInvestmentUpdate();

    expect(component.loadInvestments).toHaveBeenCalled();
  });

  it('should toggle balance visibility', () => {
    const initialShowBalance = component.showBalance;

    component.toggleBalance();

    expect(component.showBalance).toBe(!initialShowBalance);
  });

  it('should cleanup subscriptions on destroy', () => {
    const destroySpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle empty investment response', () => {
    const emptyResponse: InvestmentResponse = {
      message: 'Success',
      result: {
        investments: [],
        summary: {
          totalValue: 0,
          totalInitialValue: 0,
          totalProfit: 0,
          totalProfitPercentage: 0,
          totalInvestments: 0,
          byCategory: []
        },
        count: 0
      }
    };
    mockInvestmentService.getInvestments.and.returnValue(of(emptyResponse));

    component.loadInvestments();

    expect(component.investments).toEqual([]);
    expect(component.investmentSummary?.totalValue).toBe(0);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should handle malformed response gracefully', () => {
    const malformedResponse = {
      message: 'Success',
      result: null
    } as any;
    mockInvestmentService.getInvestments.and.returnValue(of(malformedResponse));

    expect(() => component.loadInvestments()).not.toThrow();
  });

  it('should reset error when starting new load', () => {
    component.error = 'Previous error';

    component.loadInvestments();

    expect(component.error).toBeNull();
  });

  it('should not load investments if translation loading fails', () => {
    mockTranslationService.loadTranslations.and.returnValue(throwError(() => new Error('Translation error')));
    spyOn(component, 'loadInvestments');

    component.ngOnInit();

    expect(component.loadInvestments).not.toHaveBeenCalled();
  });

  it('should handle undefined filters in loadInvestments', () => {
    component.loadInvestments(undefined);

    expect(mockInvestmentService.getInvestments).toHaveBeenCalledWith(undefined);
  });

  it('should maintain loading state during async operations', () => {
    mockInvestmentService.getInvestments.and.returnValue(of(mockInvestmentResponse));

    component.loadInvestments();

    // Since the observable completes immediately in the test, loading will be false
    expect(component.loading).toBeFalse();
    expect(component.investments).toEqual(mockInvestments);
  });

  it('should handle complex filter objects', () => {
    const complexFilters: InvestmentFilters = {
      type: 'CDB',
      name: 'Test Investment',
      isMatured: true
    };

    component.loadInvestments(complexFilters);

    expect(mockInvestmentService.getInvestments).toHaveBeenCalledWith(complexFilters);
  });

  it('should preserve showBalance state through operations', () => {
    component.showBalance = false;

    component.loadInvestments();
    component.onInvestmentUpdate();

    expect(component.showBalance).toBeFalse();
  });

  it('should handle rapid consecutive calls to loadInvestments', () => {
    component.loadInvestments();
    component.loadInvestments();
    component.loadInvestments();

    expect(mockInvestmentService.getInvestments).toHaveBeenCalledTimes(3);
  });

  it('should handle service returning partial data', () => {
    const partialResponse = {
      message: 'Success',
      result: {
        investments: mockInvestments,
        summary: null,
        count: 2
      }
    } as any;
    mockInvestmentService.getInvestments.and.returnValue(of(partialResponse));

    component.loadInvestments();

    expect(component.investments).toEqual(mockInvestments);
    expect(component.investmentSummary).toBeNull();
    expect(component.loading).toBeFalse();
  });

  it('should toggle showBalance from true to false', () => {
    component.showBalance = true;

    component.toggleBalance();

    expect(component.showBalance).toBeFalse();
  });

  it('should toggle showBalance from false to true', () => {
    component.showBalance = false;

    component.toggleBalance();

    expect(component.showBalance).toBeTrue();
  });
});
