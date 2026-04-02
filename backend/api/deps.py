from typing import Annotated
import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from core.database import get_db
from core.config import settings
from core.logging import get_logger
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
logger = get_logger(__name__)

DbSession = Annotated[AsyncSession, Depends(get_db)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]

async def get_current_user(db: DbSession, token: TokenDep) -> User:
    
    ##############################
    ##### Mock Token Logic For Development
    ##############################
    # if token == "mock-token":
    #     logger.warning("Mock token used — fetching first active user")
    #     result = await db.execute(select(User).where(User.deleted_at.is_(None)).limit(1))
    #     user = result.scalar_one_or_none()
    #     if user:
    #         return user
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Mock token used but no users found in database",
    #     )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Token decoded but 'sub' claim is missing")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.InvalidTokenError as exc:
        logger.warning("Invalid JWT token: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(User).where(User.id == user_id, User.deleted_at.is_(None))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        logger.warning("User not found after valid token decode: user_id=%s", user_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]

