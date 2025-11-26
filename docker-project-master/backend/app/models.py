from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ARRAY, JSON
from .database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    priority = Column(String, default="normal")  # urgent/high/normal/low
    tags = Column(ARRAY(String), default=[])  # PostgreSQL array type
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    estimated_time = Column(Integer, nullable=True)  # en minutes
    starred = Column(Boolean, default=False)
    archived = Column(Boolean, default=False)
    completed = Column(Boolean, default=False)