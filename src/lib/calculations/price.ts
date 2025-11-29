import { InstallmentRow, SimulationResult } from '@/types/simulation';

interface CalculationInput {
  principal: number;
  monthlyInterestRate: number;
  durationMonths: number;
  extraAmortizations: Record<number, number>;
}

/**
 * PRICE System (French Amortization - Fixed Installments)
 *
 * Formula: PMT = P * [i(1+i)^n] / [(1+i)^n - 1]
 * Where:
 *   P = Principal
 *   i = Monthly interest rate (decimal)
 *   n = Number of months
 *
 * Characteristics:
 * - Fixed monthly payment (without extra amortizations)
 * - Interest portion decreases over time
 * - Amortization portion increases over time
 */
export function calculatePriceInstallments(
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

  // Calculate fixed installment value (PMT)
  let pmt: number;
  if (i === 0) {
    // No interest case
    pmt = principal / n;
  } else {
    const factor = Math.pow(1 + i, n);
    pmt = principal * ((i * factor) / (factor - 1));
  }

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

    // Calculate base installment
    let baseInstallment = pmt;

    // If remaining balance + interest is less than PMT, adjust
    if (balance + interestPortion < pmt) {
      baseInstallment = balance + interestPortion;
    }

    // Calculate base amortization (what goes to principal from base installment)
    const baseAmortization = baseInstallment - interestPortion;

    // Total amortization includes extra
    const totalAmortization = Math.min(
      baseAmortization + extraAmort,
      balance
    );

    // Calculate actual extra paid (might be less than requested in final month)
    const actualExtraPaid = totalAmortization - baseAmortization;

    // Update balance with total amortization
    balance = Math.max(0, balance - totalAmortization);

    // Total payment for this month (base + actual extra)
    const totalPayment = baseInstallment + actualExtraPaid;

    // Track totals
    totalCost += totalPayment;
    totalInterest += interestPortion;

    rows.push({
      month,
      installmentValue: roundToTwo(baseInstallment),
      interestPortion: roundToTwo(interestPortion),
      amortizationPortion: roundToTwo(baseAmortization),
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
