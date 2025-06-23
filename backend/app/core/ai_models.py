import json
from typing import Optional
from openai import OpenAI, APIError
from fastapi import HTTPException

async def get_ai_feedback(
    image_data_base64: str,
    text_description: Optional[str],
    prompt_base: str,
    openai_api_key: str,
    model_name: str
) -> dict:
    """
    Gets feedback from OpenAI's vision model.
    """
    try:
        client = OpenAI(api_key=openai_api_key)

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_base},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data_base64}",
                            "detail": "low"
                        }
                    }
                ]
            }
        ]
        
        if text_description:
            messages[0]["content"].insert(1, {"type": "text", "text": f"Activity Description: {text_description}"})

        print(f"Sending request to OpenAI with model: {model_name}")
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            response_format={"type": "json_object"},
            max_tokens=1500,
        )

        response_content = response.choices[0].message.content
        print("Received response from OpenAI.")
        
        if not response_content:
            raise HTTPException(status_code=500, detail="AI returned an empty response.")

        return json.loads(response_content)

    except APIError as e:
        print(f"OpenAI API Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred with the OpenAI API: {e}")
    except json.JSONDecodeError:
        print(f"Failed to decode JSON from AI response: {response_content}")
        raise HTTPException(status_code=500, detail="Failed to parse JSON feedback from AI.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while getting AI feedback.") 