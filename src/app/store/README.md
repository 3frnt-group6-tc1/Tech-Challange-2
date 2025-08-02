# NgRx

## Estrutura

```
store/
├── balance/                    # Funcionalidade de Saldo
│   ├── balance.state.ts       # Interface e estado inicial
│   ├── balance.actions.ts     # Ações do NgRx
│   ├── balance.reducer.ts     # Reducer para gerenciar mudanças de estado
│   ├── balance.selectors.ts   # Selectors para acessar o estado
│   ├── balance.effects.ts     # Effects para side effects
│   ├── balance.service.ts     # Serviço para interagir com o store
│   └── index.ts              # Exportações
└── README.md                 # Documentação
```

## Funcionalidade de Saldo

### Estado (State)
- `balance`: Valor numérico do saldo
- `formattedBalance`: Saldo formatado em moeda brasileira
- `showBalance`: Flag para mostrar/ocultar o saldo
- `accountType`: Tipo da conta (ex: "Conta Corrente")
- `isLoading`: Flag de carregamento
- `error`: Mensagem de erro

### Ações (Actions)
- `loadBalance`: Carregar dados do saldo
- `loadBalanceSuccess`: Sucesso no carregamento
- `loadBalanceFailure`: Falha no carregamento
- `updateBalance`: Atualizar saldo
- `toggleBalanceVisibility`: Alternar visibilidade
- `setBalanceVisibility`: Definir visibilidade
- `setAccountType`: Definir tipo de conta
- `clearBalanceError`: Limpar erro

### Selectors
- `selectBalance`: Saldo numérico
- `selectFormattedBalance`: Saldo formatado
- `selectShowBalance`: Estado de visibilidade
- `selectAccountType`: Tipo de conta
- `selectVisibleBalance`: Saldo visível (formatado ou ****)
- `selectBalanceIsLoading`: Estado de carregamento
- `selectBalanceError`: Erro atual

### Effects
- `loadBalance$`: Carrega dados da conta via API
- `updateBalance$`: Atualiza o saldo

### Serviço
O `BalanceService` fornece uma interface limpa para interagir com o store:
- Observables para todos os dados do estado
- Métodos para disparar ações
- Métodos auxiliares para cálculos

## Como Usar

### No Componente
```typescript
import { BalanceService } from '../store/balance/balance.service';

export class DashboardComponent {
  constructor(private balanceService: BalanceService) {}
  
  // Observables
  balance$ = this.balanceService.visibleBalance$;
  accountType$ = this.balanceService.accountType$;
  
  // Actions
  toggleBalance() {
    this.balanceService.toggleBalanceVisibility();
  }
}
```

### No Template
```html
<p>{{ balance$ | async }}</p>
<p>{{ accountType$ | async }}</p>
<button (click)="toggleBalance()">Alternar</button>
```

## Configuração

O NgRx foi configurado no `app.config.ts` com:
- Store principal com o reducer de saldo
- Effects para side effects
- Store DevTools para debugging

## Benefícios

1. **Estado Centralizado**: Todo o estado do saldo está em um local
2. **Previsibilidade**: Mudanças de estado são previsíveis e rastreáveis
3. **Debugging**: DevTools permitem inspecionar mudanças de estado
4. **Testabilidade**: Actions e reducers são funções puras, fáceis de testar
5. **Reatividade**: Componentes reagem automaticamente a mudanças de estado 