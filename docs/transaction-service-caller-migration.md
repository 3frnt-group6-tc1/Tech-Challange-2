# Migration Guide: TransactionService Callers

## Changes Required

### Components That Need Updates

#### 1. ✅ UPDATED: TransactionFormComponent

**File**: `src/app/shared/components/transaction-form/transaction-form.component.ts`

**Changes Made**:

- Updated `create()` call to include `accountId` parameter
- Added error handling for missing account ID

**Before**:

```typescript
this.transactionService.create(transaction).subscribe({
```

**After**:

```typescript
const accountId = this.authService.getPrimaryAccountId();
if (!accountId) {
  this.submitStatus = {
    success: false,
    message: 'Erro: ID da conta não encontrado.',
  };
  return;
}

this.transactionService.create(transaction, accountId).subscribe({
```

#### 2. ✅ UPDATED: StatementComponent

**File**: `src/app/shared/components/statement/statement.component.ts`

**Changes Made**:

- Updated `update()` call to include `accountId` parameter
- Added error handling for missing account ID

**Before**:

```typescript
this.transactionService.update(updated.id, updated).subscribe({
```

**After**:

```typescript
const accountId = this.authService.getPrimaryAccountId();
if (!accountId) {
  console.error('Account ID not found');
  return;
}

this.transactionService.update(updated.id, updated, accountId).subscribe({
```

#### 3. ✅ UPDATED: Mock Services in Stories

**Files**:

- `src/app/shared/components/transaction-form/transaction-form.stories.ts`
- `src/app/shared/components/statement/statement.stories.ts`

**Changes Made**:

- Updated mock service signatures to match new API
- Added `accountId` parameters to mock methods

### Components That Don't Need Updates

#### DashboardComponent

**File**: `src/app/shared/components/dashboard/dashboard.component.ts`

**Status**: ✅ No changes needed
**Reason**: Uses `AccountService.getByUserId()` instead of `TransactionService` methods

## Alternative Approach: Use TransactionControllerService

### Recommended for New Development

Instead of updating all existing callers, components can use the new `TransactionControllerService` which provides the same API as the original `TransactionService` but handles account ID resolution automatically.

**Example Migration**:

```typescript
// Before
constructor(private transactionService: TransactionService) {}

// After
constructor(private transactionController: TransactionControllerService) {}

// Usage remains the same
this.transactionController.create(transaction).subscribe({...});
this.transactionController.update(transactionId, transaction).subscribe({...});
```

## Method Signature Changes

### TransactionService Methods (Updated)

```typescript
// All methods that require account context now need accountId parameter:

create(transaction: Transaction, accountId: string): Observable<Transaction>
update(transactionId: string, transaction: Transaction, accountId: string): Observable<Transaction>
getAll(accountId: string): Observable<Transaction[]>
getByUserId(userId: string, accountId: string, types?: TransactionType[]): Observable<Transaction[]>
getByUserIdWithFilters(userId: string, accountId: string, filters: {...}): Observable<Transaction[]>
getCreditsByUserId(userId: string, accountId: string): Observable<Transaction[]>
getDebitsByUserId(userId: string, accountId: string): Observable<Transaction[]>
getUserBalance(userId: string, accountId: string): Observable<Balance>

// Methods that don't require account context remain unchanged:
read(transactionId: string): Observable<Transaction>
delete(transactionId: string): Observable<void>
getById(transactionId: string): Observable<Transaction>
```

### TransactionControllerService Methods (New - Recommended)

```typescript
// Same API as original TransactionService but with automatic account ID resolution:

create(transaction: Transaction): Observable<Transaction>
update(transactionId: string, transaction: Transaction): Observable<Transaction>
getAll(): Observable<Transaction[]>
getByUserId(userId: string, types?: TransactionType[]): Observable<Transaction[]>
getByUserIdWithFilters(userId: string, filters: {...}): Observable<Transaction[]>
getCreditsByUserId(userId: string): Observable<Transaction[]>
getDebitsByUserId(userId: string): Observable<Transaction[]>
getUserBalance(userId: string): Observable<Balance>

// Pass-through methods (no change):
read(transactionId: string): Observable<Transaction>
delete(transactionId: string): Observable<void>
getById(transactionId: string): Observable<Transaction>
```

## Migration Strategy

### Option 1: Update Existing Components (Current Approach)

✅ **Pros**: Direct control over account ID handling
❌ **Cons**: Requires updating many files

### Option 2: Use TransactionControllerService (Recommended)

✅ **Pros**: Minimal code changes, automatic account ID handling
✅ **Pros**: Maintains backward compatibility
❌ **Cons**: Adds another layer of abstraction

## Files Status

### ✅ Completed

- `TransactionService` - Refactored with accountId parameters
- `TransactionControllerService` - Created with automatic account ID resolution
- `TransactionFormComponent` - Updated to pass accountId
- `StatementComponent` - Updated to pass accountId
- Story files - Updated mock services

### 📋 Optional (Depending on Strategy)

- Test files - Need comprehensive update (complex due to model changes)
- Other components using TransactionService - Can use TransactionControllerService instead

## Recommendation

For future development and existing components, use `TransactionControllerService` to maintain clean, simple code while benefiting from the improved architecture of the refactored `TransactionService`.
