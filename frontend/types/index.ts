// types/index.ts — Mirrors the backend run_pipeline() return dict

export interface DatasetAnalysis {
  num_rows: number
  num_cols: number
  missing_values: number
  missing_ratio: number
  num_numeric: number
  num_categorical: number
  numeric_ratio: number
  size: "small" | "medium" | "large"
  target_column: string
  target_unique_values: number
  target_dtype: string
  task_type: "classification"
}

export interface ClassificationMetrics {
  mean: number
  std: number
  all_scores: number[]
}

export interface ClusteringResults {
  kmeans: { silhouette_score: number }
  hierarchical: { silhouette_score: number }
  best: string
}

export interface PipelineResult {
  task: "classification"
  analysis: DatasetAnalysis
  supervised_results: Record<string, ClassificationMetrics>
  best_model: string
  clustering_results: ClusteringResults
  agent_report: string
}
