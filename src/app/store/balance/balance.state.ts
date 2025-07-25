export interface BalanceState {
  balance: number | null;
  accountType: string;
  isLoading: boolean;
  showBalance: boolean;
  error: string | null;
}

export const initialBalanceState: BalanceState = {
  balance: 0,
  accountType: 'Conta Corrente',
  isLoading: false,
  showBalance: true,
  error: null
};
