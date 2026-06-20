"""
agent/llm_agent.py

Tries Gemini models in order. If all are quota-exhausted or unavailable,
falls back to a fully rule-based report generated from the actual metrics.
The frontend always receives a complete, readable report.
"""

from google import genai
from config import GEMINI_API_KEY

_client = genai.Client(api_key=GEMINI_API_KEY)

# Try models from newest to oldest free-tier model
_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]



def _silhouette_label(score: float) -> str:
    if score >= 0.5:
        return "good"
    if score >= 0.25:
        return "moderate"
    return "weak"


def _generate_fallback_report(
    analysis: dict,
    supervised_results: dict,
    best_model: str,
    clustering_results: dict,
) -> str:
    """
    Generates a structured analysis report purely from metric values.
    Used when the Gemini API is unavailable.
    """
    rows = analysis.get("num_rows", "?")
    cols = analysis.get("num_cols", "?")
    target = analysis.get("target_column", "?")
    size = analysis.get("size", "?")
    missing_ratio = analysis.get("missing_ratio", 0)
    n_classes = analysis.get("target_unique_values", "?")

    # Sort models by F1
    ranked = sorted(
        supervised_results.items(),
        key=lambda x: x[1].get("mean", 0),
        reverse=True
    )

    best_m   = supervised_results.get(best_model, {})
    best_f1  = best_m.get("mean", 0)
    best_std = best_m.get("std", 0)
    best_stability = best_f1 - 0.5 * best_std

    # Clustering
    k_score = clustering_results["kmeans"]["silhouette_score"]
    h_score = clustering_results["hierarchical"]["silhouette_score"]
    best_cluster = clustering_results["best"]

    lines = []

    lines.append("# AI Data Scientist — Analysis Report")
    lines.append("")

    # ── 1. Dataset Summary ────────────────────────────────────────────────────
    lines.append("## 1. Dataset Overview")
    lines.append(f"- **Rows:** {rows}  |  **Features:** {cols}  |  **Size category:** {size}")
    lines.append(f"- **Target column:** `{target}`  |  **Classes:** {n_classes}")
    lines.append(f"- **Missing values:** {missing_ratio * 100:.1f}% of cells")
    lines.append(f"- **Task:** Classification (KDD pipeline)")
    lines.append("")

    # ── 2. Best Model Selection ───────────────────────────────────────────────
    lines.append("## 2. Best Model — Why Was It Selected?")
    lines.append(f"**Selected: {best_model}**")
    lines.append("")
    lines.append(
        f"Using 5-Fold Cross-Validation, `{best_model}` achieved the highest "
        f"**stability-adjusted F1 score** of **{best_stability:.4f}** "
        f"(Mean F1 = {best_f1:.4f}, Std = {best_std:.4f})."
    )
    lines.append("")
    lines.append(
        "The selection formula penalises models with high variance across folds: "
        "`score = mean_F1 − 0.5 × std`. This ensures the chosen model is not only "
        "accurate but also **consistent** on unseen data."
    )
    lines.append("")

    # ── 3. Model Comparison ───────────────────────────────────────────────────
    lines.append("## 3. Model Comparison")
    lines.append("")
    lines.append("| Rank | Model | Mean F1 | Std Dev | Stability |")
    lines.append("|------|-------|---------|---------|-----------|")
    for i, (name, m) in enumerate(ranked, 1):
        f1  = m.get("mean", 0)
        std = m.get("std", 0)
        marker = " ★" if name == best_model else ""
        lines.append(f"| {i} | {name}{marker} | {f1:.4f} | {std:.4f} | {f1 - 0.5*std:.4f} |")
    lines.append("")

    # Brief per-model comment
    for name, m in ranked:
        f1  = m.get("mean", 0)
        std = m.get("std", 0)
        if name == "Logistic Regression":
            note = "Linear decision boundary; works best when classes are linearly separable."
        elif name == "KNN":
            note = "Instance-based; sensitive to feature scale (handled by StandardScaler in pipeline)."
        elif name == "Naive Bayes":
            note = "Fast, probabilistic; assumes feature independence — good baseline."
        elif name == "Decision Tree":
            note = "Interpretable; prone to overfitting without pruning."
        elif name == "Random Forest":
            note = "Ensemble of trees; robust to noise and high-dimensional data."
        else:
            note = ""
        lines.append(f"- **{name}** (F1 {f1:.4f}): {note}")
    lines.append("")

    # ── 4. Clustering Analysis ────────────────────────────────────────────────
    lines.append("## 4. Clustering Quality (Unsupervised View)")
    lines.append("")
    lines.append(
        f"Both K-Means and Hierarchical Clustering were applied to the same dataset "
        f"to understand its natural grouping structure."
    )
    lines.append("")
    lines.append(f"| Algorithm | Silhouette Score | Quality |")
    lines.append(f"|-----------|-----------------|---------|")
    lines.append(f"| K-Means | {k_score:.4f} | {_silhouette_label(k_score).capitalize()} |")
    lines.append(f"| Hierarchical | {h_score:.4f} | {_silhouette_label(h_score).capitalize()} |")
    lines.append("")
    lines.append(
        f"**{best_cluster}** produced the higher silhouette score, meaning its clusters "
        f"are better separated. "
    )
    if max(k_score, h_score) >= 0.5:
        lines.append("The score indicates **well-defined clusters** — the data has clear natural groupings.")
    elif max(k_score, h_score) >= 0.25:
        lines.append("The score indicates **moderate cluster separation** — some overlap exists between groups.")
    else:
        lines.append(
            "The low score suggests the data does not cluster cleanly in this feature space. "
            "Feature engineering or dimensionality reduction may help."
        )
    lines.append("")

    # ── 5. Recommendations ───────────────────────────────────────────────────
    lines.append("## 5. Recommendations")
    lines.append("")
    lines.append(f"1. **Hyperparameter tuning** for `{best_model}` — grid search over key parameters.")

    if missing_ratio > 0.05:
        lines.append("2. **Handle missing values** — consider domain-specific imputation beyond mean fill.")
    else:
        lines.append("2. **Feature engineering** — create interaction features or polynomial terms.")

    lines.append("3. **Cross-validate on a held-out test set** for final performance estimate.")
    lines.append("4. **Try boosting** (AdaBoost, Gradient Boosting) for potential accuracy gains beyond Random Forest.")
    lines.append("5. **Visualise decision boundaries** for KNN and Decision Tree to build intuition.")
    lines.append("")

    # ── 6. Next Steps ────────────────────────────────────────────────────────
    lines.append("## 6. Suggested Next Steps")
    lines.append("")
    lines.append(f"- Deploy `{best_model}` as a REST endpoint for real-time predictions.")
    lines.append("- Collect more labelled data if the dataset is small — model performance scales with data.")
    lines.append("- Explore dimensionality reduction (PCA) before clustering to improve silhouette scores.")
    lines.append("- Document the KDD lifecycle phases: data collection → preprocessing → modelling → evaluation → deployment.")
    lines.append("")
    lines.append("---")
    lines.append("*Report generated by the Agentic AI Data Scientist pipeline.*")

    return "\n".join(lines)


