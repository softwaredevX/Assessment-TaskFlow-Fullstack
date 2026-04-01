import uuid
from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel
from .list import ListResponse, ListWithCardsResponse

class BoardResponse(SQLModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class BoardWithListsResponse(BoardResponse):
    lists: List[ListWithCardsResponse] = []
