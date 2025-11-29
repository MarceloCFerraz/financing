import { InvestmentMonthRow, InvestmentScenarioResult, InvestmentComparisonInput } from '@/types/investment';
import { calculatePriceInstallments } from './price';
import { calculateSacInstallments } from './sac';

function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Convert annual investment rate to monthly rate
 * Formula: monthlyRate = (1 + annualRate)^(1/12) - 1
 */
export function annualToMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

/**
 * Scenario 1: Pay Fast, Then Invest
 * - Phase 1: Pay debt with extras until payoff
 * - Phase 2: Invest FULL maxMonthlyPayment until original duration ends
 */
export function calculatePayFastThenInvest(
  input: InvestmentComparisonInput
): InvestmentScenarioResult {
  const {
    principal,
    monthlyInterestRate,
    durationMonths,
    financingType,
    annualInvestmentRate,
    maxMonthlyPayment,
  } = input;

  // Recalculate installments to get base values
  const baseCalculation = {
    principal,
    monthlyInterestRate,
    durationMonths,
    extraAmortizations: {}, // Start with no extras
  };

  const baseResult =
    financingType === 'PRICE'
      ? calculatePriceInstallments(baseCalculation)
      : calculateSacInstallments(baseCalculation);

  const monthlyInvestmentRate = annualToMonthlyRate(annualInvestmentRate);
  const rows: InvestmentMonthRow[] = [];
  let investmentBalance = 0;
  let totalDebtPaid = 0;
  let totalInvested = 0;

  // Phase 1: Pay debt with extras calculated from maxMonthlyPayment
  // Build extras map based on the max payment
  const calculatedExtras: Record<number, number> = {};
  baseResult.rows.forEach((row) => {
    const extra = maxMonthlyPayment - row.installmentValue;
    if (extra > 0.01) {
      calculatedExtras[row.month] = roundToTwo(extra);
    }
  });

  // Recalculate with the extras
  const withExtrasCalculation = {
    principal,
    monthlyInterestRate,
    durationMonths,
    extraAmortizations: calculatedExtras,
  };

  const withExtrasResult =
    financingType === 'PRICE'
      ? calculatePriceInstallments(withExtrasCalculation)
      : calculateSacInstallments(withExtrasCalculation);

  // Phase 1: Pay debt with extras, invest any unused amount
  for (let i = 0; i < withExtrasResult.rows.length; i++) {
    const row = withExtrasResult.rows[i];
    totalDebtPaid += row.totalPayment;

    // Invest any unused amount from max payment
    const unusedAmount = maxMonthlyPayment - row.totalPayment;
    const investmentContribution = Math.max(0, unusedAmount);

    // Grow investment
    investmentBalance = investmentBalance * (1 + monthlyInvestmentRate) + investmentContribution;
    totalInvested += investmentContribution;

    rows.push({
      month: row.month,
      installmentValue: row.installmentValue,
      extra: row.extraAmortization,
      debtBalance: row.remainingBalance,
      investmentBalance: roundToTwo(investmentBalance),
    });
  }

  const monthsToPayoff = withExtrasResult.monthsToPayoff;

  // Phase 2: Invest full maxMonthlyPayment after debt payoff
  for (let month = monthsToPayoff + 1; month <= durationMonths; month++) {
    // Grow investment with previous balance
    investmentBalance = investmentBalance * (1 + monthlyInvestmentRate) + maxMonthlyPayment;
    totalInvested += maxMonthlyPayment;

    rows.push({
      month,
      installmentValue: 0,
      extra: 0,
      debtBalance: 0,
      investmentBalance: roundToTwo(investmentBalance),
    });
  }

  return {
    rows,
    totalDebtPaid: roundToTwo(totalDebtPaid),
    totalInvested: roundToTwo(totalInvested),
    finalInvestmentBalance: roundToTwo(investmentBalance),
    monthsToPayoff,
  };
}

/**
 * Scenario 2: Invest the Difference
 * - Pay only minimum installments (no extras)
 * - Invest (maxMonthlyPayment - installmentValue) each month
 * - Continue until original duration
 */
