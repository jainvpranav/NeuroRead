from fastapi.responses import JSONResponse
import imghdr
import cv2
import numpy as np
from typing import Dict, Any

def validate_image_format(image_bytes: bytes) -> bool:
    image_format = imghdr.what(None, h=image_bytes)
    return image_format in ['jpeg', 'png']

def is_image_blurry(image: np.ndarray, threshold: float = 500.0) -> bool:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    print(f"Laplacian variance: {laplacian_var}")
    return laplacian_var < threshold

def assess_image_quality(image_bytes: bytes, blur_threshold: float = 500.0):
    if not validate_image_format(image_bytes):
        return JSONResponse(
            content={"status": "failed", "reason": "Unsupported image format. Only JPEG and PNG are allowed."},
            status_code=400
        )

    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return JSONResponse(
            content={"status": "failed", "reason": "Failed to decode image."},
            status_code=400
        )

    if is_image_blurry(image, threshold=blur_threshold):
        return JSONResponse(
            content={"status": "failed", "reason": "Image is too blurry."},
            status_code=400
        )

    return JSONResponse(
        content={"status": "success", "reason": "Image passed all checks."},
        status_code=200
    )
