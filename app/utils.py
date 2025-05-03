import os
import torch
from pathlib import Path
import tempfile


def get_device():
    """Get the device to use (CPU or CUDA)."""
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def ensure_directory_exists(directory):
    """Ensure that the directory exists."""
    os.makedirs(directory, exist_ok=True)


def save_uploaded_file(file):
    """Save an uploaded file temporarily and return the path."""
    # Create temp file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    temp_file.close()
    
    # Write the contents
    with open(temp_file.name, 'wb') as f:
        f.write(file.file.read())
    
    return temp_file.name


def interpret_result(letter_path,prediction):
    """
    Interpret the model prediction.
    
    Args:
        prediction: Dictionary containing prediction results
        
    Returns:
        Dictionary with interpretation
    """
    dyslexia_score = prediction['dyslexia_indicator_percentage']
    predicted_class = prediction['predicted_class']
    
    # Class interpretation
    class_names = ['Normal', 'Reversal (Dyslexia Indicator)', 'Correct']
    class_interpretation = class_names[predicted_class]
    
    # Risk level interpretation
    if dyslexia_score < 0.25:
        risk_level = "Low"
        interpretation = "The handwriting shows few signs of reversal characters typically associated with dyslexia."
    elif dyslexia_score < 0.50:
        risk_level = "Moderate"
        interpretation = "The handwriting shows some signs of reversal characters which may indicate dyslexia. Consider further assessment."
    elif dyslexia_score < 0.75:
        risk_level = "High"
        interpretation = "The handwriting shows significant signs of reversal characters commonly associated with dyslexia. Professional assessment is recommended."
    else:
        risk_level = "Very High"
        interpretation = "The handwriting shows strong signs of reversal characters strongly associated with dyslexia. Seek professional assessment."
    
    return {
        "dyslexia_score": dyslexia_score,
        "letter_path":letter_path,
        "risk_level": risk_level,
        "predicted_class": class_interpretation,
        "interpretation": interpretation
    }