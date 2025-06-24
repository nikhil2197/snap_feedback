import base64
import requests
import json

# === Update these paths to your local image files ===
PLAYGROUND_IMAGE_PATH = "filepath"
TOY_IMAGE_PATH = "filepath"

# === Optional: Update this description if you want ===
ACTIVITY_DESCRIPTION = "description"

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        b64_str = base64.b64encode(img_file.read()).decode("utf-8")
        return f"data:image/jpeg;base64,{b64_str}"

def main():
    playground_b64 = encode_image_to_base64(PLAYGROUND_IMAGE_PATH)
    toy_b64 = encode_image_to_base64(TOY_IMAGE_PATH)

    payload = {
        "playground_image_data_base64": playground_b64,
        "toy_image_data_base64": toy_b64,
        "activity_description": ACTIVITY_DESCRIPTION
    }

    url = "http://localhost:8000/submit-design"
    headers = {"Content-Type": "application/json"}

    print("Sending request to backend...")
    response = requests.post(url, headers=headers, data=json.dumps(payload))

    print("Status code:", response.status_code)
    try:
        print("Response JSON:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print("Response content:", response.text)

if __name__ == "__main__":
    main()