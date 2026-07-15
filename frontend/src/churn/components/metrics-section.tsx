// @path: frontend/src/churn/components/metrics-section.tsx
import { TrophyIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const MODELS = [
  { name: "XGBoost", accuracy: 85.9, f1: 82.1, auc: 86, best: true },
  { name: "Gradient Boosting", accuracy: 84.7, f1: 80.4, auc: 85 },
  { name: "Random Forest", accuracy: 83.2, f1: 78.9, auc: 84 },
  { name: "Regresión Logística", accuracy: 80.5, f1: 75.6, auc: 82 },
]

export function MetricsSection() {
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
          {MODELS.map((model) => (
            <Card
              key={model.name}
              className={model.best ? "border-primary/40 bg-primary/18" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{model.name}</CardTitle>
                  {model.best ? (
                    <Badge className="gap-1">
                      <TrophyIcon className="size-3" />
                      Mejor
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>
                  ROC-AUC {(model.auc / 100).toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Metric label="Accuracy" value={model.accuracy} />
                <Metric label="F1-Score" value={model.f1} />
              </CardContent>
            </Card>
          ))}
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
