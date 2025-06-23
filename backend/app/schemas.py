from pydantic import BaseModel, Field, ConfigDict, RootModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    """
    Custom Pydantic type for MongoDB's ObjectId.
    """
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema(
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                )
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class CriterionFeedback(BaseModel):
    criterion_name: str
    passed: bool
    what_went_well: str
    what_could_be_better: str

class FeedbackDetails(RootModel):
    root: List[CriterionFeedback]

class SubmissionCreate(BaseModel):
    playground_image_data_base64: str
    toy_image_data_base64: str
    activity_description: Optional[str] = None

class SubmissionInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    playground_image_url: str
    toy_image_url: str
    activity_description: Optional[str] = None
    playground_feedback: Optional[List[CriterionFeedback]] = None
    toy_feedback: Optional[List[CriterionFeedback]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

class SubmissionResponse(BaseModel):
    id: str = Field(alias="_id")
    playground_image_url: str
    toy_image_url: str
    activity_description: Optional[str] = None
    playground_feedback: Optional[List[CriterionFeedback]] = None
    toy_feedback: Optional[List[CriterionFeedback]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    ) 