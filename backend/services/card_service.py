import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from core.logging import get_logger
from models.card import Card, CardCreate, CardUpdate, CardMove
from models.list import List
from utils.lexorank import _get_lexorank_midpoint

logger = get_logger(__name__)


class CardService:

    @staticmethod
    async def create_card(db: AsyncSession, card_in: CardCreate) -> Card:
        stmt = (
            select(Card)
            .where(Card.list_id == card_in.list_id, Card.deleted_at.is_(None))
            .order_by(Card.rank.desc())
            .limit(1)
        )
        result = await db.execute(stmt)
        last_card = result.scalar_one_or_none()

        new_rank = (
            _get_lexorank_midpoint(last_card.rank, "")
            if last_card
            else 'm' * 6
        )

        card = Card(
            title=card_in.title,
            description=card_in.description,
            list_id=card_in.list_id,
            rank=new_rank,
        )
        db.add(card)
        await db.commit()
        await db.refresh(card)
        logger.info("Card created: '%s' (id=%s) in list=%s", card.title, card.id, card.list_id)
        return card

    @staticmethod
    async def update_card(db: AsyncSession, card_id: uuid.UUID, card_in: CardUpdate) -> Card:
        stmt = select(Card).where(Card.id == card_id, Card.deleted_at.is_(None))
        result = await db.execute(stmt)
        card = result.scalar_one_or_none()

        if not card:
            logger.warning("Card not found for update: id=%s", card_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

        update_data = card_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(card, key, value)

        card.version += 1
        db.add(card)
        await db.commit()
        await db.refresh(card)
        logger.info("Card updated: id=%s version=%d", card.id, card.version)
        return card

    @staticmethod
    async def delete_card(db: AsyncSession, card_id: uuid.UUID) -> None:
        stmt = select(Card).where(Card.id == card_id, Card.deleted_at.is_(None))
        result = await db.execute(stmt)
        card = result.scalar_one_or_none()

        if not card:
            logger.warning("Card not found for delete: id=%s", card_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

        card.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await db.commit()
        logger.info("Card deleted: id=%s", card_id)

    @staticmethod
    async def move_card(db: AsyncSession, card_id: uuid.UUID, move_in: CardMove) -> Card:
        async with db.begin_nested():
            stmt = select(Card).where(Card.id == card_id).with_for_update()
            result = await db.execute(stmt)
            card = result.scalar_one_or_none()

            if not card:
                logger.warning("Card not found for move: id=%s", card_id)
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

            prev_rank = ""
            next_rank = ""

            if move_in.after_card_id:
                res = await db.execute(
                    select(Card.rank).where(Card.id == move_in.after_card_id)
                )
                prev_rank = res.scalar() or ""

            if move_in.before_card_id:
                res = await db.execute(
                    select(Card.rank).where(Card.id == move_in.before_card_id)
                )
                next_rank = res.scalar() or ""

            old_list = card.list_id
            card.rank    = _get_lexorank_midpoint(prev_rank, next_rank)
            card.list_id = move_in.list_id
            card.version += 1

            db.add(card)

        await db.commit()
        await db.refresh(card)
        logger.info(
            "Card moved: id=%s from_list=%s to_list=%s new_rank=%s",
            card.id, old_list, card.list_id, card.rank,
        )
        return card
