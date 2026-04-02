import React, { useState, useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { ListWithCardsResponse } from '../types';
import { Card } from './Card';
import { Plus, X, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useBoard } from '../context/BoardContext';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import toast from 'react-hot-toast';

interface ListProps {
  list: ListWithCardsResponse;
}
export const List: React.FC<ListProps> = React.memo(({ list }) => {
  const cardIds = useMemo(() => list.cards.map((c) => c.id), [list.cards]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addCardOptimistic, deleteList } = useBoard();

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: {
      type: 'List',
      list,
    },
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsAdding(false);
    await addCardOptimistic(list.id, newTitle.trim());
    setNewTitle('');
  };

  const handleDeleteList = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteList(list.id);
      toast.success('List removed');
    } catch (err) {
      toast.error('Failed to remove list');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-[#18181b]/40 border border-white/[0.03] rounded-xl w-full flex flex-col max-h-full transition-all group relative">
      <div className="px-5 py-4 flex justify-between items-center border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">{list.name}</h3>
          <span className="text-[10px] bg-white/5 text-slate-500 px-1.5 py-0.5 rounded font-bold border border-white/5">
            {list.cards.length}
          </span>
        </div>
        <button 
          onClick={handleDeleteList}
          className="text-slate-500 hover:text-rose-400 transition-all p-1.5 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100"
          title="Delete list"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          'p-3 pb-2 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent min-h-[140px] transition-colors',
          isOver && 'bg-white/5 rounded-b-2xl'
        )}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {list.cards.map((card) => (
              <Card key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      </div>

      <div className="p-3 mt-auto">
        {isAdding ? (
          <form onSubmit={handleAdd} className="bg-[#18181b] p-3 rounded-lg border border-white/[0.05] animate-in fade-in duration-200">
            <textarea 
               autoFocus
               value={newTitle}
               onChange={(e) => setNewTitle(e.target.value)}
               placeholder="Write a title..." 
               className="w-full bg-[#09090b] border border-white/[0.05] rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all min-h-[64px] mb-3 resize-none leading-relaxed"
            />
            <div className="flex items-center gap-2">
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg shadow-sm transition-all text-[11px] uppercase tracking-wider"
              >
                Add Task
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="text-slate-500 hover:text-white p-1.5 transition-colors rounded-lg hover:bg-white/5"
              >
                <X size={16}/>
              </button>
            </div>
          </form>
        ) : (
          <button 
             onClick={() => setIsAdding(true)} 
             className="w-full flex items-center gap-2 text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] p-3 rounded-xl transition-all cursor-pointer font-semibold text-xs opacity-0 group-hover:opacity-100"
          >
             <Plus size={14} /> Add Task
          </button>
        )}
      </div>
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Remove List?"
        description="Are you sure you want to delete this listing? All cards within will be soft-deleted and removed from this board."
        confirmText="Remove List"
      />
    </div>
  );
});
