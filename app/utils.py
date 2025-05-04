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



import argparse
import torch
import json
import os
import cv2
import numpy as np
from datetime import datetime
from app.model import load_model, analyze_handwriting
from app.preprocessing import preprocess_single_image
from app.utils import get_device, interpret_result
from app.llama_evaluate import analyze_image_for_spelling
from app.translation import translate
def segment_letters(image_path, output_folder, min_width=5, min_height=15, min_area=30):
    # Read and preprocess image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None
    
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    
    # Thresholding
    _, binary = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Morphological operations to connect broken parts
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    morph = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    
    # Find contours
    contours, _ = cv2.findContours(morph, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter and sort contours
    letter_images = []
    for i, contour in enumerate(sorted(contours, key=lambda c: cv2.boundingRect(c)[0])):
        x, y, w, h = cv2.boundingRect(contour)
        
        # Filter small artifacts and noise
        if w < min_width or h < min_height or (w*h) < min_area:
            continue
            
        # Extract letter with padding
        padding = max(5, int(0.1 * max(w, h)))  # Dynamic padding
        letter = img[max(0,y-padding):min(img.shape[0],y+h+padding), 
                    max(0,x-padding):min(img.shape[1],x+w+padding)]
        
        # Save letter image to output folder
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        letter_path = os.path.join(output_folder, f"letter_{timestamp}_{i}.png")
        cv2.imwrite(letter_path, letter)
        letter_images.append(letter_path)
    
    return letter_images

def calculate_final_results(all_results, letter_images, letters_folder):
    """Calculate and format all final results based on individual letter results with multiple thresholds"""
    # Calculate basic statistics
    total_score = sum(result['dyslexia_score'] for result in all_results)
    avg_score = total_score / len(letter_images) if letter_images else 0
    
    # Count letters in different score ranges
    score_ranges = {
        'very_low': (0, 0.2),
        'low': (0.2, 0.4),
        'medium': (0.4, 0.6),
        'high': (0.6, 0.8),
        'very_high': (0.8, 1.0)
    }
    
    letter_counts = {range_name: 0 for range_name in score_ranges}
    for result in all_results:
        score = result['dyslexia_score']
        for range_name, (lower, upper) in score_ranges.items():
            if lower <= score < upper:
                letter_counts[range_name] += 1
                break
    
    # Calculate weighted score considering different thresholds
    weight_factors = {
        'very_low': 0.5,
        'low': 1.0,
        'medium': 1.5,
        'high': 2.0,
        'very_high': 3.0
    }
    weighted_sum = 0
    total_weight = 0
    for result in all_results:
        score = result['dyslexia_score']
        for range_name, (lower, upper) in score_ranges.items():
            if lower <= score < upper:
                weight = weight_factors[range_name]
                weighted_sum += score * weight
                total_weight += weight
                break

    weighted_avg = weighted_sum / total_weight if total_weight else 0
    
    # Apply additional adjustments based on high-scoring letters
    adjustment_factors = []
    adjustment_notes = []
    
    # Adjustment for very high scores
    if letter_counts['very_high'] >= 1:
        adjustment = min(1.5, 1 + (letter_counts['very_high'] * 0.2))
        adjustment_factors.append(adjustment)
        adjustment_notes.append(f"{letter_counts['very_high']} very high score letters (>0.8)")
    
    # Adjustment for high scores
    if letter_counts['high'] >= 2:
        adjustment = min(1.3, 1 + (letter_counts['high'] * 0.1))
        adjustment_factors.append(adjustment)
        adjustment_notes.append(f"{letter_counts['high']} high score letters (>0.6)")
    
    # Adjustment for medium scores
    if letter_counts['medium'] >= 3:
        adjustment = min(1.2, 1 + (letter_counts['medium'] * 0.05))
        adjustment_factors.append(adjustment)
        adjustment_notes.append(f"{letter_counts['medium']} medium score letters (>0.4)")
    
    # Calculate final adjusted score
    if adjustment_factors:
        max_adjustment = max(adjustment_factors)
        adjusted_score = min(100, weighted_avg * max_adjustment)
        if adjusted_score < 1:
            adjusted_score = round(adjusted_score * 100, 2)


        adjustment_note = "Adjusted based on: " + ", ".join(adjustment_notes)
    else:
        adjusted_score = weighted_avg
        if adjusted_score < 1:
            adjusted_score = round(adjusted_score * 100, 2)
        adjustment_note = "No significant adjustments applied"
    
    # Determine overall risk level
    if adjusted_score < 30:
        overall_risk = "Low"
    elif adjusted_score < 50:
        overall_risk = "Moderate"
    elif adjusted_score < 70:
        overall_risk = "High"
    else:
        overall_risk = "Very High"
    
    # Prepare final results dictionary
    final_results = {
        "individual_letters": all_results,
        "average_dyslexia_score": avg_score,
        "weighted_average_score": weighted_avg,
        "adjusted_dyslexia_score": adjusted_score,
        "adjustment_note": adjustment_note,
        "letter_score_distribution": letter_counts,
        "overall_risk_level": overall_risk,
        "total_letters_analyzed": len(letter_images),
        "letters_folder": letters_folder,
        "score_ranges": {k: f"{v[0]}-{v[1]}" for k, v in score_ranges.items()}
    }
    
    return final_results

def response_structure(pytorch_response, llama_response, translate_response):
    final_json_response=None
    if translate_response == None:
        final_json_response = {
            "mirror_writing": pytorch_response.get('adjusted_dyslexia_score'),
            "orthographic_irregularity": llama_response.get('Orthographic_irregularity'),
            "motor_variability": llama_response.get('Motor_variability'),
            "details_in_english": llama_response.get('detailed_text'),
            "translated_text": "None"
        }
    else:
        final_json_response = {
            "mirror_writing": pytorch_response.get('adjusted_dyslexia_score'),
            "orthographic_irregularity": llama_response.get('Orthographic_irregularity'),
            "motor_variability": llama_response.get('Motor_variability'),
            "details_in_english": llama_response.get('detailed_text'),
            "translated_text": (
                translate_response['translated_text']
            )
        }
    return final_json_response


def print_results(final_results):
    """Print the final results in a readable format with detailed score distribution"""
    print("\n--- Final Dyslexia Analysis Results ---")
    
    # Basic scores
    print(f"\nBasic Scores:")
    print(f"• Average Score: {final_results['average_dyslexia_score']:.2f}%")
    print(f"• Weighted Average: {final_results['weighted_average_score']:.2f}%")
    print(f"• Final Adjusted Score: {final_results['adjusted_dyslexia_score']:.2f}%")
    
    # Score adjustments
    print(f"\nScore Adjustments:")
    print(f"• {final_results['adjustment_note']}")
    
    # Risk level
    print(f"\nRisk Assessment:")
    print(f"• Overall Risk Level: {final_results['overall_risk_level']}")
    
    # Letter statistics
    print(f"\nLetter Analysis:")
    print(f"• Total Letters Analyzed: {final_results['total_letters_analyzed']}")
    print("\nLetter Score Distribution:")
    for range_name, count in final_results['letter_score_distribution'].items():
        range_str = final_results['score_ranges'][range_name]
        print(f"  - {range_name.replace('_', ' ').title()} ({range_str}): {count} letters")
    
    # Storage info
    print(f"\nAdditional Information:")
    print(f"• Segmented letters saved in: {final_results['letters_folder']}")
    
    # Interpretation guide
    print("\nScore Range Interpretation:")
    print("0-0.2: Very Low | 0.2-0.4: Low | 0.4-0.6: Medium")
    print("0.6-0.8: High | 0.8-1.0: Very High")
