from sklearn.cluster import AgglomerativeClustering

class HierarchicalModel:

    def __init__(self, n_clusters=2):
        self.model = AgglomerativeClustering(n_clusters=n_clusters)

    def fit(self, X):
        return self.model.fit_predict(X)