# Integração de Contas com Autenticação

## Visão Geral

Este documento descreve como o sistema foi atualizado para automaticamente obter e gerenciar a conta principal do usuário logado.

## Funcionalidades Implementadas

### 1. Carregamento Automático da Conta Principal

Quando um usuário faz login ou a aplicação é inicializada com um token válido, o sistema automaticamente:

- Carrega a primeira conta ativa do usuário como conta principal
- Salva esta conta no session storage para acesso rápido
- Disponibiliza a conta através de observables e métodos diretos

### 2. Associação Automática de Transações

Quando uma transação é criada, o sistema automaticamente:

- Obtém o ID da conta principal do usuário logado
- Adiciona o `accountId` à transação antes de salvá-la
- Mantém a compatibilidade com transações que já especificam um `accountId`

## Uso das APIs

### AuthService

```typescript
// Obter a conta principal atual
const primaryAccount = this.authService.getPrimaryAccount();

// Obter apenas o ID da conta principal
const accountId = this.authService.getPrimaryAccountId();

// Observar mudanças na conta principal
this.authService.primaryAccount$.subscribe((account) => {
  console.log("Conta principal:", account);
});
```

### TransactionService

```typescript
// Criar transação (accountId será automaticamente adicionado)
const transaction: Transaction = {
  type: TransactionType.Transfer,
  amount: 100,
  description: "Transferência",
  id_user: currentUser.id,
  date: new Date(),
  // accountId será automaticamente definido pelo serviço
};

this.transactionService.create(transaction).subscribe((result) => {
  console.log("Transação criada:", result);
});
```

### AccountService

```typescript
// Obter conta principal diretamente
this.accountService.getPrimaryAccountByUserId(userId).subscribe((account) => {
  console.log("Conta principal:", account);
});

// Obter todas as contas ativas
this.accountService.getActiveAccountsByUserId(userId).subscribe((accounts) => {
  console.log("Contas ativas:", accounts);
});
```

## Estrutura de Dados

### Modelo Account

```typescript
interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "suspended";
}
```

### Modelo Transaction (Atualizado)

```typescript
interface Transaction {
  id?: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string;
  id_user: string;
  accountId?: string; // ✨ Novo campo adicionado
  attachments?: Attachment[];
}
```

## Fluxo de Inicialização

1. **Login/Inicialização**

   - Token é verificado e usuário é autenticado
   - `loadPrimaryAccount()` é chamado automaticamente
   - Primeira conta ativa do usuário é carregada
   - Conta é salva no session storage

2. **Criação de Transação**
   - Usuário preenche formulário de transação
   - `TransactionService.create()` é chamado
   - Automaticamente obtém `accountId` da conta principal
   - Transação é salva com o `accountId` preenchido

## Benefícios

- **Simplicidade**: Desenvolvedores não precisam se preocupar em passar o `accountId` manualmente
- **Consistência**: Todas as transações automaticamente ficam associadas à conta correta
- **Performance**: Conta principal é carregada uma vez e mantida em cache
- **Flexibilidade**: Ainda permite especificar um `accountId` diferente se necessário

## Considerações

- A conta principal é definida como a primeira conta ativa retornada pela API
- Se o usuário não tiver contas ativas, `accountId` ficará `null`
- O session storage é limpo no logout para manter a segurança
- As funcionalidades são backwards-compatible com código existente
