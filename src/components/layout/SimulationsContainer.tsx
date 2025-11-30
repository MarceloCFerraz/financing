'use client';

import { useAppSelector } from '@/store/hooks';
import { SimulationCard } from '@/components/simulation/SimulationCard';
import { AddSimulationButton } from '@/components/simulation/AddSimulationButton';

export function SimulationsContainer() {
  const simulations = useAppSelector(
    (state) => state.simulations.simulations
  );

  return (
    <div className="w-full overflow-x-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:overflow-x-auto items-stretch sm:items-center gap-4 pb-4">
        {simulations.map((simulation) => (
          <SimulationCard key={simulation.id} simulationId={simulation.id} />
        ))}
        <AddSimulationButton />
      </div>
    </div>
  );
}
