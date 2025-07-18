import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Investment } from '../models/investment';
import { InvestmentTranslationService } from '../services/Investment/investment-translation.service';
import {
  InvestmentTypePipe,
  InvestmentCategoryPipe,
} from '../pipes/investment-translation.pipe';

@Component({
  selector: 'app-investment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InvestmentTypePipe,
    InvestmentCategoryPipe,
  ],
  template: `
    <div class="investment-list">
      <h2>Lista de Investimentos</h2>

      <!-- Filtros com traduções -->
      <div class="filters mb-4">
        <select
          [(ngModel)]="selectedType"
          (change)="onFilterChange()"
          class="mr-2"
        >
          <option value="">Todos os tipos</option>
          <option *ngFor="let type of availableTypes" [value]="type.value">
            {{ type.value | investmentType | async }}
          </option>
        </select>

        <select [(ngModel)]="selectedCategory" (change)="onFilterChange()">
          <option value="">Todas as categorias</option>
          <option
            *ngFor="let category of availableCategories"
            [value]="category.value"
          >
            {{ category.value | investmentCategory | async }}
          </option>
        </select>
      </div>

      <!-- Lista de investimentos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let investment of filteredInvestments"
          class="investment-card bg-white rounded-lg shadow-md p-4 border"
        >
          <h3 class="text-lg font-bold mb-2">{{ investment.name }}</h3>

          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Tipo:</span>
              <span class="font-medium">{{
                investment.type | investmentType | async
              }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">Categoria:</span>
              <span class="font-medium">{{
                investment.category | investmentCategory | async
              }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">Valor:</span>
              <span class="font-bold text-green-600">
                {{
                  investment.value
                    | currency : 'BRL' : 'symbol' : '1.2-2' : 'pt'
                }}
              </span>
            </div>

            <div
              class="flex justify-between"
              *ngIf="investment.profit !== null"
            >
              <span class="text-gray-600">Lucro:</span>
              <span
                class="font-medium"
                [class.text-green-600]="investment.profit > 0"
                [class.text-red-600]="investment.profit < 0"
              >
                {{
                  investment.profit
                    | currency : 'BRL' : 'symbol' : '1.2-2' : 'pt'
                }}
                ({{ investment.profitPercentage | percent : '1.2-2' : 'pt' }})
              </span>
            </div>

            <div class="mt-3 pt-2 border-t">
              <span
                class="inline-block px-2 py-1 rounded-full text-xs font-medium"
                [class.bg-green-100]="investment.isMatured"
                [class.text-green-800]="investment.isMatured"
                [class.bg-yellow-100]="!investment.isMatured"
                [class.text-yellow-800]="!investment.isMatured"
              >
                {{ investment.isMatured ? 'Vencido' : 'Em andamento' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Caso não haja investimentos -->
      <div *ngIf="filteredInvestments.length === 0" class="text-center py-8">
        <p class="text-gray-500">
          Nenhum investimento encontrado com os filtros aplicados.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .investment-card {
        transition: transform 0.2s, shadow 0.2s;
      }

      .investment-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .filters select {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        background-color: white;
      }
    `,
  ],
})
export class InvestmentListComponent implements OnInit, OnDestroy {
  investments: Investment[] = [];
  filteredInvestments: Investment[] = [];
  availableTypes: { value: string; label: string }[] = [];
  availableCategories: { value: string; label: string }[] = [];

  selectedType = '';
  selectedCategory = '';

  private destroy$ = new Subject<void>();

  constructor(private translationService: InvestmentTranslationService) {}

  ngOnInit(): void {
    // Carregar traduções primeiro
    this.translationService
      .loadTranslations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAvailableOptions();
        this.loadInvestments();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAvailableOptions(): void {
    // Carregar tipos disponíveis
    this.translationService
      .getTranslatedTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((types: { value: string; label: string }[]) => {
        this.availableTypes = types;
      });

    // Carregar categorias disponíveis
    this.translationService
      .getTranslatedCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories: { value: string; label: string }[]) => {
        this.availableCategories = categories;
      });
  }

  private loadInvestments(): void {
    // Aqui você carregaria os investimentos do serviço
    // Por enquanto, dados de exemplo
    this.investments = [
      {
        _id: '1',
        type: 'CDB',
        category: 'FIXED_INCOME',
        value: 10000,
        name: 'CDB Bank XYZ',
        accountId: { _id: '1', type: 'CHECKING', accountNumber: '12345' },
        __v: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        profit: 500,
        profitPercentage: 5,
        isMatured: false,
      },
      {
        _id: '2',
        type: 'LCI',
        category: 'FIXED_INCOME',
        value: 5000,
        name: 'LCI Imóveis',
        accountId: { _id: '1', type: 'CHECKING', accountNumber: '12345' },
        __v: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        profit: 250,
        profitPercentage: 5,
        isMatured: true,
      },
    ];

    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredInvestments = this.investments.filter((investment) => {
      const typeMatch =
        !this.selectedType || investment.type === this.selectedType;
      const categoryMatch =
        !this.selectedCategory || investment.category === this.selectedCategory;

      return typeMatch && categoryMatch;
    });
  }

  // Método de exemplo para obter tradução síncrona
  getTranslatedType(type: string): string {
    return this.translationService.translateTypeSync(type);
  }

  getTranslatedCategory(category: string): string {
    return this.translationService.translateCategorySync(category);
  }
}
