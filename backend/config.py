"""
config.py — Central configuration for the Agentic AI Data Scientist.
All constants, thresholds, and environment variables live here.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── Gemini LLM ────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = "gemini-2.0-flash-lite"

# ── Anthropic / Claude LLM (LangChain) ───────────────────────────────────────
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL      = "claude-opus-4-8"

# ── Cross-validation ──────────────────────────────────────────────────────────
CV_FOLDS = 5

# ── Task detection thresholds ─────────────────────────────────────────────────
# Target with <= MAX_CLASSIFICATION_UNIQUE unique values → classification
MAX_CLASSIFICATION_UNIQUE = 20
# OR target unique-value ratio < this fraction → classification
MAX_CLASSIFICATION_RATIO  = 0.05

# ── Dataset size labels ───────────────────────────────────────────────────────
SIZE_SMALL_THRESHOLD  = 1_000
SIZE_MEDIUM_THRESHOLD = 10_000

# ── Model recommendation thresholds ──────────────────────────────────────────
HIGH_DIMENSION_THRESHOLD = 20      # cols > this → add tree/forest models
HIGH_MISSING_THRESHOLD   = 0.10   # missing ratio > this → add Random Forest

# ── Clustering ────────────────────────────────────────────────────────────────
DEFAULT_N_CLUSTERS = 2
