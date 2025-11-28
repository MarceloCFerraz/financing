'use client';

import { useTranslations } from 'next-intl';
import { SimulationResult, CurrencyCode } from '@/types/simulation';
import { formatCurrency } from '@/lib/formatters/currency';

interface SimulationSummaryProps {
  result: SimulationResult;
  currency: CurrencyCode;
}

export function SimulationSummary({ result, currency }: SimulationSummaryProps) {
  const t = useTranslations('summary');

  return (
    <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
      <div className="text-center">
        <p className="text-xs text-muted-foreground">{t('totalCost')}</p>
        <p className="text-sm font-semibold">
          {formatCurrency(result.totalCost, currency)}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">{t('totalInterest')}</p>
        <p className="text-sm font-semibold">
          {formatCurrency(result.totalInterest, currency)}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">{t('monthsToPayoff')}</p>
        <p className="text-sm font-semibold">{result.monthsToPayoff}</p>
      </div>
    </div>
  );
}
