import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PORTAL_BASE_TODAY, isPastDate } from '../utils/dateUtils';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  minDate?: string;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  minDate = PORTAL_BASE_TODAY,
}) => {
  // Parse current selected date safely
  const parseDate = (str: string) => {
    try {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
    } catch {
      return new Date();
    }
  };

  const initialDate = parseDate(selectedDate);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Format helper to YYYY-MM-DD
  const formatYMD = (year: number, month: number, day: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const weekDayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  // Days in current view month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Day of week of 1st day of month (0 = Sun, 1 = Mon ... 6 = Sat)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  // Convert so Monday is index 0: Mon=0, Tue=1 ... Sun=6
  const startingCol = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handlePickDay = (day: number) => {
    const newDateStr = formatYMD(viewYear, viewMonth, day);
    if (isPastDate(newDateStr, minDate)) {
      return; // Do not allow selecting past dates
    }
    onSelectDate(newDateStr);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0D5FAE] text-[20px]">
                  calendar_month
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Seleccionar fecha
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Quick shortcuts (all guaranteed >= minDate) */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  onSelectDate('2024-10-30');
                  onClose();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === '2024-10-30'
                    ? 'bg-[#0D5FAE] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Hoy (Mié 30)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectDate('2024-10-31');
                  onClose();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === '2024-10-31'
                    ? 'bg-[#0D5FAE] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Mañana (Jue 31)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectDate('2024-11-01');
                  onClose();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === '2024-11-01'
                    ? 'bg-[#0D5FAE] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Vie 1 Nov
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectDate('2024-11-02');
                  onClose();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === '2024-11-02'
                    ? 'bg-[#0D5FAE] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Sáb 2 Nov
              </button>
            </div>

            {/* Calendar Controls (Month & Year) */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-extrabold text-sm text-slate-800 tracking-tight">
                  {monthNames[viewMonth]} {viewYear}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Mes anterior"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Mes siguiente"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Day names headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekDayNames.map((wName, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1"
                  >
                    {wName}
                  </span>
                ))}
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty cells before 1st day */}
                {Array.from({ length: startingCol }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 sm:h-10" />
                ))}

                {/* Actual day numbers */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = formatYMD(viewYear, viewMonth, dayNum);
                  const isPast = isPastDate(dateStr, minDate);
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === minDate;

                  if (isPast) {
                    return (
                      <div
                        key={dayNum}
                        className="h-9 sm:h-10 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center text-slate-300 cursor-not-allowed select-none"
                        title="Fecha pasada (no disponible para reservas)"
                      >
                        {dayNum}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => handlePickDay(dayNum)}
                      className={`h-9 sm:h-10 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-[#0D5FAE] text-white shadow-md shadow-blue-500/20 font-black'
                          : isToday
                          ? 'bg-blue-50 text-[#0D5FAE] border border-blue-200 hover:bg-blue-100'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {isToday && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-[#0D5FAE] mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Direct manual input fallback with min constraint */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>O ingresar fecha:</span>
                <input
                  type="date"
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      if (!isPastDate(e.target.value, minDate)) {
                        onSelectDate(e.target.value);
                        onClose();
                      }
                    }
                  }}
                  className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0D5FAE]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
