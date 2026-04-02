import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CardResponse } from '../types';
import Dialog from '@mui/material/Dialog';
import { Edit2, X, AlignLeft, Trash2 } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface CardProps {
  card: CardResponse;
}

export const Card = React.memo(({ card }: CardProps) => {
  const [open, setOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDesc, setEditDesc] = useState(card.description || '');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { updateCardOptimistic, deleteCardOptimistic } = useBoard();

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'Card', card },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    await updateCardOptimistic(card.id, { title: editTitle, description: editDesc });
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCard = async () => {
    setIsDeleting(true);
    try {
      await deleteCardOptimistic(card.id);
      toast.success('Task removed');
      setOpen(false);
    } catch (err) {
      toast.error('Failed to remove task');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="bg-indigo-500/10 border-2 border-indigo-500/50 rounded-xl min-h-[80px]"
      />
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={clsx(
          "group bg-[#27272a]/20 border border-white/[0.05] p-3.5 rounded-lg cursor-grab active:cursor-grabbing hover:border-white/10 hover:bg-[#27272a]/40 transition-all shadow-sm",
          open && "ring-1 ring-indigo-500/50 border-indigo-500/50"
        )}
      >
        <div className="flex justify-between items-start gap-3">
          <h4 className="text-sm font-semibold text-white leading-normal">{card.title}</h4>
          <button 
            onPointerDown={(e) => { 
              e.stopPropagation(); 
              setOpen(true); 
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/5 text-slate-500 hover:text-white transition-all flex-shrink-0"
          >
            <Edit2 size={12} />
          </button>
        </div>
        
        {card.description && (
          <div className="mt-2.5 flex items-start gap-2 text-slate-500">
             <AlignLeft size={12} className="mt-0.5 flex-shrink-0" />
             <p className="text-[11px] line-clamp-2 leading-relaxed font-medium">{card.description}</p>
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        onPointerDown={(e) => e.stopPropagation()} 
        PaperProps={{
          className: "!bg-[#18181b] !border !border-white/[0.05] !shadow-2xl sm:!rounded-xl",
          style: { backgroundImage: 'none', maxWidth: '480px', width: '100%', margin: '16px' }
        }}
        slotProps={{
          backdrop: {
            className: "!bg-black/80 !backdrop-blur-[2px]"
          }
        }}
      >
        <div className="p-8 relative font-sans text-slate-200">
          <div className="flex flex-col space-y-1 mb-8">
            <h2 className="text-xl font-bold tracking-tight text-white m-0">Edit Task</h2>
            <p className="text-xs text-slate-500 m-0 font-medium">Update the details of this task item.</p>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title</label>
              <input 
                value={editTitle} 
                onChange={e => setEditTitle(e.target.value)} 
                className="w-full bg-[#09090b] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium" 
              />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea 
                value={editDesc} 
                onChange={e => setEditDesc(e.target.value)} 
                placeholder="No description provided..."
                className="w-full bg-[#09090b] border border-white/[0.05] rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all min-h-[140px] resize-none leading-relaxed font-normal" 
              />
            </div>
            
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
              <button 
                type="button" 
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors uppercase tracking-wider"
              >
                <Trash2 size={12} /> Remove
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-white transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 rounded-lg shadow-lg active:scale-95 transition-all text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
          
          <button 
            type="button" 
            onClick={() => setOpen(false)} 
            className="absolute right-5 top-5 rounded-full p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer border-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Dialog>

      <DeleteConfirmationModal 
        open={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteCard}
        isDeleting={isDeleting}
        title="Delete Task?"
        description="Are you sure you want to permanently remove this task? This action cannot be undone."
        confirmText="Delete Task"
      />
    </>
  );
});
