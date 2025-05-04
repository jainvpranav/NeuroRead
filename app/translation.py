

# import requests

# # API_URL = "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-hi"  # English to Hindi
# API_URL = "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-te" #en to te


# data = {
#     "inputs": "Your English sentence here"  # Replace with your English sentence
# }

# response = requests.post(API_URL, headers=headers, json=data)

# # Extract and print the Hindi translation
# print(response)
# # output = response.json()
# # print(output[0]['translation_text'])from sarvamai import SarvamAI
from sarvamai import SarvamAI
from dotenv import load_dotenv
import os
load_dotenv()

def get_target_language_code(language):
    language_map = {
        "english": "en-IN",
        "hindi": "hi-IN",
        "bengali": "bn-IN",
        "gujrati": "gu-IN",
        "kannada": "kn-IN",
        "malayalam": "ml-IN",
        "marathi": "mr-IN",
        "odia": "od-IN",
        "punjabi": "pa-IN",
        "tamil": "ta-IN",
        "telugu": "te-IN"
    }
    return language_map.get(language, "Unknown language")


def translate(input_text,language):
    client = SarvamAI(
        api_subscription_key=os.getenv("TRANSLATION_API"),
    )
    input = input_text
    target_language_code = get_target_language_code(language)
    print(target_language_code)
    response = client.text.translate(
        input=input,
        source_language_code="auto",
        target_language_code=target_language_code,
    )

    print(response)

translate("Hello","hindi")