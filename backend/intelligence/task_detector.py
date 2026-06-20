"""
intelligence/task_detector.py — Detects ML task type from the target array.

Rules (in order):
  1. No target provided          → clustering
  2. Target dtype is object/str  → classification
  3. Unique values ≤ threshold   → classification
  4. Unique ratio  < threshold   → classification
  5. Otherwise                   → classification (regression removed; not in syllabus)
"""

import numpy as np
from config import MAX_CLASSIFICATION_UNIQUE, MAX_CLASSIFICATION_RATIO


def detect_task_type(y) -> str:
    """
    Returns "classification" for all supervised tasks.
    Clustering is handled separately (always runs alongside classification).
    """
    if y is None:
        return "classification"

    y = np.asarray(y)

    # String target → classification
    if y.dtype == object:
        return "classification"

    n_unique = len(np.unique(y))
    n_total  = len(y)

    if n_unique <= MAX_CLASSIFICATION_UNIQUE:
        return "classification"

    if (n_unique / n_total) < MAX_CLASSIFICATION_RATIO:
        return "classification"

    # Default — treat as classification (regression not in scope)
    return "classification"
