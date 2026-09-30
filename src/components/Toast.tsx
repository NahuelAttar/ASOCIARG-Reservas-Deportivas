import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  message: string | null;
  subMessage?: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  subMessage,
  type = 'success',
  onClose,
}) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-800 max-w-sm"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : type === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">
              {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs text-slate-100">{message}</div>
            {subMessage && (
              <div className="text-[11px] text-slate-400 mt-0.5">{subMessage}</div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
