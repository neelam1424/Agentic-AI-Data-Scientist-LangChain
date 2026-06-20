"""
preprocessing/pipeline.py — Wraps any sklearn estimator in a standard
impute → scale → model pipeline so every model gets the same preprocessing.
"""

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import copy


def build_pipeline(model):
    """
    Wrap an sklearn estimator in: Imputer → StandardScaler → Model.

    Uses a deep copy so the registry estimator is never mutated between runs.

    Parameters
    ----------
    model : any sklearn estimator

    Returns
    -------
    sklearn.pipeline.Pipeline
    """
    return Pipeline([
        ("imputer", SimpleImputer(strategy="mean")),
        ("scaler",  StandardScaler()),
        ("model",   copy.deepcopy(model)),
    ])
