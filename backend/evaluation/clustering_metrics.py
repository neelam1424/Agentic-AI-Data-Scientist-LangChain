"""
evaluation/clustering_metrics.py — Evaluates clustering quality.
Currently uses Silhouette Score (higher = better, range [-1, 1]).
"""

from sklearn.metrics import silhouette_score


def evaluate_clustering(X, labels) -> dict:
    """
    Parameters
    ----------
    X      : scaled feature matrix
    labels : cluster label array from fit()

    Returns
    -------
    {"silhouette_score": float}
    """
    score = silhouette_score(X, labels)
    return {"silhouette_score": round(float(score), 4)}
