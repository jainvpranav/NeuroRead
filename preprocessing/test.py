from image_validator import assess_image_quality

# Read image bytes
with open('image.png', 'rb') as f:
    image_bytes = f.read()

# Check quality
from image_validator import assess_image_quality

# Assume you loaded image_bytes properly...

response = assess_image_quality(image_bytes)

# To extract the data:
data = response.body.decode('utf-8')   # response.body is bytes, decode to string
import json
result = json.loads(data)              # Now you have a proper dict

# Now you can use it like a dictionary:
if not result['status'] == "success":
    print("Image validation failed:", result['reason'])
else:
    print("Image is good!")
