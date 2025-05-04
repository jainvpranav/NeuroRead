import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt

from .model import create_dyslexia_model, save_model
from .preprocessing import prepare_dataloaders


def train_model(normal_dir, reversal_dir, correct_dir, 
                model_save_path='models/dyslexia_model.pth',
                batch_size=32, 
                num_epochs=30,
                learning_rate=0.001,
                device=None):
    """
    Train the dyslexia detection model and save it.
    
    Args:
        normal_dir: Directory containing normal handwriting images
        reversal_dir: Directory containing reversal handwriting images (dyslexia indicators)
        correct_dir: Directory containing correct handwriting images
        model_save_path: Path to save the trained model
        batch_size: Batch size for training
        num_epochs: Number of training epochs
        learning_rate: Learning rate for optimizer
        device: Device to use (cuda/cpu)
    
    Returns:
        Dictionary containing training history
    """
    # Ensure model directory exists
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)

    # Set device
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Prepare dataloaders
    train_loader, val_loader = prepare_dataloaders(
        normal_dir, reversal_dir, correct_dir, batch_size
    )
    
    # Create model
    model = create_dyslexia_model(num_classes=3)
    model = model.to(device)
    
    # Define loss function and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    # Learning rate scheduler
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.1, patience=5
    )
    print("Learning rate scheduler initialized")
    
    # Training history
    history = {
        'train_loss': [],
        'val_loss': [],
        'train_acc': [],
        'val_acc': []
    }
    
    # Training loop
    since = time.time()
    best_acc = 0.0
    
    # Track if training is failing
    consecutive_failures = 0
    max_consecutive_failures = 3
    
    for epoch in range(num_epochs):
        print(f'Epoch {epoch+1}/{num_epochs}')
        print('-' * 10)
        
        try:
            # Training phase
            model.train()
            running_loss = 0.0
            running_corrects = 0
            batch_count = 0
            
            for i, (inputs, labels) in enumerate(train_loader):
                try:
                    inputs = inputs.to(device)
                    labels = labels.to(device)
                    
                    # Zero the parameter gradients
                    optimizer.zero_grad()
                    
                    # Forward pass
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)
                    
                    # Backward + optimize
                    loss.backward()
                    optimizer.step()
                    
                    # Statistics
                    running_loss += loss.item() * inputs.size(0)
                    running_corrects += torch.sum(preds == labels.data)
                    batch_count += 1
                    
                    # Print progress every 10 batches
                    if (i+1) % 10 == 0:
                        print(f'  Batch {i+1}/{len(train_loader)} - Loss: {loss.item():.4f}')
                    
                    # Free up memory
                    del inputs, labels, outputs, preds, loss
                    if torch.cuda.is_available():
                        torch.cuda.empty_cache()
                        
                except Exception as e:
                    print(f"Error in training batch {i}: {e}")
                    continue
            
            # Only compute statistics if we processed at least some batches
            if batch_count > 0:
                train_loss = running_loss / len(train_loader.sampler)
                train_acc = running_corrects.double() / len(train_loader.sampler)
            else:
                print("Warning: No batches were successfully processed in this epoch")
                train_loss = float('inf')
                train_acc = 0.0
            
            # Validation phase
            model.eval()
            running_loss = 0.0
            running_corrects = 0
            batch_count = 0
            
            with torch.no_grad():
                for i, (inputs, labels) in enumerate(val_loader):
                    try:
                        inputs = inputs.to(device)
                        labels = labels.to(device)
                        
                        # Forward pass
                        outputs = model(inputs)
                        _, preds = torch.max(outputs, 1)
                        loss = criterion(outputs, labels)
                        
                        # Statistics
                        running_loss += loss.item() * inputs.size(0)
                        running_corrects += torch.sum(preds == labels.data)
                        batch_count += 1
                        
                        # Free up memory
                        del inputs, labels, outputs, preds, loss
                        if torch.cuda.is_available():
                            torch.cuda.empty_cache()
                            
                    except Exception as e:
                        print(f"Error in validation batch {i}: {e}")
                        continue
            
            # Only compute statistics if we processed at least some batches
            if batch_count > 0:
                val_loss = running_loss / len(val_loader.sampler)
                val_acc = running_corrects.double() / len(val_loader.sampler)
            else:
                print("Warning: No validation batches were successfully processed")
                val_loss = float('inf')
                val_acc = 0.0
                
            # Reset consecutive failures counter
            consecutive_failures = 0
                
        except Exception as e:
            print(f"Error during epoch {epoch+1}: {e}")
            consecutive_failures += 1
            
            if consecutive_failures >= max_consecutive_failures:
                print(f"Training stopped after {max_consecutive_failures} consecutive failures")
                break
                
            # Try to continue with next epoch
            continue
        
        # Update learning rate
        prev_lr = optimizer.param_groups[0]['lr']
        scheduler.step(val_loss)
        current_lr = optimizer.param_groups[0]['lr']
        
        if current_lr != prev_lr:
            print(f'Learning rate changed from {prev_lr} to {current_lr}')
        
        # Save history
        history['train_loss'].append(train_loss)
        history['val_loss'].append(val_loss)
        history['train_acc'].append(train_acc.item())
        history['val_acc'].append(val_acc.item())
        
        print(f'Train Loss: {train_loss:.4f} Acc: {train_acc:.4f}')
        print(f'Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}')
        
        # Save best model
        if val_acc > best_acc:
            best_acc = val_acc
            save_model(model, model_save_path)
            print(f'New best model saved with accuracy: {val_acc:.4f}')
        
        print()
    
    time_elapsed = time.time() - since
    print(f'Training complete in {time_elapsed//60:.0f}m {time_elapsed%60:.0f}s')
    print(f'Best val Acc: {best_acc:.4f}')
    
    # Plot training history
    plot_training_history(history)
    
    return history


def plot_training_history(history):
    """Plot training and validation loss/accuracy."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    # Plot loss
    ax1.plot(history['train_loss'], label='train')
    ax1.plot(history['val_loss'], label='validation')
    ax1.set_title('Model Loss')
    ax1.set_ylabel('Loss')
    ax1.set_xlabel('Epoch')
    ax1.legend()
    
    # Plot accuracy
    ax2.plot(history['train_acc'], label='train')
    ax2.plot(history['val_acc'], label='validation')
    ax2.set_title('Model Accuracy')
    ax2.set_ylabel('Accuracy')
    ax2.set_xlabel('Epoch')
    ax2.legend()
    
    plt.tight_layout()
    
    # Save the plot
    os.makedirs('models', exist_ok=True)
    plt.savefig('models/training_history.png')
    plt.close()


def main():
    """Main training function to be used when running script directly."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train dyslexia detection model')
    parser.add_argument('--normal_dir', required=True, help='Directory with normal handwriting images')
    parser.add_argument('--reversal_dir', required=True, help='Directory with reversal handwriting images')
    parser.add_argument('--correct_dir', required=True, help='Directory with correct handwriting images')
    parser.add_argument('--model_save_path', default='models/dyslexia_model.pth', help='Path to save model')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size')
    parser.add_argument('--epochs', type=int, default=30, help='Number of epochs')
    parser.add_argument('--lr', type=float, default=0.001, help='Learning rate')
    
    args = parser.parse_args()
    
    train_model(
        args.normal_dir,
        args.reversal_dir,
        args.correct_dir,
        args.model_save_path,
        args.batch_size,
        args.epochs,
        args.lr
    )


if __name__ == "__main__":
    main()