import cv2
import numpy as np
from typing import Dict, Any

class ImageCleaner:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {
            'resize_dim': (800, 600),
            'denoise_strength': 10,
            'contrast_alpha': 1.3,
            'contrast_beta': 15
        }
    
    def clean_image(self, image: np.ndarray) -> np.ndarray:
        """Clean and prepare handwriting image for analysis"""
        # Resize for consistent processing
        resized = cv2.resize(image, self.config['resize_dim'])
        
        # Convert to grayscale if color
        if len(resized.shape) == 3:
            gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        else:
            gray = resized
            
        # Denoise
        denoised = cv2.fastNlMeansDenoising(
            gray, None, self.config['denoise_strength'], 7, 21)
            
        # Enhance contrast
        enhanced = cv2.convertScaleAbs(
            denoised, 
            alpha=self.config['contrast_alpha'], 
            beta=self.config['contrast_beta']
        )
        
        # Binarize (optional - depends on your model's requirements)
        _, binary = cv2.threshold(enhanced, 0, 255, 
                                cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        return binary
    
    def extract_text_regions(self, image: np.ndarray) -> list:
        """Extract individual text lines/regions for analysis"""
        # Find contours of text regions
        contours, _ = cv2.findContours(
            image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter small contours (noise)
        min_area = 100
        text_regions = []
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if w*h > min_area:
                # Extract region with padding
                pad = 5
                y1 = max(0, y - pad)
                y2 = min(image.shape[0], y + h + pad)
                x1 = max(0, x - pad)
                x2 = min(image.shape[1], x + w + pad)
                
                region = image[y1:y2, x1:x2]
                text_regions.append({
                    'image': region,
                    'position': (x, y, w, h)
                })
        
        # Sort by vertical position (top to bottom)
        text_regions.sort(key=lambda r: r['position'][1])
        
        return text_regions