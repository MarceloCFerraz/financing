'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addSimulation } from '@/store/slices/simulationsSlice';

export function AddSimulationButton() {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const { simulations, maxSimulations } = useAppSelector(
    (state) => state.simulations
  );

  const canAddMore = simulations.length < maxSimulations;

  const handleClick = () => {
    if (canAddMore) {
      dispatch(addSimulation());
    }
  };

  if (!canAddMore) {
    return null;
  }

  return (
    <Button
      className="h-14 w-14 flex-shrink-0 rounded-full border border-border/90 bg-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted/30 hover:text-foreground flex items-center justify-center"
      onClick={handleClick}
      title={t('simulation.addNew')}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
