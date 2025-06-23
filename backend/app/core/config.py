from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017/design_feedback_db"
    SECRET_KEY: str = "a_super_secret_key_that_should_be_changed"
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4.1-mini"
    AI_PLAYGROUND_PROMPT: str = "Analyze the provided playground image for safety, creativity, and engagement. Provide constructive feedback focusing on potential hazards, accessibility, and unique features. Format the output as JSON with an array of criteria. Each criterion should have 'criterion_name': string, 'passed': boolean, 'what_went_well': string, 'what_could_be_better': string."
    AI_TOY_PROMPT: str = "Evaluate the toy design for age appropriateness, safety (choking hazards, sharp edges), durability, and play value. Suggest improvements for educational or developmental benefits. Format the output as JSON with an array of criteria. Each criterion should have 'criterion_name': string, 'passed': boolean, 'what_went_well': string, 'what_could_be_better': string."
    MAX_ACTIVITY_DESCRIPTION_LENGTH: int = 240

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = 'ignore'

settings = Settings() 