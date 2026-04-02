import React, { useEffect, useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Hexagon, 
  LogOut, 
  Plus, 
  Layout, 
  Clock, 
  Briefcase,
  Trash2,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const Boards = () => {
  const { boards, loading, fetchAllBoards, createBoard, deleteBoard } = useBoard();
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [boardToDeleteId, setBoardToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAllBoards();
  }, [fetchAllBoards]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return toast.error('Board name is required');
    
    setIsCreating(true);
    try {
      await createBoard(newBoardName.trim(), newBoardDesc.trim());
      setIsModalOpen(false);
      setNewBoardName('');
      setNewBoardDesc('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteBoard(boardToDeleteId);
      toast.success('Project archived successfully');
    } catch (err) {
      toast.error('Failed to delete board');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setBoardToDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-indigo-500/30">
      <header className="bg-zinc-900/50 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm flex items-center justify-center">
             <Hexagon className="text-white fill-white/10" size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            TaskFlow
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-400 bg-white/5 px-3 py-1 rounded-md border border-white/5 hidden md:block">
            Workspace
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all text-slate-400 hover:text-rose-400 font-medium text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Your Projects
            </h2>
            <p className="text-slate-400 text-base max-w-xl">
              Select a board to manage task categories and items.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed top-24 right-8 z-50 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          title="Create New Board"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="hidden md:inline text-sm">Create New Board</span>
        </button>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div  className="h-56 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
          </div>
        ) : boards.length === 0 ? (
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <div className="bg-white/5 p-4 rounded-xl mb-6">
              <Layout size={32} className="text-indigo-400 opacity-40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No boards found</h3>
            <p className="text-slate-500 max-w-sm mb-6 text-sm">
              Start by creating a new board to organize your tasks and lists.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-2 transition-colors text-sm"
            >
              Initialize your first board <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link 
                key={board.id} 
                to={`/board/${board.id}`}
                className="group bg-[#18181b] border border-white/[0.05] p-6 rounded-xl transition-all hover:border-white/10 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="bg-indigo-500/10 p-2.5 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                      <Briefcase size={20} className="text-indigo-400" />
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, board.id)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {board.name}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 h-10 leading-relaxed">
                      {board.description || 'Manage tasks and categories for this project.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.03]">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium uppercase tracking-[0.05em]">
                    <Clock size={12} />
                    <span>{new Date(board.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    OPEN <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Dialog
        open={isModalOpen}
        onClose={() => !isCreating && setIsModalOpen(false)}
        PaperProps={{
          className: "!bg-slate-900 !border !border-white/10 !shadow-2xl sm:!rounded-3xl",
          style: { backgroundImage: 'none', maxWidth: '500px', width: '100%', margin: '16px' }
        }}
        slotProps={{
          backdrop: {
            className: "!bg-slate-950/80 !backdrop-blur-sm"
          }
        }}
      >
        <div className="p-8 relative font-sans text-slate-100">
          <div className="flex flex-col space-y-1.5 mb-8">
            <h2 className="text-xl font-bold tracking-tight text-white m-0">Create new board</h2>
            <p className="text-sm text-slate-400 m-0">Set up a new workspace for your team.</p>
          </div>
          
          <form onSubmit={handleCreateBoard} className="space-y-5">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Board Name</label>
              <input 
                required
                autoFocus
                value={newBoardName} 
                onChange={e => setNewBoardName(e.target.value)} 
                placeholder="e.g. Project Roadmap"
                className="w-full bg-[#09090b] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all" 
              />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea 
                value={newBoardDesc} 
                onChange={e => setNewBoardDesc(e.target.value)} 
                placeholder="What is this project about?"
                className="w-full bg-[#09090b] border border-white/[0.05] rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all min-h-[100px] resize-none" 
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
              <button 
                type="button" 
                disabled={isCreating}
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isCreating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-lg shadow-lg active:scale-95 transition-all text-sm flex items-center gap-2"
              >
                {isCreating ? <Loader2 className="animate-spin" size={18} /> : 'Create Board'}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      <DeleteConfirmationModal 
        open={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteBoard}
        isDeleting={isDeleting}
        title="Archive Project?"
        description="Are you sure you want to delete this board? This action will archive all associated data and lists."
        confirmText="Archive Project"
      />
    </div>
  );
};
