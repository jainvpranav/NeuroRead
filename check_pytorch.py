#!/usr/bin/env python
"""
Simple script to check if PyTorch is installed correctly and functioning.
"""

import sys
import platform
import torch
import torchvision

def check_pytorch():
    """Check PyTorch installation and system configuration."""
    print("=" * 50)
    print("PyTorch Environment Check")
    print("=" * 50)
    
    # System information
    print(f"Python version: {platform.python_version()}")
    print(f"PyTorch version: {torch.__version__}")
    print(f"Torchvision version: {torchvision.__version__}")
    print(f"Operating system: {platform.system()} {platform.release()}")
    
    # CUDA availability
    cuda_available = torch.cuda.is_available()
    print(f"CUDA available: {cuda_available}")
    
    if cuda_available:
        print(f"CUDA version: {torch.version.cuda}")
        print(f"Number of CUDA devices: {torch.cuda.device_count()}")
        print(f"Current CUDA device: {torch.cuda.current_device()}")
        print(f"CUDA device name: {torch.cuda.get_device_name(0)}")
    
    # Test basic tensor operations
    print("\nTesting basic tensor operations...")
    try:
        # Create a tensor
        x = torch.rand(5, 3)
        print(f"Random tensor shape: {x.shape}")
        
        # Test device movement if CUDA is available
        if cuda_available:
            x_cuda = x.to('cuda')
            print(f"Tensor moved to CUDA: {x_cuda.device}")
        
        # Test basic operations
        y = torch.ones(5, 3)
        z = x + y
        print("Addition operation successful")
        
        # Test matrix multiplication
        result = torch.mm(x, y.t())
        print(f"Matrix multiplication shape: {result.shape}")
        
        print("\n✅ PyTorch is functioning correctly.")
    except Exception as e:
        print(f"\n❌ Error during tensor operations: {e}")
        print("PyTorch may not be functioning correctly.")
    
    # Additional checks
    print("\nChecking for common issues:")
    
    # Check for potential GPU memory issues
    if cuda_available:
        try:
            print(f"Total GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
            print(f"Allocated GPU memory: {torch.cuda.memory_allocated() / 1e9:.2f} GB")
            print(f"Cached GPU memory: {torch.cuda.memory_reserved() / 1e9:.2f} GB")
        except Exception as e:
            print(f"Could not check GPU memory: {e}")
    
    # Test a small neural network
    try:
        print("\nTesting simple neural network...")
        import torch.nn as nn
        
        # Define a simple model
        model = nn.Sequential(
            nn.Linear(10, 5),
            nn.ReLU(),
            nn.Linear(5, 2)
        )
        
        # Try to move to GPU if available
        if cuda_available:
            model = model.to('cuda')
            print("Model successfully moved to CUDA")
        
        # Test forward pass
        input_tensor = torch.rand(3, 10)
        if cuda_available:
            input_tensor = input_tensor.to('cuda')
        
        output = model(input_tensor)
        print(f"Model output shape: {output.shape}")
        print("Neural network test successful")
    except Exception as e:
        print(f"Neural network test failed: {e}")
    
    print("\nCheck complete.")


if __name__ == "__main__":
    check_pytorch()