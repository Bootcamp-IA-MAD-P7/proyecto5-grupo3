// @path: frontend/src/churn/components/hero-section.tsx
import {
  ArrowRightIcon,
  BrainCircuitIcon,
  DatabaseIcon,
  GaugeIcon,
  ShieldCheckIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import type { Role } from '../context/RoleChurnContext';
import { useRoleChurn } from '../hooks/useRoleChurn';

const ROLE_COPY: Record<
  Role,
  { eyebrow: string; title: string; description: string }
> = {
  agent: {
    eyebrow: 'Modo Agente de Atención',
    title: 'Detecta el riesgo de fuga mientras hablas con el cliente',
    description:
      'Introduce los datos del cliente durante la llamada y obtén al instante su probabilidad de abandono junto a las mejores acciones de retención para ofrecer en tiempo real.',
  },
  analyst: {
    eyebrow: 'Modo Analista de Negocio',
    title: 'Cuantifica el churn y prioriza estrategias de retención',
    description:
      'Simula perfiles de clientes, entiende qué variables disparan el abandono y estima los ingresos en riesgo para diseñar campañas de retención con mayor retorno.',
  },
};

const MODEL_STEPS = [
  {
    icon: DatabaseIcon,
    title: 'Datos del cliente',
    text: 'Antigüedad, contrato, cargos y servicios contratados.',
  },
  {
    icon: BrainCircuitIcon,
    title: 'Ensemble de ML',
    text: 'Regresión Logística, Random Forest, Gradient Boosting y XGBoost.',
  },
  {
    icon: GaugeIcon,
    title: 'Probabilidad de churn',
    text: 'Score calibrado de 0 a 100% con nivel de riesgo.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Acción de retención',
    text: 'Recomendaciones accionables según el perfil de riesgo.',
  },
];

export const HeroSection = () => {
  const { role } = useRoleChurn();
  const copy = ROLE_COPY[role];

  return (
    <section
      id="modelo"
      className="relative overflow-hidden border-b border-border"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-6">
          <Badge
            variant="outline"
            className="w-fit gap-2 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary shadow-[0_0_10px_rgba(var(--primary),0.15)] brightness-110 dynamic-glow"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary shadow-[0_0_8px_#fff]" />
            </span>
            <span className="tracking-wide">{copy.eyebrow}</span>
          </Badge>

          <h1 className="text-pretty text-4xl font-bold tracking-tight sm:text-5xl">
            {copy.title}
          </h1>

          <p className="max-w-xl text-pretty text-base leading-relaxed sm:text-lg">
            {copy.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link to="/panel">
                Iniciar predicción
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/metricas">Ver desempeño del modelo</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <img
              src={role === 'agent' ? '/agente.jpg' : '/analista.jpg'}
              alt={
                role === 'agent'
                  ? 'Modo Agente de Atención'
                  : 'Modo Analista de Negocio'
              }
              width={720}
              height={540}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-primary/18 py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="mt-2 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
            <div className="flex justify-center">
              <Stat value="85.9%" label="Accuracy" />
            </div>
            <div className="flex justify-center">
              <Stat value="0.86" label="ROC-AUC" />
            </div>
            <div className="flex justify-center">
              <Stat value="7K+" label="Clientes de entrenamiento" />
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide">
            ¿Cómo funciona el modelo?
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODEL_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="order-2 text-xs text-muted-foreground">{label}</dt>
      <dd className="order-1 text-2xl font-bold tracking-tight">{value}</dd>
    </div>
  );
}
