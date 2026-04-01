from typing import List, Optional
from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class UserCreate(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(max_length=255)


class User(TimestampedModel, table=True):
    __tablename__ = "users"

    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)

    boards: List["Board"] = Relationship(back_populates="owner", cascade_delete=True)
