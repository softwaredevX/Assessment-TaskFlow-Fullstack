from uuid import UUID
from fastapi import APIRouter, status
from api.deps import DbSession, CurrentUser
from services.card_service import CardService
from models.card import CardCreate, CardMove, CardUpdate
from schemas.card import CardResponse

router = APIRouter(prefix="/cards", tags=["cards"])

@router.post("", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(card_in: CardCreate, db: DbSession, current_user: CurrentUser):
    return await CardService.create_card(db, card_in)

@router.patch("/{card_id}", response_model=CardResponse)
async def update_card(card_id: UUID, card_in: CardUpdate, db: DbSession, current_user: CurrentUser):
    return await CardService.update_card(db, card_id, card_in)

@router.patch("/{card_id}/move", response_model=CardResponse)
async def move_card(card_id: UUID, move_in: CardMove, db: DbSession, current_user: CurrentUser):
    return await CardService.move_card(db, card_id, move_in)

@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(card_id: UUID, db: DbSession, current_user: CurrentUser):
    await CardService.delete_card(db, card_id)
