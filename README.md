# Churn Prediction AI

Sistema de prediccion de abandono de clientes (churn) para telecomunicaciones, basado en un ensemble de 4 modelos de Machine Learning. Incluye backend API, frontend interactivo y pipeline automatizado de seleccion del modelo ganador.

## Descripcion

El sistema analiza el perfil de un cliente (antiguedad, contrato, servicios contratados, cargos mensuales) y predice la probabilidad de que abandone la empresa. Proporciona recomendaciones accionables de retencion clasificadas por riesgo (bajo, medio, alto) y estima el impacto financiero (ingreso mensual en riesgo, valor de vida del cliente expuesto).

El modelo activo se selecciona automaticamente al arrancar el backend comparando las metricas de holdout de 4 algoritmos entrenados previamente. El ganador se registra en la base de datos con `is_active: true` y es el que sirve todas las predicciones en produccion.

## Arquitectura

```
proyecto5-grupo3/
├── backend/
│   ├── ml/                        # Pipeline ML
│   │   ├── selector.py            # Seleccion automatica del mejor modelo
│   │   ├── predict.py             # Inferencia con el modelo activo
│   │   ├── train_*.py             # Scripts de entrenamiento (4 algoritmos)
│   │   ├── metrics_*.json         # Metricas de evaluacion por algoritmo
│   │   └── model_*.pkl            # Pipelines sklearn serializados
│   ├── src/
│   │   ├── main.py                # FastAPI app + lifespan + endpoints
│   │   ├── database/connection.py # SQLAlchemy engine + session
│   │   ├── models/                # ORM (CustomerPrediction, ModelRegistry)
│   │   ├── schemas/               # Pydantic request/response
│   │   └── controllers/           # Logica de endpoints
│   ├── notebooks/                 # Notebooks Jupytext (preprocessing, EDA, modelado)
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── churn/                 # Modulo principal de la app
│       │   ├── api/               # Clientes Axios (predict.api.ts)
│       │   ├── components/        # UI (hero, metrics, prediction-panel, churn-form)
│       │   ├── pages/             # Home, Panel, Metrics, Predicts, Model
│       │   ├── context/           # RoleChurnContext (agent/analyst)
│       │   └── hooks/             # useRoleChurn
│       ├── lib/churn-model.ts     # Motor de predicccion client-side (fallback)
│       └── router/app.router.tsx  # React Router v8 (HashRouter)
├── docker-compose.yml             # PostgreSQL 16 local
└── .env.template
```

### Flujo de datos

```
Frontend (React)
   │  POST /predict  ──────────────────►  FastAPI (backend)
   │  GET  /model/all                          │
   │  GET  /predictions                        ├──► model_registry (DB)
   │                                           ├──► customer_predictions (DB)
   │  ◄──── prediction + KPIs ────────────────┘
   │
   │  Al arrancar (lifespan):
   │  selector.py escanea metrics_*.json → compara roc_auc → inserta ganador en DB
```

## Stack Tecnologico

### Backend

| Componente | Tecnologia |
|---|---|
| Framework | FastAPI 0.139+ |
| ORM | SQLAlchemy 2.0 |
| Base de datos | PostgreSQL 16 |
| ML | scikit-learn 1.9, XGBoost 2.1 |
| Serializacion | joblib |
| Servidor | Uvicorn |
| Python | 3.12+ |

### Frontend

| Componente | Tecnologia |
|---|---|
| Framework | React 19 |
| Lenguaje | TypeScript 6 |
| Bundler | Vite 8 |
| Estilos | Tailwind CSS 4 |
| Componentes | shadcn/ui (Radix UI) |
| HTTP Client | Axios |
| Router | React Router 8 (HashRouter) |

### MLOps

| Componente | Tecnologia |
|---|---|
| Entrenamiento | 4 algoritmos con GridSearchCV + Stratified K-Fold |
| Metrica de seleccion | ROC-AUC (holdout) |
| Despliegue backend | Render |
| Despliegue frontend | Netlify |
| DB produccion | PostgreSQL en Render |

## Pipeline de Machine Learning

### Algoritmos evaluados

| Algoritmo | Metrica (ROC-AUC) | Archivo |
|---|---|---|
| XGBoost | 0.8549 | `ml/model_xgboost.pkl` |
| Gradient Boosting | 0.8541 | `ml/model_gradient_boosting.pkl` |
| Random Forest | 0.8521 | `ml/model_random_forest.pkl` |
| Regresion Logistica | 0.8491 | `ml/model_logistic_regression.pkl` |

