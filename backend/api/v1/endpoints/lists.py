from uuid import UUID
from fastapi import APIRouter, status
from api.deps import DbSession, CurrentUser
from services.list_service import ListService
from models.list import ListCreate
from schemas.list import ListResponse

router = APIRouter(prefix="", tags=["lists"])

@router.post("/boards/{board_id}/lists", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
async def create_list(board_id: UUID, list_in: ListCreate, db: DbSession, current_user: CurrentUser):
    return await ListService.create_list(db, board_id, list_in, current_user.id)

@router.delete("/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list(list_id: UUID, db: DbSession, current_user: CurrentUser):
    await ListService.delete_list(db, list_id, current_user.id)
