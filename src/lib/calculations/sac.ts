import { InstallmentRow, SimulationResult } from '@/types/simulation';

interface CalculationInput {
  principal: number;
  monthlyInterestRate: number;
  durationMonths: number;
  extraAmortizations: Record<number, number>;
}

/**
 * SAC System (Constant Amortization System)
 *
 * Formula:
 *   Amortization = P / n (constant)
 *   Interest = Remaining Balance * i
 *   Installment = Amortization + Interest (decreases over time)
 *
 * Characteristics:
 * - Constant amortization portion
 * - Interest portion decreases over time
 * - Total installment decreases over time
 */
export function calculateSacInstallments(
  input: CalculationInput
): SimulationResult {
  const {
    principal,
    monthlyInterestRate: i,
    durationMonths: n,
    extraAmortizations,
  } = input;

  // Handle edge cases
  if (principal <= 0 || i < 0 || n <= 0) {
    return {
      rows: [],
      totalCost: 0,
      totalInterest: 0,
      monthsToPayoff: 0,
    };
  }

  // Calculate base amortization (constant)
  const baseAmortization = principal / n;

  const rows: InstallmentRow[] = [];
  let balance = principal;
  let totalCost = 0;
  let totalInterest = 0;
  let month = 1;

  // Calculate until balance is paid off or we reach a reasonable limit
  const maxMonths = n * 2; // Safety limit

  while (balance > 0.01 && month <= maxMonths) {
    const interestPortion = balance * i;
    const extraAmort = extraAmortizations[month] || 0;

    // Calculate base amortization (constant)
    const baseAmort = Math.min(baseAmortization, balance);

    // Total amortization includes extra
    const totalAmortization = Math.min(
      baseAmort + extraAmort,
      balance
    );

    // Calculate actual extra paid (might be less than requested in final month)
    const actualExtraPaid = totalAmortization - baseAmort;

    // Update balance with total amortization
    balance = Math.max(0, balance - totalAmortization);

    // Base installment (without extra)
    const baseInstallment = interestPortion + baseAmort;

    // Total payment for this month (base + actual extra)
    const totalPayment = baseInstallment + actualExtraPaid;

    // Track totals
    totalCost += totalPayment;
    totalInterest += interestPortion;

    rows.push({
      month,
      installmentValue: roundToTwo(baseInstallment),
      interestPortion: roundToTwo(interestPortion),
      amortizationPortion: roundToTwo(baseAmort),
      remainingBalance: roundToTwo(balance),
      extraAmortization: roundToTwo(actualExtraPaid),
      totalPayment: roundToTwo(totalPayment),
    });

    month++;
  }

  return {
    rows,
    totalCost: roundToTwo(totalCost),
    totalInterest: roundToTwo(totalInterest),
    monthsToPayoff: rows.length,
  };
}

function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}
