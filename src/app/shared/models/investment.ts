export interface Investment {
  _id: string;
  type: string;
  category: string;
  value: number;
  name: string;
  accountId: {
    _id: string;
    type: string;
    accountNumber: string;
  };
  __v: number;
  createdAt: string;
  updatedAt: string;
  profit: number | null;
  profitPercentage: number;
  isMatured: boolean;
}

export interface InvestmentType {
  value: string;
  label: string;
}

export interface InvestmentCategory {
  value: string;
  label: string;
}

export interface InvestmentRiskLevel {
  value: string;
  label: string;
}

export interface InvestmentSummary {
  totalValue: number;
  totalInitialValue: number;
  totalProfit: number;
  totalProfitPercentage: number;
  totalInvestments: number;
  byCategory: any[];
}

export interface InvestmentResponse {
  message: string;
  result: {
    investments: Investment[];
    summary: InvestmentSummary;
    count: number;
  };
}

export interface InvestmentTypesResponse {
  message: string;
  result: {
    types: InvestmentType[];
    categories: InvestmentCategory[];
    subtypes: Record<string, any>;
    riskLevels: InvestmentRiskLevel[];
  };
}

export interface CreateInvestmentRequest {
  type: string; // CDB, LCI, etc.
  name: string;
  value: number;
  accountId: string;
}

export interface UpdateInvestmentRequest {
  type?: string;
  name?: string;
  value?: number;
}

export interface TransferToInvestmentRequest {
  investmentId: string;
  amount: number;
  description?: string;
}

export interface RedeemInvestmentRequest {
  investmentId: string;
  amount: number;
  redeemType: 'partial' | 'total';
  description?: string;
}

export interface InvestmentFilters {
  type?: string; // CDB, LCI, etc.
  name?: string;
  isMatured?: boolean;
}
