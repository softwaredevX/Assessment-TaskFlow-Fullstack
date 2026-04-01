import uuid
from datetime import datetime
from typing import List
from sqlmodel import SQLModel
from .card import CardResponse

class ListResponse(SQLModel):
    id: uuid.UUID
    name: str
    board_id: uuid.UUID
    position: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class ListWithCardsResponse(ListResponse):
    cards: List[CardResponse] = []
