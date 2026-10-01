import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Court, CustomerData, calculateEndTime, getSportDurationMinutes, ClubInfo } from '../types';

interface PublicBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: ClubInfo;
  court: Court | null;
  startTime: string;
  date: string;
  onConfirmReservation: (data: {
    court: Court;
    startTime: string;
    endTime: string;
    date: string;
    customer: CustomerData;
  }) => void;
}

export const PublicBookingModal: React.FC<PublicBookingModalProps> = ({
  isOpen,
  onClose,
  club,
  court,
  startTime,
  date,
  onConfirmReservation,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Reset inputs when opening
  useEffect(() => {
    if (isOpen) {
      setFirstName('');
      setLastName('');
      setPhone('');
      setNotes('');
    }
  }, [isOpen]);

  if (!court) return null;

  const endTime = calculateEndTime(startTime, court.sport);
  const durationMinutes = getSportDurationMinutes(court.sport);
  const durationText = durationMinutes === 90 ? '1 hora y media' : '1 hora';

  // Format date readable (e.g., "Miércoles 30 de Octubre")
  const formatDateReadable = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      alert('Por favor ingresá tu Nombre y Apellido para la reserva.');
      return;
    }

    if (!phone.trim()) {
      alert('Por favor ingresá tu Teléfono de contacto (WhatsApp) para confirmar el turno.');
      return;
    }

    onConfirmReservation({
      court,
      startTime,
      endTime,
      date,
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 z-10"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0D5FAE]">
                  <span>{court.sportLabel}</span>
                  <span>·</span>
                  <span>{court.name}</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5 tracking-tight">
                  Completar Reserva de Cancha
                </h2>
                <div className="text-xs font-semibold text-slate-500 mt-0.5 capitalize">
                  {formatDateReadable(date)}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-xs">
              {/* Summary Card (Read-only Turn Details) */}
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100/90 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D5FAE]">
                    Detalles del Turno
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                    Duración: {durationText}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Horario</span>
                    <span className="text-base font-extrabold text-slate-900 tabular-nums">
                      {startTime} a {endTime} hs
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium block">Tarifa fijada</span>
                    <span className="text-base font-black text-slate-900 tabular-nums">
                      ${court.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-blue-100/60 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">stadium</span>
                  <span>{court.name}</span>
                  {court.surface && <span>· {court.surface}</span>}
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Tus Datos de Contacto
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ej: Marcelo"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ej: Rossi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Teléfono celular (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: 3564-445566"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    El club utilizará este número para enviarte recordatorios o avisos del turno.
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Comentarios o notas (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Llevamos paletas propias / Llegamos 10 minutos antes..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Informative Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-500 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">
                  verified
                </span>
                <span>
                  Al presionar <strong>Confirmar Reserva</strong>, el turno quedará bloqueado y registrado a tu nombre en {club.name}. El pago del turno se abona en la recepción del club.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-full bg-[#0D5FAE] hover:bg-[#094785] text-white font-extrabold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Confirmar Reserva</span>
                  <span>·</span>
                  <span className="tabular-nums">${court.price.toLocaleString('es-AR')}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
