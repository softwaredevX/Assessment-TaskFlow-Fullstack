import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

class CardResponse(SQLModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    list_id: uuid.UUID
    rank: str
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
