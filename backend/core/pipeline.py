"""
core/pipeline.py — Master pipeline orchestrator (classification + clustering only).

run_pipeline() is the single entry point called by both:
  - main.py        (CLI)
  - api/routes.py  (FastAPI / frontend)
"""

from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

# Data
from data.loader import load_csv, load_builtin_breast_cancer

# Intelligence
from intelligence.dataset_analyzer import analyze_dataset
from intelligence.model_selector import (
    recommend_models,
    rank_models,
    select_best_model,
    explain_model_choice,
)

# Models
from models.registry import CLASSIFICATION_MODELS
from models.clustering.kmeans import KMeansModel
from models.clustering.hierarchical import HierarchicalModel

# Preprocessing
from preprocessing.pipeline import build_pipeline

# Evaluation
from evaluation.classification_metrics import cross_validate_classifier
from evaluation.clustering_metrics import evaluate_clustering

# Agent — LangChain + Claude implementation
from agent.llm_agent_langchain import generate_agent_report

from config import DEFAULT_N_CLUSTERS



def _run_classification(X, y, analysis: dict) -> tuple[dict, str]:
    recommended = recommend_models(analysis)
    print("Recommended Models:", recommended)

    results = {}
    for name in recommended:
        if name not in CLASSIFICATION_MODELS:
            continue
        pipeline = build_pipeline(CLASSIFICATION_MODELS[name])
        scores   = cross_validate_classifier(pipeline, X, y)
        results[name] = scores
        print(f"  {name:<30} F1: {scores['mean']:.4f}  Std: {scores['std']:.4f}")

    ranked      = rank_models(results)
    best        = select_best_model(results)
    explanation = explain_model_choice(results, best)

    print("\n=== MODEL RANKING ===")
    for i, (name, m) in enumerate(ranked, 1):
        print(f"  {i}. {name:<30} F1: {m['mean']:.4f}  Std: {m['std']:.4f}")
    print(f"\n>>> BEST MODEL: {best}")
    print(explanation)

    return results, best



def _run_clustering(X) -> dict:
    # Impute then scale before clustering
    X_clean  = SimpleImputer(strategy="mean").fit_transform(X)
    X_scaled = StandardScaler().fit_transform(X_clean)

    k_labels = KMeansModel(n_clusters=DEFAULT_N_CLUSTERS).fit(X_scaled)
    k_eval   = evaluate_clustering(X_scaled, k_labels)

    h_labels = HierarchicalModel(n_clusters=DEFAULT_N_CLUSTERS).fit(X_scaled)
    h_eval   = evaluate_clustering(X_scaled, h_labels)

    best = "K-Means" if k_eval["silhouette_score"] >= h_eval["silhouette_score"] else "Hierarchical"

    print(f"  K-Means      Silhouette: {k_eval['silhouette_score']:.4f}")
    print(f"  Hierarchical Silhouette: {h_eval['silhouette_score']:.4f}")
    print(f"  >>> Best Clustering: {best}")

    return {"kmeans": k_eval, "hierarchical": h_eval, "best": best}


def run_pipeline(csv_path: str = None, target_col: str = None) -> dict:
    """
    Run the full pipeline: load → analyse → classify → cluster → report.
    Returns a structured dict consumed by main.py and api/routes.py.
    """
    print("\n########################################")
    print("   AGENTIC AI DATA SCIENTIST")
    print("########################################")

    # 1. Load
    if csv_path:
        X, y, df, target_col = load_csv(csv_path, target_col)
    else:
        X, y, df, target_col = load_builtin_breast_cancer()

    # 2. Analyse
    analysis = analyze_dataset(df, target_col=target_col, y=y)

    print("\n--- DATASET ANALYSIS ---")
    for k, v in analysis.items():
        print(f"  {k:<25}: {v}")

    # 3. Classification
    print("\n==============================")
    print(" CLASSIFICATION ENGINE")
    print("==============================")
    supervised_results, best_model = _run_classification(X, y, analysis)

    # 4. Clustering (always runs)
    print("\n==============================")
    print(" CLUSTERING ENGINE")
    print("==============================")
    clustering_results = _run_clustering(X)

    # 5. LLM agent report
    print("\n==============================")
    print(" AGENT ANALYSIS REPORT")
    print("==============================")
    report = generate_agent_report(
        task="classification",
        analysis=analysis,
        supervised_results=supervised_results,
        best_model=best_model,
        clustering_results=clustering_results,
    )
    print(report)

    print("\n==============================")
    print(" SYSTEM EXECUTION COMPLETE")
    print("==============================")

    return {
        "task":               "classification",
        "analysis":           analysis,
        "supervised_results": supervised_results,
        "best_model":         best_model,
        "clustering_results": clustering_results,
        "agent_report":       report,
    }
