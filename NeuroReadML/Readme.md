# Dyslexia Detection System

A PyTorch-based system to detect dyslexia indicators from handwriting samples.

## Overview

This system analyzes handwriting images and provides a score indicating the likelihood of dyslexia based on reversal characters in the handwriting. It uses a convolutional neural network (CNN) trained on a dataset of normal handwriting, reversal handwriting (dyslexia indicator), and correct handwriting samples.

## Setup

### Prerequisites

- Python 3.8+
- PyTorch 2.0+
- FastAPI

### Installation

1. Clone this repository:
```
git clone https://github.com/your-username/dyslexia-detection.git
cd dyslexia-detection
```

2. Install the required packages:
```
pip install -r requirements.txt
```

## Data Preparation

Organize your handwriting images into three separate folders:
- Normal handwriting
- Reversal handwriting (dyslexia indicator)
- Correct handwriting

You can use the dataset from Kaggle: [Dyslexia Handwriting Dataset](https://www.kaggle.com/datasets/drizasazanitaisa/dyslexia-handwriting-dataset/data)

## Training the Model

You can train the model through the API or using the training script directly:

### Option 1: Using the training script directly

```
python -m app.train --normal_dir /path/to/normal --reversal_dir /path/to/reversal --correct_dir /path/to/correct
```

Additional arguments:
- `--batch_size`: Batch size (default: 32)
- `--epochs`: Number of training epochs (default: 30)
- `--lr`: Learning rate (default: 0.001)
- `--model_save_path`: Path to save the trained model (default: models/dyslexia_model.pth)

### Option 2: Using the FastAPI endpoint

1. Start the API server:
```
uvicorn app.main:app --reload
```

2. Make a POST request to the `/train` endpoint with form data:
```
curl -X POST "http://localhost:8000/train" \
     -F "normal_dir=/path/to/normal" \
     -F "reversal_dir=/path/to/reversal" \
     -F "correct_dir=/path/to/correct" \
     -F "batch_size=32" \
     -F "epochs=30"
```

## Making Predictions

### Using the API

1. Start the API server (if not already running):
```
uvicorn app.main:app --reload
```

2. Send a handwriting image for analysis:
```
curl -X POST "http://localhost:8000/predict" \
     -F "file=@/path/to/handwriting_image.jpg"
```

The response will be a JSON object containing:
- `dyslexia_score`: Percentage indicating likelihood of dyslexia
- `risk_level`: Interpretation of the score (Low, Moderate, High, Very High)
- `predicted_class`: The class predicted by the model
- `interpretation`: Detailed explanation of the results

### API Endpoints

- `POST /train`: Train a new model
- `POST /predict`: Analyze a handwriting image
- `GET /status`: Check if the model is loaded

## Project Structure

```
dyslexia-detection/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI application entry point
│   ├── preprocessing.py      # Image preprocessing functions
│   ├── model.py              # PyTorch model definition
│   ├── train.py              # Training script
│   └── utils.py              # Utility functions
├── models/                   # Directory to save trained models
│   └── dyslexia_model.pth
└── requirements.txt          # Project dependencies
```

## Deployment

This application is designed to be easily deployable to any environment that supports Python and FastAPI. For production deployment, consider using:

- Docker for containerization
- Nginx as a

2 - Loss: 0.0081
  Batch 3780/3792 - Loss: 0.0231
  Batch 3790/3792 - Loss: 0.0874
Train Loss: 0.0450 Acc: 0.9849
Val Loss: 0.0251 Acc: 0.9913
Model saved to models/dyslexia_model.pth
New best model saved with accuracy: 0.9913