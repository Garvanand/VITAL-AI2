import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load the dataset
df = pd.read_csv('cardio_train.csv', delimiter=';')

# Define feature columns
feature_columns = ['age', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 
                  'cholesterol', 'gluc', 'smoke', 'alco', 'active']

# Convert age from days to years
df['age'] = df['age'] // 365

# Split features and target
X = df[feature_columns]
y = df['cardio']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train the model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Save the model and preprocessors
joblib.dump(model, 'models/cardio_model.pkl')
joblib.dump(scaler, 'models/cardio_scaler.pkl')
joblib.dump(feature_columns, 'models/cardio_features.pkl')

# Print model accuracy
print(f"Model accuracy: {model.score(X_test_scaled, y_test):.4f}")
