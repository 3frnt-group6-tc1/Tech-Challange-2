# Atualização do Modelo de Transação

## Resumo das Alterações

O modelo de transação foi atualizado para suportar o novo formato de payload da API. As principais mudanças incluem:

### 1. Modelo de Dados

#### Antes:

```typescript
export interface Transaction {
  id?: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string;
  id_user: string;
  accountId?: string;
  attachments?: Attachment[];
}
```

#### Depois:

```typescript
export interface Transaction {
  id?: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string;
  id_user: string;
  accountId?: string;
  from?: string;
  to?: string;
  anexo?: string;
}
```

### 2. Novos Tipos de Transação

Os valores dos enums foram atualizados para corresponder ao formato da API:

```typescript
export enum TransactionType {
  Exchange = "cambio", // antes: 'exchange'
  Loan = "emprestimo", // antes: 'loan'
  Transfer = "transferencia", // antes: 'transfer'
}
```

### 3. Interfaces da API

Foram criadas novas interfaces para comunicação com a API:

```typescript
// Payload enviado para a API
export interface TransactionApiPayload {
  accountId: string;
  value: number;
  type: string;
  from: string;
  to: string;
  anexo?: string;
}

// Resposta recebida da API
export interface TransactionApiResponse extends TransactionApiPayload {
  id: string;
  date: string;
}
```

### 4. Funções de Conversão

Foram criadas funções para converter entre os formatos:

```typescript
// Converte transação interna para payload da API
export function transactionToApiPayload(transaction: Transaction): TransactionApiPayload;

// Converte resposta da API para transação interna
export function apiResponseToTransaction(apiResponse: TransactionApiResponse, userId: string): Transaction;
```

## Exemplo de Uso

### Criando uma Nova Transação

```typescript
const transaction: Transaction = {
  type: TransactionType.Transfer,
  amount: 150.5,
  date: new Date(),
  description: "Transferência para João Silva",
  id_user: "user123",
  accountId: "60f7b1b9b3f4b3b9b3f4b3b9",
  from: "Conta Corrente",
  to: "João Silva",
  anexo: "https://bucket.s3.amazonaws.com/anexo.pdf",
};

// O serviço automaticamente converte para o formato da API
this.transactionService.create(transaction).subscribe((result) => {
  console.log("Transação criada:", result);
});
```

### Payload Enviado para a API

```json
{
  "accountId": "60f7b1b9b3f4b3b9b3f4b3b9",
  "value": 150.5,
  "type": "transferencia",
  "from": "Conta Corrente",
  "to": "João Silva",
  "anexo": "https://bucket.s3.amazonaws.com/anexo.pdf"
}
```

## Serviços Atualizados

### TransactionService

- Todos os métodos foram atualizados para usar as funções de conversão
- `create()`, `read()`, `update()`, `getAll()`, `getByUserId()` agora fazem conversão automática

### TransactionMapperService (Novo)

- Serviço utilitário para conversões
- Validação de transações
- Criação de transações com valores padrão

## Componentes Atualizados

### TransactionFormComponent

- Formulário atualizado com novos campos:
  - `from`: Origem da transação
  - `to`: Destino da transação
  - `anexo`: URL do anexo (opcional)

## Compatibilidade

- ✅ A aplicação mantém compatibilidade com o modelo interno existente
- ✅ Conversão automática entre formatos interno e da API
- ✅ Validação de dados antes do envio
- ✅ Testes unitários incluídos

## Próximos Passos

1. Atualizar componentes que exibem transações para mostrar os novos campos
2. Implementar upload de anexos se necessário
3. Adicionar validações específicas para cada tipo de transação
4. Atualizar testes de integração
