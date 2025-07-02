import os
import uuid
import base64
from typing import Dict, List, Optional
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pymongo.database import Database
from pydantic import ValidationError, parse_obj_as
from bson import ObjectId
from datetime import datetime

from . import crud, schemas
from .core import ai_models
import asyncio
from .core.config import settings
from .database import get_db

# Validate required environment variables
if not settings.MONGO_URI:
    raise ValueError("MONGO_URI environment variable is required but not set")
if not settings.OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required but not set")

# Create uploads directory on startup
os.makedirs("uploaded_images", exist_ok=True)

app = FastAPI(title="Design Feedback App")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://snap-feedback.vercel.app", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for development
app.mount("/images", StaticFiles(directory="uploaded_images"), name="images")

def convert_objectids(obj):
    if isinstance(obj, dict):
        return {k: convert_objectids(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectids(i) for i in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj

async def generate_improvement_suggestions_background(
    submission_id: str,
    playground_images_base64: List[str],
    toy_images_base64: List[str],
    activity_description: Optional[str],
    playground_feedback: Dict,
    toy_feedback: Dict,
    db: Database
):
    """
    Background task to generate improvement suggestions after evaluation is complete.
    """
    try:
        # Generate playground improvement suggestions
        playground_suggestions = None
        if playground_feedback and playground_images_base64:
            playground_suggestions = await ai_models.get_improvement_suggestions(
                images_data_base64=playground_images_base64,
                text_description=activity_description,
                evaluation_results=playground_feedback,
                prompt_base=settings.AI_IMPROVEMENT_SUGGESTIONS_PROMPT,
                openai_api_key=settings.OPENAI_API_KEY,
                model_name=settings.OPENAI_MODEL
            )

        # Generate toy improvement suggestions
        toy_suggestions = None
        if toy_feedback and toy_images_base64:
            toy_suggestions = await ai_models.get_improvement_suggestions(
                images_data_base64=toy_images_base64,
                text_description=activity_description,
                evaluation_results=toy_feedback,
                prompt_base=settings.AI_IMPROVEMENT_SUGGESTIONS_PROMPT,
                openai_api_key=settings.OPENAI_API_KEY,
                model_name=settings.OPENAI_MODEL
            )

        # Store improvement suggestions in database
        suggestions_data = {}
        if playground_suggestions:
            suggestions_data['playground_suggestions'] = playground_suggestions
        if toy_suggestions:
            suggestions_data['toy_suggestions'] = toy_suggestions

        if suggestions_data:
            crud.create_improvement_suggestions(
                db, 
                submission_id=submission_id, 
                suggestions_data=suggestions_data
            )
            print(f"Successfully generated and stored improvement suggestions for submission {submission_id}")
        else:
            print(f"No improvement suggestions generated for submission {submission_id}")

    except Exception as e:
        print(f"Error generating improvement suggestions for submission {submission_id}: {e}")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Design Feedback API!"}

@app.post("/submit-design", response_model=schemas.SubmissionResponse, tags=["Submissions"])
async def submit_design(
    submission: schemas.SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_db)
):
    if submission.activity_description and len(submission.activity_description) > settings.MAX_ACTIVITY_DESCRIPTION_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Activity description exceeds maximum length of {settings.MAX_ACTIVITY_DESCRIPTION_LENGTH} characters."
        )

    # Save images and get URLs
    try:
        image_urls = {}
        for key, b64_data in [("playground", submission.playground_image_data_base64), ("toy", submission.toy_image_data_base64)]:
            image_data = base64.b64decode(b64_data.split(',')[1])
            filename = f"{uuid.uuid4().hex}.jpeg"
            filepath = os.path.join("uploaded_images", filename)
            with open(filepath, "wb") as f:
                f.write(image_data)
            image_urls[key] = f"/images/{filename}"
    except (base64.binascii.Error, IndexError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid Base64 image data: {e}")

    # Create initial submission in DB
    initial_submission_data = {
        "playground_image_url": image_urls["playground"],
        "toy_image_url": image_urls["toy"],
        "activity_description": submission.activity_description,
        "playground_feedback": None,
        "toy_feedback": None
    }
    db_submission = crud.create_submission(db, submission_data=initial_submission_data)

    # Parallel AI feedback calls for playground and toy
    t_playground = ai_models.get_ai_feedback(
        image_data_base64=submission.playground_image_data_base64.split(',')[1],
        text_description=submission.activity_description,
        prompt_base=settings.AI_PLAYGROUND_PROMPT,
        openai_api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_MODEL
    )
    t_toy = ai_models.get_ai_feedback(
        image_data_base64=submission.toy_image_data_base64.split(',')[1],
        text_description=submission.activity_description,
        prompt_base=settings.AI_TOY_PROMPT,
        openai_api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_MODEL
    )
    playground_feedback_json, toy_feedback_json = await asyncio.gather(t_playground, t_toy)

    # Validate and update DB with feedback
    try:
        # The AI response should be a dictionary with criterion names as keys
        # and objects with score and justification as values
        validated_playground_feedback = parse_obj_as(Dict[str, schemas.CriterionFeedback], playground_feedback_json)
        validated_toy_feedback = parse_obj_as(Dict[str, schemas.CriterionFeedback], toy_feedback_json)
        
        # Convert pydantic models to dicts for the crud function
        playground_feedback_dict = {k: v.model_dump() for k, v in validated_playground_feedback.items()}
        toy_feedback_dict = {k: v.model_dump() for k, v in validated_toy_feedback.items()}
        
        crud.update_submission_feedback(db, submission_id=str(db_submission["_id"]), feedback_type="playground_feedback", feedback_data=playground_feedback_dict)
        updated_submission = crud.update_submission_feedback(db, submission_id=str(db_submission["_id"]), feedback_type="toy_feedback", feedback_data=toy_feedback_dict)

        # Start background task to generate improvement suggestions
        background_tasks.add_task(
            generate_improvement_suggestions_background,
            submission_id=str(db_submission["_id"]),
            playground_images_base64=[submission.playground_image_data_base64.split(',')[1]],
            toy_images_base64=[submission.toy_image_data_base64.split(',')[1]],
            activity_description=submission.activity_description,
            playground_feedback=playground_feedback_dict,
            toy_feedback=toy_feedback_dict,
            db=db
        )

    except ValidationError as e:
        raise HTTPException(status_code=500, detail=f"AI returned data in an invalid format: {e}")

    if not updated_submission:
        raise HTTPException(status_code=404, detail="Submission not found after update.")

    # Convert all ObjectIds to strings for FastAPI response validation
    updated_submission = convert_objectids(updated_submission)
    return updated_submission

@app.post("/submit-design-multi", response_model=schemas.SubmissionResponseMulti, tags=["Submissions"])
async def submit_design_multi(
    submission: schemas.SubmissionCreateMulti,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_db)
):
    if submission.activity_description and len(submission.activity_description) > settings.MAX_ACTIVITY_DESCRIPTION_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Activity description exceeds maximum length of {settings.MAX_ACTIVITY_DESCRIPTION_LENGTH} characters."
        )

    # Create submission folder
    submission_id = str(uuid.uuid4())
    submission_folder = os.path.join("uploaded_images", submission_id)
    playground_folder = os.path.join(submission_folder, "playground")
    toy_folder = os.path.join(submission_folder, "toy")
    
    os.makedirs(playground_folder, exist_ok=True)
    os.makedirs(toy_folder, exist_ok=True)

    # Save images and get URLs
    try:
        playground_urls = []
        toy_urls = []
        
        # Save playground images
        for i, b64_data in enumerate(submission.playground_images_data_base64):
            image_data = base64.b64decode(b64_data.split(',')[1])
            filename = f"image_{i+1}.jpeg"
            filepath = os.path.join(playground_folder, filename)
            with open(filepath, "wb") as f:
                f.write(image_data)
            playground_urls.append(f"/images/{submission_id}/playground/{filename}")
        
        # Save toy images
        for i, b64_data in enumerate(submission.toy_images_data_base64):
            image_data = base64.b64decode(b64_data.split(',')[1])
            filename = f"image_{i+1}.jpeg"
            filepath = os.path.join(toy_folder, filename)
            with open(filepath, "wb") as f:
                f.write(image_data)
            toy_urls.append(f"/images/{submission_id}/toy/{filename}")
            
    except (base64.binascii.Error, IndexError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid Base64 image data: {e}")

    # Create initial submission in DB
    initial_submission_data = {
        "playground_image_urls": playground_urls,
        "toy_image_urls": toy_urls,
        "activity_description": submission.activity_description,
        "playground_feedback": None,
        "toy_feedback": None
    }
    db_submission = crud.create_submission_multi(db, submission_data=initial_submission_data)

    # Parallel AI feedback calls for playground and toy images
    playground_images_base64 = [img.split(',')[1] for img in submission.playground_images_data_base64]
    toy_images_base64 = [img.split(',')[1] for img in submission.toy_images_data_base64]
    t_playground = ai_models.get_ai_feedback_multi(
        images_data_base64=playground_images_base64,
        text_description=submission.activity_description,
        prompt_base=settings.AI_PLAYGROUND_PROMPT,
        openai_api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_MODEL
    )
    t_toy = ai_models.get_ai_feedback_multi(
        images_data_base64=toy_images_base64,
        text_description=submission.activity_description,
        prompt_base=settings.AI_TOY_PROMPT,
        openai_api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_MODEL
    )
    playground_feedback_json, toy_feedback_json = await asyncio.gather(t_playground, t_toy)

    # Validate and update DB with feedback (catching partial failures)
    playground_feedback_dict = None
    toy_feedback_dict = None
    
    # Playground feedback
    try:
        validated_playground_feedback = parse_obj_as(Dict[str, schemas.CriterionFeedback], playground_feedback_json)
        playground_feedback_dict = {k: v.model_dump() for k, v in validated_playground_feedback.items()}
        crud.update_submission_feedback(db, submission_id=str(db_submission["_id"]), feedback_type="playground_feedback", feedback_data=playground_feedback_dict)
    except Exception as e:
        print(f"Playground feedback error: {e}")

    # Toy feedback
    try:
        validated_toy_feedback = parse_obj_as(Dict[str, schemas.CriterionFeedback], toy_feedback_json)
        toy_feedback_dict = {k: v.model_dump() for k, v in validated_toy_feedback.items()}
        crud.update_submission_feedback(db, submission_id=str(db_submission["_id"]), feedback_type="toy_feedback", feedback_data=toy_feedback_dict)
    except Exception as e:
        print(f"Toy feedback error: {e}")

    # Start background task to generate improvement suggestions
    background_tasks.add_task(
        generate_improvement_suggestions_background,
        submission_id=str(db_submission["_id"]),
        playground_images_base64=playground_images_base64,
        toy_images_base64=toy_images_base64,
        activity_description=submission.activity_description,
        playground_feedback=playground_feedback_dict,
        toy_feedback=toy_feedback_dict,
        db=db
    )

    # Fetch the fully updated submission
    updated_submission = crud.get_submission(db, submission_id=str(db_submission["_id"]))
    # Convert all ObjectIds to strings for FastAPI response validation
    updated_submission = convert_objectids(updated_submission)
    return updated_submission

@app.get("/feedback/{submission_id}", response_model=schemas.SubmissionResponse, tags=["Submissions"])
async def get_feedback(submission_id: str, db: Database = Depends(get_db)):
    db_submission = crud.get_submission(db, submission_id=submission_id)
    if db_submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    # Convert all ObjectIds to strings for FastAPI response validation
    db_submission = convert_objectids(db_submission)
    return db_submission

@app.get("/improvement-suggestions/{submission_id}", response_model=schemas.ImprovementSuggestionsResponse, tags=["Improvement Suggestions"])
async def get_improvement_suggestions(submission_id: str, db: Database = Depends(get_db)):
    """
    Get improvement suggestions for a submission.
    """
    db_suggestions = crud.get_improvement_suggestions(db, submission_id=submission_id)
    if db_suggestions is None:
        raise HTTPException(status_code=404, detail="Improvement suggestions not found")
    # Convert all ObjectIds to strings for FastAPI response validation
    db_suggestions = convert_objectids(db_suggestions)
    return db_suggestions

@app.post("/improvement-suggestions/{submission_id}/regenerate", response_model=schemas.ImprovementSuggestionsResponse, tags=["Improvement Suggestions"])
async def regenerate_improvement_suggestions(
    submission_id: str,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_db)
):
    """
    Regenerate improvement suggestions for a submission.
    """
    # Get the submission to access images and feedback
    db_submission = crud.get_submission(db, submission_id=submission_id)
    if db_submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Check if we have feedback to work with
    if not db_submission.get("playground_feedback") and not db_submission.get("toy_feedback"):
        raise HTTPException(status_code=400, detail="No evaluation feedback available for this submission")
    
    # For now, we'll need to reconstruct the base64 images from URLs
    # This is a limitation - in a production system, you might want to store base64 data
    # or implement a more sophisticated image retrieval system
    
    # Start background task to regenerate improvement suggestions
    background_tasks.add_task(
        generate_improvement_suggestions_background,
        submission_id=submission_id,
        playground_images_base64=[],  # Would need to be implemented with image retrieval
        toy_images_base64=[],  # Would need to be implemented with image retrieval
        activity_description=db_submission.get("activity_description"),
        playground_feedback=db_submission.get("playground_feedback"),
        toy_feedback=db_submission.get("toy_feedback"),
        db=db
    )
    
    return {"message": "Improvement suggestions regeneration started"} 