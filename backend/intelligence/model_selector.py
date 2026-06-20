"""
intelligence/model_selector.py — AutoML intelligence layer (classification only).

All models are from the course syllabus:
  KNN (Wk 5) · Naive Bayes (Wk 6) · Decision Tree (Wk 7)
  Random Forest (Wk 8) · Logistic Regression (Wk 12)
"""

from config import HIGH_DIMENSION_THRESHOLD, HIGH_MISSING_THRESHOLD


def recommend_models(analysis: dict) -> list[str]:
    """
    Return a list of classification model names to train,
    chosen by dataset heuristics.
    """
    rows          = analysis.get("rows", 0)
    cols          = analysis.get("cols", 0)
    missing_ratio = analysis.get("missing_ratio", 0.0)
    numeric_ratio = analysis.get("numeric_ratio", 1.0)

    models = set()

    # Always include these two safe baselines
    models.update(["Logistic Regression", "Naive Bayes"])

    if rows < 1_000:
        models.update(["KNN", "Decision Tree"])
    elif rows < 10_000:
        models.update(["Random Forest", "Decision Tree"])
    else:
        models.add("Random Forest")

    if cols > HIGH_DIMENSION_THRESHOLD:
        models.update(["Random Forest", "Logistic Regression"])

    if missing_ratio > HIGH_MISSING_THRESHOLD:
        models.add("Random Forest")   # robust to missing values

    if numeric_ratio > 0.9:
        models.add("KNN")             # works best on all-numeric data

    return list(models)



def rank_models(results: dict) -> list[tuple]:
    """Sort models by mean F1-macro (descending)."""
    return sorted(results.items(), key=lambda x: x[1].get("mean", 0), reverse=True)


def select_best_model(results: dict) -> str:
    """
    Pick the model with the best stability-adjusted score:
        score = mean_F1 − 0.5 × std_F1
    Penalises models that vary a lot across folds.
    """
    best_name  = None
    best_score = float("-inf")

    for name, metrics in results.items():
        mean  = metrics.get("mean", 0)
        std   = metrics.get("std",  0)
        score = mean - 0.5 * std
        if score > best_score:
            best_score = score
            best_name  = name

    return best_name



def explain_model_choice(results: dict, best_model: str) -> str:
    """Generate a human-readable selection report."""
    metrics = results.get(best_model, {})
    mean    = metrics.get("mean", 0)
    std     = metrics.get("std",  0)

    return f"""
MODEL SELECTION REPORT
==============================
Task Type      : Classification
Selected Model : {best_model}

5-Fold Cross-Validation Results:
  Mean F1   : {mean:.4f}
  Std Dev   : {std:.4f}
  Stability : {mean - 0.5 * std:.4f}

Why selected:
  - Best stability-adjusted F1 across all folds
  - Low variance → consistent performance on unseen data

Recommendations:
  - Tune hyperparameters for further improvement
  - Try ensemble stacking for additional robustness
"""
