# Selección del modelo ganador

## Modelo activo: RandomForestClassifier

Elegido entre 4 candidatos (`LogisticRegression`, `RandomForestClassifier`,
`XGBClassifier`, `GradientBoostingClassifier`) por `selector.py`, comparando
`f1_score` en holdout (combina precision y recall, criterio elegido porque el
objetivo de negocio pide mínimos simultáneos de ambas métricas).

| Modelo | Accuracy | Precision | Recall | F1 | ROC AUC |
|---|---|---|---|---|---|
| GradientBoosting | 80.6% | 67.0% | 53.2% | 0.593 | 0.854 |
| LogisticRegression | 74.5% | 51.3% | 78.3% | 0.620 | 0.849 |
| **RandomForest (ganador)** | **76.3%** | 53.9% | 74.1% | **0.624** | 0.853 |
| XGBoost | 74.5% | 51.3% | 78.9% | 0.622 | 0.854 |

Con el umbral de decisión afinado (`ml/tune_threshold.py`, ver
`ml/threshold_random_forest.json`), en vez del 0.5 por defecto:

- Umbral: **0.49**
- Accuracy: **76.65%**
- Recall: **75.94%**
- Precision: 54.3%

`predict.py` lee automáticamente este umbral para el modelo activo.

## Techo de precisión con recall ≥ 75%

Se investigó si era posible superar el 75% de precisión manteniendo el
recall en 75% o más. Se calculó la curva precision-recall real (holdout) de
los 4 modelos:

| Modelo | Precisión máxima con recall ≥ 75% |
|---|---|
| RandomForest | 54.4% |
| XGBoost | 55.1% |
| GradientBoosting | 54.3% |
| LogisticRegression | 53.0% |

Los 4 modelos topan en el mismo rango (~53-55%). Esto es un **límite
estructural de los datos**, no un problema de tuning:

- El dataset trae una columna `churn_score` que es un score de propensión
  pre-calculado por IBM (correlación 0.66 con el target, medias de 82.5 vs
  50.1 entre churn/no-churn). Usarla sería *data leakage* — por eso está
  excluida de `FEATURE_COLUMNS` en todos los scripts de entrenamiento.
- Sin esa columna, el ROC AUC de los 4 algoritmos converge en ~0.84-0.86,
  que es el techo público conocido para este dataset (IBM Telco Customer
  Churn) con features legítimas.
- Se probó feature engineering adicional (nº de servicios contratados,
  gasto medio real vs. facturado, antigüedad en buckets, riesgo de contrato
  ordinal, flag de cliente nuevo): el ROC AUC no mejoró de forma
  significativa (0.838 vs. 0.853 base) y la precisión máxima con
  recall ≥ 75% se mantuvo igual (~53.5%).
- Para lograr 75% de precisión y 75% de recall simultáneos haría falta un
  ROC AUC ≈ 0.93+, que normalmente requiere señales que este dataset no
  tiene (comportamiento de uso real, historial de soporte, ofertas de la
  competencia, etc.).

**Conclusión**: se prioriza el recall (detectar clientes en riesgo de fuga)
sobre la precisión, que es la práctica habitual en modelos de churn — el
coste de un falso positivo (ofrecer retención a alguien que no se iba a ir)
suele ser mucho menor que el de un falso negativo (perder a un cliente sin
intervenir). RandomForest con umbral 0.49 da el mejor equilibrio real
disponible: accuracy 76.65%, recall 75.94%, precision 54.3%.
