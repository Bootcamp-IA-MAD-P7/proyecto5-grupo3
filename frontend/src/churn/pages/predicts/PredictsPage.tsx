// @path: frontend/src/churn/pages/predicts/PredictsPage.tsx
import { RefreshCwIcon, UsersIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getPredictions } from '@/churn/api/predict.api';
import type { SavedPrediction } from '@/churn/types/predict.interface';
import { predictChurn, type CustomerInput } from '@/lib/churn-model';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const CONTRACT_DISPLAY: Record<string, string> = {
  'Month-to-month': 'Mes a mes',
  'One year': '1 año',
  'Two year': '2 años',
};

function savedToCustomerInput(p: SavedPrediction): CustomerInput {
  return {
    tenure: p.tenure_months,
    monthlyCharges: p.monthly_charges,
    contract:
      p.contract === 'Month-to-month'
        ? 'month-to-month'
        : p.contract === 'One year'
          ? 'one-year'
          : 'two-year',
    internetService:
      p.internet_service === 'Fiber optic'
        ? 'fiber'
        : p.internet_service === 'DSL'
          ? 'dsl'
          : 'none',
    paymentMethod:
      p.payment_method === 'Electronic check'
        ? 'electronic-check'
        : p.payment_method === 'Mailed check'
          ? 'mailed-check'
          : p.payment_method === 'Bank transfer'
            ? 'bank-transfer'
            : 'credit-card',
    onlineSecurity: p.online_security === 'Yes',
    techSupport: p.tech_support === 'Yes',
    streamingServices: p.streaming_tv === 'Yes',
    paperlessBilling: p.paperless_billing === 'Yes',
    seniorCitizen: p.senior_citizen === 1,
    hasPartner: p.partner === 'Yes',
  };
}

function topRiskFactor(p: SavedPrediction): string {
  const input = savedToCustomerInput(p);
  const { factors } = predictChurn(input);
  const riskFactor = factors.find((f) => f.direction === 'risk');
  return riskFactor?.label ?? '—';
}

export const PredictsPage = () => {
  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPredictions = () => {
    setLoading(true);
    getPredictions()
      .then(setPredictions)
      .catch(() => setPredictions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UsersIcon className="size-4" />
              </span>
              <div>
                <CardTitle>Clientes evaluados</CardTitle>
                <CardDescription>
                  Historial de predicciones de churn guardadas en el sistema.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {predictions.length} registros
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchPredictions}
                disabled={loading}
              >
                <RefreshCwIcon
                  data-icon="inline-start"
                  className={loading ? 'animate-spin' : ''}
                />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Cargando registros...
            </div>
          ) : predictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <UsersIcon className="size-8 opacity-40" />
              <p className="text-sm">
                No hay predicciones guardadas aún. Ve al predictor y guarda un
                registro.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Antigüedad</th>
                    <th className="px-3 py-3">Contrato</th>
                    <th className="px-3 py-3">Cargo mensual</th>
                    <th className="px-3 py-3">Churn %</th>
                    <th className="px-3 py-3">Etiqueta</th>
                    <th className="px-3 py-3">Factor de riesgo</th>
                    <th className="px-3 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {predictions.map((p) => {
                    const isHigh = p.prediction_label === 'High Risk';
                    return (
                      <tr
                        key={p.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="whitespace-nowrap px-3 py-3 font-mono text-xs font-medium">
                          #{p.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {p.tenure_months} m
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {CONTRACT_DISPLAY[p.contract] ?? p.contract}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-mono">
                          ${p.monthly_charges.toFixed(0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-mono font-medium">
                          {p.churn_probability.toFixed(1)}%
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <Badge
                            variant="secondary"
                            className={
                              isHigh
                                ? 'bg-danger/10 text-danger'
                                : 'bg-success/10 text-success'
                            }
                          >
                            {p.prediction_label}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {topRiskFactor(p)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
