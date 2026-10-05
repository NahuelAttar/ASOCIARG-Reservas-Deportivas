import React, { useState } from 'react';
import {
  Court,
  PublicReservation,
  SportType,
  getSportSlots,
  calculateEndTime,
  doIntervalsOverlap,
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
  // Solo los 3 deportes soportados (Requisito #7)
  const [selectedSport, setSelectedSport] = useState<SportType>('padel');

  const sportsCategories: { id: SportType; label: string; icon: string }[] = [
    { id: 'padel', label: 'Pádel', icon: '🎾' },
    { id: 'futbol', label: 'Fútbol 7', icon: '⚽' },
    { id: 'tenis', label: 'Tenis', icon: '🎾' },
  ];

  // Canchas dinámicas del deporte seleccionado (sin buscador ni filtros - Requisito #2)
  const courtsForSport = courts.filter((court) => court.sport === selectedSport);

  // Verificación de disponibilidad contemplando superposición real de intervalos (Requisito #20)
  const isSlotOccupied = (court: Court, time: string) => {
    const slotEnd = calculateEndTime(time, court.sport);

    return reservations.some((r) => {
      if (r.courtId !== court.id || r.date !== currentDate) return false;
      return doIntervalsOverlap(time, slotEnd, r.startTime, r.endTime);
    });
  };

  const formattedDate = formatDateReadable(currentDate);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Selector de Deporte y Fecha Seleccionada */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        {/* Pestañas de deportes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
          {sportsCategories.map((cat) => {
            const isActive = selectedSport === cat.id;
            const count = courts.filter((c) => c.sport === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedSport(cat.id)}
                className={`h-10 px-4 sm:px-5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
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

        {/* Indicador de Fecha */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/70">
          <span className="material-symbols-outlined text-[15px] text-[#0D5FAE]">
            calendar_today
          </span>
          <span>Fecha:</span>
          <strong className="text-slate-900 capitalize font-bold">{formattedDate}</strong>
        </div>
      </div>

      {/* 2. Listado Dinámico de Canchas (Requisito #3: información simplificada al mínimo necesario) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courtsForSport.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs font-medium">
            No hay canchas registradas para este deporte.
          </div>
        ) : (
          courtsForSport.map((court) => {
            const courtSlots = getSportSlots(court.sport);

            // Disponibilidad real calculada
            const occupiedCount = courtSlots.filter((hour) =>
              isSlotOccupied(court, hour)
            ).length;
            const freeCount = courtSlots.length - occupiedCount;

            // Formato de nombre con su característica relevante (ej: "Cancha 1 · Cristal")
            const courtDisplayName = court.feature
              ? `${court.name} · ${court.feature}`
              : court.name;

            return (
              <div
                key={court.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md"
              >
                {/* Cabecera simplificada de la cancha (Requisito #3) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5FAE] bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                      {court.sportLabel}
                    </span>

                    <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight mt-0.5">
                      {courtDisplayName}
                    </h2>
                  </div>

                  {/* Precio del turno (Requisito #3) */}
                  <div className="text-right shrink-0 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200/70">
                    <div className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                      ${court.price.toLocaleString('es-AR')}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      por turno
                    </span>
                  </div>
                </div>

                {/* Sección de Horarios con intervalo completo (Requisito #8 y #9) */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Horarios disponibles:</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {freeCount} libres
                    </span>
                  </div>

                  {/* Botones de turnos con intervalo completo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {courtSlots.map((hour) => {
                      const occupied = isSlotOccupied(court, hour);
                      const intervalText = formatSlotInterval(hour, court.sport);

                      if (occupied) {
                        return (
                          <div
                            key={hour}
                            className="p-2.5 rounded-2xl border border-slate-200/70 bg-slate-100/70 text-slate-400 flex items-center justify-between cursor-not-allowed select-none"
                            title={`Horario de ${intervalText} ocupado`}
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
                          className="p-2.5 rounded-2xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-600 text-emerald-900 hover:text-white flex items-center justify-between transition-all cursor-pointer shadow-2xs group active:scale-[0.98]"
                          title={`Tocar para reservar de ${intervalText}`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="tabular-nums font-extrabold text-xs text-emerald-950 group-hover:text-white">
                              {intervalText}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 group-hover:text-emerald-100">
                              Disponible · Reservar
                            </span>
                          </div>
                          <span className="w-6 h-6 rounded-full bg-emerald-200/80 group-hover:bg-white text-emerald-800 flex items-center justify-center font-black text-sm shrink-0 transition-colors">
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