### Proceso de entrenamiento

Cada algoritmo se entrena con un pipeline que incluye:

1. **Preprocesamiento**: `ColumnTransformer` con `OneHotEncoder` para variables categoricas y `passthrough` para numericas
2. **Optimizacion**: `GridSearchCV` con validacion cruzada estratificada (5 folds)
3. **Evaluacion**: Metricas de holdout (accuracy, precision, recall, F1, ROC-AUC) y validacion cruzada
4. **Serializacion**: Pipeline completo (preprocesador + modelo) guardado como `.pkl`

### Selector automatico de modelos

Al arrancar el backend (`lifespan`), `selector.py`:

1. Escanea `ml/metrics_*.json` y extrae la metrica `roc_auc` de cada uno
2. Selecciona el algoritmo con mayor valor
3. Desactiva todos los modelos anteriores en `model_registry`
4. Inserta el ganador con `is_active: true`

El endpoint `POST /admin/select-model` permite re-ejecutar esta logica sin reiniciar el servidor.

## Que hace la solucion

### Modo Agente de Atencion
- El agente introduce los datos del cliente durante una llamada
- Recibe al instante la probabilidad de abandono y el nivel de riesgo
- Obtiene un guion de retencion sugerido con acciones concretas para ofrecer en la llamada

### Modo Analista de Negocio
- Simula perfiles de clientes para entender que variables disparan el abandono
- Visualiza la contribucion de cada variable al score de churn
- Estima ingresos en riesgo y valor de vida del cliente para disenar campanas de retencion

### Paginas de la aplicacion

| Ruta | Descripcion |
|---|---|
| `/` | Landing page con metricas del modelo activo y pasos del pipeline |
| `/panel` | Predictor interactivo con formulario y resultados en tiempo real |
| `/metricas` | Comparativa de las 4 metricas de los modelos evaluados |
| `/predicciones` | Historial de predicciones guardadas en la base de datos |
| `/admin` | Panel administrativo |

## URLs de despliegue

| Servicio | URL |
|---|---|
| Backend (Render) | https://churn-back.onrender.com/ |
| Frontend (Netlify) | https://churn-prediction-ai.netlify.app/ |

### Endpoints de la API

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/model/all` | Metricas de los 4 modelos + cual esta activo |
| POST | `/predict` | Inferencia + persistencia de prediccion |
| GET | `/predictions` | Historial de predicciones guardadas |
| POST | `/admin/select-model` | Re-ejecutar el selector de modelos |

## Como correr el proyecto

### Requisitos

- **Node.js** v20+: https://nodejs.org
- **uv** (gestor Python): `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
- **Docker Desktop** (para PostgreSQL local)

### Clonar el repositorio

```bash
git clone https://github.com/Bootcamp-IA-MAD-P7/proyecto5-grupo3
cd proyecto5-grupo3
```

### Configurar variables de entorno

```bash
cp .env.template .env
# Editar .env con tus credenciales de PostgreSQL
```

### Backend

```bash
cd backend
uv sync                              # Instalar dependencias
.venv\Scripts\activate                # Activar entorno virtual (Windows)
uv run uvicorn src.main:app --reload  # Levantar servidor en http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install          # Instalar dependencias
npm run dev          # Levantar en http://localhost:5173
```

### Base de datos local (Docker)

```bash
# Desde la raiz del proyecto
docker compose up -d                  # Levantar PostgreSQL 16
docker compose ps                     # Verificar que esta sano

# Cargar dataset procesado (requiere haber ejecutado notebooks antes)
cd backend
uv run python -m src.db.load_raw
```

### Notebooks (entrenamiento de modelos)

```bash
cd backend
uv run jupytext --to notebook notebooks/01_preprocessing.py
# Abrir en Jupyter Lab o VS Code con extension de Jupytext
```

Los notebooks generan:
- `backend/data/raw/telco_customer_churn.csv` (dataset original)
- `backend/data/processed/telco_customer_churn_clean.csv` (dataset limpio)
- `backend/ml/metrics_*.json` y `backend/ml/model_*.pkl` (modelos entrenados)

### Entrenar un modelo individual

```bash
cd backend
uv run python -m ml.train_gradient_boosting
uv run python -m ml.train_xgboost
uv run python -m ml.train_random_forest
uv run python -m ml.train_logistic_regression
```

## Licencia

Proyecto realizado como parte del Bootcamp IA - Bootcamp-IA-MAD-P7
