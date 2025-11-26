from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from enum import Enum

class PriorityEnum(str, Enum):
    URGENT = "urgent"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, examples=["Refactor UI"])
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM, description="Priorité de la tâche")
    tags: List[str] = Field(
        default_factory=list,
        examples=[["ui/ux", "mobile"]],
        description="Tags de catégorisation"
    )
    due_date: Optional[datetime] = Field(
        None,
        examples=["2024-01-22T17:00:00"],
        description="Date limite de réalisation"
    )
    estimated_time: Optional[int] = Field(
        None,
        ge=0,
        le=1440,
        examples=[480],
        description="Temps estimé en minutes (0-1440)"
    )
    starred: bool = Field(
        default=False,
        description="Tâche mise en avant"
    )
    archived: bool = Field(
        default=False,
        description="Tâche archivée"
    )

    @field_validator('tags')
    def validate_tags(cls, v):
        if len(v) > 5:
            raise ValueError("Maximum 5 tags autorisés")
        return [tag.lower() for tag in v]

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    starred: Optional[bool] = None
    archived: Optional[bool] = None
    due_date: Optional[datetime] = None
    estimated_time: Optional[int] = None
    tags: Optional[List[str]] = None

class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    completed: bool = False

    class Config:
        from_attributes = True  # Anciennement orm_mode=True dans Pydantic v1