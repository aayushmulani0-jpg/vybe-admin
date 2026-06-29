import { X, AlertTriangle } from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';

export default function ConfirmModal({ confirmModal, onClose }) {
  if (!confirmModal) return null;

  const { 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?', 
    onConfirm, 
    onCancel, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel' 
  } = confirmModal;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-sm p-6 relative text-center flex flex-col items-center">
        <button 
          onClick={handleCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 text-yellow-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        
        <p className="text-gray-300 mb-8">{message}</p>
        
        <div className="flex gap-3 w-full">
          <Button variant="ghost" fullWidth onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button variant="danger" fullWidth onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
