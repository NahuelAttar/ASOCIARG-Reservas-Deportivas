import React from 'react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentTab: 'agenda' | 'reservas';
  onSelectTab: (tab: 'agenda' | 'reservas') => void;
  currentDate: string;
  onDateChange: (date: string) => void;
  onOpenNewBooking: () => void;
  onOpenBlockSlot: () => void;
  onOpenBaseRates: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentDate,
  onDateChange,
  onOpenNewBooking,
  onOpenBlockSlot,
  onOpenBaseRates,
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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Animated Navigation Pills (Fudo Style) */}
          <div className="flex items-center gap-2.5 sm:gap-6 min-w-0">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 cursor-pointer shrink-0"
            >
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-gradient-to-br from-[#0D5FAE] to-[#2575c0] flex items-center justify-center text-white shadow-xs font-black text-sm shrink-0">
                A
              </div>
              <div className="hidden xs:block">
                <div className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-tight">
                  ASOCIARG
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                  Complejo Deportivo
                </div>
              </div>
            </motion.div>

            {/* Navigation Tabs with smooth layoutId sliding pill */}
            <nav className="flex items-center p-1 bg-slate-100/90 rounded-full text-xs font-semibold border border-slate-200/70 relative shrink-0">
              <button
                onClick={() => onSelectTab('agenda')}
                className={`relative z-10 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'agenda' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {currentTab === 'agenda' && (
                  <motion.div
                    layoutId="activeHeaderTab"
                    className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200/60 z-[-1]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                <span>Agenda</span>
              </button>

              <button
                onClick={() => onSelectTab('reservas')}
                className={`relative z-10 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'reservas' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {currentTab === 'reservas' && (
                  <motion.div
                    layoutId="activeHeaderTab"
                    className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200/60 z-[-1]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="material-symbols-outlined text-[15px]">list_alt</span>
                <span>Reservas</span>
              </button>
            </nav>
          </div>

          {/* Center Date Quick Selector with Smooth Sliding Indicator (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/90 rounded-full border border-slate-200/70 text-xs font-medium relative">
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

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenBlockSlot}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title="Bloquear cancha por mantenimiento o evento"
            >
              <span className="material-symbols-outlined text-[15px] text-slate-400">lock</span>
              <span>Bloquear</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenBaseRates}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title="Configurar precios base por cancha"
            >
              <span className="material-symbols-outlined text-[15px] text-slate-400">payments</span>
              <span>Tarifas</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 4px 14px rgba(13, 95, 174, 0.25)' }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenNewBooking}
              className="px-3 sm:px-4 py-2 rounded-full bg-[#0D5FAE] hover:bg-[#094785] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span className="hidden xs:inline">Nueva reserva</span>
              <span className="xs:hidden">Reserva</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sub-header Bar for Tablet & Mobile (under lg) */}
      <div className="lg:hidden w-full border-t border-slate-100 bg-slate-50/95 backdrop-blur-xs px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Date Selector for Mobile */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-full text-xs font-medium shrink-0">
          <button
            onClick={() => onDateChange('2024-10-30')}
            className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs ${
              isToday ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => onDateChange('2024-10-31')}
            className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs ${
              isTomorrow ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
              title="Elegir otra fecha"
            />
            <button
              type="button"
              className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                !isToday && !isTomorrow ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">event</span>
              <span>{!isToday && !isTomorrow ? formatDateDisplay(currentDate) : 'Fecha'}</span>
            </button>
          </div>
        </div>

        {/* Quick mobile secondary action buttons */}
        <div className="flex items-center gap-1 sm:hidden shrink-0">
          <button
            onClick={onOpenBlockSlot}
            className="p-1 rounded-full text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs text-xs font-semibold flex items-center gap-1 px-2.5 cursor-pointer"
            title="Bloquear cancha"
          >
            <span className="material-symbols-outlined text-[13px] text-slate-500">lock</span>
            <span className="text-[10px]">Bloquear</span>
          </button>
          <button
            onClick={onOpenBaseRates}
            className="p-1 rounded-full text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs text-xs font-semibold flex items-center gap-1 px-2.5 cursor-pointer"
            title="Tarifas base"
          >
            <span className="material-symbols-outlined text-[13px] text-slate-500">payments</span>
            <span className="text-[10px]">Tarifas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