export function calculateInvestDifference(
  input: InvestmentComparisonInput
): InvestmentScenarioResult {
  const {
    principal,
    monthlyInterestRate,
    durationMonths,
    financingType,
    annualInvestmentRate,
    maxMonthlyPayment,
  } = input;

  // Recalculate installments WITHOUT extras
  const calculationInput = {
    principal,
    monthlyInterestRate,
    durationMonths,
    extraAmortizations: {}, // No extras
  };

  const baseResult =
    financingType === 'PRICE'
      ? calculatePriceInstallments(calculationInput)
      : calculateSacInstallments(calculationInput);

  const monthlyInvestmentRate = annualToMonthlyRate(annualInvestmentRate);
  const rows: InvestmentMonthRow[] = [];
  let investmentBalance = 0;
  let totalDebtPaid = 0;
  let totalInvested = 0;

  // Each month: pay minimum, invest the difference
  for (let i = 0; i < baseResult.rows.length; i++) {
    const row = baseResult.rows[i];
    const investmentContribution = maxMonthlyPayment - row.installmentValue;

    // Grow investment
    investmentBalance = investmentBalance * (1 + monthlyInvestmentRate) + Math.max(0, investmentContribution);
    totalInvested += Math.max(0, investmentContribution);
    totalDebtPaid += row.installmentValue;

    rows.push({
      month: row.month,
      installmentValue: row.installmentValue,
      extra: 0,
      debtBalance: row.remainingBalance,
      investmentBalance: roundToTwo(investmentBalance),
    });
  }

  return {
    rows,
    totalDebtPaid: roundToTwo(totalDebtPaid),
    totalInvested: roundToTwo(totalInvested),
    finalInvestmentBalance: roundToTwo(investmentBalance),
    monthsToPayoff: durationMonths,
  };
}

/**
 * Scenario 3: Balanced Approach (Pay Extra + Invest)
 * - Split available amount 50/50 between extra payment and investment
 * - Pay debt faster while building investment
 * - After debt payoff, invest full maxMonthlyPayment
 */
export function calculateBalancedApproach(
  input: InvestmentComparisonInput
): InvestmentScenarioResult {
  const {
    principal,
    monthlyInterestRate,
    durationMonths,
    financingType,
    annualInvestmentRate,
    maxMonthlyPayment,
  } = input;

  // Calculate base installments without extras
  const baseCalculation = {
    principal,
    monthlyInterestRate,
    durationMonths,
    extraAmortizations: {},
  };

  const baseResult =
    financingType === 'PRICE'
      ? calculatePriceInstallments(baseCalculation)
      : calculateSacInstallments(baseCalculation);

  const monthlyInvestmentRate = annualToMonthlyRate(annualInvestmentRate);

  // Build extras map: split available amount 50/50
  const calculatedExtras: Record<number, number> = {};
  baseResult.rows.forEach((row) => {
    const availableAmount = maxMonthlyPayment - row.installmentValue;
    if (availableAmount > 0.01) {
      // Split 50/50: half for extra payment, half for investment
      const extraPayment = availableAmount / 2;
      calculatedExtras[row.month] = roundToTwo(extraPayment);
    }
  });

  // Recalculate with extras
  const withExtrasCalculation = {
    principal,
    monthlyInterestRate,
    durationMonths,
    extraAmortizations: calculatedExtras,
  };

  const withExtrasResult =
    financingType === 'PRICE'
      ? calculatePriceInstallments(withExtrasCalculation)
      : calculateSacInstallments(withExtrasCalculation);

  const rows: InvestmentMonthRow[] = [];
  let investmentBalance = 0;
  let totalDebtPaid = 0;
  let totalInvested = 0;

  // Phase 1: Pay debt with extras AND invest
  for (let i = 0; i < withExtrasResult.rows.length; i++) {
    const row = withExtrasResult.rows[i];
    const availableAmount = maxMonthlyPayment - row.installmentValue;

    // Investment gets what's left after paying extra
    // If extra couldn't fully use its 50% (due to low debt), investment gets the remainder
    const investmentContribution = availableAmount - row.extraAmortization;

    // Grow investment
    investmentBalance = investmentBalance * (1 + monthlyInvestmentRate) + investmentContribution;
    totalInvested += investmentContribution;
    totalDebtPaid += row.totalPayment;

    rows.push({
      month: row.month,
      installmentValue: row.installmentValue,
      extra: row.extraAmortization,
      debtBalance: row.remainingBalance,
      investmentBalance: roundToTwo(investmentBalance),
    });
  }

  const monthsToPayoff = withExtrasResult.monthsToPayoff;

  // Phase 2: Debt paid off, invest full maxMonthlyPayment
  for (let month = monthsToPayoff + 1; month <= durationMonths; month++) {
    investmentBalance = investmentBalance * (1 + monthlyInvestmentRate) + maxMonthlyPayment;
    totalInvested += maxMonthlyPayment;

    rows.push({
      month,
      installmentValue: 0,
      extra: 0,
      debtBalance: 0,
      investmentBalance: roundToTwo(investmentBalance),
    });
  }

  return {
    rows,
    totalDebtPaid: roundToTwo(totalDebtPaid),
    totalInvested: roundToTwo(totalInvested),
    finalInvestmentBalance: roundToTwo(investmentBalance),
    monthsToPayoff,
  };
}
