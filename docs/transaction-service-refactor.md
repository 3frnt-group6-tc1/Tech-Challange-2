# Transaction Service Refactoring

## Overview

The `TransactionService` has been refactored to extract the `getAccountId()` method and make the account ID a parameter that's passed from controllers/components. This provides better separation of concerns and makes the service more testable and flexible.

## Changes Made

### 1. TransactionService Changes

- **Removed**: `getAccountId()` private method
- **Updated**: All methods now require `accountId` as a parameter
- **Simplified**: Removed complex Observable chains for account ID resolution

#### Method Signature Changes:

```typescript
// Before
create(transaction: Transaction): Observable<Transaction>
getAll(): Observable<Transaction[]>
getByUserId(userId: string, types?: TransactionType[]): Observable<Transaction[]>
// ... etc

// After
create(transaction: Transaction, accountId: string): Observable<Transaction>
getAll(accountId: string): Observable<Transaction[]>
getByUserId(userId: string, accountId: string, types?: TransactionType[]): Observable<Transaction[]>
// ... etc
```

### 2. New TransactionControllerService

Created `TransactionControllerService` that:

- Handles account ID resolution (moved from TransactionService)
- Provides the same API as the original TransactionService
- Acts as a wrapper around the refactored TransactionService
- Maintains backward compatibility for existing components

## Usage

### For New Code (Recommended)

Use `TransactionControllerService` which handles account ID resolution automatically:

```typescript
constructor(private transactionController: TransactionControllerService) {}

// Same API as before
this.transactionController.create(transaction).subscribe(...)
this.transactionController.getAll().subscribe(...)
```

### For Direct Service Usage

If you need to use `TransactionService` directly (e.g., for testing or when you already have the accountId):

```typescript
constructor(
  private transactionService: TransactionService,
  private authService: AuthService
) {}

// Get account ID and pass it explicitly
const accountId = this.authService.getPrimaryAccountId();
this.transactionService.create(transaction, accountId).subscribe(...)
```

## Migration Guide

### Option 1: Use TransactionControllerService

Replace `TransactionService` with `TransactionControllerService` in your components:

```typescript
// Before
constructor(private transactionService: TransactionService) {}

// After
constructor(private transactionController: TransactionControllerService) {}
```

### Option 2: Update Existing Code

If you prefer to keep using `TransactionService` directly, update your calls to include `accountId`:

```typescript
// You'll need to handle account ID resolution in your component
private getAccountIdAndExecute<T>(
  operation: (accountId: string) => Observable<T>
): Observable<T> {
  const accountId = this.authService.getPrimaryAccountId();
  if (accountId) {
    return operation(accountId);
  }
  // Handle case where account ID is not available
  return throwError('Account ID not found');
}

// Usage
this.getAccountIdAndExecute(accountId =>
  this.transactionService.create(transaction, accountId)
).subscribe(...)
```

## Benefits

1. **Separation of Concerns**: Account ID resolution is separated from transaction operations
2. **Testability**: Easier to test transaction operations with known account IDs
3. **Flexibility**: Can work with different account IDs without changing the service
4. **Performance**: Eliminates redundant account ID lookups when processing multiple transactions
5. **Clearer Dependencies**: Makes it explicit which operations require account context

## Files Modified

- `src/app/shared/services/Transaction/transaction-service.ts` - Refactored to accept accountId parameters
- `src/app/shared/services/Transaction/transaction-controller.service.ts` - New controller service

## Next Steps

Components using `TransactionService` should be updated to either:

1. Use `TransactionControllerService` for automatic account ID handling
2. Handle account ID resolution themselves when using `TransactionService` directly

The choice depends on your specific use case and whether you need the flexibility of explicit account ID management.
