// @path: frontend/src/churn/types/predict.interface.ts

export interface HoldoutMetrics {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  roc_auc: number
  confusion_matrix: {
    true_negative: number
    false_positive: number
    false_negative: number
    true_positive: number
  }
}

export interface CrossValidationMetrics {
  accuracy_mean: number
  precision_mean: number
  recall_mean: number
  f1_mean: number
  roc_auc_mean: number
  accuracy_std: number
  precision_std: number
  recall_std: number
  f1_std: number
  roc_auc_std: number
}

export interface ModelInfo {
  model_name: string
  algorithm: string
  is_active: boolean
  holdout: HoldoutMetrics
  cross_validation: CrossValidationMetrics
  best_params: Record<string, unknown>
  n_train: number
  n_test: number
}

export interface SavedPrediction {
  id: number
  gender: string
  senior_citizen: number
  partner: string
  dependents: string
  phone_service: string
  multiple_lines: string
  internet_service: string
  online_security: string
  online_backup: string
  device_protection: string
  tech_support: string
  streaming_tv: string
  streaming_movies: string
  contract: string
  paperless_billing: string
  payment_method: string
  tenure_months: number
  monthly_charges: number
  total_charges: number
  churn_value: number | null
  churn_probability: number
  prediction_label: string
  model_confidence: number
  estimated_lifetime_months: number | null
  revenue_at_risk: number | null
  clv_exposed: number | null
  created_at: string
}
