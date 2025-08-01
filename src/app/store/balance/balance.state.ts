export interface BalanceState {
  balance: number;
  formattedBalance: string;
  showBalance: boolean;
  accountType: string;
  isLoading: boolean;
  error: string | null;
}

export const initialState: BalanceState = {
  balance: 0,
  formattedBalance: 'R$ 0,00',
  showBalance: true,
  accountType: 'Conta Corrente',
  isLoading: false,
  error: null
}; 