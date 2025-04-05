import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load the dataset
df = pd.read_csv('diabetes_prediction_dataset.csv')

# Prepare features
feature_columns = ['gender', 'age', 'hypertension', 'heart_disease', 'smoking_history', 
                  'bmi', 'HbA1c_level', 'blood_glucose_level']

# Create label encoders for categorical variables
le_gender = LabelEncoder()
le_smoking = LabelEncoder()

# Transform categorical variables
df['gender'] = le_gender.fit_transform(df['gender'])
df['smoking_history'] = le_smoking.fit_transform(df['smoking_history'])

# Split features and target
X = df[feature_columns]
y = df['diabetes']

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
joblib.dump(model, 'models/diabetes_model.pkl')
joblib.dump(scaler, 'models/diabetes_scaler.pkl')
joblib.dump(le_gender, 'models/diabetes_le_gender.pkl')
joblib.dump(le_smoking, 'models/diabetes_le_smoking.pkl')
joblib.dump(feature_columns, 'models/diabetes_features.pkl')

# Print model accuracy
print(f"Model accuracy: {model.score(X_test_scaled, y_test):.4f}")
