import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestmentSummaryComponent } from './investment-summary.component';
import {
  InvestmentTranslationService,
  TranslatedInvestmentData,
} from '../../services/Investment/investment-translation.service';
import { of } from 'rxjs';
import { Investment, InvestmentSummary } from '../../models/investment';

describe('InvestmentSummaryComponent', () => {
  let component: InvestmentSummaryComponent;
  let fixture: ComponentFixture<InvestmentSummaryComponent>;
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
        accountNumber: '12345',
      },
      __v: 0,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      profit: 250,
      profitPercentage: 5,
      isMatured: false,
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
        accountNumber: '12345',
      },
      __v: 0,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      profit: -150,
      profitPercentage: -5,
      isMatured: false,
    },
    {
      _id: '3',
      type: 'Tesouro Direto',
      category: 'Renda Fixa',
      value: 2000,
      name: 'Tesouro Selic',
      accountId: {
        _id: 'acc1',
        type: 'Conta Corrente',
        accountNumber: '12345',
      },
      __v: 0,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      profit: 100,
      profitPercentage: 5,
      isMatured: false,
    },
  ];

  const mockInvestmentSummary: InvestmentSummary = {
    totalValue: 10000,
    totalInitialValue: 9800,
    totalProfit: 200,
    totalProfitPercentage: 2.04,
    totalInvestments: 3,
    byCategory: [],
  };

  beforeEach(async () => {
    const translationServiceSpy = jasmine.createSpyObj(
      'InvestmentTranslationService',
      ['loadTranslations', 'translateCategorySync']
    );

    await TestBed.configureTestingModule({
      imports: [InvestmentSummaryComponent],
      providers: [
        {
          provide: InvestmentTranslationService,
          useValue: translationServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentSummaryComponent);
    component = fixture.componentInstance;
    mockTranslationService = TestBed.inject(
      InvestmentTranslationService
    ) as jasmine.SpyObj<InvestmentTranslationService>;

    // Setup default mocks
    const mockTranslationData: TranslatedInvestmentData = {
      types: new Map(),
      categories: new Map(),
      riskLevels: new Map(),
    };
    mockTranslationService.loadTranslations.and.returnValue(
      of(mockTranslationData)
    );
    mockTranslationService.translateCategorySync.and.callFake(
      (category: string) => {
        const translations: { [key: string]: string } = {
          'Renda Fixa': 'Renda Fixa',
          'Renda Variável': 'Renda Variável',
        };
        return translations[category] || category;
      }
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.investments).toEqual([]);
    expect(component.investmentSummary).toBeNull();
    expect(component.loading).toBeFalse();
    expect(component.showBalance).toBeTrue();
    expect(component.displaySummary.totalValue).toBe(0);
    expect(component.displaySummary.totalProfit).toBe(0);
    expect(component.displaySummary.profitPercentage).toBe(0);
    expect(component.displaySummary.categories).toEqual([]);
    expect(component.isLoading).toBeFalse();
  });

  it('should load translations on init', () => {
    component.ngOnInit();
    expect(mockTranslationService.loadTranslations).toHaveBeenCalled();
  });

  it('should update display summary when investments change', () => {
    component.investments = mockInvestments;
    component.ngOnChanges({
      investments: {
        currentValue: mockInvestments,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.displaySummary.totalValue).toBe(10000);
    expect(component.displaySummary.totalProfit).toBe(200);
    expect(component.displaySummary.categories.length).toBe(2);
  });

  it('should update display summary when investment summary changes', () => {
    component.investmentSummary = mockInvestmentSummary;
    component.investments = mockInvestments;
    component.ngOnChanges({
      investmentSummary: {
        currentValue: mockInvestmentSummary,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.displaySummary.totalValue).toBe(10000);
    expect(component.displaySummary.totalProfit).toBe(200);
  });

  it('should prioritize API summary over calculated summary', () => {
    component.investments = mockInvestments;
    component.investmentSummary = mockInvestmentSummary;

    component['updateDisplaySummary']();

    expect(component.displaySummary.totalValue).toBe(
      mockInvestmentSummary.totalValue
    );
    expect(component.displaySummary.totalProfit).toBe(
      mockInvestmentSummary.totalProfit
    );
  });

  it('should calculate summary from investments when no API summary', () => {
    component.investments = mockInvestments;
    component.investmentSummary = null;

    component['updateDisplaySummary']();

    expect(component.displaySummary.totalValue).toBe(10000);
    expect(component.displaySummary.totalProfit).toBe(200);
  });

  it('should reset summary when no data available', () => {
    component.investments = [];
    component.investmentSummary = null;

    component['updateDisplaySummary']();

    expect(component.displaySummary.totalValue).toBe(0);
    expect(component.displaySummary.totalProfit).toBe(0);
    expect(component.displaySummary.profitPercentage).toBe(0);
    expect(component.displaySummary.categories).toEqual([]);
  });

  it('should generate categories from investments', () => {
    const categories = component['generateCategoriesFromInvestments'](
      mockInvestments,
      10000
    );

    expect(categories.length).toBe(2);

    const rendaFixa = categories.find((cat) => cat.name === 'Renda Fixa');
    const rendaVariavel = categories.find(
      (cat) => cat.name === 'Renda Variável'
    );

    expect(rendaFixa?.value).toBe(7000); // CDB (5000) + Tesouro (2000)
    expect(rendaVariavel?.value).toBe(3000); // Ações (3000)
  });

  it('should calculate percentages correctly for categories', () => {
    const categories = component['generateCategoriesFromInvestments'](
      mockInvestments,
      10000
    );

    const rendaFixa = categories.find((cat) => cat.name === 'Renda Fixa');
    const rendaVariavel = categories.find(
      (cat) => cat.name === 'Renda Variável'
    );

    expect(rendaFixa?.percentage).toBe(70);
    expect(rendaVariavel?.percentage).toBe(30);
  });

  it('should assign colors to categories', () => {
    const categories = component['generateCategoriesFromInvestments'](
      mockInvestments,
      10000
    );

    categories.forEach((category, index) => {
      expect(category.color).toBeDefined();
      expect(category.color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('should sort categories by value descending', () => {
    const categories = component['generateCategoriesFromInvestments'](
      mockInvestments,
      10000
    );

    for (let i = 0; i < categories.length - 1; i++) {
      expect(categories[i].value).toBeGreaterThanOrEqual(
        categories[i + 1].value
      );
    }
  });

  it('should handle empty investments array', () => {
    const categories = component['generateCategoriesFromInvestments']([], 0);
    expect(categories).toEqual([]);
  });

  it('should handle investments with zero total value', () => {
    const categories = component['generateCategoriesFromInvestments'](
      mockInvestments,
      0
    );
    expect(categories).toEqual([]);
  });

  it('should filter out invalid investments', () => {
    const invalidInvestments = [
      { ...mockInvestments[0], value: 0 },
      { ...mockInvestments[1], value: undefined as any },
      mockInvestments[2],
    ];

    component.investments = invalidInvestments;
    component['updateSummaryFromInvestments'](invalidInvestments);

    expect(component.displaySummary.totalValue).toBe(2000);
    expect(component.displaySummary.categories.length).toBe(1);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(1500.5);
    expect(formatted).toContain('R$');
    expect(formatted).toContain('1.500,50');
  });

  it('should format percentage correctly', () => {
    const formatted = component.formatPercentage(15.5);
    expect(formatted).toContain('15,50%');
  });

  it('should return correct profit class for positive profit', () => {
    component.displaySummary.totalProfit = 100;
    const profitClass = component.getProfitClass();
    expect(profitClass).toBe('text-green-600');
  });

  it('should return correct profit class for negative profit', () => {
    component.displaySummary.totalProfit = -100;
    const profitClass = component.getProfitClass();
    expect(profitClass).toBe('text-red-600');
  });

  it('should return correct profit class for zero profit', () => {
    component.displaySummary.totalProfit = 0;
    const profitClass = component.getProfitClass();
    expect(profitClass).toBe('text-gray-600');
  });

  it('should return correct profit icon for positive profit', () => {
    component.displaySummary.totalProfit = 100;
    const profitIcon = component.getProfitIcon();
    expect(profitIcon).toBe('↗');
  });

  it('should return correct profit icon for negative profit', () => {
    component.displaySummary.totalProfit = -100;
    const profitIcon = component.getProfitIcon();
    expect(profitIcon).toBe('↘');
  });

  it('should return correct profit icon for zero profit', () => {
    component.displaySummary.totalProfit = 0;
    const profitIcon = component.getProfitIcon();
    expect(profitIcon).toBe('→');
  });

  it('should calculate profit percentage correctly', () => {
    component.investments = mockInvestments;
    component['updateSummaryFromInvestments'](mockInvestments);

    expect(component.displaySummary.profitPercentage).toBe(2);
  });

  it('should handle zero total value for profit percentage calculation', () => {
    const zeroValueInvestments = mockInvestments.map((inv) => ({
      ...inv,
      value: 0,
    }));
    component.investments = zeroValueInvestments;
    component['updateSummaryFromInvestments'](zeroValueInvestments);

    expect(component.displaySummary.profitPercentage).toBe(0);
  });

  it('should update loading state when loading changes', () => {
    component.loading = true;
    component.ngOnChanges({
      loading: {
        currentValue: true,
        previousValue: false,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.isLoading).toBeTrue();
  });

  it('should cleanup subscriptions on destroy', () => {
    const destroySpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle translation service returning empty string', () => {
    mockTranslationService.translateCategorySync.and.returnValue('');

    const categories = component['generateCategoriesFromInvestments'](
      mockInvestments,
      10000
    );

    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((cat) => cat.name === 'Outros')).toBeTrue();
  });

  it('should handle undefined category translation', () => {
    mockTranslationService.translateCategorySync.and.returnValue('Outros');

    const categories = component['generateCategoriesFromInvestments'](
      mockInvestments,
      10000
    );

    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((cat) => cat.name === 'Outros')).toBeTrue();
  });

  it('should round percentages to 2 decimal places', () => {
    const testInvestments = [
      { ...mockInvestments[0], value: 3333 },
      { ...mockInvestments[1], value: 6667 },
    ];

    const categories = component['generateCategoriesFromInvestments'](
      testInvestments,
      10000
    );

    categories.forEach((category) => {
      expect(category.percentage).toBe(
        Math.round(category.percentage * 100) / 100
      );
    });
  });

  it('should handle null investments array gracefully', () => {
    component.investments = null as any;
    component.investmentSummary = null;

    expect(() => component['updateDisplaySummary']()).not.toThrow();
    expect(component.displaySummary.totalValue).toBe(0);
  });
});
