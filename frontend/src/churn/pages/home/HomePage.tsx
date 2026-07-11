import { ActivityIcon } from 'lucide-react';

import { useMemo, useState } from 'react';

import { ChurnForm } from '@/churn/components/churn-form';
import { HeroSection } from '@/churn/components/hero-section';
import { MetricsSection } from '@/churn/components/metrics-section';
import { Navbar, type Role } from '@/churn/components/navbar';
import { PredictionPanel } from '@/churn/components/prediction-panel';
import { DEFAULT_INPUT, predictChurn } from '@/lib/churn-model';

export const HomePage = () => {
  const [role, setRole] = useState<Role>('agent');
  const [input, setInput] = useState(DEFAULT_INPUT);

  const result = useMemo(() => predictChurn(input), [input]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar role={role} onRoleChange={setRole} />

      <main className="flex-1">
        <HeroSection role={role} />

        <section id="predictor" className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-2">
              <h2 className="text-pretty text-3xl font-bold tracking-tight">
                Predictor de abandono
              </h2>
              <p className="max-w-2xl text-pretty">
                {role === 'agent'
                  ? 'Introduce los datos del cliente durante la llamada y recibe la recomendación de retención al instante.'
                  : 'Simula un perfil de cliente para analizar su riesgo de churn y los ingresos expuestos.'}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
              <ChurnForm value={input} onChange={setInput} />
              <PredictionPanel input={input} result={result} role={role} />
            </div>
          </div>
        </section>

        <MetricsSection />
      </main>

      <footer id="docs" className="bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ActivityIcon className="size-4" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold">Churn Prediction</span>
              <span className="text-xs text-muted-foreground">
                Sistema Inteligente de Retención de Clientes
              </span>
            </div>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            React + Vite + TailwindCSS + shadcn/ui · Backend FastAPI ·
            PostgreSQL · Scikit-learn / XGBoost. Predicciones servidas en tiempo
            real para activar estrategias de retención.
          </p>
        </div>
      </footer>
    </div>
  );
};
