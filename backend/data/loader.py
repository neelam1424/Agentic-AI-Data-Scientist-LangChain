"""
data/loader.py — Loads any CSV file into (X, y, df, target_col).

Handles:
  - String targets        → LabelEncoder
  - Continuous targets    → auto-binned into 3 classes (Low / Medium / High)
  - Categorical features  → LabelEncoder
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# If target has more than this many unique values it is treated as continuous
_CONTINUOUS_THRESHOLD = 20


def _is_continuous(series: pd.Series) -> bool:
    """Return True if the series looks like a continuous numeric target."""
    if not pd.api.types.is_numeric_dtype(series):
        return False
    n_unique = series.nunique()
    n_total  = len(series)
    return n_unique > _CONTINUOUS_THRESHOLD and (n_unique / n_total) > 0.05


def _bin_continuous(series: pd.Series) -> np.ndarray:
    """
    Bin a continuous target into 3 equal-frequency classes:
      0 = Low  |  1 = Medium  |  2 = High
    Falls back to 2 bins if not enough distinct values for 3.
    """
    for n_bins in (3, 2):
        try:
            binned = pd.qcut(series, q=n_bins, labels=False, duplicates="drop")
            if binned.nunique() >= 2:
                labels = {0: "Low", 1: "Medium", 2: "High"}[:n_bins]
                print(
                    f"Continuous target auto-binned into {n_bins} classes: "
                    + " | ".join(f"{v}={labels.get(v, v)}" for v in sorted(binned.unique()))
                )
                return binned.values.astype(float)
        except Exception:
            continue
    # Last resort: median split → binary
    median = series.median()
    print(f"Continuous target binarised at median ({median:.2f}): 0=Low, 1=High")
    return (series >= median).astype(float).values


def load_csv(file_path: str, target_col: str = None):
    """
    Load a CSV from any path on disk.

    Returns
    -------
    X          : np.ndarray    — feature matrix (float)
    y          : np.ndarray    — target array   (float, discrete classes)
    df         : pd.DataFrame  — full raw dataframe
    target_col : str           — name of the target column used
    """
    df = pd.read_csv(file_path)
    print(f"Loaded: {file_path}  |  Shape: {df.shape}")

    # Resolve target column
    if not target_col or target_col not in df.columns:
        target_col = df.columns[-1]
        print(f"Target column not specified — using last column: '{target_col}'")

    X_df  = df.drop(columns=[target_col])
    y_raw = df[target_col]

    # ── Encode target ──────────────────────────────────────────────────────────
    if _is_continuous(y_raw):
        # Continuous numeric → bin into classes
        y = _bin_continuous(y_raw)

    else:
        # Try direct float conversion; fall back to LabelEncoder for strings
        try:
            y = y_raw.astype(float).values
        except (ValueError, TypeError):
            le = LabelEncoder()
            y  = le.fit_transform(y_raw.astype(str)).astype(float)
            print(f"Target encoded: {dict(zip(le.classes_, le.transform(le.classes_)))}")

    # ── Encode non-numeric feature columns ────────────────────────────────────
    for col in X_df.columns:
        if not pd.api.types.is_numeric_dtype(X_df[col]):
            X_df[col] = LabelEncoder().fit_transform(X_df[col].astype(str))

    X = X_df.values.astype(float)
    return X, y, df, target_col


def load_builtin_breast_cancer():
    """Fallback built-in dataset for quick testing."""
    from sklearn.datasets import load_breast_cancer
    data = load_breast_cancer()
    df   = pd.DataFrame(data.data, columns=data.feature_names)
    df["target"] = data.target
    print("Loaded built-in: breast_cancer  |  Shape:", df.shape)
    return data.data, data.target.astype(float), df, "target"
