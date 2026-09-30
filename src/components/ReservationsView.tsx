import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Reservation, Court, computeReservationStatus } from '../types';

interface ReservationsViewProps {
  reservations: Reservation[];
  courts: Court[];
  onSelectReservation: (reservation: Reservation) => void;
  onOpenPaymentModal?: (reservation: Reservation) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  courts,
  onSelectReservation,
  onOpenPaymentModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pagada' | 'pendiente'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('today');

  // Filter reservations
  const filtered = reservations.filter((r) => {
    if (r.isBlocked && !searchTerm) return false;

    // Payment status filter
    if (statusFilter !== 'all' && r.paymentStatus !== statusFilter) return false;

    // Date filter
    if (dateFilter === 'today' && r.date !== '2024-10-30') return false;
    if (dateFilter === 'upcoming' && r.date < '2024-10-30') return false;

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = r.person.name.toLowerCase().includes(q);
      const matchPhone = r.person.phone.includes(q);
      const matchCourt = r.courtName.toLowerCase().includes(q);
      const matchDate = r.date.includes(q);
      if (!matchName && !matchPhone && !matchCourt && !matchDate) {
        return false;
      }
    }

    return true;
  });

  // Métricas de Recaudación (Cálculo derivado directamente de las reservas deportivas)
  const paidReservations = filtered.filter((r) => r.paymentStatus === 'pagada' && !r.isBlocked);
  const pendingReservations = filtered.filter((r) => r.paymentStatus === 'pendiente' && !r.isBlocked);

  const totalCollected = paidReservations.reduce((acc, r) => acc + (r.paidAmount || r.price), 0);
  const totalPending = pendingReservations.reduce((acc, r) => acc + r.price, 0);

  const collectedEfectivo = paidReservations
    .filter((r) => r.paymentMethod === 'Efectivo')
    .reduce((acc, r) => acc + (r.paidAmount || r.price), 0);

  const collectedTransferencia = paidReservations
    .filter((r) => r.paymentMethod === 'Transferencia')
    .reduce((acc, r) => acc + (r.paidAmount || r.price), 0);

  const collectedQR = paidReservations
    .filter((r) => r.paymentMethod === 'QR / Mercado Pago')
    .reduce((acc, r) => acc + (r.paidAmount || r.price), 0);

  const collectedOtro = paidReservations
    .filter((r) => r.paymentMethod === 'Otro')
    .reduce((acc, r) => acc + (r.paidAmount || r.price), 0);

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full py-2">
      {/* Search & Filter Header (Fudo Style) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0D5FAE] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                Listado y Búsqueda de Reservas
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Gestión de turnos y cobranzas
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-full">
            {filtered.length} {filtered.length === 1 ? 'reserva' : 'reservas'}
          </span>
        </div>

        {/* Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por jugador, teléfono o cancha..."
            className="w-full h-10.5 pl-10 pr-9 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white focus:ring-3 focus:ring-[#0D5FAE]/15 transition-all shadow-2xs"
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filters with LayoutId Animations */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date filter */}
            <div className="inline-flex p-1 bg-slate-100/90 rounded-full border border-slate-200/70 text-xs font-medium relative">
              {(
                [
                  { id: 'today', label: 'Hoy' },
                  { id: 'upcoming', label: 'Próximas' },
                  { id: 'all', label: 'Todas' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={`relative z-10 px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                    dateFilter === f.id ? 'text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dateFilter === f.id && (
                    <motion.div
                      layoutId="activeResDateFilter"
                      className="absolute inset-0 bg-slate-900 rounded-full shadow-xs z-[-1]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Payment filter */}
            <div className="inline-flex p-1 bg-slate-100/90 rounded-full border border-slate-200/70 text-xs font-medium relative">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'pagada', label: 'Pagadas' },
                  { id: 'pendiente', label: 'Pendientes' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`relative z-10 px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                    statusFilter === f.id
                      ? f.id === 'pagada'
                        ? 'text-white font-bold'
                        : f.id === 'pendiente'
                        ? 'text-white font-bold'
                        : 'text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {statusFilter === f.id && (
                    <motion.div
                      layoutId="activeResStatusFilter"
                      className={`absolute inset-0 rounded-full shadow-xs z-[-1] ${
                        f.id === 'pagada'
                          ? 'bg-emerald-600'
                          : f.id === 'pendiente'
                          ? 'bg-amber-500'
                          : 'bg-white'
                      }`}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de Recaudación en vivo derivado de las reservas */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Recaudación:
            </span>
            <span className="font-extrabold text-slate-900 tabular-nums">
              Total cobrado: <strong className="text-emerald-700">${totalCollected.toLocaleString('es-AR')}</strong>
            </span>
            {collectedEfectivo > 0 && (
              <span className="text-slate-500 font-medium tabular-nums">
                · Efectivo: ${collectedEfectivo.toLocaleString('es-AR')}
              </span>
            )}
            {collectedTransferencia > 0 && (
              <span className="text-slate-500 font-medium tabular-nums">
                · Transf.: ${collectedTransferencia.toLocaleString('es-AR')}
              </span>
            )}
            {collectedQR > 0 && (
              <span className="text-slate-500 font-medium tabular-nums">
                · QR/MP: ${collectedQR.toLocaleString('es-AR')}
              </span>
            )}
            {collectedOtro > 0 && (
              <span className="text-slate-500 font-medium tabular-nums">
                · Otro: ${collectedOtro.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          {totalPending > 0 && (
            <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Pendiente: ${totalPending.toLocaleString('es-AR')} ({pendingReservations.length})
            </div>
          )}
        </div>
      </div>

      {/* Results Cards List with Staggered Motion */}
      <motion.div layout className="flex flex-col gap-2.5">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs font-medium shadow-xs"
            >
              No se encontraron reservas con los filtros seleccionados.
            </motion.div>
          ) : (
            filtered.map((r, index) => {
              const isPaid = r.paymentStatus === 'pagada';
              const isToday = r.date === '2024-10-30';
              const timing = computeReservationStatus(r);

              return (
                <motion.div
                  layout
                  key={r.id}
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  whileHover={{ y: -2, scale: 1.005, transition: { duration: 0.15 } }}
                  onClick={() => onSelectReservation(r)}
                  className="bg-white rounded-3xl border border-slate-200/80 p-4.5 hover:border-[#0D5FAE]/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Person & Court Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm group-hover:bg-blue-50 group-hover:text-[#0D5FAE] transition-colors shrink-0">
                      {r.person.name.charAt(0)}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                          {r.person.name}
                        </span>
                        {r.person.isMember && (
                          <span className="text-[10px] font-semibold text-[#0D5FAE] bg-blue-50 px-2 py-0.5 rounded-full">
                            Socio #{r.person.memberNumber}
                          </span>
                        )}
                        {/* Estado conceptual del turno */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            timing === 'en_juego'
                              ? 'bg-blue-100 text-[#0D5FAE] animate-pulse'
                              : timing === 'finalizada'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {timing === 'en_juego'
                            ? 'En juego'
                            : timing === 'finalizada'
                            ? 'Finalizada'
                            : 'Reservada'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium">
                        {r.courtName} · <span className="uppercase text-[11px] font-bold text-slate-400">{r.sport}</span>
                      </div>

                      {r.person.phone && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">call</span>
                          <span>{r.person.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date, Time & Status */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="flex flex-col sm:items-end">
                      <div className="font-bold text-xs text-slate-900 tabular-nums">
                        {isToday ? 'Hoy' : r.date} · {r.startTime} a {r.endTime} hs
                      </div>
                      <div className="font-black text-sm text-slate-900 tabular-nums mt-0.5">
                        ${r.price.toLocaleString('es-AR')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Pagada · {r.paymentMethod || 'Efectivo'}</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Pendiente</span>
                          </span>

                          {onOpenPaymentModal && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenPaymentModal(r);
                              }}
                              className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              Cobrar turno
                            </motion.button>
                          )}
                        </div>
                      )}

                      <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-600 text-[18px] transition-colors">
                        chevron_right
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
