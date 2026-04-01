from uuid import UUID
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from core.logging import get_logger
from models.list import List, ListCreate
from services.board_service import BoardService

logger = get_logger(__name__)


class ListService:
    @staticmethod
    async def create_list(db: AsyncSession, board_id: UUID, list_in: ListCreate, user_id: UUID) -> List:
        await BoardService.get_board_by_id(db, board_id, user_id)

        stmt = select(func.max(List.position)).where(List.board_id == board_id, List.deleted_at.is_(None))
        result = await db.execute(stmt)
        max_pos = result.scalar()
        new_pos = (max_pos + 65536.0) if max_pos is not None else 65536.0

        new_list = List(
            name=list_in.name,
            board_id=board_id,
            position=new_pos
        )
        db.add(new_list)
        await db.commit()
        await db.refresh(new_list)
        logger.info(
            "List created: '%s' (id=%s) in board=%s at position=%s",
            new_list.name, new_list.id, board_id, new_pos,
        )
        return new_list

    @staticmethod
    async def delete_list(db: AsyncSession, list_id: UUID, user_id: UUID) -> None:
        stmt = select(List).where(List.id == list_id, List.deleted_at.is_(None))
        result = await db.execute(stmt)
        lst = result.scalar_one_or_none()

        if not lst:
            logger.warning("List not found for delete: id=%s (user=%s)", list_id, user_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")

        await BoardService.get_board_by_id(db, lst.board_id, user_id)

        lst.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await db.commit()
        logger.info("List deleted: id=%s from board=%s by user=%s", list_id, lst.board_id, user_id)

