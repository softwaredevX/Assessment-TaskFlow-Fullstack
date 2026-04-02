from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from core.security import create_access_token
from api.deps import DbSession
from services.auth_service import AuthService
from models.user import UserCreate
from schemas.user import UserResponse , UserRegisterResponse
from schemas.token import Token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRegisterResponse)
async def register(user_in: UserCreate, db: DbSession):
    user = await AuthService.register_user(db, user_in)
    access_token = create_access_token(str(user.id))
    return {"user": user, "access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession
):
    access_token = await AuthService.authenticate_user(db, form_data.username, form_data.password)
    return {"access_token": access_token, "token_type": "bearer"}
