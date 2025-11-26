from typing import Generic, TypeVar, Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict
from pydantic.generics import GenericModel

T = TypeVar('T')

class ErrorDetail(BaseModel):
    """Detailed error information"""
    error_code: str = Field(..., description="Error code")
    detail: str = Field(..., description="Error description")
    error_details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    
    model_config = ConfigDict(from_attributes=True)

class APIResponse(GenericModel, Generic[T]):
    """Standard API response model"""
    success: bool = Field(..., description="Whether the request was successful")
    data: Optional[T] = Field(None, description="Response data")
    message: Optional[str] = Field(None, description="Response message")
    error: Optional[ErrorDetail] = Field(None, description="Error details if success is false")
    meta: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    
    model_config = ConfigDict(from_attributes=True)