import cv2
import numpy as np
from PIL import Image

def segment_characters(image_path):
    """
    Segment individual characters from the input handwriting image using contour detection.

    Args:
        image_path (str): Path to the input handwriting image.

    Returns:
        List[PIL.Image.Image]: List of cropped character images as PIL Image objects.
    """
    # Load the image in grayscale
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    if img is None:
        raise ValueError(f"Failed to load image at: {image_path}")

    # Apply Gaussian blur and binary threshold
    blurred = cv2.GaussianBlur(img, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Morphological operations to close gaps
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)

    # Find contours of potential characters
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Sort contours left to right
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])

    char_images = []

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)

        # Filter out very small regions (likely noise)
        if w < 5 or h < 5:
            continue

        # Crop character from original grayscale image
        char_crop = img[y:y+h, x:x+w]

        # Convert to PIL Image
        char_pil = Image.fromarray(char_crop)
        char_images.append(char_pil)

    return char_images



