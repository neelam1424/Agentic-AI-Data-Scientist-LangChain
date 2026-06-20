# Agentic AI Data Scientist

An end-to-end automated machine learning web application built for the KDD course project. Upload any CSV dataset and the system automatically detects the task, trains and evaluates multiple ML models, performs clustering analysis, and generates an AI-powered insight report via **LangChain + Claude (Anthropic)**.

---


## 🎥 Project Demo

<video src="https://github.com/user-attachments/assets/09061e41-7d3d-4ac1-bc75-f63650dc6888" controls width="100%"></video>



The video file is included in this repository: [`Agentic AI scientist.mp4`](./Agentic%20AI%20scientist.mp4)

---

## Features

- **Drag-and-drop CSV upload** with optional target column selection
- **Auto task detection** — classifies as classification or regression based on target column cardinality
- **Automated model training** — Logistic Regression, KNN, Naive Bayes, Decision Tree, Random Forest with 5-fold cross-validation
- **Clustering analysis** — K-Means vs Hierarchical Clustering with silhouette scoring
- **AI-generated report** — powered by LangChain + Claude (`claude-opus-4-8`) with automatic fallback
- **Interactive dashboard** — model rankings, metrics charts, clustering scores, and full markdown report

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **UI Components** | Radix UI, Recharts, Framer Motion |
| **Backend** | FastAPI, Uvicorn, Python 3.9+ |
| **ML** | scikit-learn (classification + clustering) |
| **LLM Framework** | LangChain (`langchain`, `langchain-anthropic`, `langchain-core`) |
| **LLM Model** | Anthropic Claude (`claude-opus-4-8`) via LangChain |
| **Data** | pandas, NumPy, SciPy |

---

## LangChain + Claude Integration

The AI report generation uses **6 LangChain features** chained together:

```
ChatPromptTemplate  →  ChatAnthropic (claude-opus-4-8)  →  StrOutputParser
                              ↓ (on any error)
                       RunnableLambda (rule-based fallback)
```

| # | Feature | What it does |
|---|---------|-------------|
| 1 | `ChatAnthropic` | Official LangChain wrapper for Anthropic / Claude |
| 2 | `ChatPromptTemplate` | Reusable system + human prompt with named `{variables}` |
| 3 | LCEL pipe operator `\|` | Chains components declaratively: `prompt \| llm \| parser` |
| 4 | `StrOutputParser` | Extracts the plain-text string from the Claude response |
| 5 | `RunnableLambda` | Wraps the rule-based fallback function as a LangChain Runnable |
| 6 | `RunnableWithFallbacks` | Auto-retries with fallback if Claude API is unavailable |

Implementation: [`backend/agent/llm_agent_langchain.py`](./backend/agent/llm_agent_langchain.py)

---

## Project Structure

```
agentic-ai-data-scientist/
├── backend/                        # FastAPI Python server
│   ├── agent/
│   │   ├── llm_agent_langchain.py  # LangChain + Claude report generator ← NEW
│   │   └── llm_agent.py            # Original Gemini direct-API version
│   ├── api/
│   │   └── routes.py               # POST /analyze endpoint
│   ├── core/
│   │   └── pipeline.py             # Master pipeline orchestrator
│   ├── data/                       # CSV loader utilities
│   ├── evaluation/                 # Classification & clustering metrics
│   ├── intelligence/               # Dataset analyzer & model selector
│   ├── models/                     # ML model definitions
│   │   ├── classification/         # LR, KNN, NB, DT, RF
│   │   ├── clustering/             # K-Means, Hierarchical
│   │   └── regression/             # Linear, Ridge, DT, RF regressors
│   ├── preprocessing/              # scikit-learn pipeline builder
│   ├── app.py                      # FastAPI app entry point
│   ├── config.py                   # API keys & configuration
│   ├── .env                        # API keys (not committed — see setup)
│   └── test_*.csv                  # Sample datasets for testing
└── frontend/                       # Next.js TypeScript frontend
    ├── app/                        # Next.js app router
    ├── components/
    │   ├── upload/                 # File upload UI
    │   ├── results/                # Dashboard tabs
    │   └── ui/                     # Radix UI components
    ├── lib/                        # API utilities
    └── types/                      # TypeScript type definitions
```

---

## Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**
- An **Anthropic API key** — get one free at [console.anthropic.com](https://console.anthropic.com)

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agentic-ai-data-scientist.git
cd agentic-ai-data-scientist
```

### 2. Backend Setup

```bash
cd backend
```

**Create and activate a virtual environment:**

```bash
python3 -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

**Install all dependencies:**

```bash
pip install fastapi uvicorn python-dotenv python-multipart \
            scikit-learn pandas numpy scipy google-genai \
            langchain langchain-anthropic langchain-core
```

**Configure your API key:**

Create `backend/.env` (or edit the existing one):

```env
ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# Optional — only needed if using the legacy Gemini agent
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## Running the Application

You need **two terminals** running simultaneously.

### Terminal 1 — Backend

```bash
cd backend
source venv/bin/activate        # Windows: venv\Scripts\activate
uvicorn app:app --reload
```

API available at: `http://localhost:8000`

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Open your browser at: `http://localhost:3000`

---

## How to Use

1. Open `http://localhost:3000`
2. **Upload a CSV file** — drag and drop or click to browse
   - Sample files are in `backend/`: `test_classification_iris.csv`, `test_classification_wine.csv`, `test_regression_diabetes.csv`
3. **(Optional)** Enter the target column name — leave blank to use the last column automatically
4. Click **Analyze** — the full pipeline runs:
   - Dataset analysis (shape, missing values, class distribution)
   - Auto task detection (classification or regression)
   - Model training with 5-fold cross-validation
   - Clustering (K-Means vs Hierarchical with silhouette scoring)
   - AI report generated via LangChain + Claude
5. **View results** — model rankings, metric charts, clustering scores, and full AI report

---

## KDD Pipeline Phases

| Phase | What Happens |
|-------|-------------|
| **Data Collection** | CSV uploaded via the web interface |
| **Preprocessing** | Missing value imputation (mean), standard scaling |
| **Task Detection** | Auto-detects classification vs regression from target column |
| **Model Selection** | Recommends models based on dataset size and dimensionality |
| **Training & Evaluation** | 5-fold cross-validation, F1-score (macro), std deviation |
| **Clustering** | K-Means and Hierarchical clustering with silhouette scoring |
| **Knowledge Discovery** | LangChain + Claude generates a structured insight report |

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/analyze` | Upload a CSV and receive full ML pipeline results as JSON |

**Request:** `multipart/form-data`
- `file` — the CSV file
- `target_col` *(optional)* — name of the target column

**Response JSON fields:**

| Field | Description |
|-------|-------------|
| `task` | Detected task type (`"classification"` or `"regression"`) |
| `analysis` | Dataset metadata (rows, cols, missing values, etc.) |
| `supervised_results` | Per-model cross-validation scores (mean F1, std) |
| `best_model` | Name of the best-performing model |
| `clustering_results` | Silhouette scores for K-Means and Hierarchical |
| `agent_report` | Full markdown report generated by Claude via LangChain |

---

## Troubleshooting

**`ModuleNotFoundError` on backend start**
Make sure your virtual environment is activated and all packages are installed.

**Anthropic API errors / invalid key**
Double-check `ANTHROPIC_API_KEY` in `backend/.env`. The system automatically falls back to a rule-based report if the API is unavailable.

**Frontend can't reach the backend**
Ensure the backend is running on port `8000`. CORS is open to all origins in development.

**CSV upload fails**
Only `.csv` files are accepted. The file must have a header row and at least one numeric column.

**Python 3.9 compatibility**
This project uses Python 3.9. Type hints using `X | Y` union syntax (Python 3.10+) have been patched to use compatible alternatives.

---

## Switching Between LLM Backends

The project ships with two agent implementations:

| File | LLM | Framework |
|------|-----|-----------|
| `agent/llm_agent_langchain.py` | Claude (`claude-opus-4-8`) | LangChain ← **active** |
| `agent/llm_agent.py` | Gemini (`gemini-2.5-flash`) | Direct API |

To switch, change one line in `backend/core/pipeline.py`:

```python
# Use LangChain + Claude (default)
from agent.llm_agent_langchain import generate_agent_report

# Use direct Gemini API
from agent.llm_agent import generate_agent_report
```

---

## Authors

- **Neelam More** — KDD Course Project

---

## License

This project is for academic purposes as part of a KDD (Knowledge Discovery in Databases) course.
