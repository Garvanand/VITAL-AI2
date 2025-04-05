from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
import os

app = Flask(__name__)
CORS(app)

# Global variables for models and preprocessors
models = {}
scalers = {}
encoders = {}
features = {}

def load_all_models():
    """Load all saved models and preprocessors"""
    try:
        # Load Diabetes model and preprocessors
        models['diabetes'] = joblib.load('models/diabetes_model.pkl')
        scalers['diabetes'] = joblib.load('models/diabetes_scaler.pkl')
        encoders['diabetes_gender'] = joblib.load('models/diabetes_le_gender.pkl')
        encoders['diabetes_smoking'] = joblib.load('models/diabetes_le_smoking.pkl')
        features['diabetes'] = joblib.load('models/diabetes_features.pkl')

        # Load Cancer model and preprocessors
        models['cancer'] = joblib.load('models/cancer_model.pkl')
        scalers['cancer'] = joblib.load('models/cancer_scaler.pkl')
        features['cancer'] = joblib.load('models/cancer_features.pkl')
        encoders['cancer'] = joblib.load('models/cancer_encoders.pkl')

        # Load Cardio model and preprocessors
        models['cardio'] = joblib.load('models/cardio_model.pkl')
        scalers['cardio'] = joblib.load('models/cardio_scaler.pkl')
        features['cardio'] = joblib.load('models/cardio_features.pkl')
        
        return True
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        return False

# Load models at startup
if not load_all_models():
    raise RuntimeError("Failed to load models. Please check if model files exist and are accessible.")

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Welcome to Medical Prediction API',
        'endpoints': {
            '/predict/diabetes': 'POST - Make diabetes predictions',
            '/predict/cancer': 'POST - Make cancer predictions',
            '/predict/cardio': 'POST - Make cardiovascular disease predictions',
            '/health': 'GET - Check API health status'
        }
    })

@app.route('/predict/diabetes', methods=['POST'])
def predict_diabetes():
    try:
        data = request.get_json()
        input_data = pd.DataFrame([data])
        
        # Preprocess
        input_data['gender'] = encoders['diabetes_gender'].transform([data['gender']])
        input_data['smoking_history'] = encoders['diabetes_smoking'].transform([data['smoking_history']])
        
        # Ensure correct column order
        input_data = input_data[features['diabetes']]
        
        # Scale
        input_scaled = scalers['diabetes'].transform(input_data)
        
        # Predict
        prediction = models['diabetes'].predict(input_scaled)[0]
        probability = models['diabetes'].predict_proba(input_scaled)[0][1]
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'message': 'Diabetes detected' if prediction == 1 else 'No diabetes detected'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict/cancer', methods=['POST'])
def predict_cancer():
    try:
        data = request.get_json()
        input_data = pd.DataFrame([data])
        
        # Apply encoding to categorical variables using global encoders
        input_data['Gender'] = encoders['cancer']['gender'].transform([data['Gender']])
        input_data['Smoking'] = encoders['cancer']['smoking'].transform([data['Smoking']])
        input_data['GeneticRisk'] = encoders['cancer']['genetic_risk'].transform([data['GeneticRisk']])
        input_data['CancerHistory'] = encoders['cancer']['cancer_history'].transform([data['CancerHistory']])
        
        # Convert numeric inputs
        input_data['Age'] = float(data['Age'])
        input_data['BMI'] = float(data['BMI'])
        input_data['PhysicalActivity'] = float(data['PhysicalActivity'])
        input_data['AlcoholIntake'] = float(data['AlcoholIntake'])
        
        # Ensure correct column order
        input_data = input_data[features['cancer']]
        
        # Scale features
        input_scaled = scalers['cancer'].transform(input_data)
        
        # Make prediction
        prediction = models['cancer'].predict(input_scaled)[0]
        probability = models['cancer'].predict_proba(input_scaled)[0][1]
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'message': 'Cancer risk detected' if prediction == 1 else 'No cancer risk detected'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict/cardio', methods=['POST'])
def predict_cardio():
    try:
        data = request.get_json()
        input_data = pd.DataFrame([data])
        
        # Ensure correct column order
        input_data = input_data[features['cardio']]
        
        # Scale features
        input_scaled = scalers['cardio'].transform(input_data)
        
        # Make prediction
        prediction = models['cardio'].predict(input_scaled)[0]
        probability = models['cardio'].predict_proba(input_scaled)[0][1]
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'message': 'Cardiovascular disease risk detected' if prediction == 1 else 'No cardiovascular disease risk detected'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'diabetes': 'diabetes' in models,
            'cancer': 'cancer' in models,
            'cardio': 'cardio' in models
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
