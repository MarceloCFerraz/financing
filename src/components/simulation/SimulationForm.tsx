'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setFinancingType,
  setPrincipal,
  setMonthlyInterestRate,
  setDurationMonths,
  setPayFasterEnabled,
  setMaxMonthlyPayment,
  applyPayFasterCalculation,
} from '@/store/slices/simulationsSlice';
import { Simulation, FinancingType } from '@/types/simulation';
import { calculateInstallments } from '@/lib/calculations';
import { formatCurrency } from '@/lib/formatters/currency';

interface SimulationFormProps {
  simulation: Simulation;
}

export function SimulationForm({ simulation }: SimulationFormProps) {
  const t = useTranslations('simulation');
  const tPayFaster = useTranslations('payFaster');
  const dispatch = useAppDispatch();
  const currency = useAppSelector((state) => state.simulations.currency);
  const [validationError, setValidationError] = useState<string>('');

  const handleFinancingTypeChange = (value: string) => {
    dispatch(
      setFinancingType({
        id: simulation.id,
        financingType: value as FinancingType,
      })
    );
  };

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    dispatch(setPrincipal({ id: simulation.id, principal: value }));
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseFloat(e.target.value) || 0;
    const decimal = percentage / 100;
    dispatch(setMonthlyInterestRate({ id: simulation.id, rate: decimal }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    dispatch(setDurationMonths({ id: simulation.id, duration: value }));
  };

  const handlePayFasterToggle = (checked: boolean) => {
    dispatch(setPayFasterEnabled({ id: simulation.id, enabled: checked }));
    if (!checked) {
      setValidationError('');
    }
  };

  const handleMaxPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    dispatch(setMaxMonthlyPayment({ id: simulation.id, amount: value }));
    setValidationError('');
  };

  const handleApplyPayFaster = () => {
    // Calculate installments to get the first installment value
    const result = calculateInstallments(simulation);

    if (result.rows.length === 0) {
      setValidationError(tPayFaster('noInstallments'));
      return;
    }

    const firstInstallment = result.rows[0].installmentValue;

    if (simulation.maxMonthlyPayment < firstInstallment) {
      setValidationError(
        tPayFaster('belowMinimum').replace(
          '{minimum}',
          formatCurrency(firstInstallment, currency)
        )
      );
      return;
    }

    // Calculate extra amortizations
    const calculatedExtras: Record<number, number> = {};
    result.rows.forEach((row) => {
      const extra = simulation.maxMonthlyPayment - row.installmentValue;
      if (extra > 0.01) {
        // Avoid tiny floating point values
        calculatedExtras[row.month] = Math.round(extra * 100) / 100;
      }
    });

    dispatch(
      applyPayFasterCalculation({ id: simulation.id, calculatedExtras })
    );
    setValidationError('');
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Financing Type */}
      <div className="space-y-2">
        <Label htmlFor={`type-${simulation.id}`}>{t('financingType')}</Label>
        <Select
          value={simulation.financingType}
          onValueChange={handleFinancingTypeChange}
        >
          <SelectTrigger id={`type-${simulation.id}`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRICE">{t('price')}</SelectItem>
            <SelectItem value="SAC">{t('sac')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Principal and Interest Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`principal-${simulation.id}`}>{t('principal')}</Label>
          <Input
            id={`principal-${simulation.id}`}
            type="number"
            min="0"
            step="1000"
            value={simulation.principal}
            onChange={handlePrincipalChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`rate-${simulation.id}`}>{t('interestRate')}</Label>
          <Input
            id={`rate-${simulation.id}`}
            type="number"
            min="0"
            step="0.01"
            value={(simulation.monthlyInterestRate * 100).toFixed(2)}
            onChange={handleInterestRateChange}
          />
        </div>
      </div>

      {/* Row 3: Duration */}
      <div className="space-y-2">
        <Label htmlFor={`duration-${simulation.id}`}>{t('duration')}</Label>
        <Input
          id={`duration-${simulation.id}`}
          type="number"
          min="1"
          max="600"
          step="1"
          value={simulation.durationMonths}
          onChange={handleDurationChange}
        />
      </div>

      {/* Pay Faster Section */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`payFaster-${simulation.id}`}
            checked={simulation.payFasterEnabled}
            onCheckedChange={handlePayFasterToggle}
          />
          <Label
            htmlFor={`payFaster-${simulation.id}`}
            className="text-sm font-normal cursor-pointer"
          >
            {t('payFaster.enable')}
          </Label>
        </div>

        {simulation.payFasterEnabled && (
          <div className="space-y-2 pl-6">
            <Label htmlFor={`maxPayment-${simulation.id}`}>
              {t('payFaster.maxPayment')}
            </Label>
            <div className="flex gap-2">
              <Input
                id={`maxPayment-${simulation.id}`}
                type="number"
                min="0"
                step="100"
                value={simulation.maxMonthlyPayment || ''}
                onChange={handleMaxPaymentChange}
                className={validationError ? 'border-destructive' : ''}
              />
              <Button
                onClick={handleApplyPayFaster}
                variant="secondary"
                size="sm"
              >
                {t('payFaster.apply')}
              </Button>
            </div>
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
