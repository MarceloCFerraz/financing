import { Simulation, SimulationResult, FinancingType } from '@/types/simulation';
import { calculatePriceInstallments } from './price';
import { calculateSacInstallments } from './sac';

/**
 * Calculate financing installments based on the financing type
 */
export function calculateInstallments(simulation: Simulation): SimulationResult {
  const input = {
    principal: simulation.principal,
    monthlyInterestRate: simulation.monthlyInterestRate,
    durationMonths: simulation.durationMonths,
    extraAmortizations: simulation.extraAmortizations,
  };

  switch (simulation.financingType) {
    case 'PRICE':
      return calculatePriceInstallments(input);
    case 'SAC':
      return calculateSacInstallments(input);
    default:
      return {
        rows: [],
        totalCost: 0,
        totalInterest: 0,
        monthsToPayoff: 0,
      };
  }
}

export { calculatePriceInstallments } from './price';
export { calculateSacInstallments } from './sac';
