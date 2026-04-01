from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from api.deps import DbSession
from services.auth_service import AuthService
from models.user import UserCreate
from schemas.user import UserResponse
from schemas.token import Token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: DbSession):
    user = await AuthService.register_user(db, user_in)
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession
):
    access_token = await AuthService.authenticate_user(db, form_data.username, form_data.password)
    return {"access_token": access_token, "token_type": "bearer"}
