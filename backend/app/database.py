from pymongo import MongoClient
from .core.config import settings

# Create a single, reusable MongoClient instance
# It's recommended to have one MongoClient per process.
client = MongoClient(settings.MONGO_URI)

# This will get the database name from your MONGO_URI
# e.g., 'design_feedback_db'
db =client["snapfeedback"]

def get_db():
    """
    Dependency function to get the database instance.
    """
    return db 