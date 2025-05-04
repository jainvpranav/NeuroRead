from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import uuid
import os
import subprocess
import json

app = FastAPI()

# Updated Request model to receive the image URL and language
class PredictRequest(BaseModel):
    image_url: str
    language: str  # Add this line

@app.post("/predict")
async def predict(request: PredictRequest):
    try:
        # Step 1: Create directories if not present
        os.makedirs("downloads", exist_ok=True)
        os.makedirs("results", exist_ok=True)

        # Step 2: Generate unique names
        image_filename = f"{uuid.uuid4().hex}.png"
        image_path = os.path.join("downloads", image_filename)

        output_filename = f"{uuid.uuid4().hex}_result.json"
        output_path = os.path.join("results", output_filename)

        # Step 3: Download the image from Supabase
        response = requests.get(request.image_url)
        response.raise_for_status()

        with open(image_path, "wb") as f:
            f.write(response.content)

        # Step 4: Run the model using subprocess
        command = [
            "python",
            "predict.py",
            "--image_path", image_path,
            "--model_path", "models/dyslexia_model.pth",
            "--output_file", output_path,
            "--language", request.language  # Pass the language parameter
        ]

        try:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            print("STDOUT:", e.stdout)
            print("STDERR:", e.stderr)
            raise HTTPException(status_code=500, detail=f"Model prediction failed. Details: {e.stderr}")
        
        return result.stdout[:-1]

    except requests.exceptions.RequestException:
        raise HTTPException(status_code=400, detail="Failed to download image from the provided URL.")
    except subprocess.CalledProcessError:
        raise HTTPException(status_code=500, detail="Model prediction failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))