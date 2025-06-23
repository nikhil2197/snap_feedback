from pymongo.database import Database
from typing import Optional, Dict, List
from bson import ObjectId
from datetime import datetime

SUBMISSION_COLLECTION = "submissions"

def create_submission(db: Database, *, submission_data: dict) -> Dict:
    """
    Inserts a new submission record into the database.
    """
    submission_data['created_at'] = datetime.utcnow()
    submission_data['updated_at'] = datetime.utcnow()
    result = db[SUBMISSION_COLLECTION].insert_one(submission_data)
    inserted_doc = db[SUBMISSION_COLLECTION].find_one({"_id": result.inserted_id})
    return inserted_doc

def get_submission(db: Database, *, submission_id: str) -> Optional[Dict]:
    """
    Retrieves a submission by its ID.
    """
    return db[SUBMISSION_COLLECTION].find_one({"_id": ObjectId(submission_id)})

def update_submission_feedback(
    db: Database, *, submission_id: str, feedback_type: str, feedback_data: List[dict]
) -> Optional[Dict]:
    """
    Updates a submission with feedback for either the playground or the toy.
    'feedback_type' must be 'playground_feedback' or 'toy_feedback'.
    """
    if feedback_type not in ["playground_feedback", "toy_feedback"]:
        raise ValueError("Invalid feedback_type specified.")
    
    update_data = {
        "$set": {
            feedback_type: feedback_data,
            "updated_at": datetime.utcnow()
        }
    }
    
    update_result = db[SUBMISSION_COLLECTION].update_one(
        {"_id": ObjectId(submission_id)},
        update_data
    )
    
    if update_result.modified_count == 1:
        return db[SUBMISSION_COLLECTION].find_one({"_id": ObjectId(submission_id)})
    
    return None 