from sklearn.cluster import KMeans

class KMeansModel:

    def __init__(self, n_clusters=2):
        self.model = KMeans(n_clusters=n_clusters, n_init=10)

    def fit(self, X):
        self.model.fit(X)
        return self.model.labels_