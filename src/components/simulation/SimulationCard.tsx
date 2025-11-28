'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeSimulation } from '@/store/slices/simulationsSlice';
import { SimulationForm } from './SimulationForm';
import { SimulationSummary } from './SimulationSummary';
import { SimulationTable } from './SimulationTable';
import { calculateInstallments } from '@/lib/calculations';
import { Simulation } from '@/types/simulation';

interface SimulationCardProps {
  simulationId: string;
}

export function SimulationCard({ simulationId }: SimulationCardProps) {
  const t = useTranslations('simulation');
  const dispatch = useAppDispatch();

  const simulation = useAppSelector((state) =>
    state.simulations.simulations.find((s) => s.id === simulationId)
  );

  const simulationsCount = useAppSelector(
    (state) => state.simulations.simulations.length
  );

  const currency = useAppSelector((state) => state.simulations.currency);

  const result = useMemo(() => {
    if (!simulation) {
      return { rows: [], totalCost: 0, totalInterest: 0, monthsToPayoff: 0 };
    }
    return calculateInstallments(simulation);
  }, [simulation]);

  if (!simulation) {
    return null;
  }

  const handleClose = () => {
    dispatch(removeSimulation(simulationId));
  };

  const canClose = simulationsCount > 1;

  return (
    <Card className="min-w-[480px] flex-shrink-0 border-border/40 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {simulation.financingType}
        </span>
        {canClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('close')}</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <SimulationForm simulation={simulation} />
        <SimulationSummary result={result} currency={currency} />
        <SimulationTable
          simulationId={simulation.id}
          rows={result.rows}
          currency={currency}
          extraAmortizations={simulation.extraAmortizations}
        />
      </CardContent>
    </Card>
  );
}
