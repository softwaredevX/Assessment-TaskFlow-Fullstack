from typing import Annotated
import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from core.database import get_db
from core.config import settings
from core.security import verify_password, get_password_hash, create_access_token
from core.logging import get_logger
from models.user import User, UserCreate

logger = get_logger(__name__)


class AuthService:
    @staticmethod
    async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
        stmt = select(User).where(User.email == user_in.email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            logger.warning("Registration failed — email already exists: %s", user_in.email)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password)
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info("User registered: %s (id=%s)", user.email, user.id)
        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> str:
        stmt = select(User).where(User.email == email, User.deleted_at.is_(None))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            logger.warning("Authentication failed for email: %s", email)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")

        access_token = create_access_token(str(user.id))
        logger.info("User authenticated: %s (id=%s)", user.email, user.id)
        return access_token
