import React from 'react';
import { motion } from 'motion/react';
import { ClubInfo } from '../types';

interface PublicHeaderProps {
  club: ClubInfo;
  currentDate: string;
  onDateChange: (date: string) => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  club,
  currentDate,
  onDateChange,
}) => {
  // Format date display (e.g., "Mié 30 Oct")
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      const weekday = d.toLocaleDateString('es-AR', { weekday: 'short' });
      const day = d.getDate();
      const month = d.toLocaleDateString('es-AR', { month: 'short' });
      return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month}`;
    } catch {
      return dateStr;
    }
  };

  const isToday = currentDate === '2024-10-30';
  const isTomorrow = currentDate === '2024-10-31';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Top micro bar with club public link indicator */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-300 truncate">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">link</span>
            <span className="text-slate-400 font-mono">club.com/</span>
            <span className="font-bold text-white font-mono">{club.slug}</span>
            <span className="text-slate-400 font-mono">/reservas</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
              <span>{club.address}</span>
            </span>
            <a
              href={`https://api.whatsapp.com/send?phone=${club.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[13px]">chat</span>
              <span>WhatsApp Club</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Club Navigation & Date Selector */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Club Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#0D5FAE] to-[#1E3A8A] flex items-center justify-center text-white shadow-xs font-black text-base shrink-0">
              {club.logoLetter || club.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-tight truncate">
                  {club.name}
                </h1>
                <span className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Portal de Reservas
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate hidden xs:block">
                {club.tagline}
              </p>
            </div>
          </div>

          {/* Quick Date Selector (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100/90 rounded-full border border-slate-200/70 text-xs font-medium relative shrink-0">
            <button
              onClick={() => onDateChange('2024-10-30')}
              className={`relative z-10 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                isToday ? 'text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isToday && (
                <motion.div
                  layoutId="activeDatePill"
                  className="absolute inset-0 bg-slate-900 rounded-full shadow-xs z-[-1]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              Hoy (Mié 30)
            </button>

            <button
              onClick={() => onDateChange('2024-10-31')}
              className={`relative z-10 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                isTomorrow ? 'text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTomorrow && (
                <motion.div
                  layoutId="activeDatePill"
                  className="absolute inset-0 bg-slate-900 rounded-full shadow-xs z-[-1]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              Mañana (Jue 31)
            </button>

            <div className="relative inline-flex items-center">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  if (e.target.value) onDateChange(e.target.value);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                title="Elegir otra fecha"
              />
              <button
                type="button"
                className={`relative z-10 px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                  !isToday && !isTomorrow ? 'text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {!isToday && !isTomorrow && (
                  <motion.div
                    layoutId="activeDatePill"
                    className="absolute inset-0 bg-slate-900 rounded-full shadow-xs z-[-1]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="material-symbols-outlined text-[15px]">event</span>
                <span>{!isToday && !isTomorrow ? formatDateDisplay(currentDate) : 'Otra fecha'}</span>
              </button>
            </div>
          </div>

          {/* Right Mobile WhatsApp Quick Action */}
          <div className="flex sm:hidden items-center shrink-0">
            <a
              href={`https://api.whatsapp.com/send?phone=${club.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xs font-bold"
              title="Contacto por WhatsApp"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sub-header Bar for Mobile Screen (Date selector) */}
      <div className="sm:hidden w-full border-t border-slate-100 bg-slate-50/95 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 p-0.5 bg-slate-200/80 rounded-full text-xs font-medium shrink-0">
          <button
            onClick={() => onDateChange('2024-10-30')}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer text-xs ${
              isToday ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => onDateChange('2024-10-31')}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer text-xs ${
              isTomorrow ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Mañana
          </button>
          <div className="relative inline-flex items-center">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) onDateChange(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
            />
            <button
              type="button"
              className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                !isToday && !isTomorrow ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">event</span>
              <span>{!isToday && !isTomorrow ? formatDateDisplay(currentDate) : 'Fecha'}</span>
            </button>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-medium truncate">
          {formatDateDisplay(currentDate)}
        </span>
      </div>
    </header>
  );
};
