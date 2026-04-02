import React from 'react';
import Dialog from '@mui/material/Dialog';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  isDeleting = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: "!bg-[#18181b] !border !border-white/[0.05] !shadow-2xl sm:!rounded-xl",
        style: { backgroundImage: 'none', maxWidth: '400px', width: '100%', margin: '16px' }
      }}
      slotProps={{
        backdrop: {
          className: "!bg-black/80 !backdrop-blur-[2px]"
        }
      }}
    >
      <div className="p-8 relative font-sans text-slate-200">
        <div className="flex flex-col items-center text-center">
          <div className="bg-rose-500/10 p-2.5 rounded-lg mb-4 border border-rose-500/20 shadow-inner">
            <AlertTriangle className="text-rose-500" size={24} />
          </div>
          
          <h2 className="text-lg font-bold tracking-tight text-white m-0 mb-1.5">{title}</h2>
          <p className="text-slate-500 text-[13px] leading-relaxed mb-8 font-medium">{description}</p>
          
          <div className="flex flex-col w-full gap-2">
            <button 
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-lg shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <Trash2 size={16} />
                  {confirmText}
                </>
              )}
            </button>
            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="w-full hover:bg-white/5 text-slate-500 font-semibold py-2.5 rounded-lg transition-all text-[13px] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
