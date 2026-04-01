import uuid
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

if TYPE_CHECKING:
    from .list import List

class CardCreate(SQLModel):
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    list_id: uuid.UUID

class CardUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)

class CardMove(SQLModel):
    list_id: uuid.UUID
    after_card_id: Optional[uuid.UUID] = None
    before_card_id: Optional[uuid.UUID] = None
    rank: Optional[str] = None

class Card(TimestampedModel, table=True):
    __tablename__ = "cards"

    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    rank: str = Field(index=True, max_length=255) # LexoRank string for ordering
    list_id: uuid.UUID = Field(foreign_key="lists.id")
    version: int = Field(default=1, sa_column_kwargs={"server_default": "1"})

    list: Optional["List"] = Relationship(back_populates="cards")
