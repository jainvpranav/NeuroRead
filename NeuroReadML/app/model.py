import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models


def create_dyslexia_model(num_classes=3, pretrained=True):
    """Create a CNN model for dyslexia detection based on ResNet18."""
    # Handle different versions of torchvision
    try:
        # For newer PyTorch versions (>=1.6)
        if pretrained:
            try:
                # For newer PyTorch versions (>=2.0)
                model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
            except:
                # Fallback for older but still post-1.6 versions
                model = models.resnet18(pretrained=True)
        else:
            model = models.resnet18(pretrained=False)
    except TypeError:
        # For older PyTorch versions
        model = models.resnet18(pretrained=pretrained)
    
    # Modify the final fully connected layer for our classification task
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    
    return model


def save_model(model, path):
    """Save model weights to the specified path."""
    torch.save(model.state_dict(), path)
    print(f"Model saved to {path}")


def load_model(path, num_classes=3):
    """Load model weights from the specified path."""
    model = create_dyslexia_model(num_classes=num_classes, pretrained=False)
    
    try:
        # Try to load with default method
        model.load_state_dict(torch.load(path))
    except RuntimeError:
        try:
            # Try to load with map_location (for CPU/CUDA mismatch)
            device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            model.load_state_dict(torch.load(path, map_location=device))
        except Exception as e:
            print(f"Error loading model weights: {e}")
            print("Loading model with random weights instead.")
            # Return model with random weights
            return create_dyslexia_model(num_classes=num_classes, pretrained=True)
    except Exception as e:
        print(f"Unexpected error loading model: {e}")
        print("Loading model with random weights instead.")
        # Return model with random weights
        return create_dyslexia_model(num_classes=num_classes, pretrained=True)
    
    model.eval()  # Set to evaluation mode
    return model


def predict_single_image(model, image_tensor, device="cpu"):
    """Make a prediction on a single preprocessed image."""
    model.eval()
    with torch.no_grad():
        image_tensor = image_tensor.to(device)
        outputs = model(image_tensor)
        probs = F.softmax(outputs, dim=1)
        _, predicted = torch.max(outputs, 1)
        
    return {
        'predicted_class': int(predicted.item()),  
        'probabilities': probs[0].tolist()  # Convert to list for easier JSON serialization
    }


def analyze_handwriting(model, image_tensor, device="cpu"):
    """
    Analyze handwriting to detect dyslexia indicators.
    Returns the probability of the image containing reversal characters.
    """
    prediction = predict_single_image(model, image_tensor, device)
    
    # Get probability of reversal (class 1)
    reversal_probability = prediction['probabilities'][1]
    
    return {
        'reversal_probability': reversal_probability,
        'dyslexia_indicator_percentage': reversal_probability,
        'predicted_class': prediction['predicted_class']
    }