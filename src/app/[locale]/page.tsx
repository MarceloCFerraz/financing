import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { SimulationsContainer } from '@/components/layout/SimulationsContainer';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <SimulationsContainer />
    </main>
  );
}
