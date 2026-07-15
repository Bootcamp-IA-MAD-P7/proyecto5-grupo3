// @path: frontend/src/lib/churn-model.ts
// Cliente-side scoring engine that emulates the trained logistic-regression /
// gradient-boosting ensemble described in the ChurnPrediction backend.
// Coefficients are tuned to reflect the well-known drivers of the
// IBM Telco Customer Churn dataset. This keeps the UI fully interactive
// without a backend, while mirroring the real API contract.

export type Contract = "month-to-month" | "one-year" | "two-year"
export type InternetService = "fiber" | "dsl" | "none"
export type PaymentMethod =
  | "electronic-check"
  | "mailed-check"
  | "bank-transfer"
  | "credit-card"

export interface CustomerInput {
  tenure: number // months
  monthlyCharges: number
  contract: Contract
  internetService: InternetService
  paymentMethod: PaymentMethod
  onlineSecurity: boolean
  techSupport: boolean
  streamingServices: boolean
  paperlessBilling: boolean
  seniorCitizen: boolean
  hasPartner: boolean
}

export interface FactorContribution {
  label: string
  weight: number // signed contribution to the logit
  direction: "risk" | "retention"
}

export type RiskLevel = "low" | "medium" | "high"

export interface PredictionResult {
  probability: number // 0-1
  riskLevel: RiskLevel
  estimatedTenureMonths: number
  monthlyRevenueAtRisk: number
  lifetimeValueAtRisk: number
  factors: FactorContribution[]
  confidence: number // 0-1 pseudo model confidence
}

export const DEFAULT_INPUT: CustomerInput = {
  tenure: 12,
  monthlyCharges: 70,
  contract: "month-to-month",
  internetService: "fiber",
  paymentMethod: "electronic-check",
  onlineSecurity: false,
  techSupport: false,
  streamingServices: true,
  paperlessBilling: true,
  seniorCitizen: false,
  hasPartner: false,
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

export function predictChurn(input: CustomerInput): PredictionResult {
  const factors: FactorContribution[] = []
  const add = (label: string, weight: number) => {
    if (Math.abs(weight) < 0.04) return
    factors.push({
      label,
      weight,
      direction: weight >= 0 ? "risk" : "retention",
    })
  }

  // Intercept
  let z = -0.9

  // Contract type — strongest single driver
  if (input.contract === "month-to-month") {
    z += 1.35
    add("Contrato mes a mes", 1.35)
  } else if (input.contract === "one-year") {
    z -= 0.55
    add("Contrato de 1 año", -0.55)
  } else {
    z -= 1.45
    add("Contrato de 2 años", -1.45)
  }

  // Tenure — loyal customers churn far less
  const tenureEffect = -0.035 * input.tenure
  z += tenureEffect
  add(
    input.tenure < 12 ? "Antigüedad baja (<12 meses)" : "Antigüedad del cliente",
    tenureEffect,
  )

  // Monthly charges relative to ~65 average
  const chargeEffect = 0.014 * (input.monthlyCharges - 65)
  z += chargeEffect
  if (input.monthlyCharges > 80)
    add("Cargo mensual elevado", chargeEffect)
  else if (input.monthlyCharges < 45)
    add("Cargo mensual bajo", chargeEffect)

  // Internet service
  if (input.internetService === "fiber") {
    z += 0.7
    add("Servicio de fibra óptica", 0.7)
  } else if (input.internetService === "none") {
    z -= 0.7
    add("Sin servicio de internet", -0.7)
  }

  const hasInternet = input.internetService !== "none"

  // Value-added services reduce churn
  if (hasInternet && !input.onlineSecurity) {
    z += 0.45
    add("Sin seguridad en línea", 0.45)
  } else if (hasInternet && input.onlineSecurity) {
    z -= 0.3
    add("Seguridad en línea activa", -0.3)
  }

  if (hasInternet && !input.techSupport) {
    z += 0.4
    add("Sin soporte técnico", 0.4)
  } else if (hasInternet && input.techSupport) {
    z -= 0.3
    add("Soporte técnico contratado", -0.3)
  }

  if (hasInternet && input.streamingServices) {
    z += 0.15
    add("Servicios de streaming", 0.15)
  }

  // Payment method — electronic check correlates with churn
  if (input.paymentMethod === "electronic-check") {
    z += 0.45
    add("Pago con cheque electrónico", 0.45)
  } else if (
    input.paymentMethod === "bank-transfer" ||
    input.paymentMethod === "credit-card"
  ) {
    z -= 0.25
    add("Pago automático", -0.25)
  }

  if (input.paperlessBilling) {
    z += 0.2
    add("Facturación electrónica", 0.2)
  }

  if (input.seniorCitizen) {
    z += 0.25
    add("Cliente de tercera edad", 0.25)
  }

  if (input.hasPartner) {
    z -= 0.25
    add("Tiene pareja / dependientes", -0.25)
  }

  const probability = sigmoid(z)

  const riskLevel: RiskLevel =
    probability >= 0.6 ? "high" : probability >= 0.35 ? "medium" : "low"

  // Expected remaining tenure (simple survival heuristic)
  const estimatedTenureMonths = Math.max(
    1,
    Math.round((1 - probability) * 48 + 2),
  )
  const monthlyRevenueAtRisk = input.monthlyCharges * probability
  const lifetimeValueAtRisk =
    input.monthlyCharges * estimatedTenureMonths * probability

  // Sort factors by absolute impact, keep the most influential
  factors.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))

  // Pseudo confidence: higher when far from decision boundary
  const confidence = 0.7 + 0.29 * Math.abs(probability - 0.5) * 2

  return {
    probability,
    riskLevel,
    estimatedTenureMonths,
    monthlyRevenueAtRisk,
    lifetimeValueAtRisk,
    factors: factors.slice(0, 6),
    confidence: Math.min(0.99, confidence),
  }
}

