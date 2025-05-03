#!/usr/bin/env python
"""
Script to train the dyslexia detection model from the command line.
"""

import argparse
from app.train import train_model


def main():
    parser = argparse.ArgumentParser(description='Train the dyslexia detection model')
    
    # Required arguments
    parser.add_argument('--normal_dir', required=True, 
                        help='Directory containing normal handwriting images')
    parser.add_argument('--reversal_dir', required=True, 
                        help='Directory containing reversal handwriting images (dyslexia indicators)')
    parser.add_argument('--correct_dir', required=True, 
                        help='Directory containing correct handwriting images')
    
    # Optional arguments
    parser.add_argument('--model_save_path', default='models/dyslexia_model.pth',
                        help='Path to save the trained model')
    parser.add_argument('--batch_size', type=int, default=32,
                        help='Batch size for training')
    parser.add_argument('--epochs', type=int, default=30,
                        help='Number of training epochs')
    parser.add_argument('--lr', type=float, default=0.001,
                        help='Learning rate for optimizer')
    
    args = parser.parse_args()
    
    print("Starting model training...")
    print(f"Normal handwriting directory: {args.normal_dir}")
    print(f"Reversal handwriting directory: {args.reversal_dir}")
    print(f"Correct handwriting directory: {args.correct_dir}")
    print(f"Model will be saved to: {args.model_save_path}")
    print(f"Training parameters: batch_size={args.batch_size}, epochs={args.epochs}, lr={args.lr}")
    
    # Train the model
    train_model(
        normal_dir=args.normal_dir,
        reversal_dir=args.reversal_dir,
        correct_dir=args.correct_dir,
        model_save_path=args.model_save_path,
        batch_size=args.batch_size,
        num_epochs=args.epochs,
        learning_rate=args.lr
    )
    
    print("Training completed successfully!")


if __name__ == "__main__":
    main()