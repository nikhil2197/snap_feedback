import os
import uuid
import base64
from typing import Dict
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pymongo.database import Database
from pydantic import ValidationError, parse_obj_as
from bson import ObjectId

from . import crud, schemas
from .core import ai_models
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
    else:
        return obj

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Design Feedback API!"}

@app.post("/submit-design", response_model=schemas.SubmissionResponse, tags=["Submissions"])
async def submit_design(
    submission: schemas.SubmissionCreate,
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

    # Get AI feedback for playground
    playground_feedback_json = await ai_models.get_ai_feedback(
        image_data_base64=submission.playground_image_data_base64.split(',')[1],
        text_description=submission.activity_description,
        prompt_base=settings.AI_PLAYGROUND_PROMPT,
        openai_api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_MODEL
    )
    
    # Get AI feedback for toy
    toy_feedback_json = await ai_models.get_ai_feedback(
        image_data_base64=submission.toy_image_data_base64.split(',')[1],
        text_description=submission.activity_description,
        prompt_base=settings.AI_TOY_PROMPT,
        openai_api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_MODEL
    )

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

    # Get AI feedback for playground (all images)
    playground_images_base64 = [img.split(',')[1] for img in submission.playground_images_data_base64]
    playground_feedback_json = await ai_models.get_ai_feedback_multi(
        images_data_base64=playground_images_base64,
        text_description=submission.activity_description,
        prompt_base=settings.AI_PLAYGROUND_PROMPT,
        openai_api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_MODEL
    )
    
    # Get AI feedback for toy (all images)
    toy_images_base64 = [img.split(',')[1] for img in submission.toy_images_data_base64]
    toy_feedback_json = await ai_models.get_ai_feedback_multi(
        images_data_base64=toy_images_base64,
        text_description=submission.activity_description,
        prompt_base=settings.AI_TOY_PROMPT,
        openai_api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_MODEL
    )

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

    except ValidationError as e:
        raise HTTPException(status_code=500, detail=f"AI returned data in an invalid format: {e}")

    if not updated_submission:
        raise HTTPException(status_code=404, detail="Submission not found after update.")

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