'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Moon, Sun, Languages, DollarSign } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setGlobalCurrency } from '@/store/slices/simulationsSlice';
import { CurrencyCode } from '@/types/simulation';

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const currency = useAppSelector((state) => state.simulations.currency);

  const handleLocaleChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    dispatch(setGlobalCurrency(newCurrency));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative flex h-14 items-center justify-center px-4">
        <h1 className="text-lg font-semibold">{t('app.title')}</h1>

        <div className="absolute right-4 flex items-center gap-2">
          {/* Currency Selector */}
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger>
              <DollarSign className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">{t('currency.brl')}</SelectItem>
              <SelectItem value="USD">{t('currency.usd')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Language Selector */}
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger>
              <Languages className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('language.en')}</SelectItem>
              <SelectItem value="pt">{t('language.pt')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
