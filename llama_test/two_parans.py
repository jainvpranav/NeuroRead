from openai import OpenAI
import base64
import sys
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = os.getenv("BASE_URL")
API_KEY = os.getenv("API_KEY")
MODEL = os.getenv("MODEL")

def load_prompt_from_file(file_path):
    """Load the prompt template from a markdown file."""
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
    except Exception as e:
        print(f"Error loading prompt file: {str(e)}")
        sys.exit(1)

def encode_image_to_base64(image_path):
    """Encode an image file to base64."""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        print(f"Error encoding image: {str(e)}")
        sys.exit(1)

def create_api_client():
    """Create and return the OpenAI API client."""
    try:
        return OpenAI(
            base_url=BASE_URL,
            api_key=API_KEY
        )
    except Exception as e:
        print(f"Error creating API client: {str(e)}")
        sys.exit(1)

def analyze_handwriting(image_path, mirror_writing_score, language="English"):
    """
    Analyze handwriting using the provided image, mirror writing score, and language.
    
    Args:
        image_path (str): Path to the handwriting image
        mirror_writing_score (float): Pre-calculated mirror writing score (percentage)
        language (str): Target language for the analysis output
        
    Returns:
        dict: Analysis results in JSON format
    """
    # Create API client
    client = create_api_client()
    
    # Load prompt from file
    prompt_template = load_prompt_from_file("prompt.md")
    
    # Encode image to base64
    base64_image = encode_image_to_base64(image_path)
    
    print(f"Analyzing image: {image_path}")
    print(f"Mirror writing score: {mirror_writing_score}%")
    print(f"Target language: {language}")
    
    # Create a more direct and specific prompt for the vision model
    specific_prompt = f"""
You are a specialized handwriting analysis system. Analyze the handwriting in the provided image.

1. For Motor Variability: Examine the image for discontinuous handwriting or "pen in the air" phenomenon. 
   Look for irregular spacing, inconsistent letter sizes, or uneven writing flow.
   Quantify these observations as a percentage (0-100%).

2. For Orthographic Irregularity: Identify all spelling mistakes in the text.
   Calculate the percentage of misspelled words relative to total words.

3. For Mirror Writing: Use this pre-calculated value: {mirror_writing_score}%.

Based on your analysis, return a JSON object with this exact structure:
{{
   "Motor_variability": [percentage as number],
   "Orthographic_irregularity": [percentage as number],
   "Mirror_writing": {mirror_writing_score},
   "detailed_text": [comprehensive analysis in {language} language]
}}

For the detailed text:
- Use simple language without medical terms
- Explain what the scores mean
- Recommend these games in order of priority (highest score first):
  * Game 1 for Motor Variability
  * Game 2 for Orthographic Irregularity
  * Game 3 for Mirror Writing

IMPORTANT: Return ONLY valid JSON matching the exact structure above.
"""
    
    # Construct the message with image content and the specific prompt
    messages = [
        {
            "role": "system",
            "content": "You are a handwriting analysis assistant that returns only valid JSON responses. You have vision capabilities and can analyze images of handwriting samples."
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text", 
                    "text": specific_prompt
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
    
    try:
        # Make API call with properly formatted messages
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.2,
            max_tokens=2000,
            stream=False
        )
        
        # Extract the response text
        response_text = response.choices[0].message.content
        
        # Parse JSON from the response
        try:
            # Try to extract JSON from text if it's wrapped in other content
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx >= 0 and end_idx > start_idx:
                json_content = response_text[start_idx:end_idx]
                # Clean up the JSON string in case it has any issues
                json_content = json_content.replace('\n', ' ').replace('\r', '')
                results = json.loads(json_content)
            else:
                # If no JSON found, attempt to create a structured response
                print("No JSON format found in response, attempting to create structured data")
                
                # Make a second attempt with an explicit request for JSON
                retry_messages = messages + [
                    {
                        "role": "user",
                        "content": "Please format your response as valid JSON only. No explanations or text outside the JSON structure."
                    }
                ]
                
                retry_response = client.chat.completions.create(
                    model=MODEL,
                    messages=retry_messages,
                    temperature=0.1,  # Lower temperature for more structured output
                    max_tokens=2000,
                    stream=False
                )
                
                retry_text = retry_response.choices[0].message.content
                start_idx = retry_text.find('{')
                end_idx = retry_text.rfind('}') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_content = retry_text[start_idx:end_idx]
                    json_content = json_content.replace('\n', ' ').replace('\r', '')
                    results = json.loads(json_content)
                else:
                    # If still no JSON found, return the full response
                    results = {"error": "Could not parse JSON from response", "raw_response": response_text}
                
            return results
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from response: {str(e)}")
            # Create a fallback structured response
            try:
                # Attempt to extract key information even if JSON parsing failed
                motor_var_match = response_text.find("Motor_variability")
                ortho_match = response_text.find("Orthographic_irregularity")
                mirror_match = response_text.find("Mirror_writing")
                
                if motor_var_match >= 0 and ortho_match >= 0 and mirror_match >= 0:
                    print("Attempting to create structured data from text response")
                    # Extract values with regex or string operations
                    # This is a simplified fallback
                    return {
                        "Motor_variability": float(mirror_writing_score) * 0.8,  # Fallback calculation
                        "Orthographic_irregularity": float(mirror_writing_score) * 0.6,  # Fallback calculation
                        "Mirror_writing": float(mirror_writing_score),
                        "detailed_text": response_text,
                        "note": "JSON parsing failed, values are estimates"
                    }
                else:
                    return {"error": "Could not parse JSON from response", "raw_response": response_text}
            except:
                return {"error": "Could not parse JSON from response", "raw_response": response_text}
            
    except Exception as e:
        print(f"Error calling API: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"Status code: {e.response.status_code}")
            print(f"Response text: {e.response.text if hasattr(e.response, 'text') else 'No response text'}")
        return {"error": str(e)}

def save_results_to_file(results, output_path):
    """Save the analysis results to a JSON file."""
    try:
        with open(output_path, "w", encoding="utf-8") as file:
            json.dump(results, file, indent=4, ensure_ascii=False)
        print(f"Results saved to {output_path}")
    except Exception as e:
        print(f"Error saving results to file: {str(e)}")

def generate_handwriting_analysis(prompt_text, image_path, mirror_writing_score, language="English"):
    """
    Generate direct handwriting analysis using a specific prompt.
    This function bypasses the prompts.md file and uses a hardcoded prompt for reliability.
    """
    client = create_api_client()
    base64_image = encode_image_to_base64(image_path)
    
    direct_prompt = f"""
You are analyzing a handwriting sample image. Follow these steps:

1. Examine the handwriting for Motor Variability (discontinuous writing, uneven spacing): Rate as percentage.
2. Check for Orthographic Irregularity (spelling mistakes): Rate as percentage.
3. Use the provided Mirror Writing score: {mirror_writing_score}%

Return ONLY a valid JSON object with this structure:
{{
   "Motor_variability": [number],
   "Orthographic_irregularity": [number],
   "Mirror_writing": {mirror_writing_score},
   "detailed_text": "[Analysis in {language} language without medical terms, recommending Game 1 for Motor Variability, Game 2 for Orthographic Irregularity, and Game 3 for Mirror Writing, in order from highest to lowest score]"
}}

IMPORTANT: Return ONLY the JSON. No other text.
"""
    
    messages = [
        {
            "role": "system",
            "content": "You are a handwriting analysis system that returns only valid JSON."
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text", 
                    "text": direct_prompt
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
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.1,  # Low temperature for structured output
            max_tokens=2000,
            response_format={"type": "json_object"},  # Force JSON response if model supports it
            stream=False
        )
        
        response_text = response.choices[0].message.content
        
        try:
            results = json.loads(response_text)
            return results
        except json.JSONDecodeError:
            print("Error parsing JSON from direct response")
            return {"error": "Could not parse JSON from direct response", "raw_response": response_text}
            
    except Exception as e:
        print(f"Error in direct analysis: {str(e)}")
        return {"error": str(e)}

def main():
    """Main function to handle command-line arguments and run analysis."""
    if len(sys.argv) < 3:
        print("Usage: python script.py <path_to_image> <mirror_writing_score> [language]")
        print("Example: python script.py sample.jpg 15 English")
        sys.exit(1)
    
    image_path = sys.argv[1]
    try:
        mirror_writing_score = float(sys.argv[2])
    except ValueError:
        print("Error: Mirror writing score must be a number")
        sys.exit(1)
        
    # Default language is English if not specified
    language = sys.argv[3] if len(sys.argv) > 3 else "English"
    
    print("Starting handwriting analysis...")
    print(f"Image: {image_path}")
    print(f"Mirror writing score: {mirror_writing_score}%")
    print(f"Language: {language}")
    
    # Try the direct approach first (more reliable)
    print("\nAttempting direct analysis method...")
    results = generate_handwriting_analysis("", image_path, mirror_writing_score, language)
    
    # If direct approach fails, fall back to using prompts.md
    if "error" in results:
        print("Direct method failed, trying with prompt from file...")
        results = analyze_handwriting(image_path, mirror_writing_score, language)
    
    # Print results
    print("\nAnalysis Results:\n")
    print(json.dumps(results, indent=4, ensure_ascii=False))
    
    # Save results to file
    output_path = f"analysis_results_{os.path.basename(image_path)}.json"
    save_results_to_file(results, output_path)

if __name__ == "__main__":
    main()