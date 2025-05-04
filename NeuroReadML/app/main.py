from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import torch
import uvicorn

from .preprocessing import preprocess_single_image
from .model import load_model, analyze_handwriting
from .train import train_model 
from .utils import get_device, save_uploaded_file, interpret_result

# Initialize FastAPI application
app = FastAPI(title="Dyslexia Detection API",
              description="API for detecting dyslexia from handwriting samples",
              version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Global variables
MODEL_PATH = "models/dyslexia_model.pth"
DEVICE = get_device()
model = None

# Load model on startup if it exists
@app.on_event("startup")
def startup_event():
    global model, DEVICE
    
    # Try to create models directory if it doesn't exist
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    
    # Check CUDA availability and set device
    if torch.cuda.is_available():
        try:
            torch.cuda.empty_cache()
            DEVICE = torch.device("cuda")
            print(f"Using CUDA device: {torch.cuda.get_device_name(0)}")
        except Exception as e:
            print(f"Error initializing CUDA: {e}")
            DEVICE = torch.device("cpu")
            print("Falling back to CPU")
    else:
        DEVICE = torch.device("cpu")
        print("Using CPU for computation")
    
    # Load model if exists
    if os.path.exists(MODEL_PATH):
        try:
            print(f"Loading model from {MODEL_PATH}...")
            model = load_model(MODEL_PATH)
            model.to(DEVICE)
            print(f"Model successfully loaded from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Initializing a new model with pretrained weights")
            try:
                model = create_dyslexia_model(num_classes=3, pretrained=True)
                model.to(DEVICE)
            except Exception as e2:
                print(f"Error creating new model: {e2}")
                model = None
    else:
        print(f"Model not found at {MODEL_PATH}. Please train the model first.")
        model = None


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Predict dyslexia indicators from a handwriting image."""
    global model
    
    # Check if model is loaded
    if model is None:
        return JSONResponse(
            status_code=400,
            content={"error": "Model not loaded. Please train the model first."}
        )
    
    # Save uploaded file
    temp_file_path = save_uploaded_file(file)
    
    try:
        # Preprocess image
        preprocessed_image = preprocess_single_image(temp_file_path)
        if preprocessed_image is None:
            return JSONResponse(
                status_code=400,
                content={"error": "Failed to process the image."}
            )
        
        # Move tensor to device
        preprocessed_image = preprocessed_image.to(DEVICE)
        
        # Analyze handwriting
        prediction = analyze_handwriting(model, preprocessed_image, DEVICE)
        
        # Interpret results
        result = interpret_result(prediction)
        
        return result
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Prediction failed: {str(e)}"}
        )
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@app.post("/train")
async def train(
    background_tasks: BackgroundTasks,
    normal_dir: str = Form(...),
    reversal_dir: str = Form(...),
    correct_dir: str = Form(...),
    batch_size: int = Form(32),
    epochs: int = Form(30)
):
    """
    Train a new model using the provided directories.
    
    This endpoint will start training in the background and return immediately.
    The training will continue in the background.
    """
    # Validate directories
    for dir_path in [normal_dir, reversal_dir, correct_dir]:
        if not os.path.exists(dir_path):
            return JSONResponse(
                status_code=400,
                content={"error": f"Directory not found: {dir_path}"}
            )
    
    # Start training in background
    def train_in_background():
        global model
        try:
            train_model(
                normal_dir=normal_dir,
                reversal_dir=reversal_dir,
                correct_dir=correct_dir,
                model_save_path=MODEL_PATH,
                batch_size=batch_size,
                num_epochs=epochs,
                device=DEVICE
            )
            
            # Load the newly trained model
            model = load_model(MODEL_PATH)
            model.to(DEVICE)
            print("Training completed and model loaded")
        except Exception as e:
            print(f"Training failed: {e}")
    
    background_tasks.add_task(train_in_background)
    
    return {"message": "Training started in the background.", 
            "status": "Training will continue in the background."}


@app.get("/status")
async def model_status():
    """Check the status of the model."""
    global model
    
    return {
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "device": str(DEVICE)
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)