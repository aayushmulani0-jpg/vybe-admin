import { X, Info, CheckCircle, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';

export default function AlertModal({ alertModal, onClose }) {
  if (!alertModal) return null;

  const { title, message, type = 'info' } = alertModal;

  const icons = {
    info: <Info className="w-8 h-8 text-blue-400" />,
    success: <CheckCircle className="w-8 h-8 text-green-400" />,
    error: <AlertCircle className="w-8 h-8 text-red-400" />
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-sm p-6 relative text-center flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          {icons[type]}
        </div>

        {title && (
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        )}
        
        <p className="text-gray-300 mb-6">{message}</p>
        
        <Button variant="primary" fullWidth onClick={onClose}>
          Okay
        </Button>
      </GlassCard>
    </div>
  );
}
