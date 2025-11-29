import { FinancingType, InstallmentRow } from './simulation';

export interface InvestmentMonthRow {
  month: number;
  installmentValue: number;
  extra: number;
  debtBalance: number;
  investmentBalance: number;
}

export interface InvestmentScenarioResult {
  rows: InvestmentMonthRow[];
  totalDebtPaid: number;
  totalInvested: number;
  finalInvestmentBalance: number;
  monthsToPayoff: number;
}

export interface InvestmentComparisonInput {
  principal: number;
  monthlyInterestRate: number;
  durationMonths: number;
  financingType: FinancingType;
  annualInvestmentRate: number;
  maxMonthlyPayment: number;
  installmentRowsWithExtras: InstallmentRow[];
  monthsToPayoffWithExtra: number;
}
