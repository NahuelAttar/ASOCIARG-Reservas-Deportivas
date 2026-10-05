import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicReservation, ClubInfo } from '../types';
import { formatDateReadable } from '../utils/dateUtils';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  reservation: PublicReservation | null;
  club: ClubInfo;
  onClose: () => void;
  onCancelReservation?: (reservationId: string) => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  reservation,
  club,
  onClose,
  onCancelReservation,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  if (!isOpen || !reservation) return null;

  const formattedDate = formatDateReadable(reservation.date);
  const sportEmoji = reservation.sport === 'futbol' ? '⚽' : '🎾';

  // Construct message matching exact reference format from prompt (Requisito #9)
  const confirmationMessage =
    `*Reserva confirmada* ${sportEmoji}\n\n` +
    `*${club.name}*\n\n` +
    `*${reservation.sportLabel} - ${reservation.courtName}*\n` +
    `${formattedDate} · ${reservation.startTime} a ${reservation.endTime} hs\n\n` +
    `A nombre de *${reservation.customer.firstName} ${reservation.customer.lastName}*\n` +
    `Total: *$${reservation.price.toLocaleString('es-AR')}*\n\n` +
    `📍 ${club.address}\n\n` +
    `¡Te esperamos!`;

  const shareText = encodeURIComponent(confirmationMessage);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(confirmationMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleConfirmCancel = () => {
    if (onCancelReservation) {
      onCancelReservation(reservation.id);
    }
    setShowCancelPrompt(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-md max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col"
        >
          {/* Header Accent */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 sm:p-6 text-center relative overflow-hidden shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-2 shadow-inner">
              <span className="material-symbols-outlined text-[28px] text-white">check_circle</span>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200 block">
              Confirmación de Reserva
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tracking-tight">
              ¡Turno confirmado con éxito!
            </h2>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col gap-4 text-xs">
            {/* Visual Voucher (exact presentation of the confirmation) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2.5 leading-relaxed text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  Reserva confirmada {sportEmoji}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Registrada
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900">{club.name}</div>

              <div className="text-xs font-extrabold text-[#0D5FAE]">
                {reservation.sportLabel} - {reservation.courtName}
              </div>

              <div className="text-xs font-semibold text-slate-700 capitalize">
                {formattedDate} · {reservation.startTime} a {reservation.endTime} hs
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-col gap-0.5 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">A nombre de </span>
                  <strong className="text-slate-900 font-bold">
                    {reservation.customer.firstName} {reservation.customer.lastName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Total: </span>
                  <strong className="text-slate-900 font-black text-sm tabular-nums">
                    ${reservation.price.toLocaleString('es-AR')}
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="text-slate-700 font-medium">📍 {club.address}</span>
              </div>

              <div className="text-xs font-bold text-emerald-800 pt-1">
                ¡Te esperamos!
              </div>
            </div>

            {/* Cancel Prompt (Requisito #13: estructurada para cancelación pública) */}
            {showCancelPrompt ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col gap-2">
                <span className="font-extrabold text-xs text-rose-800">
                  ¿Confirmás la cancelación de esta reserva?
                </span>
                <p className="text-[11px] text-rose-700 leading-normal">
                  El turno ({reservation.startTime} a {reservation.endTime} hs) volverá a quedar disponible para cualquier persona.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(false)}
                    className="flex-1 py-1.5 px-3 rounded-full bg-white border border-rose-200 text-rose-800 font-bold text-xs hover:bg-rose-100/50"
                  >
                    No, mantener reserva
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    className="flex-1 py-1.5 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs"
                  >
                    Sí, cancelar turno
                  </button>
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1 mt-auto">
              {/* WhatsApp Share Button */}
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 text-center"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Compartir confirmación por WhatsApp</span>
              </a>

              {/* Copy Voucher to Clipboard */}
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto de confirmación'}</span>
              </button>

              {/* Close / Make Another Booking */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors cursor-pointer text-center"
              >
                Hacer otra reserva
              </button>

              {/* Public Cancellation Option (Requisito #13) */}
              {onCancelReservation && !showCancelPrompt && (
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(true)}
                  className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors pt-1 underline cursor-pointer text-center"
                >
                  ¿Te equivocaste? Cancelar esta reserva
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
