#!/usr/bin/env python3
"""
Test script for the new multiple images endpoint
"""
import requests
import base64
import json
import os

# Test images - you can replace these with actual image files
def create_test_image_base64():
    """Create a simple test image as base64"""
    # Create a simple 1x1 pixel JPEG image
    # This is a minimal valid JPEG
    jpeg_data = bytes.fromhex('ffd8ffe000104a46494600010101006000600000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00ffd9')
    return base64.b64encode(jpeg_data).decode('utf-8')

def test_multi_images_endpoint():
    """Test the new multiple images endpoint"""
    url = "http://localhost:8000/submit-design-multi"
    
    # Create test image data
    test_image_base64 = create_test_image_base64()
    
    # Prepare request data
    payload = {
        "playground_images_data_base64": [
            f"data:image/jpeg;base64,{test_image_base64}",
            f"data:image/jpeg;base64,{test_image_base64}"
        ],
        "toy_images_data_base64": [
            f"data:image/jpeg;base64,{test_image_base64}"
        ],
        "activity_description": "Test activity with multiple images"
    }
    
    print("Testing multiple images endpoint...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"\nResponse Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Response:")
            print(json.dumps(result, indent=2))
            
            # Check if the response has the expected structure
            if 'playground_image_urls' in result and 'toy_image_urls' in result:
                print(f"\n✅ Playground images: {len(result['playground_image_urls'])}")
                print(f"✅ Toy images: {len(result['toy_image_urls'])}")
                print(f"✅ Has playground feedback: {result.get('playground_feedback') is not None}")
                print(f"✅ Has toy feedback: {result.get('toy_feedback') is not None}")
            else:
                print("❌ Response missing expected fields")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")

def test_original_endpoint():
    """Test the original single image endpoint for comparison"""
    url = "http://localhost:8000/submit-design"
    
    test_image_base64 = create_test_image_base64()
    
    payload = {
        "playground_image_data_base64": f"data:image/jpeg;base64,{test_image_base64}",
        "toy_image_data_base64": f"data:image/jpeg;base64,{test_image_base64}",
        "activity_description": "Test activity with single images"
    }
    
    print("\nTesting original single image endpoint...")
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        print(f"Original endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Original endpoint still works")
        else:
            print(f"❌ Original endpoint error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Original endpoint request failed: {e}")

if __name__ == "__main__":
    print("🧪 Testing Multiple Images Functionality")
    print("=" * 50)
    
    # Test the new endpoint
    test_multi_images_endpoint()
    
    # Test the original endpoint
    test_original_endpoint()
    
    print("\n" + "=" * 50)
    print("🎉 Testing complete!") 