import uuid
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class BoardCreate(SQLModel):
    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)

class BoardUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)

class Board(TimestampedModel, table=True):
    __tablename__ = "boards"

    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    owner_id: uuid.UUID = Field(foreign_key="users.id")

    owner: "User" = Relationship(back_populates="boards")
    lists: List["List"] = Relationship(
        back_populates="board",
        cascade_delete=True,
        sa_relationship_kwargs={"order_by": "List.position"}
    )
