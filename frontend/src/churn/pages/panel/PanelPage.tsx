// @path: frontend/src/churn/pages/panel/PanelPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { SaveIcon, CheckCircleIcon } from 'lucide-react';

import { ChurnForm } from '@/churn/components/churn-form';
import { PredictionPanel } from '@/churn/components/prediction-panel';
import { useRoleChurn } from '@/churn/hooks/useRoleChurn';
import { DEFAULT_INPUT, predictChurn, mapFormToBackend } from '@/lib/churn-model';
import { getModelAll, savePrediction } from '@/churn/api/predict.api';
import type { ModelInfo } from '@/churn/types/predict.interface';
import { Button } from '@/components/ui/button';

export const PanelPage = () => {
  const { role } = useRoleChurn();
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [activeModel, setActiveModel] = useState<ModelInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getModelAll()
      .then((models) => {
        const winner = models.find((m) => m.is_active) ?? models[0] ?? null;
        setActiveModel(winner);
      })
      .catch(() => {});
  }, []);

  const result = useMemo(() => predictChurn(input), [input]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload = mapFormToBackend(input);
      await savePrediction(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      console.warn(
        '[Churn] El backend no está disponible. La predicción mostrada es local (predictChurn client-side).',
      );
    } finally {
      setSaving(false);
    }
  };

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
          {activeModel && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              Modelo activo:{' '}
              <span className="font-medium text-foreground">
                {activeModel.model_name}
              </span>{' '}
              · ROC-AUC{' '}
              {(activeModel.holdout.roc_auc * 100).toFixed(1)}%
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <ChurnForm value={input} onChange={setInput} />
          <PredictionPanel input={input} result={result} role={role} />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant={saved ? 'default' : 'outline'}
            size="sm"
            disabled={saving}
            onClick={handleSave}
          >
            {saved ? (
              <>
                <CheckCircleIcon data-icon="inline-start" className="text-primary-foreground" />
                Guardado
              </>
            ) : (
              <>
                <SaveIcon data-icon="inline-start" />
                {saving ? 'Guardando...' : 'Guardar predicción'}
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};
