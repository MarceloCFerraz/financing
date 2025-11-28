import { CurrencyCode } from '@/types/simulation';

const currencyConfig: Record<
  CurrencyCode,
  { locale: string } & Intl.NumberFormatOptions
> = {
  BRL: {
    locale: 'pt-BR',
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  USD: {
    locale: 'en-US',
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};

/**
 * Format a number as currency
 * Examples:
 *   formatCurrency(1234.56, 'BRL') => "R$ 1.234,56"
 *   formatCurrency(1234.56, 'USD') => "$1,234.56"
 */
export function formatCurrency(value: number, currency: CurrencyCode): string {
  const config = currencyConfig[currency] || currencyConfig['BRL'];
  const { locale, ...options } = config;
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a percentage
 * Examples:
 *   formatPercentage(0.01) => "1.00%"
 *   formatPercentage(0.125) => "12.50%"
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Parse a currency string to number
 * Handles both BRL (comma decimal) and USD (period decimal) formats
 */
export function parseCurrencyInput(value: string, currency: CurrencyCode): number {
  // Remove currency symbols and spaces
  let cleaned = value.replace(/[R$\s]/g, '').trim();

  if (currency === 'BRL') {
    // BRL format: 1.234,56 -> 1234.56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // USD format: 1,234.56 -> 1234.56
    cleaned = cleaned.replace(/,/g, '');
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number for input display
 */
export function formatNumberInput(value: number, currency: CurrencyCode): string {
  if (currency === 'BRL') {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
