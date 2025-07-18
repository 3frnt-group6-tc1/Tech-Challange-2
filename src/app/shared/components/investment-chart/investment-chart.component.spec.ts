import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestmentChartComponent } from './investment-chart.component';
import {
  InvestmentTranslationService,
  TranslatedInvestmentData,
} from '../../services/Investment/investment-translation.service';
import { of, Subject } from 'rxjs';
import { Investment } from '../../models/investment';

describe('InvestmentChartComponent', () => {
  let component: InvestmentChartComponent;
  let fixture: ComponentFixture<InvestmentChartComponent>;
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

  beforeEach(async () => {
    const translationServiceSpy = jasmine.createSpyObj(
      'InvestmentTranslationService',
      ['loadTranslations', 'translateTypeSync']
    );

    await TestBed.configureTestingModule({
      imports: [InvestmentChartComponent],
      providers: [
        {
          provide: InvestmentTranslationService,
          useValue: translationServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentChartComponent);
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
    mockTranslationService.translateTypeSync.and.callFake((type: string) => {
      const translations: { [key: string]: string } = {
        CDB: 'Certificado de Depósito Bancário',
        Ações: 'Ações',
        'Tesouro Direto': 'Tesouro Direto',
      };
      return translations[type] || type;
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.investments).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.showBalance).toBeTrue();
    expect(component.categories).toEqual([]);
    expect(component.totalValue).toBe(0);
    expect(component.isLoading).toBeFalse();
  });

  it('should load translations on init', () => {
    component.ngOnInit();
    expect(mockTranslationService.loadTranslations).toHaveBeenCalled();
  });

  it('should update chart data when investments change', () => {
    component.investments = mockInvestments;
    component.ngOnChanges({
      investments: {
        currentValue: mockInvestments,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.totalValue).toBe(10000);
    expect(component.categories.length).toBe(3);
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

  it('should calculate total value correctly', () => {
    component.investments = mockInvestments;
    component['updateChartData'](mockInvestments);

    expect(component.totalValue).toBe(10000);
  });

  it('should group investments by type', () => {
    component.investments = mockInvestments;
    component['updateChartData'](mockInvestments);

    expect(component.categories.length).toBe(3);

    const cdbCategory = component.categories.find(
      (cat) => cat.name === 'Certificado de Depósito Bancário'
    );
    const acaoCategory = component.categories.find(
      (cat) => cat.name === 'Ações'
    );
    const tesouroCategory = component.categories.find(
      (cat) => cat.name === 'Tesouro Direto'
    );

    expect(cdbCategory?.value).toBe(5000);
    expect(acaoCategory?.value).toBe(3000);
    expect(tesouroCategory?.value).toBe(2000);
  });

  it('should calculate percentages correctly', () => {
    component.investments = mockInvestments;
    component['updateChartData'](mockInvestments);

    const cdbCategory = component.categories.find(
      (cat) => cat.name === 'Certificado de Depósito Bancário'
    );
    const acaoCategory = component.categories.find(
      (cat) => cat.name === 'Ações'
    );
    const tesouroCategory = component.categories.find(
      (cat) => cat.name === 'Tesouro Direto'
    );

    expect(cdbCategory?.percentage).toBe(50);
    expect(acaoCategory?.percentage).toBe(30);
    expect(tesouroCategory?.percentage).toBe(20);
  });

  it('should assign colors to categories', () => {
    component.investments = mockInvestments;
    component['updateChartData'](mockInvestments);

    component.categories.forEach((category) => {
      expect(category.color).toBeDefined();
      expect(category.color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('should handle empty investments array', () => {
    component.investments = [];
    component['updateChartData']([]);

    expect(component.totalValue).toBe(0);
    expect(component.categories).toEqual([]);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(1500.5);
    expect(formatted).toContain('R$');
    expect(formatted).toContain('1.500,50');
  });

  it('should generate correct SVG path for segments', () => {
    const startAngle = 0;
    const endAngle = Math.PI / 2;
    const path = component.getSegmentPath(startAngle, endAngle);

    expect(path).toContain('M');
    expect(path).toContain('A');
    expect(path).toContain('L');
    expect(path).toContain('Z');
  });

  it('should generate segment data with paths', () => {
    component.investments = mockInvestments;
    component['updateChartData'](mockInvestments);

    const segmentData = component.getSegmentData();

    expect(segmentData.length).toBe(3);
    segmentData.forEach((segment) => {
      expect(segment.path).toBeDefined();
      expect(segment.name).toBeDefined();
      expect(segment.value).toBeGreaterThan(0);
      expect(segment.percentage).toBeGreaterThan(0);
      expect(segment.color).toBeDefined();
    });
  });

  it('should handle investments with same type', () => {
    const sameTypeInvestments: Investment[] = [
      { ...mockInvestments[0], _id: '1', value: 1000 },
      { ...mockInvestments[0], _id: '2', value: 2000 },
    ];

    component.investments = sameTypeInvestments;
    component['updateChartData'](sameTypeInvestments);

    expect(component.categories.length).toBe(1);
    expect(component.categories[0].value).toBe(3000);
    expect(component.categories[0].percentage).toBe(100);
  });

  it('should cleanup subscriptions on destroy', () => {
    const destroySpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle translation service errors gracefully', () => {
    mockTranslationService.translateTypeSync.and.returnValue('Outros');

    component.investments = [mockInvestments[0]];
    component['updateChartData']([mockInvestments[0]]);

    expect(component.categories.length).toBe(1);
    expect(component.categories[0].name).toBe('Outros'); // Falls back to 'Outros'
  });

  it('should update when showBalance input changes', () => {
    const initialShowBalance = component.showBalance;
    component.showBalance = !initialShowBalance;

    expect(component.showBalance).toBe(!initialShowBalance);
  });

  it('should handle segment calculation for full circle', () => {
    const singleInvestment = [mockInvestments[0]];
    component.investments = singleInvestment;
    component['updateChartData'](singleInvestment);

    const segmentData = component.getSegmentData();

    expect(segmentData.length).toBe(1);
    expect(segmentData[0].percentage).toBe(100);
    expect(segmentData[0].path).toBeDefined();
  });
});
