import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Court,
  PublicReservation,
  SportType,
  getSportSlots,
  calculateEndTime,
  getSportDurationMinutes,
} from '../types';

interface PublicBookingViewProps {
  courts: Court[];
  reservations: PublicReservation[];
  currentDate: string;
  onSelectSlot: (court: Court, startTime: string) => void;
}

export const PublicBookingView: React.FC<PublicBookingViewProps> = ({
  courts,
  reservations,
  currentDate,
  onSelectSlot,
}) => {
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('padel');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCoveredOnly, setFilterCoveredOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');

  // Filter courts by sport, search query, and attributes
  const filteredCourts = courts.filter((court) => {
    if (selectedSport !== 'all' && court.sport !== selectedSport) return false;
    if (filterCoveredOnly && !court.isCovered) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = court.name.toLowerCase().includes(q);
      const matchSurface = court.surface?.toLowerCase().includes(q);
      const matchSport = court.sportLabel.toLowerCase().includes(q);
      if (!matchName && !matchSurface && !matchSport) return false;
    }

    return true;
  });

  // Sports categories with counts
  const sportsCategories = [
    {
      id: 'padel' as const,
      label: 'Pádel',
      icon: '🎾',
      count: courts.filter((c) => c.sport === 'padel').length,
    },
    {
      id: 'futbol' as const,
      label: 'Fútbol 7',
      icon: '⚽',
      count: courts.filter((c) => c.sport === 'futbol').length,
    },
    {
      id: 'tenis' as const,
      label: 'Tenis',
      icon: '🎾',
      count: courts.filter((c) => c.sport === 'tenis').length,
    },
    {
      id: 'all' as const,
      label: 'Todas las canchas',
      icon: '🏟️',
      count: courts.length,
    },
  ];

  // Helper to check if a slot is occupied
  const isSlotOccupied = (courtId: string, time: string) => {
    return reservations.some(
      (r) =>
        r.courtId === courtId &&
        r.date === currentDate &&
        (r.startTime === time || (time >= r.startTime && time < r.endTime))
    );
  };

  // Timeline hours for matrix view
  const timelineHours = [
    '09:00',
    '10:30',
    '12:00',
    '13:30',
    '15:00',
    '16:30',
    '18:00',
    '19:30',
    '21:00',
    '22:30',
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Sports Filter Bar & View Toggle */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Sports Categories Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto relative">
            {sportsCategories.map((cat) => {
              const isActive = selectedSport === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSport(cat.id)}
                  className={`relative h-9 px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-700 hover:text-slate-900 bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePublicSportCategory"
                      className="absolute inset-0 bg-slate-900 rounded-full shadow-xs z-[-1]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span>
                    {cat.icon} {cat.label}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View mode toggle (Cards vs Matrix Grid) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-full text-xs font-semibold shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">grid_view</span>
              <span>Canchas</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">view_timeline</span>
              <span>Grilla horaria</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Filters */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap pt-1 border-t border-slate-100">
          <div className="relative flex-1 w-full sm:w-auto min-w-0 sm:min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cancha, superficie (cristal, césped, polvo)..."
              className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterCoveredOnly(!filterCoveredOnly)}
            className={`h-9 px-3.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filterCoveredOnly
                ? 'bg-blue-50 border-[#0D5FAE] text-[#0D5FAE]'
                : 'bg-white border-slate-200/80 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">roofing</span>
            <span>Solo canchas techadas</span>
          </button>
        </div>
      </div>

      {/* 2. Courts List / Grid Representation */}
      {viewMode === 'cards' ? (
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4.5">
          <AnimatePresence mode="popLayout">
            {filteredCourts.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs font-medium">
                No se encontraron canchas con los filtros seleccionados.
              </div>
            ) : (
              filteredCourts.map((court, index) => {
                const courtSlots = getSportSlots(court.sport);
                const isHourAndHalf = court.sport === 'padel' || court.sport === 'tenis';

                // Calculate available count for this court today
                const occupiedCount = courtSlots.filter((hour) =>
                  isSlotOccupied(court.id, hour)
                ).length;
                const freeCount = courtSlots.length - occupiedCount;

                return (
                  <motion.div
                    layout
                    key={court.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-5 flex flex-col justify-between gap-3.5 sm:gap-4 group relative"
                  >
                    {/* Court Top Info Header */}
                    <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5FAE] bg-blue-50 px-2 py-0.5 rounded-full">
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
                            <span className="text-[10px] text-slate-400 font-medium">
                              · {court.surface}
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-snug group-hover:text-[#0D5FAE] transition-colors mt-0.5">
                          {court.name}
                        </h3>

                        {court.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {court.description}
                          </p>
                        )}
                      </div>

                      {/* Price Tag (Read-only configured rate) */}
                      <div className="text-right shrink-0 bg-slate-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl border border-slate-100">
                        <div className="text-sm sm:text-lg font-black text-slate-900 tabular-nums">
                          ${court.price.toLocaleString('es-AR')}
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium block">
                          por turno ({isHourAndHalf ? '1h 30m' : '1h'})
                        </span>
                      </div>
                    </div>

                    {/* Turnos Selector */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Turnos para la fecha elegida:</span>
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          {freeCount} disponibles
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {courtSlots.map((hour) => {
                          const occupied = isSlotOccupied(court.id, hour);
                          const slotEnd = calculateEndTime(hour, court.sport);

                          if (occupied) {
                            return (
                              <div
                                key={hour}
                                className="p-2 rounded-2xl border border-slate-200/70 bg-slate-100/70 text-slate-400 text-left flex flex-col justify-between h-14 cursor-not-allowed select-none"
                                title="Este turno ya se encuentra reservado"
                              >
                                <div className="flex items-center justify-between text-[11px] font-semibold">
                                  <span className="tabular-nums font-bold">{hour} hs</span>
                                  <span className="material-symbols-outlined text-[13px] text-slate-400">
                                    lock
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Ocupado
                                </span>
                              </div>
                            );
                          }

                          return (
                            <motion.button
                              whileHover={{ scale: 1.03, y: -1 }}
                              whileTap={{ scale: 0.95 }}
                              key={hour}
                              onClick={() => onSelectSlot(court, hour)}
                              className="p-2 rounded-2xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-800 text-left flex flex-col justify-between transition-all cursor-pointer h-14 group/slot shadow-2xs hover:shadow-xs"
                              title={`Tocar para reservar de ${hour} a ${slotEnd} hs`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="tabular-nums">{hour} hs</span>
                                <span className="text-[11px] font-black group-hover/slot:text-white text-emerald-600 transition-colors">
                                  +
                                </span>
                              </div>
                              <div className="text-[10px] font-semibold text-emerald-700 group-hover/slot:text-white transition-colors truncate">
                                Disponible
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick card footer helper */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-emerald-600">touch_app</span>
                        <span>Tocá un horario verde para reservar tu turno</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Timeline Matrix Grid View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
        >
          <div className="overflow-x-auto relative">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/95 border-b border-slate-200 text-slate-500 font-semibold text-xs">
                  <th className="sticky left-0 bg-slate-50/95 z-30 w-[140px] min-w-[140px] sm:w-[220px] sm:min-w-[220px] py-2.5 px-3 sm:px-4 border-r border-slate-200 font-bold uppercase tracking-wider text-[11px] text-slate-500 shadow-[1px_0_2px_rgba(0,0,0,0.03)]">
                    Cancha
                  </th>
                  {timelineHours.map((hour) => (
                    <th
                      key={hour}
                      className="py-2.5 px-2 text-center border-r last:border-r-0 border-slate-200 font-bold text-xs text-slate-700 tabular-nums min-w-[110px] sm:min-w-[130px]"
                    >
                      <span>{hour} hs</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourts.map((court) => {
                  return (
                    <tr key={court.id} className="h-[52px] hover:bg-slate-50/40 transition-colors">
                      <td className="sticky left-0 bg-white z-20 w-[140px] min-w-[140px] sm:w-[220px] sm:min-w-[220px] py-2 px-3 sm:px-4 border-r border-slate-200 shadow-[1px_0_2px_rgba(0,0,0,0.03)] align-middle">
                        <div className="flex flex-col justify-center leading-tight">
                          <div className="font-bold text-xs text-slate-900 tracking-tight truncate">
                            {court.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium tabular-nums mt-0.5">
                            ${court.price.toLocaleString('es-AR')}
                          </div>
                        </div>
                      </td>

                      {timelineHours.map((hour) => {
                        const occupied = isSlotOccupied(court.id, hour);

                        if (occupied) {
                          return (
                            <td
                              key={hour}
                              className="p-1.5 border-r last:border-r-0 border-slate-100 align-middle min-w-[110px] sm:min-w-[130px]"
                            >
                              <div className="w-full h-[38px] rounded-xl bg-slate-100 text-slate-400 px-2 flex items-center justify-between text-xs font-semibold select-none cursor-not-allowed">
                                <span>Ocupado</span>
                                <span className="material-symbols-outlined text-[13px]">lock</span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={hour}
                            onClick={() => onSelectSlot(court, hour)}
                            className="p-1.5 border-r last:border-r-0 border-slate-100 cursor-pointer align-middle group min-w-[110px] sm:min-w-[130px]"
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full h-[38px] rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-600 hover:text-white px-2.5 flex items-center justify-between transition-all"
                            >
                              <span className="text-[11px] text-emerald-800 group-hover:text-white font-bold">
                                Reservar
                              </span>
                              <span className="text-[10px] text-emerald-700 group-hover:text-white font-semibold">
                                +
                              </span>
                            </motion.div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};
