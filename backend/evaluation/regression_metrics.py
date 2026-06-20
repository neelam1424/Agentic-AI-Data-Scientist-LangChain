"""
evaluation/regression_metrics.py — Cross-validates a regression pipeline.
Returns MAE, RMSE, and R² (mean + std) across folds.
"""

import numpy as np
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from config import CV_FOLDS


def cross_validate_regressor(model, X, y, cv: int = CV_FOLDS) -> dict:
    """
    Parameters
    ----------
    model : sklearn estimator or Pipeline
    X     : feature matrix
    y     : continuous target
    cv    : number of folds (default from config)

    Returns
    -------
    {
      "r2":   {"mean": float, "std": float, "all_scores": list},
      "mae":  {"mean": float, "std": float, "all_scores": list},
      "rmse": {"mean": float, "std": float, "all_scores": list},
    }
    """
    kf = KFold(n_splits=cv, shuffle=True, random_state=42)

    mae_scores, rmse_scores, r2_scores = [], [], []

    for train_idx, test_idx in kf.split(X):
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        mae_scores.append(mean_absolute_error(y_test, y_pred))
        rmse_scores.append(float(np.sqrt(mean_squared_error(y_test, y_pred))))
        r2_scores.append(r2_score(y_test, y_pred))

    def _stats(scores):
        return {
            "mean":       round(float(np.mean(scores)), 4),
            "std":        round(float(np.std(scores)),  4),
            "all_scores": [round(s, 4) for s in scores],
        }

    return {
        "r2":   _stats(r2_scores),
        "mae":  _stats(mae_scores),
        "rmse": _stats(rmse_scores),
    }
