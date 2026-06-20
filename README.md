# Agentic AI Data Scientist

An end-to-end automated machine learning web application built for the KDD course project. Upload any CSV dataset and the system automatically detects the task, trains and evaluates multiple ML models, performs clustering analysis, and generates an AI-powered insight report via the Gemini API.

---

## Project Structure

```
agentic-ai-data-scientist/
├── backend/                  # FastAPI Python server
│   ├── agent/                # Gemini LLM report generation
│   ├── api/                  # REST API routes
│   ├── core/                 # Pipeline orchestrator
│   ├── data/                 # CSV loader utilities
│   ├── evaluation/           # Classification & clustering metrics
│   ├── intelligence/         # Dataset analyzer & model selector
│   ├── models/               # ML model definitions (classification, clustering)
│   ├── preprocessing/        # Scikit-learn pipeline builder
│   ├── app.py                # FastAPI app entry point
│   ├── config.py             # Configuration & environment variables
│   ├── .env                  # API keys (not committed — see setup below)
│   └── venv/                 # Python virtual environment
└── frontend/                 # Next.js TypeScript frontend
    ├── app/                  # Next.js app router pages
    ├── components/           # React UI components
    ├── lib/                  # Utility functions
    └── types/                # TypeScript type definitions
```

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** and **npm**
- A **Gemini API key** (free tier at [Google AI Studio](https://aistudio.google.com/))

---

## Setup & Installation

### 1. Clone / Download the Project

Place the `agentic-ai-data-scientist` folder somewhere on your machine.

### 2. Backend Setup

```bash
cd agentic-ai-data-scientist/backend
```

**Create and activate a virtual environment:**

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

**Install dependencies:**

```bash
pip install fastapi uvicorn python-dotenv python-multipart \
            scikit-learn pandas numpy scipy \
            google-genai
```

**Configure your API key:**

Open `backend/.env` and replace the placeholder with your real key:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Frontend Setup

```bash
cd agentic-ai-data-scientist/frontend
npm install
```

---

## Running the Application

You need **two terminals** running at the same time — one for the backend and one for the frontend.

### Terminal 1 — Start the Backend

```bash
cd agentic-ai-data-scientist/backend
source venv/bin/activate   # Windows: venv\Scripts\activate
uvicorn app:app --reload
```

The backend API will be available at: `http://localhost:8000`

### Terminal 2 — Start the Frontend

```bash
cd agentic-ai-data-scientist/frontend
npm run dev
```

Open your browser and go to: `http://localhost:3000`

---

## How to Use

1. **Open** `http://localhost:3000` in your browser.
2. **Upload a CSV file** by dragging and dropping it onto the upload area, or clicking to browse.
3. **(Optional)** Specify the target column name. If left blank, the last column is used automatically.
4. **Click Analyze** — the pipeline runs automatically:
   - Dataset analysis (shape, missing values, class distribution)
   - Task detection (classification)
   - Model training with 5-fold cross-validation (Logistic Regression, KNN, Naive Bayes, Decision Tree, Random Forest)
   - Clustering (K-Means vs Hierarchical, silhouette score comparison)
   - AI-generated report via Gemini (falls back to a rule-based report if API is unavailable)
5. **View results** — model rankings, metrics, clustering scores, and the full AI report are displayed in the dashboard.

---

## KDD Pipeline Phases

| Phase | What Happens |
|-------|-------------|
| **Data Collection** | CSV uploaded via the web interface |
| **Preprocessing** | Missing value imputation (mean), standard scaling |
| **Task Detection** | Auto-detects classification vs regression based on target column cardinality |
| **Model Selection** | Recommends models based on dataset size and dimensionality |
| **Training & Evaluation** | 5-fold cross-validation, F1-score (macro), std deviation |
| **Clustering** | K-Means and Hierarchical clustering with silhouette scoring |
| **Knowledge Discovery** | Gemini LLM generates a structured analysis report |

---

## API Endpoint

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/analyze` | Upload a CSV file and receive full ML pipeline results as JSON |

**Request:** `multipart/form-data` with fields:
- `file` — the CSV file
- `target_col` *(optional)* — name of the target column

**Response:** JSON containing `task`, `analysis`, `supervised_results`, `best_model`, `clustering_results`, and `agent_report`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| UI Components | Radix UI, Recharts, Framer Motion |
| Backend | FastAPI, Uvicorn, Python 3.13 |
| ML | scikit-learn (Logistic Regression, KNN, Naive Bayes, Decision Tree, Random Forest) |
| LLM | Google Gemini API (`google-genai`) |
| Data | pandas, NumPy, SciPy |

---

## Troubleshooting

**Backend won't start — `ModuleNotFoundError`**
Make sure your virtual environment is activated and all packages are installed.

**Gemini API errors / quota exceeded**
The system automatically falls back to a rule-based report generator — results will still appear, just without the LLM narrative.

**Frontend can't reach the backend**
Ensure the backend is running on port `8000`. CORS is open to all origins in development mode.

**CSV upload fails**
Only `.csv` files are accepted. Make sure your file has a header row and at least one numeric target column.
