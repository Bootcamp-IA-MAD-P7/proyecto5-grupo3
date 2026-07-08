# Instructivo de instalación

## 1. Requisitos globales

Antes de clonar el repositorio, instalá las siguientes herramientas de manera global:

- **Node.js** (v20 o superior): [https://nodejs.org](https://nodejs.org/es/download)

```bash
# Bajar un poco y dar Clic en el boton verde: Windows Installer (.msi)
# Ejecutar el asistente de instalación descargado
# Seguir la instalación paso a paso y aceptar todo
# Para comprobar que sí se instaló, ejecutar desde cualquier terminal:
node --version
```

- **uv** (gestor de proyectos Python). Ejecutar:

```bash
# Ejecutar desde una terminal de powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
# Para comprobar que sí se instaló, ejecutar desde cualquier terminal:
uv --version
```

## 2. Clonar el repositorio

```bash
git clone https://github.com/Bootcamp-IA-MAD-P7/proyecto5-grupo3
cd proyecto5-grupo3
```

## 3. Frontend (React + Vite)

> 💡IMPORTANTE: Asegurese de estar en la ruta del frontend: `/proyecto5-grupo3/frontend`

```bash
cd frontend
npm install
npm run dev
```

Esto levanta el servidor de desarrollo en `http://localhost:5173`.

## 4. Backend (uv)

> 💡IMPORTANTE: Asegurese de estar en la ruta del backend: `/proyecto5-grupo3/backend`

```bash
cd backend
uv sync
```

Esto crea el entorno virtual e instala las dependencias definidas en `pyproject.toml`.

Para activar el entorno virtual:

```bash
.venv\Scripts\activate   # Windows
source .venv/Scripts/activate # Bash
```

## 5. Notebook Jupyter

El archivo `backend/notebooks/01_preprocessing.ipynb` se genera automáticamente al ejecutar en modo interactivo (Jupytext) el archivo `backend/notebooks/01_preprocessing.py`.

```bash
cd backend
uv run jupytext --to notebook notebooks/01_preprocessing.py
# Seleccionar el Kernel de la versión de python: 3.12.13
```

O simplemente abrir `01_preprocessing.py` desde Jupyter Lab / VS Code con la extensión de Jupytext y se sincronizará solo.

> **Nota sobre el dataset:** La primera vez que se ejecute el notebook, `kagglehub` descargará automáticamente el dataset **Telco Customer Churn** de Kaggle y lo almacenará en caché local. En ejecuciones posteriores, `kagglehub.dataset_download(...)` reutilizará la copia cacheadas y solo cargará la ruta en la variable `path`.

Ejecutar `01_preprocessing.py` genera además `backend/data/raw/telco_customer_churn.csv` (snapshot inmutable del dataset original) y `backend/data/processed/telco_customer_churn_clean.csv` (dataset limpio, listo para el EDA y para cargarse en la base de datos).

## 6. Base de datos (Postgres vía Docker)

> 💡IMPORTANTE: Requiere **Docker Desktop** corriendo. Los comandos se ejecutan desde la raíz del repo (`proyecto5-grupo3/`), salvo que se indique lo contrario.

El proyecto usa Postgres para dos cosas: (1) almacenar el dataset de entrenamiento (tabla `customers`) y (2) dejar constancia de cada predicción que sirva la app en producción (tabla `app_predictions`), de cara a monitorización y a futuros reentrenamientos.

```bash
# Levanta Postgres (usa las credenciales de .env, ya versionado con valores de desarrollo)
docker compose up -d

# Comprobar que está sano
docker compose ps
```

Con Postgres arriba, cargar el dataset procesado (requiere haber ejecutado antes `01_preprocessing.py`):

```bash
cd backend
uv run python -m src.db.load_raw
```

El script crea las tablas si no existen (`customers`, `app_predictions`) y es idempotente: se puede volver a ejecutar sin duplicar filas (se salta los `customer_id` ya cargados).

Para apagar la base de datos manteniendo los datos (el volumen persiste):

```bash
docker compose down
```
