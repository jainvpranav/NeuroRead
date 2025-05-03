#!/usr/bin/env python
"""
Script to make predictions using the trained dyslexia detection model.
"""

import argparse
import torch
import json
import os
from app.model import load_model, analyze_handwriting
from app.preprocessing import preprocess_single_image
from app.utils import get_device, interpret_result


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
        
        # Preprocess image
        print(f"Processing image {args.image_path}...")
        preprocessed_image = preprocess_single_image(args.image_path)
        
        if preprocessed_image is None:
            print("Error: Failed to process the image")
            return
        
        # Move tensor to device
        preprocessed_image = preprocessed_image.to(device)
        
        # Analyze handwriting
        print("Analyzing handwriting...")
        prediction = analyze_handwriting(model, preprocessed_image, device)
        
        # Interpret results
        results = interpret_result(prediction)
        
        # Print results
        print("\n--- Dyslexia Analysis Results ---")
        print("results--------------------")
        print(results)
        print(f"Dyslexia Indicator Score: {results['dyslexia_score']:.2f}%")
        print(f"Risk Level: {results['risk_level']}")
        print(f"Predicted Class: {results['predicted_class']}")
        print(f"Interpretation: {results['interpretation']}")
        
        # Save results if output file is specified
        if args.output_file:
            with open(args.output_file, 'w') as f:
                json.dump(results, f, indent=4)
            print(f"\nResults saved to {args.output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")


if __name__ == "__main__":
    main()