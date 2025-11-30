'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppDispatch } from '@/store/hooks';
import { setExtraAmortization, clearExtraAmortizations } from '@/store/slices/simulationsSlice';
import { InstallmentRow, CurrencyCode } from '@/types/simulation';
import { formatCurrency } from '@/lib/formatters/currency';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SimulationTableProps {
  simulationId: string;
  rows: InstallmentRow[];
  currency: CurrencyCode;
  extraAmortizations: Record<number, number>;
}

export function SimulationTable({
  simulationId,
  rows,
  currency,
  extraAmortizations,
}: SimulationTableProps) {
  const t = useTranslations('table');
  const dispatch = useAppDispatch();
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  const handleExtraAmortizationFocus = (month: number) => {
    setEditingMonth(month);
    setInputValue(
      extraAmortizations[month] ? extraAmortizations[month].toString() : ''
    );
  };

  const handleExtraAmortizationBlur = useCallback(
    (month: number) => {
      const value = parseFloat(inputValue) || 0;
      dispatch(
        setExtraAmortization({
          id: simulationId,
          month,
          amount: value,
        })
      );
      setEditingMonth(null);
      setInputValue('');
    },
    [dispatch, simulationId, inputValue]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, month: number) => {
    if (e.key === 'Enter') {
      handleExtraAmortizationBlur(month);
    }
  };

  const handleClearExtras = () => {
    dispatch(clearExtraAmortizations(simulationId));
  };

  const hasExtras = Object.keys(extraAmortizations).length > 0;

  return (
    <div className="space-y-2">
      {hasExtras && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearExtras}
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="mr-1 h-3 w-3" />
            {t('clearExtras')}
          </Button>
        </div>
      )}
      <div className="rounded-md border border-border/40 overflow-x-auto">
      <div className="max-h-[300px] overflow-y-auto">
        <Table className="w-full min-w-[640px]">
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-8 text-center">{t('installment')}</TableHead>
              <TableHead className="text-right">{t('value')}</TableHead>
              <TableHead className="text-right">{t('interest')}</TableHead>
              <TableHead className="text-right">{t('amortization')}</TableHead>
              <TableHead className="text-right">{t('balance')}</TableHead>
              <TableHead className="w-28 text-center">{t('extra')}</TableHead>
              <TableHead className="text-right">{t('monthlyTotal')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.month}>
                <TableCell className="text-center font-medium">
                  {row.month}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatCurrency(row.installmentValue, currency)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatCurrency(row.interestPortion, currency)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatCurrency(row.amortizationPortion, currency)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatCurrency(row.remainingBalance, currency)}
                </TableCell>
                <TableCell className="text-center">
                  {editingMonth === row.month ? (
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      className="h-7 w-24 text-center text-xs"
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={() => handleExtraAmortizationBlur(row.month)}
                      onKeyDown={(e) => handleKeyDown(e, row.month)}
                      autoFocus
                    />
                  ) : (
                    <button
                      className="h-7 w-24 rounded border border-transparent px-1 text-xs hover:border-input focus:border-input"
                      onClick={() => handleExtraAmortizationFocus(row.month)}
                    >
                      {extraAmortizations[row.month]
                        ? formatCurrency(extraAmortizations[row.month], currency)
                        : '-'}
                    </button>
                  )}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap font-medium">
                  {formatCurrency(row.totalPayment, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </div>
    </div>
  );
}
