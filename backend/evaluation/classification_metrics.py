"""
evaluation/classification_metrics.py — Cross-validates a classification pipeline.
Returns mean F1-macro and std across folds.
"""

import numpy as np
from sklearn.model_selection import cross_val_score
from config import CV_FOLDS


def cross_validate_classifier(model, X, y, cv: int = CV_FOLDS) -> dict:
    """
    Parameters
    ----------
    model : sklearn estimator or Pipeline
    X     : feature matrix
    y     : target labels
    cv    : number of folds (default from config)

    Returns
    -------
    {"mean": float, "std": float, "all_scores": np.ndarray}
    """
    scores = cross_val_score(model, X, y, cv=cv, scoring="f1_macro")

    return {
        "mean":       float(np.mean(scores)),
        "std":        float(np.std(scores)),
        "all_scores": scores.tolist(),
    }
