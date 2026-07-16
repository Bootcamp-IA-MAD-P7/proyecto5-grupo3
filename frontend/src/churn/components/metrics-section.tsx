// @path: frontend/src/churn/components/metrics-section.tsx
import { useEffect, useState } from 'react'
import { TrophyIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getModelAll } from '@/churn/api/predict.api'
import type { ModelInfo } from '@/churn/types/predict.interface'

const DISPLAY_NAMES: Record<string, string> = {
  xgboost: 'XGBoost',
  gradient_boosting: 'Gradient Boosting',
  random_forest: 'Random Forest',
  logistic_regression: 'Regresión Logística',
}

export function MetricsSection() {
  const [models, setModels] = useState<ModelInfo[]>([])

  useEffect(() => {
    getModelAll()
      .then(setModels)
      .catch(() => {})
  }, [])

  return (
    <section id="metricas" className="border-b border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3">
          <Badge
            variant="secondary"
            className="w-fit gap-1.5 rounded-full border border-border"
          >
            Informe técnico
          </Badge>
          <h2 className="text-pretty text-3xl font-bold tracking-tight">
            Desempeño de los modelos evaluados
          </h2>
          <p className="max-w-2xl text-pretty">
            El pipeline entrena y compara cuatro algoritmos con validación
            cruzada estratificada (Stratified K-Fold) y control estricto de
            overfitting por debajo del 5%. El de mejor rendimiento se despliega
            en producción.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {models.map((model) => {
            const accuracy = (model.holdout.accuracy * 100).toFixed(1)
            const f1 = (model.holdout.f1_score * 100).toFixed(1)
            const auc = (model.holdout.roc_auc * 100).toFixed(1)
            const displayName =
              DISPLAY_NAMES[model.algorithm] ?? model.model_name

            return (
              <Card
                key={model.algorithm}
                className={
                  model.is_active ? 'border-primary/50 bg-primary/25' : ''
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{displayName}</CardTitle>
                    {model.is_active ? (
                      <Badge className="gap-1">
                        <TrophyIcon className="size-3" />
                        Mejor
                      </Badge>
                    ) : null}
                  </div>
                  <CardDescription>ROC-AUC {auc}%</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Metric label="Accuracy" value={Number(accuracy)} />
                  <Metric label="F1-Score" value={Number(f1)} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium tabular-nums">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  )
}
