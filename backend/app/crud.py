from pymongo.database import Database
from typing import Optional, Dict, List
from bson import ObjectId
from datetime import datetime

SUBMISSION_COLLECTION = "submissions"
IMPROVEMENT_SUGGESTIONS_COLLECTION = "improvement_suggestions"

def create_submission(db: Database, *, submission_data: dict) -> Dict:
    """
    Inserts a new submission record into the database.
    """
    submission_data['created_at'] = datetime.utcnow()
    submission_data['updated_at'] = datetime.utcnow()
    result = db[SUBMISSION_COLLECTION].insert_one(submission_data)
    inserted_doc = db[SUBMISSION_COLLECTION].find_one({"_id": result.inserted_id})
    return inserted_doc

def create_submission_multi(db: Database, *, submission_data: dict) -> Dict:
    """
    Inserts a new submission record with multiple images into the database.
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

def create_improvement_suggestions(db: Database, *, submission_id: str, suggestions_data: dict) -> Dict:
    """
    Inserts improvement suggestions for a submission into the database.
    """
    suggestions_data['submission_id'] = ObjectId(submission_id)
    suggestions_data['created_at'] = datetime.utcnow()
    suggestions_data['updated_at'] = datetime.utcnow()
    result = db[IMPROVEMENT_SUGGESTIONS_COLLECTION].insert_one(suggestions_data)
    inserted_doc = db[IMPROVEMENT_SUGGESTIONS_COLLECTION].find_one({"_id": result.inserted_id})
    return inserted_doc

def get_improvement_suggestions(db: Database, *, submission_id: str) -> Optional[Dict]:
    """
    Retrieves improvement suggestions by submission ID.
    """
    return db[IMPROVEMENT_SUGGESTIONS_COLLECTION].find_one({"submission_id": ObjectId(submission_id)})

def update_improvement_suggestions(
    db: Database, *, submission_id: str, suggestions_data: dict
) -> Optional[Dict]:
    """
    Updates improvement suggestions for a submission.
    """
    update_data = {
        "$set": {
            **suggestions_data,
            "updated_at": datetime.utcnow()
        }
    }
    
    update_result = db[IMPROVEMENT_SUGGESTIONS_COLLECTION].update_one(
        {"submission_id": ObjectId(submission_id)},
        update_data,
        upsert=True
    )
    
    if update_result.modified_count >= 0:  # Modified or upserted
        return db[IMPROVEMENT_SUGGESTIONS_COLLECTION].find_one({"submission_id": ObjectId(submission_id)})
    
    return None 