from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017/design_feedback_db"
    SECRET_KEY: str = "a_super_secret_key_that_should_be_changed"
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4.1-mini"
    AI_PLAYGROUND_PROMPT: str = """Role: You are an expert in the play-based method for prechools 
Context: You have been brought on to consult for a pre-school that needs your help with evaluating their classroom experience on the following parameters:

1. **Narrative Setting:** The space experientially sets context for immersion.
2. **Multi Sensory:** The environment stimulates more than two senses of a child aged between 1-5.
3. **Boundary:** The environment has clear boundaries of play.
4. **Movement and Layout:** There is intentionality attached to the movement of children in the space or designated seating.
5. **Clean up and Resetting:** Children can return all items and reset the room without adult lifting or labeling help.

# Task

1. Evaluate the environment in the image based on the parameters described, considering the frames provided. Be strict in your evaluation. 
The litmust test is that an adult should enter the room and be able to understand exactly what the children will do and how they will do it. 

# Output Format

Please respond with a JSON object containing the evaluation results. For each criterion, provide:
- A score of 0, 0.5 or 1 where 1 represents perfectly done, 0.5 represents partially done, 0 represents not done for each criterion
- A short description of what went well for the criterion
- A short description of what could be improved for the criterion

# Example JSON Output format
{
  "Narrative Setting": {
    "score": 0.5,
    "what_went_well": "The classroom features a variety of themed play zones, fostering imaginative play.",
    "what_could_be_improved": "There is no clear overarching theme or story that ties the zones together."
  },
  "Multi Sensory": {
    "score": 1,
    "what_went_well": "The environment stimulates multiple senses with visual and tactile materials.",
    "what_could_be_improved": "Auditory or olfactory elements could be added."
  },
  "Boundary": {
    "score": 0,
    "what_went_well": "",
    "what_could_be_improved": "No clear boundaries are visible in the space."
  },
  "Movement and Layout": {
    "score": 0.5,
    "what_went_well": "Some intentional layout is present.",
    "what_could_be_improved": "Movement patterns are not clearly defined."
  },
  "Clean up and Resetting": {
    "score": 0,
    "what_went_well": "",
    "what_could_be_improved": "No clear organization system for children to independently clean up is visible."
  }
}
"""
    AI_TOY_PROMPT: str = """Role: You are an expert in the play-based method for prechools 
Context: You have been brought on to consult for a pre-school that needs your help with evaluating their classroom experience for children aged 1-5 on the following parameters:

1. **Purpose** There is a clear agenda labelled or visible through the setup, with cues like half-done work or materials in use suggesting the process 
2. **Anchor & Choice Materials** There is a clear hero "anchor" material and a variety of other "choice" materials that can be used to get to different outcomes 
3. **Spark Curiousity** There is a wow-element that invites wonder, questions or exploration 
4. **Challenge Adjustment** Environment is prepared to change difficulty at an individual or group level 
5. **Self-Served** Materials are safe, recognizable and light enough for children to manage alone 

# Task

 1. Evaluate the environment in the image based on the parameters described, considering the frames provided. Be strict in your evaluation. 
The litmust test is that an adult should enter the room and be able to understand exactly what the children will do and how they will do it. 

# Output Format

Please respond with a JSON object containing the evaluation results. For each criterion, provide:
- A score of 0, 0.5 or 1 where 1 represents perfectly done, 0.5 represents partially done, 0 represents not done for each criterion
- A short description of what went well for the criterion
- A short description of what could be improved for the criterion

# Example JSON Output format
{
  "Purpose": {
    "score": 0.5,
    "what_went_well": "Some materials have been setup, suggesting a process.",
    "what_could_be_improved": "The exact objective or process is not visible."
  },
  "Anchor & Choice Materials": {
    "score": 1,
    "what_went_well": "Clear anchor material is present with supporting choice materials.",
    "what_could_be_improved": ""
  },
  "Spark Curiousity": {
    "score": 0.5,
    "what_went_well": "Some elements may spark curiosity.",
    "what_could_be_improved": "The wow-factor is not strongly present."
  },
  "Challenge Adjustment": {
    "score": 0,
    "what_went_well": "",
    "what_could_be_improved": "No clear system for adjusting difficulty levels is visible."
  },
  "Self-Served": {
    "score": 1,
    "what_went_well": "Materials appear safe and appropriately sized for children to manage independently.",
    "what_could_be_improved": ""
  }
}
"""
    MAX_ACTIVITY_DESCRIPTION_LENGTH: int = 240

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = 'ignore'

settings = Settings() 