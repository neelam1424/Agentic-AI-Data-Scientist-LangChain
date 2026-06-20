from sklearn.linear_model import Ridge

class RidgeRegressionModel:
    def __init__(self):
        self.model = Ridge(alpha=1.0)

    def train(self, X_train, y_train):
        self.model.fit(X_train, y_train)

    def predict(self, X_test):
        return self.model.predict(X_test)
