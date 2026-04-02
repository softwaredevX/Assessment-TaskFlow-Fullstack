import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { List } from './List';
import { Card } from './Card';
import type { CardResponse, ListWithCardsResponse } from '../types';
import { Hexagon, LogOut, ChevronLeft, Plus, X, Loader2 } from 'lucide-react';

export const Board = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { board, loading, fetchBoard, moveCardOptimistic, createList } = useBoard();
  const { logout } = useAuth();
  const [activeCard, setActiveCard] = useState<CardResponse | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }
  }, [boardId, fetchBoard]);

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Card') {
      setActiveCard(active.data.current.card);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);

    const { active, over } = event;
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceListId = active.data.current?.card?.list_id;
    
    const isOverList = over.data.current?.type === 'List';
    const isOverCard = over.data.current?.type === 'Card';

    const destinationListId = isOverList 
      ? over.data.current?.list?.id 
      : over.data.current?.card?.list_id;

    if (!sourceListId || !destinationListId) return;

    const sourceList = board.lists.find(l => l.id === sourceListId);
    const destList = board.lists.find(l => l.id === destinationListId);

    if (!sourceList || !destList) return;

    const oldIndex = sourceList.cards.findIndex(c => c.id === activeId);
    let newIndex = destList.cards.length;

    if (isOverCard) {
      const overCardIndex = destList.cards.findIndex(c => c.id === overId);
      if (sourceListId === destinationListId && oldIndex < overCardIndex) {
        newIndex = overCardIndex;
      } else {
        newIndex = overCardIndex;
      }
    }

    if (sourceListId === destinationListId && oldIndex === newIndex) {
       return; 
    }

    const finalCardsAfterDrag = [...destList.cards];
    if (sourceListId === destinationListId) {
      const [removed] = finalCardsAfterDrag.splice(oldIndex, 1);
      finalCardsAfterDrag.splice(newIndex, 0, removed);
    } else {
      finalCardsAfterDrag.splice(newIndex, 0, active.data.current?.card);
    }

    const beforeCardId = newIndex > 0 ? finalCardsAfterDrag[newIndex - 1].id : null;
    const afterCardId = newIndex < finalCardsAfterDrag.length - 1 ? finalCardsAfterDrag[newIndex + 1].id : null;

    moveCardOptimistic({
      cardId: activeId,
      sourceListId,
      destinationListId,
      newPosition: newIndex,
      beforeCardId,
      afterCardId
    });
  };

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !boardId) return;
    setIsCreatingList(true);
    try {
      await createList(boardId, newListName.trim());
      setNewListName('');
      setIsAddingList(false);
    } finally {
      setIsCreatingList(false);
    }
  };

  if (loading && !board) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 transition-all font-sans">
        <header className="bg-white/5 border-b border-white/5 px-8 py-5 flex items-center gap-3">
           <div className="w-8 h-8 rounded-md bg-white/10 animate-pulse" />
           <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
        </header>
        <div className="flex-1 p-8 flex gap-6 overflow-x-auto">
            <div className="w-80 h-[500px] rounded-[32px] bg-white/5 animate-pulse border border-white/5 flex-shrink-0" />
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen bg-[#09090b] font-sans text-slate-200 overflow-hidden ">
      <header className="bg-zinc-900/50 backdrop-blur-md border-b border-white/5 px-8 py-4 flex flex-row items-center justify-between z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg border border-transparent hover:border-white/5">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm flex items-center justify-center">
               <Hexagon className="text-white fill-white/10" size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                {board?.name}
              </h1>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider leading-none mt-0.5">Project</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 items-center">
           <div className="text-[11px] font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-md border border-white/5 hidden lg:block uppercase tracking-wider">
              TaskFlow v1.1
           </div>
           <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase">
              {board?.name.charAt(0)}
           </div>
           <button 
             onClick={() => logout()}
             title="Logout"
             className="ml-1 hover:bg-white/5 p-2 rounded-lg transition-all text-slate-400 hover:text-rose-400"
           >
             <LogOut size={16} />
           </button>
        </div>
      </header>
      
      <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32 max-w-[1600px] mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            {board?.lists.map((list) => (
              <List key={list.id} list={list as ListWithCardsResponse} />
            ))}

            <div className="h-fit">
              {isAddingList ? (
                <div className="bg-[#18181b] rounded-xl p-6 border border-white/[0.05] shadow-xl animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 rounded-md bg-indigo-600 text-white shadow-sm">
                      <Plus size={14} strokeWidth={3} />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">New Category</h3>
                  </div>
                  <form onSubmit={handleAddList} className="space-y-4">
                    <input 
                      autoFocus
                      placeholder="Category name..."
                      value={newListName}
                      onChange={e => setNewListName(e.target.value)}
                      className="w-full bg-[#09090b] border border-white/[0.05] rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                    <div className="flex items-center gap-2">
                      <button 
                        type="submit" 
                        disabled={isCreatingList}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-all text-[11px] uppercase tracking-wider"
                      >
                        {isCreatingList ? <Loader2 className="animate-spin" size={14} /> : 'Create'}
                      </button>
                      <button 
                        type="button" 
                        disabled={isCreatingList}
                        onClick={() => setIsAddingList(false)}
                        className="text-slate-500 hover:text-white p-2 transition-colors rounded-lg hover:bg-white/5"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingList(true)}
                  className="w-full h-[180px] bg-[#18181b]/50 border-2 border-dashed border-white/[0.02] hover:border-indigo-500/30 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-indigo-400 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-[#18181b] border border-white/[0.05] group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-sm">
                    <Plus size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Add Category</span>
                </button>
              )}
            </div>

            <DragOverlay dropAnimation={{
              duration: 250,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              {activeCard ? (
                <div className="rotate-3 scale-105 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] rounded-2xl opacity-90 transition-all border border-indigo-500/50">
                  <Card card={activeCard} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          
          <div className="w-8 flex-shrink-0" /> 
        </div>
      </main>
    </div>
  );
};
