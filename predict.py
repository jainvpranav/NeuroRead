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
from datetime import datetime
from app.model import load_model, analyze_handwriting
from app.preprocessing import preprocess_single_image
from app.utils import get_device, interpret_result, preprocess_single_image,print_results,save_uploaded_file,segment_letters,calculate_final_results,response_structure,find_overall_risk
from app.llama_evaluate import analyze_image_for_spelling
from app.translation import translate

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
    parser.add_argument('--letters_folder', default='segmented_letters',
                        help='Folder to store segmented letter images (default: segmented_letters)')
    parser.add_argument(
    '--language',
    nargs='?',
    default='english',
    const='english',
    help='language to translate to (default: english)'
)
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
    # print(f"Using device: {device}")
    
    try:
        # Load model
        # print(f"Loading model from {args.model_path}...")
        model = load_model(args.model_path)
        model.to(device)
        
        # Segment image into individual letters
        # print(f"Segmenting image {args.image_path} into letters...")
        letter_images = segment_letters(args.image_path, args.letters_folder)
        
        if not letter_images:
            print("Error: No letters found in the image")
            return
        
        # print(f"Segmented letters saved to: {args.letters_folder}")
        
        all_results = []
        
        # Process each letter
        for i, letter_path in enumerate(letter_images):
            # print(f"\nProcessing letter {i+1} of {len(letter_images)}...")
            
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
            results = interpret_result(letter_path,prediction)
            all_results.append(results)
            
            # Print letter results
            # print(f"Letter {i+1} Results:")
            # print(results)
            # print(f"Dyslexia Indicator Score: {results['dyslexia_score']:.2f}%")
            # print(f"Risk Level: {results['risk_level']}")
            # print(f"Predicted Class: {results['predicted_class']}")
        
        # Calculate and format all final results
        
        final_results = calculate_final_results(all_results, letter_images, args.letters_folder)
        if 'letter_images' in locals():
            for path in letter_images:
                if os.path.exists(path):
                    os.remove(path)
        # Print final results
        # print_results(final_results)
        
        # Save results if output file is specified
        # if args.output_file:
        #     with open(args.output_file, 'w') as f:
        #         json.dump(final_results, f, indent=4)
        #     print(f"\nResults saved to {args.output_file}")
        mirror_score = final_results.get("adjusted_dyslexia_score")
        llama_result = analyze_image_for_spelling(args.image_path,mirror_score)
        # print(llama_result)
        translate_text =None
        if args.language != "english":
            details_in_english = llama_result['detailed_text']
            # print("--------------------------------\n",details_in_english,"\n___--")
            translate_text = translate(details_in_english,args.language)
      
        # print(translate_text)
        # print("calling resposne")
        mirror_writing=final_results.get('adjusted_dyslexia_score')
        orthographic_irregularity=llama_result.get('Orthographic_irregularity')
        motor_variability=llama_result.get('Motor_variability')
     
        overall_score = find_overall_risk(mirror_writing,orthographic_irregularity,motor_variability)
        final_json = response_structure(overall_score,final_results,llama_result,translate_text)
        # print("final json",final_json)
        final_json_json=json.dumps(final_json)
        print(final_json_json)
        return final_json_json
        
    except Exception as e:
        print(f"Error: {str(e)}")
    
if __name__ == "__main__":
    main()