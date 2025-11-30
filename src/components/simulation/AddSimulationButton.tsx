"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addSimulation } from "@/store/slices/simulationsSlice";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function AddSimulationButton() {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const { simulations, maxSimulations } = useAppSelector((state) => state.simulations);

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
    <div className="flex justify-center sm:justify-start w-full sm:w-auto">
      <Button
        className="rounded shrink-0 border border-border bg-transparent text-muted-foreground transition-colors hover:bg-foreground/10 hover:border-border hover:text-foreground flex items-center justify-center"
        onClick={handleClick}
        title={t("simulation.addNew")}
      >
        <Plus className="h-6 w-6" />
        <span>{t("simulation.addNew")}</span>
      </Button>
    </div>
  );
}
