import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { 
  BoardWithListsResponse, 
  BoardResponse, 
  CardUpdate, 
  CardResponse 
} from '../types';
import { 
  fetchBoardApi, 
  moveCardApi, 
  createCardApi, 
  updateCardApi, 
  getBoardsApi, 
  createBoardApi, 
  deleteBoardApi, 
  createListApi, 
  deleteListApi, 
  deleteCardApi 
} from '../services/api';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export type MoveCardParams = {
  cardId: string;
  sourceListId: string;
  destinationListId: string;
  newPosition: number;
  beforeCardId: string | null;
  afterCardId: string | null;
};

interface BoardContextType {
  boards: BoardResponse[];
  board: BoardWithListsResponse | null;
  loading: boolean;
  error: string | null;
  fetchAllBoards: () => Promise<void>;
  createBoard: (name: string, description?: string) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createList: (boardId: string, name: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  moveCardOptimistic: (params: MoveCardParams) => Promise<void>;
  addCardOptimistic: (listId: string, title: string) => Promise<void>;
  updateCardOptimistic: (cardId: string, payload: CardUpdate) => Promise<void>;
  deleteCardOptimistic: (cardId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [board, setBoard] = useState<BoardWithListsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBoardsApi();
      setBoards(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = useCallback(async (name: string, description?: string) => {
    try {
      const newBoard = await createBoardApi({ name, description });
      setBoards(prev => [...prev, newBoard]);
      toast.success('Board created successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, []);

  const deleteBoard = useCallback(async (id: string) => {
    try {
      await deleteBoardApi(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      toast.success('Board deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, []);

  const fetchBoard = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBoardApi(id);
      setBoard(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load board detail');
    } finally {
      setLoading(false);
    }
  }, []);

  const createList = useCallback(async (boardId: string, name: string) => {
    try {
      const newList = await createListApi(boardId, { name });
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: [...prev.lists, { ...newList, cards: [] }]
        };
      });
      toast.success('List created');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, []);

  const deleteList = useCallback(async (listId: string) => {
    try {
      await deleteListApi(listId);
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.filter(l => l.id !== listId)
        };
      });
      toast.success('List removed');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, []);

  const moveCardOptimistic = useCallback(async ({ cardId, sourceListId, destinationListId, newPosition, beforeCardId, afterCardId }: MoveCardParams) => {
    if (!board) return;
    const previousState = JSON.parse(JSON.stringify(board));

    setBoard(prev => {
      if (!prev) return prev;
      const newBoard = JSON.parse(JSON.stringify(prev)) as BoardWithListsResponse;
      const sourceList = newBoard.lists.find(l => l.id === sourceListId);
      const destList = newBoard.lists.find(l => l.id === destinationListId);
      if (!sourceList || !destList) return prev;

      const cardIndex = sourceList.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;

      const [movedCard] = sourceList.cards.splice(cardIndex, 1);
      movedCard.list_id = destinationListId;
      destList.cards.splice(newPosition, 0, movedCard);
      return newBoard;
    });

    try {
      await moveCardApi(cardId, {
        list_id: destinationListId,
        before_card_id: beforeCardId,
        after_card_id: afterCardId
      });
    } catch (err: any) {
      setBoard(previousState);
      toast.error('Move failed: ' + err.message);
    }
  }, [board]);

  const addCardOptimistic = useCallback(async (listId: string, title: string) => {
    if (!board) return;
    const previousState = JSON.parse(JSON.stringify(board));
    const tempId = uuidv4();

    setBoard(prev => {
      if (!prev) return prev;
      const newBoard = JSON.parse(JSON.stringify(prev)) as BoardWithListsResponse;
      const list = newBoard.lists.find(l => l.id === listId);
      if (list) {
        list.cards.push({
          id: tempId,
          title,
          description: null,
          list_id: listId,
          rank: 'temp',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as CardResponse);
      }
      return newBoard;
    });

    try {
      const realCard = await createCardApi({ title, list_id: listId });
      setBoard(prev => {
        if (!prev) return prev;
        const newBoard = JSON.parse(JSON.stringify(prev)) as BoardWithListsResponse;
        const list = newBoard.lists.find(l => l.id === listId);
        if (list) {
          const idx = list.cards.findIndex(c => c.id === tempId);
          if (idx !== -1) list.cards[idx] = realCard;
        }
        return newBoard;
      });
    } catch (err: any) {
      setBoard(previousState);
      toast.error('Create failed: ' + err.message);
    }
  }, [board]);

  const updateCardOptimistic = useCallback(async (cardId: string, payload: CardUpdate) => {
    if (!board) return;
    const previousState = JSON.parse(JSON.stringify(board));

    setBoard(prev => {
      if (!prev) return prev;
      const newBoard = JSON.parse(JSON.stringify(prev)) as BoardWithListsResponse;
      for (const list of newBoard.lists) {
        const card = list.cards.find(c => c.id === cardId);
        if (card) {
          if (payload.title !== undefined) card.title = payload.title || '';
          if (payload.description !== undefined) card.description = payload.description || null;
          break;
        }
      }
      return newBoard;
    });

    try {
      await updateCardApi(cardId, payload);
    } catch (err: any) {
      setBoard(previousState);
      toast.error('Update failed: ' + err.message);
    }
  }, [board]);

  const deleteCardOptimistic = useCallback(async (cardId: string) => {
    if (!board) return;
    const previousState = JSON.parse(JSON.stringify(board));

    setBoard(prev => {
      if (!prev) return prev;
      const newBoard = JSON.parse(JSON.stringify(prev)) as BoardWithListsResponse;
      for (const list of newBoard.lists) {
        const idx = list.cards.findIndex(c => c.id === cardId);
        if (idx !== -1) {
          list.cards.splice(idx, 1);
          break;
        }
      }
      return newBoard;
    });

    try {
      await deleteCardApi(cardId);
      toast.success('Card deleted');
    } catch (err: any) {
      setBoard(previousState);
      toast.error('Delete failed: ' + err.message);
    }
  }, [board]);

  return (
    <BoardContext.Provider value={{ 
      boards, 
      board, 
      loading, 
      error, 
      fetchAllBoards, 
      createBoard, 
      deleteBoard, 
      fetchBoard, 
      createList, 
      deleteList, 
      moveCardOptimistic, 
      addCardOptimistic, 
      updateCardOptimistic,
      deleteCardOptimistic
    }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error('useBoard must be used within a BoardProvider');
  return context;
};