# =============================================================================
# PUBLIC FUNCTION
# =============================================================================

def generate_agent_report(
    task: str,
    analysis: dict,
    supervised_results,
    best_model,
    clustering_results: dict,
) -> str:
    """
    Try Gemini models in order. Fall back to the rule-based report if all fail.
    """
    prompt = f"""
You are an expert AI Data Scientist. Analyze the ML pipeline results and provide a structured report.

DATASET OVERVIEW:
{analysis}

TASK: {task.upper()}

SUPERVISED LEARNING RESULTS:
{supervised_results}

BEST MODEL SELECTED: {best_model}

CLUSTERING RESULTS:
{clustering_results}

Your report must cover:
1. Why the best model was selected (cite specific metric values)
2. Comparison of all models trained — strengths and weaknesses
3. Clustering quality analysis (interpret silhouette scores: >0.5 good, 0.25-0.5 moderate, <0.25 poor)
4. Concrete recommendations for improving performance
5. Suggested next steps for deployment or further analysis

Use markdown formatting with numbered sections and bullet points.
"""

    # Try each Gemini model in order
    for model_name in _MODELS:
        try:
            response = _client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            print(f"Agent report generated via {model_name}")
            return response.text
        except Exception as e:
            print(f"  {model_name} unavailable: {e!s:.120}")
            continue

    # All Gemini models failed — use rule-based fallback
    print("All Gemini models unavailable — using rule-based fallback report.")
    return _generate_fallback_report(
        analysis=analysis,
        supervised_results=supervised_results or {},
        best_model=best_model or "",
        clustering_results=clustering_results,
    )
