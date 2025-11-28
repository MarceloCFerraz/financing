export type FinancingType = 'PRICE' | 'SAC';
export type CurrencyCode = 'BRL' | 'USD';

export interface Simulation {
  id: string;
  financingType: FinancingType;
  principal: number;
  monthlyInterestRate: number; // decimal, e.g., 0.01 for 1%
  durationMonths: number;
  extraAmortizations: Record<number, number>; // {month: amount}
  payFasterEnabled: boolean; // Whether pay-faster mode is active
  maxMonthlyPayment: number; // Maximum monthly payment amount
  createdAt: number;
}

export interface InstallmentRow {
  month: number;
  installmentValue: number; // Base installment (without extra)
  interestPortion: number;
  amortizationPortion: number; // Base amortization (without extra)
  remainingBalance: number;
  extraAmortization: number;
  totalPayment: number; // installmentValue + extraAmortization
}

export interface SimulationResult {
  rows: InstallmentRow[];
  totalCost: number;
  totalInterest: number;
  monthsToPayoff: number;
}
