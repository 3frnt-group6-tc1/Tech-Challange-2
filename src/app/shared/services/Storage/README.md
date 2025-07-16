# Safe Storage Service

## Descrição

O `SafeStorageService` é um serviço Angular especializado em gerenciar o armazenamento seguro de dados no `sessionStorage` e `localStorage`, com correção automática de problemas de codificação de caracteres UTF-8.

## Funcionalidades

### 🔧 Correção Automática de Codificação

- Detecta e corrige problemas de dupla codificação UTF-8
- Converte caracteres como "JoÃ£o" de volta para "João"
- Normaliza strings usando Unicode NFC

### 🛡️ Armazenamento Seguro

- Métodos seguros para `sessionStorage` e `localStorage`
- Tratamento de erros robusto
- Limpeza automática de dados corrompidos

### 🚀 API Simples

- Interface consistente para ambos os tipos de storage
- Métodos tipados com TypeScript
- Fácil integração com outros serviços

## Uso

### Importação

```typescript
import { SafeStorageService } from "./shared/services/Storage";
```

### Injeção de Dependência

```typescript
constructor(private safeStorage: SafeStorageService) {}
```

### Métodos Principais

#### SessionStorage

```typescript
// Salvar dados
this.safeStorage.setSessionItem("user-data", userData);

// Recuperar dados (com tipagem)
const userData = this.safeStorage.getSessionItem<User>("user-data");

// Remover dados
this.safeStorage.removeSessionItem("user-data");

// Limpar tudo
this.safeStorage.clearSession();
```

#### LocalStorage

```typescript
// Salvar dados
this.safeStorage.setLocalItem("settings", settings);

// Recuperar dados (com tipagem)
const settings = this.safeStorage.getLocalItem<Settings>("settings");

// Remover dados
this.safeStorage.removeLocalItem("settings");

// Limpar tudo
this.safeStorage.clearLocal();
```

#### Métodos Utilitários

```typescript
// Serialização segura
const jsonString = this.safeStorage.safeStringify(data);

// Parse seguro
const data = this.safeStorage.safeParse(jsonString);
```

## Exemplos de Uso

### Salvando Dados de Usuário com Acentos

```typescript
const userData = {
  name: "João Silva",
  city: "São Paulo",
  email: "joao@exemplo.com",
};

// Salva com correção automática de codificação
this.safeStorage.setSessionItem("current-user", userData);

// Recupera com dados corretos
const user = this.safeStorage.getSessionItem<UserData>("current-user");
console.log(user.name); // Output: "João Silva" (correto)
```

### Tratamento de Dados Corrompidos Existentes

O serviço automaticamente detecta e corrige dados corrompidos durante a inicialização:

```typescript
// Dados corrompidos existentes no storage:
// sessionStorage: {"name": "JoÃ£o Silva"}

// Após inicialização do serviço:
const userData = this.safeStorage.getSessionItem("user-data");
console.log(userData.name); // Output: "João Silva" (corrigido)
```

## Integração com AuthService

O `AuthService` foi refatorado para usar o `SafeStorageService`:

```typescript
// Antes
sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));

// Depois
this.safeStorage.setSessionItem(this.USER_KEY, userData);
```

## Benefícios

1. **Correção Automática**: Problemas de codificação são corrigidos automaticamente
2. **Robustez**: Tratamento de erros previne crashes da aplicação
3. **Reutilização**: Pode ser usado em qualquer serviço que precise de storage
4. **Manutenibilidade**: Centraliza a lógica de storage em um local
5. **Tipagem**: Suporte completo ao TypeScript com generics

## Testes

O serviço inclui testes unitários abrangentes que cobrem:

- Serialização e deserialização segura
- Correção de codificação de caracteres
- Operações de storage (get, set, remove, clear)
- Tratamento de erros

Execute os testes com:

```bash
npm test -- --grep SafeStorageService
```

## Compatibilidade

- Angular 15+
- Navegadores modernos com suporte a `TextDecoder`
- Suporte completo a caracteres UTF-8 e acentuação
