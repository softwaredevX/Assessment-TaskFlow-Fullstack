from uuid import UUID
from fastapi import APIRouter, status
from typing import List
from api.deps import DbSession, CurrentUser
from services.board_service import BoardService
from models.board import BoardCreate
from schemas.board import BoardResponse, BoardWithListsResponse

router = APIRouter(prefix="/boards", tags=["boards"])

@router.post("", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_board(board_in: BoardCreate, db: DbSession, current_user: CurrentUser):
    return await BoardService.create_board(db, board_in, current_user.id)

@router.get("", response_model=List[BoardResponse])
async def get_boards(db: DbSession, current_user: CurrentUser):
    return await BoardService.get_boards(db, current_user.id)

@router.get("/{board_id}", response_model=BoardWithListsResponse)
async def get_board(board_id: UUID, db: DbSession, current_user: CurrentUser):
    return await BoardService.get_board_by_id(db, board_id, current_user.id)

@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(board_id: UUID, db: DbSession, current_user: CurrentUser):
    await BoardService.delete_board(db, board_id, current_user.id)