export const RISK_META: Record<
  RiskLevel,
  { label: string; token: string; description: string }
> = {
  low: {
    label: "Riesgo Bajo",
    token: "success",
    description: "Cliente estable con alta probabilidad de permanencia.",
  },
  medium: {
    label: "Riesgo Medio",
    token: "warning",
    description: "Cliente en zona de vigilancia. Monitorear de cerca.",
  },
  high: {
    label: "Riesgo Alto",
    token: "danger",
    description: "Alta probabilidad de abandono. Requiere acción inmediata.",
  },
}

// Retention playbook mapped to the detected risk drivers
export function getRetentionActions(
  input: CustomerInput,
  result: PredictionResult,
): { agent: string[]; analyst: string[] } {
  const agent: string[] = []
  const analyst: string[] = []

  if (input.contract === "month-to-month") {
    agent.push(
      "Ofrecer migración a contrato anual con descuento del 15% en la mensualidad.",
    )
    analyst.push(
      "Campaña de fidelización con incentivo a contratos de 1-2 años (mayor palanca de retención).",
    )
  }
  if (input.paymentMethod === "electronic-check") {
    agent.push(
      "Proponer domiciliación bancaria o tarjeta con un mes de bonificación.",
    )
    analyst.push(
      "Incentivar pago automático: reduce fricción y churn ~10 pts.",
    )
  }
  if (input.internetService !== "none" && !input.techSupport) {
    agent.push("Incluir Soporte Técnico Premium gratis por 3 meses.")
    analyst.push("Bundle de soporte/seguridad como retención de valor añadido.")
  }
  if (input.internetService !== "none" && !input.onlineSecurity) {
    agent.push("Activar paquete de Seguridad en Línea sin costo inicial.")
  }
  if (input.monthlyCharges > 85) {
    agent.push(
      "Revisar plan y aplicar descuento de lealtad para reducir el cargo mensual.",
    )
    analyst.push(
      "Segmento de alto ARPU sensible al precio: evaluar reestructuración tarifaria.",
    )
  }
  if (result.riskLevel === "low") {
    agent.push(
      "Cliente satisfecho: aprovechar para venta cruzada (up-sell de servicios).",
    )
    analyst.push(
      "Candidato ideal para programas de embajadores y up-selling.",
    )
  }

  if (agent.length === 0)
    agent.push("Mantener seguimiento estándar de satisfacción.")
  if (analyst.length === 0)
    analyst.push("Sin palancas críticas: mantener en cohorte de control.")

  return { agent, analyst }
}
