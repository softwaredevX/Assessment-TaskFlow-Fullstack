import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

if TYPE_CHECKING:
    from .board import Board
    from .card import Card

class ListCreate(SQLModel):
    name: str = Field(max_length=255)

class List(TimestampedModel, table=True):
    __tablename__ = "lists"

    name: str = Field(max_length=255)
    position: float = Field(default=0.0) # Floating point indexing for ordering
    board_id: uuid.UUID = Field(foreign_key="boards.id")

    board: Optional["Board"] = Relationship(back_populates="lists")
    cards: List["Card"] = Relationship(
        back_populates="list",
        cascade_delete=True,
        sa_relationship_kwargs={"order_by": "Card.rank"}
    )
