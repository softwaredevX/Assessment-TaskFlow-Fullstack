import uuid
from pydantic import EmailStr
from sqlmodel import SQLModel, Field

class UserResponse(SQLModel):
    id: uuid.UUID
    email: EmailStr

    model_config = {"from_attributes": True}

class UserRegisterResponse(SQLModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"