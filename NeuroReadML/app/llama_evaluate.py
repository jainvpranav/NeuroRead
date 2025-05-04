from openai import OpenAI
import base64
import sys
from dotenv import load_dotenv
import os
load_dotenv()  # Load from .env
import re
BASE_URL = os.getenv("BASE_URL")
API_KEY = os.getenv("API_KEY")
MODEL = os.getenv("MODEL")


def encode_image_to_base64(image_path):
    """Encode an image file to base64."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


def load_prompt_from_file(file_path, mirror_writing_score):
    """Load the prompt template from a markdown file and replace {Mirror_writing_score}."""
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
            # Replace the placeholder with the given parameter
            content = content.replace("{Mirror_writing_score}", str(mirror_writing_score))
            return content
    except Exception as e:
        print(f"Error loading prompt file: {str(e)}")
        sys.exit(1)


import json

def extract_json_from_text(text):
    # This regex matches the first {...} block in the text
    match = re.search(r'\{.*?\}', text, re.DOTALL)
    if match:
        json_str = match.group(0)
        try:
            data = json.loads(json_str)
            return data
        except json.JSONDecodeError:
            return None  # JSON was invalid
    return None  # No JSON found

def analyze_image_for_spelling(image_path,mirror_score):
    """Analyze an image for spelling mistakes using Llama vision model."""
    model_name = MODEL  
    
    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )
    
    try:
        # Encode image to base64
        base64_image = encode_image_to_base64(image_path)
        
        # print(f"Analyzing image: {image_path}")
        prompt_template = load_prompt_from_file("app/prompt.md",mirror_score)
        # Construct the message with image content
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text", 
                        "text": prompt_template
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
            max_tokens=10000,
            stream=False  
        )
        
        # Return the full response
        response = response.choices[0].message.content
        if isinstance(response,str):
            response_json = extract_json_from_text(response)
            return response_json
        else:
            return response
        
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"Status code: {e.response.status_code}")
            print(f"Response text: {e.response.text if hasattr(e.response, 'text') else 'No response text'}")
        return f"Error: {str(e)}"



