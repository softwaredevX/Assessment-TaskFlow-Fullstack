from uuid import UUID
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from core.logging import get_logger
from models.board import Board, BoardCreate
from models.list import List
from models.card import Card

logger = get_logger(__name__)


class BoardService:
    @staticmethod
    async def create_board(db: AsyncSession, board_in: BoardCreate, user_id: UUID) -> Board:
        board = Board(
            name=board_in.name,
            description=board_in.description,
            owner_id=user_id
        )
        db.add(board)
        await db.commit()
        await db.refresh(board)
        logger.info("Board created: '%s' (id=%s) by user=%s", board.name, board.id, user_id)
        return board

    @staticmethod
    async def get_boards(db: AsyncSession, user_id: UUID) -> list[Board]:
        stmt = select(Board).where(
            Board.owner_id == user_id,
            Board.deleted_at.is_(None)
        ).order_by(Board.created_at.desc())
        result = await db.execute(stmt)
        boards = list(result.scalars().all())
        logger.info("Fetched %d board(s) for user=%s", len(boards), user_id)
        return boards

    @staticmethod
    async def get_board_by_id(db: AsyncSession, board_id: UUID, user_id: UUID) -> Board:
        stmt = select(Board).options(
            selectinload(Board.lists).selectinload(List.cards)
        ).where(
            Board.id == board_id,
            Board.deleted_at.is_(None)
        )
        result = await db.execute(stmt)
        board = result.scalar_one_or_none()

        if not board:
            logger.warning("Board not found: id=%s (requested by user=%s)", board_id, user_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")

        if board.owner_id != user_id:
            logger.warning(
                "Unauthorized board access: board_id=%s owner=%s requester=%s",
                board_id, board.owner_id, user_id,
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized to access this board")

        board.lists = [l for l in board.lists if l.deleted_at is None]
        for l in board.lists:
            l.cards = [c for c in l.cards if c.deleted_at is None]

        return board

    @staticmethod
    async def delete_board(db: AsyncSession, board_id: UUID, user_id: UUID) -> None:
        board = await BoardService.get_board_by_id(db, board_id, user_id)
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        board.deleted_at = now

        for l in board.lists:
            l.deleted_at = now
            for c in l.cards:
                c.deleted_at = now

        await db.commit()
        logger.info(
            "Board deleted (cascade): id=%s lists=%d cards=%d by user=%s",
            board_id,
            len(board.lists),
            sum(len(l.cards) for l in board.lists),
            user_id,
        )

