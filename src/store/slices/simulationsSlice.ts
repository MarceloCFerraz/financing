import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { Simulation, FinancingType, CurrencyCode } from '@/types/simulation';

const MAX_SIMULATIONS = 10;

function createDefaultSimulation(): Simulation {
  return {
    id: uuidv4(),
    financingType: 'PRICE',
    principal: 100000,
    monthlyInterestRate: 0.01, // 1%
    durationMonths: 120, // 10 years
    extraAmortizations: {},
    payFasterEnabled: false,
    maxMonthlyPayment: 0,
    createdAt: Date.now(),
  };
}

interface SimulationsState {
  simulations: Simulation[];
  maxSimulations: number;
  currency: CurrencyCode;
}

const initialState: SimulationsState = {
  simulations: [createDefaultSimulation()],
  maxSimulations: MAX_SIMULATIONS,
  currency: 'BRL',
};

const simulationsSlice = createSlice({
  name: 'simulations',
  initialState,
  reducers: {
    addSimulation: (state) => {
      if (state.simulations.length < state.maxSimulations) {
        state.simulations.push(createDefaultSimulation());
      }
    },
    removeSimulation: (state, action: PayloadAction<string>) => {
      state.simulations = state.simulations.filter(
        (sim) => sim.id !== action.payload
      );
      // Ensure at least one simulation exists
      if (state.simulations.length === 0) {
        state.simulations.push(createDefaultSimulation());
      }
    },
    updateSimulation: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Omit<Simulation, 'id' | 'createdAt'>>;
      }>
    ) => {
      const { id, updates } = action.payload;
      const index = state.simulations.findIndex((sim) => sim.id === id);
      if (index !== -1) {
        state.simulations[index] = {
          ...state.simulations[index],
          ...updates,
        };
      }
    },
    setFinancingType: (
      state,
      action: PayloadAction<{ id: string; financingType: FinancingType }>
    ) => {
      const { id, financingType } = action.payload;
      const sim = state.simulations.find((s) => s.id === id);
      if (sim) {
        sim.financingType = financingType;
      }
    },
    setPrincipal: (
      state,
      action: PayloadAction<{ id: string; principal: number }>
    ) => {
      const { id, principal } = action.payload;
      const sim = state.simulations.find((s) => s.id === id);
      if (sim) {
        sim.principal = principal;
      }
    },
    setMonthlyInterestRate: (
      state,
      action: PayloadAction<{ id: string; rate: number }>
    ) => {
      const { id, rate } = action.payload;
      const sim = state.simulations.find((s) => s.id === id);
      if (sim) {
        sim.monthlyInterestRate = rate;
      }
    },
    setDurationMonths: (
      state,
      action: PayloadAction<{ id: string; duration: number }>
    ) => {
      const { id, duration } = action.payload;
      const sim = state.simulations.find((s) => s.id === id);
      if (sim) {
        sim.durationMonths = duration;
      }
    },
    setGlobalCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.currency = action.payload;
    },
    setExtraAmortization: (
      state,
      action: PayloadAction<{ id: string; month: number; amount: number }>
    ) => {
      const { id, month, amount } = action.payload;
      const sim = state.simulations.find((s) => s.id === id);
      if (sim) {
        if (amount > 0) {
          sim.extraAmortizations[month] = amount;
        } else {
          delete sim.extraAmortizations[month];
        }
      }
    },
    clearExtraAmortizations: (state, action: PayloadAction<string>) => {
      const sim = state.simulations.find((s) => s.id === action.payload);
      if (sim) {
        sim.extraAmortizations = {};
      }
    },
    resetSimulation: (state, action: PayloadAction<string>) => {
      const index = state.simulations.findIndex(
        (sim) => sim.id === action.payload
      );
      if (index !== -1) {
        const newSim = createDefaultSimulation();
        newSim.id = state.simulations[index].id;
        newSim.createdAt = state.simulations[index].createdAt;
        state.simulations[index] = newSim;
      }
    },
    setPayFasterEnabled: (
      state,
      action: PayloadAction<{ id: string; enabled: boolean }>
    ) => {
      const { id, enabled } = action.payload;
      const sim = state.simulations.find((s) => s.id === id);
      if (sim) {
        sim.payFasterEnabled = enabled;
        if (!enabled) {
          sim.maxMonthlyPayment = 0;
        }
      }
    },
    setMaxMonthlyPayment: (
      state,
      action: PayloadAction<{ id: string; amount: number }>
    ) => {
      const { id, amount } = action.payload;
      const sim = state.simulations.find((s) => s.id === id);
      if (sim) {
        sim.maxMonthlyPayment = amount;
      }
    },
    applyPayFasterCalculation: (
      state,
      action: PayloadAction<{ id: string; calculatedExtras: Record<number, number> }>
    ) => {
      const { id, calculatedExtras } = action.payload;
      const sim = state.simulations.find((s) => s.id === id);
      if (sim) {
        sim.extraAmortizations = calculatedExtras;
      }
    },
  },
});

export const {
  addSimulation,
  removeSimulation,
  updateSimulation,
  setFinancingType,
  setPrincipal,
  setMonthlyInterestRate,
  setDurationMonths,
  setGlobalCurrency,
  setExtraAmortization,
  clearExtraAmortizations,
  resetSimulation,
  setPayFasterEnabled,
  setMaxMonthlyPayment,
  applyPayFasterCalculation,
} = simulationsSlice.actions;

export default simulationsSlice.reducer;
