import React, { useState } from 'react';
import { ClubInfo } from '../types';
import { DatePickerModal } from './DatePickerModal';
import {
  PORTAL_BASE_TODAY,
  stepDate,
  formatDateShort,
  formatDateReadable,
} from '../utils/dateUtils';

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const todayStr = PORTAL_BASE_TODAY;
  const tomorrowStr = stepDate(todayStr, 1);

  const isToday = currentDate === todayStr;
  const isTomorrow = currentDate === tomorrowStr;
  const isAtMinDate = currentDate <= todayStr;

  const handleStep = (offset: number) => {
    const next = stepDate(currentDate, offset, todayStr);
    onDateChange(next);
  };

  return (
    <>
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
                <span>WhatsApp del Club</span>
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
                    Portal Público de Reservas
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate hidden xs:block">
                  {club.tagline}
                </p>
              </div>
            </div>

            {/* Quick Date Selector (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100/90 rounded-full border border-slate-200/70 text-xs font-medium relative shrink-0">
              {/* Back button (disabled if already at minimum date) */}
              <button
                type="button"
                disabled={isAtMinDate}
                onClick={() => handleStep(-1)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isAtMinDate
                    ? 'text-slate-300 opacity-40 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer'
                }`}
                title={isAtMinDate ? 'No se pueden consultar fechas pasadas' : 'Día anterior'}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              <button
                type="button"
                onClick={() => onDateChange(todayStr)}
                className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                  isToday
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Hoy ({formatDateShort(todayStr)})
              </button>

              <button
                type="button"
                onClick={() => onDateChange(tomorrowStr)}
                className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                  isTomorrow
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Mañana ({formatDateShort(tomorrowStr)})
              </button>

              {/* Forward button */}
              <button
                type="button"
                onClick={() => handleStep(1)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Día siguiente"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              {/* Pick another date modal trigger */}
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                  !isToday && !isTomorrow
                    ? 'text-white font-bold bg-[#0D5FAE] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Abrir calendario para elegir otra fecha"
              >
                <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                <span>{!isToday && !isTomorrow ? formatDateShort(currentDate) : 'Otra fecha'}</span>
              </button>
            </div>

            {/* Right Mobile WhatsApp Quick Action */}
            <div className="flex sm:hidden items-center shrink-0">
              <a
                href={`https://api.whatsapp.com/send?phone=${club.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xs font-bold"
                title="Contacto directo por WhatsApp"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sub-header Bar for Mobile Screen (Date selector) */}
        <div className="sm:hidden w-full border-t border-slate-100 bg-slate-50/95 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-full text-xs font-medium shrink-0">
            <button
              type="button"
              disabled={isAtMinDate}
              onClick={() => handleStep(-1)}
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isAtMinDate ? 'text-slate-300 opacity-40 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-300 cursor-pointer'
              }`}
              title={isAtMinDate ? 'No se pueden consultar fechas pasadas' : 'Día anterior'}
            >
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
            </button>

            <button
              type="button"
              onClick={() => onDateChange(todayStr)}
              className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs ${
                isToday ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => onDateChange(tomorrowStr)}
              className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs ${
                isTomorrow ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Mañana
            </button>

            <button
              type="button"
              onClick={() => handleStep(1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-300 cursor-pointer"
              title="Día siguiente"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                !isToday && !isTomorrow
                  ? 'bg-[#0D5FAE] text-white font-bold shadow-xs'
                  : 'text-slate-700 bg-white shadow-2xs'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">calendar_month</span>
              <span>{!isToday && !isTomorrow ? formatDateShort(currentDate) : 'Fecha'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            className="text-[11px] text-[#0D5FAE] font-bold truncate flex items-center gap-1 cursor-pointer hover:underline"
            title="Cambiar fecha"
          >
            <span>{formatDateReadable(currentDate)}</span>
          </button>
        </div>
      </header>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={currentDate}
        minDate={todayStr}
        onSelectDate={(newDate) => {
          onDateChange(newDate);
        }}
      />
    </>
  );
};
