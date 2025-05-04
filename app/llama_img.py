from openai import OpenAI
import base64
import sys
from dotenv import load_dotenv
import os
load_dotenv()  # Load from .env

BASE_URL = os.getenv("BASE_URL")
API_KEY = os.getenv("API_KEY")
MODEL = os.getenv("MODEL")
print("BASE", BASE_URL)
print("API",API_KEY)
def encode_image_to_base64(image_path):
    """Encode an image file to base64."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def analyze_image_for_spelling(image_path):
    """Analyze an image for spelling mistakes using Llama vision model."""
    model_name = MODEL  
    
    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )
    
    try:
        # Encode image to base64
        base64_image = encode_image_to_base64(image_path)
        
        print(f"Analyzing image: {image_path}")
        
        # Construct the message with image content
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text", 
                        "text": "Please analyze this image and identify any spelling mistakes. Count the total words, the number of spelling mistakes, and calculate what percentage of words have spelling mistakes. List each spelling mistake you find."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ]
        
        # Make API call with properly formatted messages
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.2,
            max_tokens=2000,
            stream=False  # Use non-streaming for this task
        )
        
        # Return the full response
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"Status code: {e.response.status_code}")
            print(f"Response text: {e.response.text if hasattr(e.response, 'text') else 'No response text'}")
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <path_to_image>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    result = analyze_image_for_spelling(image_path)
    print("\nAnalysis Result:\n")
    print(result)