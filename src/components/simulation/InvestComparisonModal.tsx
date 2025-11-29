'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Simulation, SimulationResult, CurrencyCode } from '@/types/simulation';
import { InvestmentScenarioResult } from '@/types/investment';
import {
  calculatePayFastThenInvest,
  calculateInvestDifference,
  calculateBalancedApproach,
} from '@/lib/calculations/investment';
import { formatCurrency } from '@/lib/formatters/currency';
import { cn, pickWinner } from '@/lib/utils';

interface InvestComparisonModalProps {
  simulation: Simulation;
  simulationResult: SimulationResult;
  currency: CurrencyCode;
}

export function InvestComparisonModal({
  simulation,
  simulationResult,
  currency,
}: InvestComparisonModalProps) {
  const t = useTranslations('investComparison');

  const [isOpen, setIsOpen] = useState(false);
  const [annualRate, setAnnualRate] = useState(12);
  const [maxPayment, setMaxPayment] = useState(simulation.maxMonthlyPayment);
  const [showResults, setShowResults] = useState(false);

  // Reset max payment when modal opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setMaxPayment(simulation.maxMonthlyPayment);
      setShowResults(false);
    }
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  // Calculate all three scenarios
  const { scenario1, scenario2, scenario3 } = useMemo(() => {
    if (!showResults || maxPayment <= 0) {
      return { scenario1: null, scenario2: null, scenario3: null };
    }

    const input = {
      principal: simulation.principal,
      monthlyInterestRate: simulation.monthlyInterestRate,
      durationMonths: simulation.durationMonths,
      financingType: simulation.financingType,
      annualInvestmentRate: annualRate / 100,
      maxMonthlyPayment: maxPayment,
      installmentRowsWithExtras: simulationResult.rows,
      monthsToPayoffWithExtra: simulationResult.monthsToPayoff,
    };

    return {
      scenario1: calculatePayFastThenInvest(input),
      scenario2: calculateInvestDifference(input),
      scenario3: calculateBalancedApproach(input),
    };
  }, [showResults, simulation, simulationResult, annualRate, maxPayment]);

  // Find the winner among 3 scenarios
  const winner = pickWinner(scenario1?.finalInvestmentBalance, scenario2?.finalInvestmentBalance, scenario3?.finalInvestmentBalance);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          {t('trigger')}
        </button>
      </DialogTrigger>
      <DialogContent className="!w-[95vw] !max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="annualRate">{t('annualRate')}</Label>
              <Input
                id="annualRate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={annualRate}
                onChange={(e) => {
                  setAnnualRate(parseFloat(e.target.value) || 0);
                  setShowResults(false);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPaymentModal">{t('maxPayment')}</Label>
              <Input
                id="maxPaymentModal"
                type="number"
                min="0"
                step="100"
                value={maxPayment}
                onChange={(e) => {
                  setMaxPayment(parseFloat(e.target.value) || 0);
                  setShowResults(false);
                }}
              />
            </div>
            <Button onClick={handleCalculate}>{t('calculate')}</Button>
          </div>

          {/* Results section */}
          {showResults && scenario1 && scenario2 && scenario3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Scenario 1: Pay Fast, Then Invest */}
                <ScenarioCard
                  title={t('scenario1Title')}
                  result={scenario1}
                  currency={currency}
                  isWinner={winner === 1}
                  t={t}
                />

                {/* Scenario 2: Invest the Difference */}
                <ScenarioCard
                  title={t('scenario2Title')}
                  result={scenario2}
                  currency={currency}
                  isWinner={winner === 2}
                  t={t}
                />

                {/* Scenario 3: Balanced Approach */}
                <ScenarioCard
                  title={t('scenario3Title')}
                  result={scenario3}
                  currency={currency}
                  isWinner={winner === 3}
                  t={t}
                />
              </div>

              {/* Disclaimer section */}
              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 space-y-2">
                <h3 className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                  {t('disclaimer.title')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('disclaimer.message')}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ScenarioCardProps {
  title: string;
  result: InvestmentScenarioResult;
  currency: CurrencyCode;
  isWinner: boolean;
  t: ReturnType<typeof useTranslations<'investComparison'>>;
}

function ScenarioCard({
  title,
  result,
  currency,
  isWinner,
  t,
}: ScenarioCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 space-y-4',
        isWinner && 'border-green-500 bg-green-500/10'
      )}
    >
      {/* Header with title and winner indicator */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">{title}</h3>
        {isWinner && <Check className="h-5 w-5 text-green-500 flex-shrink-0" />}
      </div>

      {/* Summary stats - stacked vertically for clarity */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('totalAccumulated')}:</span>
          <span className="font-semibold">
            {formatCurrency(result.finalInvestmentBalance, currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('monthsToPayoff')}:</span>
          <span className="font-medium">{result.monthsToPayoff}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('totalInvested')}:</span>
          <span className="font-medium">
            {formatCurrency(result.totalInvested, currency)}
          </span>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="max-h-60 overflow-y-auto overflow-x-auto border rounded">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted">
            <tr className="border-b">
              <th className="py-2 px-2 text-left whitespace-nowrap">{t('table.month')}</th>
              <th className="py-2 px-2 text-right whitespace-nowrap">{t('table.installment')}</th>
              <th className="py-2 px-2 text-right whitespace-nowrap">{t('table.extra')}</th>
              <th className="py-2 px-2 text-right whitespace-nowrap">{t('table.debtLeft')}</th>
              <th className="py-2 px-2 text-right whitespace-nowrap">{t('table.invested')}</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.month} className="border-b border-border/50">
                <td className="py-1.5 px-2">{row.month}</td>
                <td className="py-1.5 px-2 text-right whitespace-nowrap">
                  {row.installmentValue > 0
                    ? formatCurrency(row.installmentValue, currency)
                    : '-'}
                </td>
                <td className="py-1.5 px-2 text-right whitespace-nowrap">
                  {row.extra > 0 ? formatCurrency(row.extra, currency) : '-'}
                </td>
                <td className="py-1.5 px-2 text-right whitespace-nowrap">
                  {formatCurrency(row.debtBalance, currency)}
                </td>
                <td className="py-1.5 px-2 text-right whitespace-nowrap">
                  {formatCurrency(row.investmentBalance, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
