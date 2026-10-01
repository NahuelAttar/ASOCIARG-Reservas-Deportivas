import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicReservation, ClubInfo } from '../types';

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
  if (!isOpen || !reservation) return null;

  // Format date readable (ej: "Miércoles 30 de octubre")
  const formatDateReadable = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      const text = d.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      const clean = text.replace(',', '');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    } catch {
      return dateStr;
    }
  };

  // Extract clean address without duplicating city if already included in the club name
  const getCleanAddress = (address: string, clubName: string) => {
    const parts = address.split(',').map((p) => p.trim());
    const withoutCityParts = parts.filter(
      (part) => !clubName.toLowerCase().includes(part.toLowerCase())
    );
    return withoutCityParts.length > 0 ? withoutCityParts.join(', ') : parts[0];
  };

  const formattedDate = formatDateReadable(reservation.date);
  const sportEmoji = reservation.sport === 'futbol' ? '⚽' : '🎾';
  const cleanAddress = getCleanAddress(club.address, club.name);

  // Clean, elegant confirmation message format for WhatsApp
  const confirmationMessage =
    `*Reserva confirmada* ${sportEmoji}\n\n` +
    `*${club.name}*\n\n` +
    `*${reservation.sportLabel} - ${reservation.courtName}*\n` +
    `${formattedDate} · ${reservation.startTime} a ${reservation.endTime} hs\n\n` +
    `A nombre de *${reservation.customer.firstName} ${reservation.customer.lastName}*\n` +
    `Total: *$${reservation.price.toLocaleString('es-AR')}*\n\n` +
    `📍 ${cleanAddress}\n\n` +
    `¡Te esperamos!`;

  const shareText = encodeURIComponent(confirmationMessage);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
        />

        {/* Voucher Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-md max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 z-10 flex flex-col"
        >
          {/* Top Celebration Accent Header */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 sm:p-6 text-center relative overflow-hidden shrink-0">
            {/* Close button X in header */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-2.5 shadow-inner">
              <span className="material-symbols-outlined text-[28px] sm:text-[32px] text-white">check_circle</span>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-200 block">
              Comprobante de Reserva
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tracking-tight">
              ¡Tu turno está reservado!
            </h2>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider text-emerald-100">
              <span>Código:</span>
              <span className="text-white">{reservation.bookingCode}</span>
            </div>
          </div>

          {/* Body Voucher Details */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col gap-3.5 sm:gap-4 text-xs">
            {/* Club and Court details */}
            <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Club
                </span>
                <span className="font-bold text-slate-900 text-xs text-right">
                  {club.name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cancha y Deporte
                </span>
                <span className="font-extrabold text-slate-900 text-xs text-right">
                  {reservation.sportLabel} · {reservation.courtName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fecha
                </span>
                <span className="font-semibold text-slate-700 capitalize text-xs">
                  {formatDateReadable(reservation.date)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Horario
                </span>
                <span className="font-extrabold text-[#0D5FAE] text-sm tabular-nums">
                  {reservation.startTime} a {reservation.endTime} hs
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Importe a abonar en el club
                </span>
                <span className="font-black text-slate-900 text-base tabular-nums text-emerald-700">
                  ${reservation.price.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="px-3.5 py-2.5 bg-slate-50/70 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Reservante</span>
                <span className="font-bold text-slate-800 text-xs">
                  {reservation.customer.firstName} {reservation.customer.lastName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">WhatsApp</span>
                <span className="font-semibold text-slate-700 text-xs">
                  {reservation.customer.phone}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1 mt-auto">
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>Compartir comprobante por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Hacer otra reserva / Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
