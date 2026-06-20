"""
intelligence/dataset_analyzer.py — Computes dataset statistics.
Does NOT detect task type — that is task_detector.py's job.
"""

import numpy as np
import pandas as pd
from config import SIZE_SMALL_THRESHOLD, SIZE_MEDIUM_THRESHOLD
from intelligence.task_detector import detect_task_type


def analyze_dataset(df: pd.DataFrame, target_col: str, y) -> dict:
    """
    Compute structural statistics for a dataset.

    Parameters
    ----------
    df         : full DataFrame (features + target column)
    target_col : name of the target column
    y          : target array (used for task detection + target stats)

    Returns
    -------
    dict with all analysis fields consumed by model_selector and the agent
    """
    X_df = df.drop(columns=[target_col])

    num_rows, num_cols = X_df.shape
    total_cells        = num_rows * num_cols
    total_missing      = X_df.isnull().sum().sum()

    numeric_cols     = X_df.select_dtypes(include=[np.number]).columns
    categorical_cols = X_df.select_dtypes(exclude=[np.number]).columns

    if num_rows < SIZE_SMALL_THRESHOLD:
        size = "small"
    elif num_rows < SIZE_MEDIUM_THRESHOLD:
        size = "medium"
    else:
        size = "large"

    return {
        # Shape
        "num_rows":      num_rows,
        "num_cols":      num_cols,
        # Aliases expected by model_selector
        "rows":          num_rows,
        "cols":          num_cols,
        # Missing
        "missing_values": int(total_missing),
        "missing_ratio":  round(total_missing / total_cells, 4) if total_cells > 0 else 0.0,
        # Column types
        "num_numeric":     len(numeric_cols),
        "num_categorical": len(categorical_cols),
        "numeric_ratio":   round(len(numeric_cols) / num_cols, 4) if num_cols > 0 else 1.0,
        # Size label
        "size":            size,
        # Target info
        "target_column":        target_col,
        "target_unique_values": int(len(np.unique(y))),
        "target_dtype":         str(pd.Series(y).dtype),
        # Task (detected here so callers only need the analysis dict)
        "task_type":            detect_task_type(y),
    }
