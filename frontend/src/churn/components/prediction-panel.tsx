import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CalendarClockIcon,
  CircleCheckIcon,
  DollarSignIcon,
  LightbulbIcon,
  TrendingDownIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  getRetentionActions,
  RISK_META,
  type CustomerInput,
  type PredictionResult,
} from "@/lib/churn-model"
import { cn } from "@/lib/utils"
import type { Role } from '../context/RoleChurnContext'

const tokenClasses: Record<
  string,
  { text: string; bg: string; ring: string; border: string }
> = {
  success: {
    text: "text-success",
    bg: "bg-success/10",
    ring: "text-success",
    border: "border-l-success",
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning/15",
    ring: "text-warning",
    border: "border-l-warning",
  },
  danger: {
    text: "text-danger",
    bg: "bg-danger/10",
    ring: "text-danger",
    border: "border-l-danger",
  },
}

export function PredictionPanel({
  input,
  result,
  role,
}: {
  input: CustomerInput
  result: PredictionResult
  role: Role
}) {
  const meta = RISK_META[result.riskLevel]
  const colors = tokenClasses[meta.token]
  const percent = Math.round(result.probability * 100)
  const actions = getRetentionActions(input, result)
  const roleActions = role === "agent" ? actions.agent : actions.analyst

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resultado predictivo</CardTitle>
              <CardDescription>
                Probabilidad de abandono estimada por el modelo.
              </CardDescription>
            </div>
            <Badge
              className={cn("gap-1.5 border-transparent", colors.bg, colors.text)}
            >
              <span
                className={cn("size-1.5 rounded-full", {
                  "bg-success": meta.token === "success",
                  "bg-warning": meta.token === "warning",
                  "bg-danger": meta.token === "danger",
                })}
              />
              {meta.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
            <Gauge percent={percent} colorClass={colors.ring} />
            <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {meta.description}
              </p>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <span className="text-xs text-muted-foreground">
                  Confianza del modelo
                </span>
                <Badge variant="secondary" className="font-mono">
                  {Math.round(result.confidence * 100)}%
                </Badge>
              </div>
              <Progress
                value={result.confidence * 100}
                className="h-1.5"
                aria-label="Confianza del modelo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={CalendarClockIcon}
          label="Permanencia estimada"
          value={`${result.estimatedTenureMonths} m`}
          hint="Meses esperados de vida útil"
        />
        <MetricCard
          icon={DollarSignIcon}
          label="Ingreso mensual en riesgo"
          value={`$${result.monthlyRevenueAtRisk.toFixed(0)}`}
          hint="Sobre el cargo mensual actual"
        />
        <MetricCard
          icon={TrendingDownIcon}
          label="Valor de vida en riesgo"
          value={`$${result.lifetimeValueAtRisk.toFixed(0)}`}
          hint="LTV expuesto al abandono"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {role === "agent"
              ? "Factores detectados en la cuenta"
              : "Variables que explican la predicción"}
          </CardTitle>
          <CardDescription>
            {role === "agent"
              ? "Menciónalos para personalizar la conversación."
              : "Contribución de cada variable al score de churn."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {result.factors.map((factor) => {
            const magnitude = Math.min(100, Math.abs(factor.weight) * 55)
            const isRisk = factor.direction === "risk"
            return (
              <div key={factor.label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md",
                    isRisk
                      ? "bg-danger/10 text-danger"
                      : "bg-success/10 text-success",
                  )}
                >
                  {isRisk ? (
                    <ArrowUpRightIcon className="size-3.5" />
                  ) : (
                    <ArrowDownRightIcon className="size-3.5" />
                  )}
                </span>
                <span className="w-44 shrink-0 truncate text-sm">
                  {factor.label}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      isRisk ? "bg-danger" : "bg-success",
                    )}
                    style={{ width: `${magnitude}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                  {isRisk ? "+ riesgo" : "− riesgo"}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className={cn("border-l-4", colors.border)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className={cn("flex size-8 items-center justify-center rounded-lg", colors.bg, colors.text)}>
              <LightbulbIcon className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base">
                {role === "agent"
                  ? "Guion de retención sugerido"
                  : "Estrategia de retención recomendada"}
              </CardTitle>
              <CardDescription>
                {role === "agent"
                  ? "Acciones para ofrecer durante la llamada."
                  : "Palancas priorizadas por impacto en el negocio."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {roleActions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            {role === "agent"
              ? "Registra el resultado de la gestión al finalizar la llamada para reentrenar el modelo."
              : "Predicciones y feedback se almacenan para el reentrenamiento continuo del pipeline MLOps."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Gauge({
  percent,
  colorClass,
}: {
  percent: number
  colorClass: string
}) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative flex size-36 shrink-0 items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="12"
          className="stroke-muted"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-500", colorClass)}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tabular-nums tracking-tight">
          {percent}%
        </span>
        <span className="text-xs text-muted-foreground">churn</span>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint: string
}) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="flex flex-col gap-1 px-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className="text-2xl font-bold tabular-nums tracking-tight">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </CardContent>
    </Card>
  )
}
