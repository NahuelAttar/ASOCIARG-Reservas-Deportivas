import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Court, BlockReason } from '../types';

interface BlockSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Court[];
  onConfirmBlock: (data: {
    courtId: string;
    startTime: string;
    endTime: string;
    reason: BlockReason;
    notes?: string;
  }) => void;
}

export const BlockSlotModal: React.FC<BlockSlotModalProps> = ({
  isOpen,
  onClose,
  courts,
  onConfirmBlock,
}) => {
  const [courtId, setCourtId] = useState<string>(courts[0]?.id || 'padel-1');
  const [startTime, setStartTime] = useState<string>('20:00');
  const [endTime, setEndTime] = useState<string>('22:00');
  const [reason, setReason] = useState<BlockReason>('Mantenimiento');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmBlock({
      courtId,
      startTime,
      endTime,
      reason,
      notes,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 z-10"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-slate-700 text-[18px]">lock</span>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">Bloquear Cancha / Horario</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5 text-xs">
              {/* Court */}
              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                  Cancha
                </label>
                <select
                  value={courtId}
                  onChange={(e) => setCourtId(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#0D5FAE]"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.sportLabel} · {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Desde
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="20:00"
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#0D5FAE] tabular-nums"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Hasta
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="22:00"
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#0D5FAE] tabular-nums"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                  Motivo del Bloqueo
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Mantenimiento', 'Torneo', 'Uso interno', 'Otro'] as BlockReason[]).map((r) => (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center ${
                        reason === r
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                      }`}
                    >
                      {r}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                  Detalle / Observaciones
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Riego, iluminación, torneo relámpago..."
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#0D5FAE]"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer text-center transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer text-center transition-colors shadow-sm"
                >
                  Confirmar Bloqueo
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
