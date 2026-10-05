import React, { useState } from 'react';
import {
  Court,
  PublicReservation,
  SportType,
  getSportSlots,
  getSportDurationMinutes,
} from '../types';
import { formatDateReadable, formatSlotInterval } from '../utils/dateUtils';

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
  // Only supported sports: Pádel, Fútbol 7, Tenis (Requisito #1)
  const [selectedSport, setSelectedSport] = useState<SportType>('padel');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCoveredOnly, setFilterCoveredOnly] = useState(false);

  // Sports list (strictly the 3 supported sports)
  const sportsCategories: { id: SportType; label: string; icon: string }[] = [
    {
      id: 'padel',
      label: 'Pádel',
      icon: '🎾',
    },
    {
      id: 'futbol',
      label: 'Fútbol 7',
      icon: '⚽',
    },
    {
      id: 'tenis',
      label: 'Tenis',
      icon: '🎾',
    },
  ];

  // Helper to check if a court slot is occupied on the selected date
  const isSlotOccupied = (courtId: string, time: string) => {
    return reservations.some(
      (r) =>
        r.courtId === courtId &&
        r.date === currentDate &&
        (r.startTime === time || (time >= r.startTime && time < r.endTime))
    );
  };

  // Filter courts dynamically by the selected sport and search/covered options
  const courtsForSport = courts.filter((court) => {
    if (court.sport !== selectedSport) return false;
    if (filterCoveredOnly && !court.isCovered) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = court.name.toLowerCase().includes(q);
      const matchSurface = court.surface?.toLowerCase().includes(q);
      const matchDesc = court.description?.toLowerCase().includes(q);
      if (!matchName && !matchSurface && !matchDesc) return false;
    }

    return true;
  });

  const formattedDate = formatDateReadable(currentDate);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Sport Selector Tabs (Requisito #1: Pádel, Fútbol 7, Tenis) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Sports Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
            {sportsCategories.map((cat) => {
              const isActive = selectedSport === cat.id;
              const count = courts.filter((c) => c.sport === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedSport(cat.id)}
                  className={`h-10 px-4 sm:px-5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>
                    {cat.icon} {cat.label}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count} {count === 1 ? 'cancha' : 'canchas'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Date Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/70">
            <span className="material-symbols-outlined text-[15px] text-[#0D5FAE]">
              event_available
            </span>
            <span>Fecha:</span>
            <strong className="text-slate-900 capitalize font-bold">{formattedDate}</strong>
          </div>
        </div>

        {/* Search & Characteristics Filter */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap pt-2 border-t border-slate-100">
          <div className="relative flex-1 w-full sm:w-auto min-w-0 sm:min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cancha o característica (cristal, césped, polvo)..."
              className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFilterCoveredOnly(!filterCoveredOnly)}
            className={`h-9 px-3.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filterCoveredOnly
                ? 'bg-blue-50 border-[#0D5FAE] text-[#0D5FAE]'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">roofing</span>
            <span>Solo canchas techadas</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Courts & Availability List (Requisito #1, #2, #4, #5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courtsForSport.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs font-medium flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[32px] text-slate-300">
              search_off
            </span>
            <span>No se encontraron canchas con los filtros seleccionados.</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-[#0D5FAE] font-bold hover:underline cursor-pointer"
              >
                Borrar filtro de búsqueda
              </button>
            )}
          </div>
        ) : (
          courtsForSport.map((court) => {
            const courtSlots = getSportSlots(court.sport);
            const durationMinutes = getSportDurationMinutes(court.sport);
            const durationText = durationMinutes === 90 ? '1h 30m' : '1h';

            // Calculate occupied count for this court on current date
            const occupiedCount = courtSlots.filter((hour) =>
              isSlotOccupied(court.id, hour)
            ).length;
            const freeCount = courtSlots.length - occupiedCount;

            return (
              <div
                key={court.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between gap-4 group transition-shadow hover:shadow-md"
              >
                {/* Court Header Information (Requisito #2: deporte, nombre, características) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5FAE] bg-blue-50 px-2 py-0.5 rounded-full">
                        {court.sportLabel}
                      </span>

                      {court.isCovered ? (
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-slate-500">
                            roofing
                          </span>
                          <span>Techada</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full">
                          Exterior
                        </span>
                      )}

                      {court.surface && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-full">
                          {court.surface}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight mt-0.5">
                      {court.name}
                    </h3>

                    {court.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {court.description}
                      </p>
                    )}
                  </div>

                  {/* Price Tag (Read-only informative rate - Requisito #8) */}
                  <div className="text-right shrink-0 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200/70">
                    <div className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                      ${court.price.toLocaleString('es-AR')}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      por turno ({durationText})
                    </span>
                  </div>
                </div>

                {/* Turnos Section (Requisitos #4 & #5: intervalo completo, disponible vs ocupado) */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Horarios disponibles:</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {freeCount} de {courtSlots.length} libres
                    </span>
                  </div>

                  {/* Grid of slot buttons with full interval representations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {courtSlots.map((hour) => {
                      const occupied = isSlotOccupied(court.id, hour);
                      const intervalText = formatSlotInterval(hour, court.sport);

                      if (occupied) {
                        return (
                          <div
                            key={hour}
                            className="p-2.5 rounded-2xl border border-slate-200/70 bg-slate-100/70 text-slate-400 flex items-center justify-between cursor-not-allowed select-none transition-opacity"
                            title={`Horario de ${intervalText} ya ocupado`}
                          >
                            <div className="flex flex-col">
                              <span className="tabular-nums font-bold text-xs text-slate-500">
                                {intervalText}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Ocupado
                              </span>
                            </div>
                            <span className="material-symbols-outlined text-[15px] text-slate-400">
                              lock
                            </span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => onSelectSlot(court, hour)}
                          className="p-2.5 rounded-2xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-600 text-emerald-900 hover:text-white flex items-center justify-between transition-all cursor-pointer shadow-2xs group/slot active:scale-[0.98]"
                          title={`Tocar para reservar de ${intervalText}`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="tabular-nums font-extrabold text-xs text-emerald-950 group-hover/slot:text-white">
                              {intervalText}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 group-hover/slot:text-emerald-100">
                              Disponible · Reservar
                            </span>
                          </div>
                          <span className="w-6 h-6 rounded-full bg-emerald-200/80 group-hover/slot:bg-white text-emerald-800 flex items-center justify-center font-black text-sm shrink-0 transition-colors">
                            +
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
