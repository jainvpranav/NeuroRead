#!/usr/bin/env python
"""
Script to make predictions using the trained dyslexia detection model.
"""

import argparse
import torch
import json
import os
import cv2
import numpy as np
from app.model import load_model, analyze_handwriting
from app.preprocessing import preprocess_single_image
from app.utils import get_device, interpret_result
def segment_letters(image_path, min_width=5, min_height=15, min_area=30):
    # Read and preprocess image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None
    
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
        
        # Save temporary letter image
        temp_path = f"temp_letter_{i}.png"
        cv2.imwrite(temp_path, letter)
        letter_images.append(temp_path)
    
    return letter_images
def main():
    parser = argparse.ArgumentParser(description='Predict dyslexia indicators from handwriting images')
    
    # Required arguments
    parser.add_argument('--image_path', required=True, 
                        help='Path to the handwriting image')
    
    # Optional arguments
    parser.add_argument('--model_path', default='models/dyslexia_model.pth',
                        help='Path to the trained model')
    parser.add_argument('--output_file', 
                        help='Path to save the results as JSON (optional)')
    
    args = parser.parse_args()
    
    # Check if model exists
    if not os.path.exists(args.model_path):
        print(f"Error: Model not found at {args.model_path}")
        print("Please train the model first using train_model.py")
        return
    
    # Check if image exists
    if not os.path.exists(args.image_path):
        print(f"Error: Image not found at {args.image_path}")
        return
    
    # Get device
    device = get_device()
    print(f"Using device: {device}")
    
    try:
        # Load model
        print(f"Loading model from {args.model_path}...")
        model = load_model(args.model_path)
        model.to(device)
        
        # Segment image into individual letters
        print(f"Segmenting image {args.image_path} into letters...")
        letter_images = segment_letters(args.image_path)
        
        if not letter_images:
            print("Error: No letters found in the image")
            return
        
        all_results = []
        total_score = 0
        
        # Process each letter
        for i, letter_path in enumerate(letter_images):
            print(f"\nProcessing letter {i+1} of {len(letter_images)}...")
            
            # Preprocess image
            preprocessed_image = preprocess_single_image(letter_path)
            
            if preprocessed_image is None:
                print(f"Error: Failed to process letter image {letter_path}")
                continue
            
            # Move tensor to device
            preprocessed_image = preprocessed_image.to(device)
            
            # Analyze handwriting
            prediction = analyze_handwriting(model, preprocessed_image, device)
            
            # Interpret results
            results = interpret_result(prediction)
            all_results.append(results)
            total_score += results['dyslexia_score']
            
            # Clean up temporary file
            os.remove(letter_path)
            
            # Print letter results
            print(f"Letter {i+1} Results:")
            print(results)
            print(f"Dyslexia Indicator Score: {results['dyslexia_score']:.2f}%")
            print(f"Risk Level: {results['risk_level']}")
            print(f"Predicted Class: {results['predicted_class']}")
        
        # Calculate average score
        avg_score = total_score / len(letter_images) if letter_images else 0
        
        # Determine overall risk level
        if avg_score < 30:
            overall_risk = "Low"
        elif avg_score < 70:
            overall_risk = "Medium"
        else:
            overall_risk = "High"
        
        # Prepare final results
        final_results = {
            "individual_letters": all_results,
            "average_dyslexia_score": avg_score,
            "overall_risk_level": overall_risk,
            "total_letters_analyzed": len(letter_images)
        }
        
        # Print final results
        print("\n--- Final Dyslexia Analysis Results ---")
        print(f"Average Dyslexia Indicator Score: {avg_score:.2f}%")
        print(f"Overall Risk Level: {overall_risk}")
        print(f"Total Letters Analyzed: {len(letter_images)}")
        
        # Save results if output file is specified
        if args.output_file:
            with open(args.output_file, 'w') as f:
                json.dump(final_results, f, indent=4)
            print(f"\nResults saved to {args.output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        # Clean up any remaining temporary files
        if 'letter_images' in locals():
            for path in letter_images:
                if os.path.exists(path):
                    os.remove(path)


if __name__ == "__main__":
    main()