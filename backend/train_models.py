import os
import subprocess

def run_training_scripts():
    # Create models directory if it doesn't exist
    if not os.path.exists('models'):
        os.makedirs('models')
    
    # List of training scripts
    training_scripts = [
        'train_diabetes_model.py',
        'train_cancer_model.py',
        'train_cardio_model.py'
    ]
    
    # Run each training script
    for script in training_scripts:
        print(f"\nRunning {script}...")
        subprocess.run(['python', script])
        print(f"Finished {script}")

if __name__ == '__main__':
    run_training_scripts()
