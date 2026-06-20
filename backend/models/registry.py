"""
models/registry.py — All ML models used in the project.

Syllabus coverage:
  KNN               → Week 5
  Naive Bayes       → Week 6
  Decision Tree     → Week 7  (CART)
  Random Forest     → Week 8
  Logistic Regression → Week 12

Clustering (always runs alongside classification):
  K-Means           → Week 11
  Hierarchical      → Week 11
"""

from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier


CLASSIFICATION_MODELS: dict = {
    "Logistic Regression": LogisticRegression(max_iter=300),
    "KNN":                 KNeighborsClassifier(),
    "Naive Bayes":         GaussianNB(),
    "Decision Tree":       DecisionTreeClassifier(),
    "Random Forest":       RandomForestClassifier(n_estimators=100),
}
