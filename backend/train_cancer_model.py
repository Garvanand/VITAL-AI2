import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load the dataset
df = pd.read_csv('The_Cancer_data_1500_V2.csv')

# Define feature columns
feature_columns = ['Gender', 'Age', 'BMI', 'Smoking', 'GeneticRisk', 'PhysicalActivity', 
                  'AlcoholIntake', 'CancerHistory']

# Initialize label encoders for categorical variables
encoders = {
    'gender': LabelEncoder(),
    'smoking': LabelEncoder(),
    'genetic_risk': LabelEncoder(),
    'activity': LabelEncoder(),
    'alcohol': LabelEncoder(),
    'cancer_history': LabelEncoder()
}

# Transform categorical variables
df['Gender'] = encoders['gender'].fit_transform(df['Gender'])
df['Smoking'] = encoders['smoking'].fit_transform(df['Smoking'])
df['GeneticRisk'] = encoders['genetic_risk'].fit_transform(df['GeneticRisk'])
df['PhysicalActivity'] = encoders['activity'].fit_transform(df['PhysicalActivity'])
df['AlcoholIntake'] = encoders['alcohol'].fit_transform(df['AlcoholIntake'])
df['CancerHistory'] = encoders['cancer_history'].fit_transform(df['CancerHistory'])

# Split features and target
X = df[feature_columns]
y = df['Diagnosis']

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
joblib.dump(model, 'models/cancer_model.pkl')
joblib.dump(scaler, 'models/cancer_scaler.pkl')
joblib.dump(encoders, 'models/cancer_encoders.pkl')
joblib.dump(feature_columns, 'models/cancer_features.pkl')

# Print model accuracy
print(f"Model accuracy: {model.score(X_test_scaled, y_test):.4f}")
