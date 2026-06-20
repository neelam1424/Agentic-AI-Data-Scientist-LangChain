from sklearn.tree import DecisionTreeClassifier

class DecisionTreeModel:
    def __init__(self):
        self.model=DecisionTreeClassifier()
    def train(self,X_train,y_train):
        self.model.fit(X_train,y_train)
    def predict(self,X_test):
        return self.model.predict(X_test)