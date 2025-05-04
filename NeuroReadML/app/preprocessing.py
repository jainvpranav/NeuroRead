import os
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import numpy as np
from pathlib import Path


def load_image(image_path):
    """Load and convert image to RGB."""
    try:
        img = Image.open(image_path).convert('RGB')
        return img
    except Exception as e:
        print(f"Error loading image {image_path}: {e}")
        return None


def get_transform():
    """Define image transformations for model input."""
    return transforms.Compose([
        transforms.Resize((224, 224)),  # Resize to standard dimensions
        transforms.ToTensor(),           # Convert to tensor
        transforms.Normalize(            # Normalize with ImageNet stats
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])


class HandwritingDataset(Dataset):
    """Dataset for handwriting images."""
    
    def __init__(self, normal_dir, reversal_dir, correct_dir, transform=None):
        self.transform = transform if transform else get_transform()
        
        # Load normal handwriting (label 0)
        self.normal_paths = [os.path.join(normal_dir, f) for f in os.listdir(normal_dir) 
                            if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        # Load reversal handwriting (label 1 - indicates dyslexia)
        self.reversal_paths = [os.path.join(reversal_dir, f) for f in os.listdir(reversal_dir)
                              if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        # Load correct handwriting (label 2)
        self.correct_paths = [os.path.join(correct_dir, f) for f in os.listdir(correct_dir)
                             if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        # Combine all paths and assign labels
        self.image_paths = self.normal_paths + self.reversal_paths + self.correct_paths
        self.labels = ([0] * len(self.normal_paths) + 
                       [1] * len(self.reversal_paths) + 
                       [2] * len(self.correct_paths))
        
        print(f"Loaded {len(self.normal_paths)} normal images")
        print(f"Loaded {len(self.reversal_paths)} reversal images")
        print(f"Loaded {len(self.correct_paths)} correct images")
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = load_image(img_path)
        
        if image is None:
            # Return a blank image if loading failed
            image = Image.new('RGB', (224, 224), color='white')
        
        if self.transform:
            image = self.transform(image)
        
        label = self.labels[idx]
        return image, label


def prepare_dataloaders(normal_dir, reversal_dir, correct_dir, batch_size=32, 
                        val_split=0.2, seed=42):
    """Prepare training and validation dataloaders."""
    # Set random seed for reproducibility
    torch.manual_seed(seed)
    np.random.seed(seed)
    
    # Create dataset
    transform = get_transform()
    dataset = HandwritingDataset(normal_dir, reversal_dir, correct_dir, transform)
    
    # Split dataset
    dataset_size = len(dataset)
    indices = list(range(dataset_size))
    np.random.shuffle(indices)
    split = int(np.floor(val_split * dataset_size))
    train_indices, val_indices = indices[split:], indices[:split]
    
    # Create samplers
    train_sampler = torch.utils.data.SubsetRandomSampler(train_indices)
    val_sampler = torch.utils.data.SubsetRandomSampler(val_indices)
    
    # Create dataloaders
    train_loader = DataLoader(
        dataset, 
        batch_size=batch_size,
        sampler=train_sampler,
        num_workers=4
    )
    
    val_loader = DataLoader(
        dataset,
        batch_size=batch_size,
        sampler=val_sampler,
        num_workers=4
    )
    
    return train_loader, val_loader


def preprocess_single_image(image_path, transform=None):
    """Preprocess a single image for inference."""
    if transform is None:
        transform = get_transform()
    
    image = load_image(image_path)
    if image is None:
        return None
    
    return transform(image).unsqueeze(0)  # Add batch dimension