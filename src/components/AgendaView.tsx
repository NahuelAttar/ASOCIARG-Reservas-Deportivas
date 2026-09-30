import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Court, Reservation, SportType, computeReservationStatus } from '../types';

interface AgendaViewProps {
  courts: Court[];
  reservations: Reservation[];
  currentDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  onSelectSlot: (courtId: string, time: string) => void;
  onSelectReservation: (reservation: Reservation) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  courts,
  reservations,
  currentDate,
  onDateChange,
  onSelectSlot,
  onSelectReservation,
}) => {
  // Level 1: Sport Category (like Fudo menu categories)
  const [selectedCategory, setSelectedCategory] = useState<'all' | SportType>('padel');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Quick filters (Fudo style)
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyCovered, setOnlyCovered] = useState(false);
  const [timeShift, setTimeShift] = useState<'prime' | 'all'>('prime');

  // Display mode: 'cards' (Fudo style - default, super intuitive) vs 'timeline' (Matriz tradicional)
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');

  // Defined hours
  const primeHours = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
  const fullHours = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
  ];

  const activeHours = timeShift === 'prime' ? primeHours : fullHours;

  // Filter courts by category, search, and covered
  const filteredCourts = courts.filter((court) => {
    if (selectedCategory !== 'all' && court.sport !== selectedCategory) return false;
    if (onlyCovered && !court.isCovered) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = court.name.toLowerCase().includes(q);
      const matchSport = court.sportLabel.toLowerCase().includes(q);
      const matchDesc = court.description?.toLowerCase().includes(q);
      if (!matchName && !matchSport && !matchDesc) return false;
    }
    return true;
  });

  // Helper to find reservation for a court and hour on currentDate
  const findReservation = (courtId: string, time: string) => {
    return reservations.find(
      (r) =>
        r.courtId === courtId &&
        r.startTime === time &&
        r.date === currentDate &&
        r.status !== 'cancelada'
    );
  };

  // Helper to count available slots for a court today
  const getCourtAvailability = (courtId: string) => {
    let freeCount = 0;
    activeHours.forEach((hour) => {
      if (!findReservation(courtId, hour)) freeCount++;
    });
    return { freeCount, totalCount: activeHours.length };
  };

  // Total free slots across all active courts today
  const totalFreeSlots = filteredCourts.reduce((acc, c) => acc + getCourtAvailability(c.id).freeCount, 0);

  return (
    <div className="flex flex-col gap-4.5 w-full max-w-7xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* 1. FUDO STICKY CATEGORY NAV & ANIMATED CONTROLS                           */}
      {/* ========================================================================= */}
      <div className="sticky top-16 z-20 bg-slate-50/90 backdrop-blur-md pt-2 pb-3.5 flex flex-col gap-3 transition-colors">
        {/* Horizontal Category Scroll with Smooth Sliding Active Pill */}
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto relative">
            {(
              [
                { id: 'padel', label: 'Pádel', icon: '🎾', count: 8 },
                { id: 'futbol', label: 'Fútbol 7', icon: '⚽', count: 4 },
                { id: 'tenis', label: 'Tenis', icon: '🎾', count: 3 },
                { id: 'all', label: 'Todas', icon: '⭐', count: courts.length },
              ] as const
            ).map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative h-9 px-4 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                    isActive ? 'text-white' : 'text-slate-700 hover:text-slate-900 bg-white border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSportCategory"
                      className="absolute inset-0 bg-slate-900 rounded-full shadow-sm z-[-1]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span>{cat.icon} {cat.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View mode toggle (Cards Fudo vs Timeline Matrix) */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-full text-xs font-semibold shrink-0 relative">
            <button
              onClick={() => setViewMode('cards')}
              className={`relative z-10 h-7.5 px-3 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'cards' ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vista de tarjetas intuitivas estilo Fudo"
            >
              {viewMode === 'cards' && (
                <motion.div
                  layoutId="activeViewModePill"
                  className="absolute inset-0 bg-white rounded-full shadow-xs z-[-1]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span className="hidden sm:inline">Tarjetas</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`relative z-10 h-7.5 px-3 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'timeline' ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vista de grilla horaria por cancha"
            >
              {viewMode === 'timeline' && (
                <motion.div
                  layoutId="activeViewModePill"
                  className="absolute inset-0 bg-white rounded-full shadow-xs z-[-1]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="material-symbols-outlined text-[16px]">view_timeline</span>
              <span className="hidden sm:inline">Grilla</span>
            </button>
          </div>
        </div>

        {/* Search & Quick Filters Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Fudo style clean search input */}
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cancha por nombre o superficie..."
              className="w-full h-10 pl-10 pr-9 bg-white border border-slate-200/80 rounded-full text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:ring-3 focus:ring-[#0D5FAE]/15 shadow-2xs transition-all"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Filter Chips with Micro-Interactions */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeShift(timeShift === 'prime' ? 'all' : 'prime')}
              className={`h-8.5 px-3.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border shadow-2xs ${
                timeShift === 'prime'
                  ? 'bg-blue-50 text-[#0D5FAE] border-blue-200 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>{timeShift === 'prime' ? 'Tarde / Noche (16h+)' : 'Día completo'}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setOnlyCovered(!onlyCovered)}
              className={`h-8.5 px-3.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border shadow-2xs ${
                onlyCovered
                  ? 'bg-blue-50 text-[#0D5FAE] border-blue-200 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">roofing</span>
              <span>Techadas</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`h-8.5 px-3.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border shadow-2xs ${
                onlyAvailable
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Con turnos libres ({totalFreeSlots})</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VISTA FUDO: TARJETAS CON ANIMACIONES FLUIDAS Y TURNOS TÁCTILES         */}
      {/* ========================================================================= */}
      {viewMode === 'cards' ? (
        <motion.div
          layout
          className="grid grid-cols-1 lg:grid-cols-2 gap-4.5"
        >
          <AnimatePresence mode="popLayout">
            {filteredCourts.map((court, index) => {
              const { freeCount, totalCount } = getCourtAvailability(court.id);
              if (onlyAvailable && freeCount === 0) return null;

              return (
                <motion.div
                  layout
                  key={court.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.28, delay: index * 0.03, ease: 'easeOut' }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between gap-4 group relative overflow-hidden"
                >
                  {/* Subtle top court sport accent gradient hairline */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#0D5FAE]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Court Top Info (Fudo Product Card style) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5FAE] bg-blue-50/80 px-2 py-0.5 rounded-full">
                          {court.sportLabel}
                        </span>
                        {court.isCovered ? (
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">roofing</span>
                            <span>Techada</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100/70 px-2 py-0.5 rounded-full">
                            Exterior
                          </span>
                        )}
                        {court.surface && (
                          <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                            · {court.surface}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-snug group-hover:text-[#0D5FAE] transition-colors">
                        {court.name}
                      </h3>

                      {court.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {court.description}
                        </p>
                      )}
                    </div>

                    {/* Price Tag (Fudo bold price badge) */}
                    <div className="text-right shrink-0 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
                      <div className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                        ${court.basePrice.toLocaleString('es-AR')}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">por hora</span>
                    </div>
                  </div>

                  {/* Slots Selector (Turnos del día - direct and touch-friendly) */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Turnos para hoy:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        <strong className="text-emerald-700 font-bold">{freeCount} libres</strong> de {totalCount}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {activeHours.map((hour) => {
                        const res = findReservation(court.id, hour);

                        if (res) {
                          const isBlocked = res.isBlocked;
                          const isPaid = res.paymentStatus === 'pagada';
                          const timing = computeReservationStatus(res);

                          return (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.96 }}
                              key={hour}
                              onClick={() => onSelectReservation(res)}
                              className={`p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer h-14 ${
                                isBlocked
                                  ? 'bg-slate-100 border-slate-200 text-slate-500'
                                  : !isPaid
                                  ? 'bg-amber-50/70 border-amber-200/90 hover:border-amber-400 hover:shadow-xs'
                                  : 'bg-blue-50/70 border-blue-200/90 hover:border-blue-400 hover:shadow-xs'
                              }`}
                              title="Ver detalles de la reserva"
                            >
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                                <span className="tabular-nums font-bold">{hour} hs</span>
                                {isBlocked ? (
                                  <span className="material-symbols-outlined text-[13px] text-slate-400">lock</span>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        timing === 'en_juego'
                                          ? 'bg-blue-500 animate-pulse'
                                          : isPaid
                                          ? 'bg-emerald-500'
                                          : 'bg-amber-500'
                                      }`}
                                      title={timing === 'en_juego' ? 'En juego' : isPaid ? 'Pagada' : 'Pendiente'}
                                    />
                                    <span className="text-[9px] font-bold text-slate-400">
                                      {timing === 'en_juego' ? 'En juego' : !isPaid ? 'Cobrar' : 'Pagado'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {isBlocked ? 'Bloqueado' : res.person.name}
                              </div>
                            </motion.button>
                          );
                        }

                        // Available Slot (Libre - One click to book with animated tactile feedback!)
                        return (
                          <motion.button
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            key={hour}
                            onClick={() => onSelectSlot(court.id, hour)}
                            className="p-2 rounded-2xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-emerald-800 text-left flex flex-col justify-between transition-all cursor-pointer h-14 group/slot shadow-2xs hover:shadow-xs"
                            title="Hacé clic para reservar este horario"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="tabular-nums">{hour} hs</span>
                              <span className="text-[11px] font-black group-hover/slot:text-white text-emerald-600 transition-colors">
                                +
                              </span>
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-700 group-hover/slot:text-white transition-colors">
                              Disponible
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick card footer action */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[14px]">touch_app</span>
                      <span>Tocá cualquier turno disponible</span>
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onSelectSlot(court.id, '19:00')}
                      className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <span>+ Reservar turno</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* ========================================================================= */
        /* 3. VISTA GRILLA HORARIA (TIMELINE MATRIX) CON TRANSICIÓN SUAVE             */
        /* ========================================================================= */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
        >
          <div className="overflow-x-auto relative">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/95 border-b border-slate-200 text-slate-500 font-semibold text-xs">
                  <th className="sticky left-0 bg-slate-50/95 z-30 w-[220px] min-w-[220px] py-2.5 px-4 border-r border-slate-200 font-bold uppercase tracking-wider text-[11px] text-slate-500 shadow-[1px_0_2px_rgba(0,0,0,0.03)]">
                    Cancha
                  </th>
                  {activeHours.map((hour) => {
                    const endH = `${(parseInt(hour.split(':')[0], 10) + 1).toString().padStart(2, '0')}:00`;
                    return (
                      <th
                        key={hour}
                        className="py-2.5 px-2 text-center border-r last:border-r-0 border-slate-200 font-bold text-xs text-slate-700 tabular-nums min-w-[130px]"
                      >
                        <span>{hour}</span>
                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">–{endH.slice(0, 2)}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourts.map((court) => (
                  <tr key={court.id} className="h-[52px] hover:bg-slate-50/40 transition-colors">
                    <td className="sticky left-0 bg-white z-20 w-[220px] min-w-[220px] py-2 px-4 border-r border-slate-200 shadow-[1px_0_2px_rgba(0,0,0,0.03)] align-middle">
                      <div className="flex flex-col justify-center leading-tight">
                        <div className="font-bold text-xs text-slate-900 tracking-tight flex items-center gap-1.5">
                          <span className="truncate">{court.name}</span>
                          {court.isCovered && (
                            <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.2 rounded-full shrink-0">
                              Techada
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium tabular-nums mt-0.5">
                          ${court.basePrice.toLocaleString('es-AR')} / h
                        </div>
                      </div>
                    </td>

                    {activeHours.map((hour) => {
                      const res = findReservation(court.id, hour);
                      const endHour = `${(parseInt(hour.split(':')[0], 10) + 1).toString().padStart(2, '0')}:00`;

                      if (res) {
                        const isBlocked = res.isBlocked;
                        const isPaid = res.paymentStatus === 'pagada';
                        const timing = computeReservationStatus(res);

                        return (
                          <td
                            key={hour}
                            onClick={() => onSelectReservation(res)}
                            className="p-1.5 border-r last:border-r-0 border-slate-100 cursor-pointer align-middle min-w-[130px]"
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full h-[40px] rounded-xl px-2.5 py-1 flex flex-col justify-between transition-all border text-left leading-none ${
                                isBlocked
                                  ? 'bg-slate-100/90 border-slate-200 text-slate-700'
                                  : !isPaid
                                  ? 'bg-amber-50/90 border-amber-200 text-slate-900'
                                  : 'bg-blue-50/80 border-blue-200 text-slate-900'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {isBlocked ? (res.notes || res.blockReason) : res.person.name}
                                </span>
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    timing === 'en_juego'
                                      ? 'bg-blue-500 animate-pulse'
                                      : isPaid
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                                  }`}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                                <span>{hour.slice(0, 2)}–{endHour.slice(0, 2)} hs</span>
                                <span>{isPaid ? 'Pagada' : 'Pendiente'}</span>
                              </div>
                            </motion.div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={hour}
                          onClick={() => onSelectSlot(court.id, hour)}
                          className="p-1.5 border-r last:border-r-0 border-slate-100 cursor-pointer align-middle group min-w-[130px]"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-[40px] rounded-xl border border-dashed border-slate-200 hover:border-[#0D5FAE] bg-white hover:bg-blue-50/40 px-2.5 flex items-center justify-between transition-all"
                          >
                            <span className="text-[11px] text-slate-400 group-hover:text-[#0D5FAE] font-medium">
                              Libre
                            </span>
                            <span className="text-[10px] text-slate-400 tabular-nums">
                              ${court.basePrice.toLocaleString('es-AR')}
                            </span>
                          </motion.div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};
