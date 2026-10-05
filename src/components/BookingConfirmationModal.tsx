import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicReservation, ClubInfo } from '../types';
import { formatDateReadable } from '../utils/dateUtils';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  reservation: PublicReservation | null;
  club: ClubInfo;
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  reservation,
  club,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !reservation) return null;

  const formattedDate = formatDateReadable(reservation.date);
  const sportEmoji = reservation.sport === 'futbol' ? '⚽' : '🎾';

  // Cancha con su característica relevante (ej: "Cancha 1 · Cristal")
  const courtDisplayName = reservation.feature
    ? `${reservation.courtName} · ${reservation.feature}`
    : reservation.courtName;

  // Formato exacto de confirmación solicitado (Requisito #14)
  const confirmationMessage =
    `*Reserva confirmada* ${sportEmoji}\n\n` +
    `*${club.name}*\n\n` +
    `*${reservation.sportLabel} - ${courtDisplayName}*\n` +
    `${formattedDate} · ${reservation.startTime} a ${reservation.endTime} hs\n\n` +
    `A nombre de *${reservation.customer.firstName} ${reservation.customer.lastName}*\n` +
    `Total: *$${reservation.price.toLocaleString('es-AR')}*\n\n` +
    `📍 ${club.address}\n\n` +
    `¡Te esperamos!`;

  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(confirmationMessage)}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(confirmationMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
      throw new Error('Clipboard API no disponible');
    } catch {
      // Fallback para iframes y navegadores con restricciones de portapapeles
      try {
        const textArea = document.createElement('textarea');
        textArea.value = confirmationMessage;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      } catch {
        // Fallback sin interrupción
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        {/* Fondo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Comprobante */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col my-0 sm:my-auto"
        >
          {/* Cabecera */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 sm:p-6 text-center relative overflow-hidden shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3.5 top-3.5 w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-2 shadow-inner">
              <span className="material-symbols-outlined text-[28px] text-white">check_circle</span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              ¡Reserva confirmada!
            </h2>
          </div>

          {/* Cuerpo: Comprobante visual idéntico al mensaje */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col gap-3.5 sm:gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2.5 leading-relaxed text-slate-800">
              <div className="font-extrabold text-slate-900 text-sm">
                Reserva confirmada {sportEmoji}
              </div>

              <div className="text-xs font-bold text-slate-900">{club.name}</div>

              <div className="text-xs font-extrabold text-[#0D5FAE]">
                {reservation.sportLabel} - {courtDisplayName}
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

              <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 font-medium">
                📍 {club.address}
              </div>

              <div className="text-xs font-bold text-emerald-800 pt-1">
                ¡Te esperamos!
              </div>
            </div>

            {/* Acciones del usuario público (Requisito #1: sin opciones de cancelación) */}
            <div className="flex flex-col gap-2.5 pt-1 mt-auto pb-4 sm:pb-0">
              {/* Enlace directo a WhatsApp */}
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-[48px] py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 text-center"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>Compartir confirmación por WhatsApp</span>
              </a>

              {/* Copiar texto */}
              <button
                type="button"
                onClick={handleCopy}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto de confirmación'}</span>
              </button>

              {/* Realizar otra reserva / Volver al portal */}
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-full bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer text-center"
              >
                Realizar otra reserva
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
