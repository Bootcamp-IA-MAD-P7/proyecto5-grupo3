// @path: frontend/src/churn/components/churn-form.tsx
import { RotateCcwIcon, UserRoundIcon } from 'lucide-react';

import {
  DEFAULT_INPUT,
  type Contract,
  type CustomerInput,
  type InternetService,
  type PaymentMethod,
} from '@/lib/churn-model';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

const CONTRACT_LABELS: Record<Contract, string> = {
  'month-to-month': 'Mes a mes',
  'one-year': 'Un año',
  'two-year': 'Dos años',
};

const INTERNET_LABELS: Record<InternetService, string> = {
  fiber: 'Fibra óptica',
  dsl: 'DSL',
  none: 'Sin internet',
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  'electronic-check': 'Cheque electrónico',
  'mailed-check': 'Cheque por correo',
  'bank-transfer': 'Transferencia bancaria',
  'credit-card': 'Tarjeta de crédito',
};

export const ChurnForm = ({
  value,
  onChange,
}: {
  value: CustomerInput;
  onChange: (value: CustomerInput) => void;
}) => {
  const set = <K extends keyof CustomerInput>(key: K, v: CustomerInput[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRoundIcon className="size-4" />
          </span>
          <div>
            <CardTitle>Datos del cliente</CardTitle>
            <CardDescription>
              Completa el perfil para calcular el riesgo de abandono.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="tenure">Antigüedad</FieldLabel>
              <span className="font-mono text-sm font-medium text-foreground">
                {value.tenure} {value.tenure === 1 ? 'mes' : 'meses'}
              </span>
            </div>
            <Slider
              id="tenure"
              min={0}
              max={72}
              step={1}
              value={[value.tenure]}
              onValueChange={(v) => set('tenure', v[0] as number)}
              className="py-2"
            />
            <FieldDescription>
              Meses que el cliente lleva contratado (0 – 72).
            </FieldDescription>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="charges">Cargo mensual</FieldLabel>
              <span className="font-mono text-sm font-medium text-foreground">
                ${value.monthlyCharges.toFixed(0)}
              </span>
            </div>
            <Slider
              id="charges"
              min={18}
              max={120}
              step={1}
              value={[value.monthlyCharges]}
              onValueChange={(v) => set('monthlyCharges', v[0] as number)}
              className="py-2"
            />
            <FieldDescription>
              Importe facturado cada mes (USD).
            </FieldDescription>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel>Tipo de contrato</FieldLabel>
              <Select
                value={value.contract}
                onValueChange={(v) => set('contract', v as Contract)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {CONTRACT_LABELS[value.contract]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="month-to-month">Mes a mes</SelectItem>
                    <SelectItem value="one-year">Un año</SelectItem>
                    <SelectItem value="two-year">Dos años</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Servicio de internet</FieldLabel>
              <Select
                value={value.internetService}
                onValueChange={(v) =>
                  set('internetService', v as InternetService)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {INTERNET_LABELS[value.internetService]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="fiber">Fibra óptica</SelectItem>
                    <SelectItem value="dsl">DSL</SelectItem>
                    <SelectItem value="none">Sin internet</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Método de pago</FieldLabel>
            <Select
              value={value.paymentMethod}
              onValueChange={(v) => set('paymentMethod', v as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {PAYMENT_LABELS[value.paymentMethod]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="electronic-check">
                    Cheque electrónico
                  </SelectItem>
                  <SelectItem value="mailed-check">
                    Cheque por correo
                  </SelectItem>
                  <SelectItem value="bank-transfer">
                    Transferencia bancaria
                  </SelectItem>
                  <SelectItem value="credit-card">
                    Tarjeta de crédito
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <FieldSet>
            <FieldLegend>Servicios y perfil</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-2">
              <BooleanField
                label="Seguridad en línea"
                value={value.onlineSecurity}
                onValueChange={(v) => set('onlineSecurity', v)}
              />
              <BooleanField
                label="Soporte técnico"
                value={value.techSupport}
                onValueChange={(v) => set('techSupport', v)}
              />
              <BooleanField
                label="Servicios de streaming"
                value={value.streamingServices}
                onValueChange={(v) => set('streamingServices', v)}
              />
              <BooleanField
                label="Facturación electrónica"
                value={value.paperlessBilling}
                onValueChange={(v) => set('paperlessBilling', v)}
              />
              <BooleanField
                label="Tercera edad"
                value={value.seniorCitizen}
                onValueChange={(v) => set('seniorCitizen', v)}
              />
              <BooleanField
                label="Tiene pareja"
                value={value.hasPartner}
                onValueChange={(v) => set('hasPartner', v)}
              />
            </div>
          </FieldSet>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              La predicción se actualiza automáticamente.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(DEFAULT_INPUT)}
            >
              <RotateCcwIcon data-icon="inline-start" />
              Reiniciar
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
};

function BooleanField({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <span className="text-sm font-medium">{label}</span>
      <ToggleGroup
        type="single"
        value={value ? 'yes' : 'no'}
        onValueChange={(v) => {
          if (v) onValueChange(v === 'yes');
        }}
        className="rounded-md border border-border bg-card p-0.5"
        aria-label={label}
      >
        <ToggleGroupItem
          value="yes"
          size="sm"
          className={cn(
            "cursor-pointer rounded px-2.5 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
          )}
        >
          Sí
        </ToggleGroupItem>
        <ToggleGroupItem
          value="no"
          size="sm"
          className="cursor-pointer rounded px-2.5 text-xs data-[state=on]:bg-primary/24 data-[state=on]:text-secondary-foreground"
        >
          No
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
