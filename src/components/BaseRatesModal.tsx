import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Court } from '../types';

interface BaseRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Court[];
  onUpdateCourtPrice: (courtId: string, newPrice: number) => void;
}

export const BaseRatesModal: React.FC<BaseRatesModalProps> = ({
  isOpen,
  onClose,
  courts,
  onUpdateCourtPrice,
}) => {
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const handleStartEdit = (court: Court) => {
    setEditingCourtId(court.id);
    setEditPrice(court.basePrice);
  };

  const handleSaveEdit = (courtId: string) => {
    onUpdateCourtPrice(courtId, editPrice);
    setEditingCourtId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
            className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 z-10"
          >
            {/* Header */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#0D5FAE] text-[18px]">payments</span>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">Tarifas Base por Cancha</h3>
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

            {/* Content */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col gap-3.5 text-xs">
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Estas tarifas se sugieren por defecto al agendar turnos. El recepcionista puede editar el precio final de cualquier turno en el momento de reservar.
              </p>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                {courts.map((court) => {
                  const isEditing = editingCourtId === court.id;

                  return (
                    <div key={court.id} className="p-3.5 bg-white flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {court.sportLabel} · {court.name}
                        </div>
                        {!isEditing && (
                          <div className="text-slate-500 text-[11px] mt-0.5 tabular-nums">
                            Tarifa base: <strong className="text-slate-900 font-bold">${court.basePrice.toLocaleString('es-AR')}</strong> / h
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-right font-extrabold text-xs focus:outline-none focus:border-[#0D5FAE] tabular-nums"
                            autoFocus
                          />
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleSaveEdit(court.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#0D5FAE] text-white font-bold text-xs hover:bg-[#094785] transition-colors"
                          >
                            Guardar
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStartEdit(court)}
                          className="px-3 py-1.5 rounded-full text-[#0D5FAE] bg-blue-50/80 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Modificar
                        </motion.button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Listo
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
