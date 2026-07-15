// @path: frontend/src/churn/pages/panel/PanelPage.tsx
import { useMemo, useState } from 'react';

import { ChurnForm } from '@/churn/components/churn-form';
import { PredictionPanel } from '@/churn/components/prediction-panel';
import { useRoleChurn } from '@/churn/hooks/useRoleChurn';
import { DEFAULT_INPUT, predictChurn } from '@/lib/churn-model';

export const PanelPage = () => {
  const { role } = useRoleChurn();
  const [input, setInput] = useState(DEFAULT_INPUT);

  const result = useMemo(() => predictChurn(input), [input]);
  return (
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
  );
};
