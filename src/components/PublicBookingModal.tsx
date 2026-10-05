import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Court, CustomerData, calculateEndTime } from '../types';
import { formatDateReadable, formatSlotInterval } from '../utils/dateUtils';
import { isValidPhone, normalizePhone } from '../utils/phoneUtils';

interface PublicBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: Court | null;
  startTime: string;
  date: string;
  onConfirmReservation: (data: {
    court: Court;
    startTime: string;
    endTime: string;
    date: string;
    customer: CustomerData;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const PublicBookingModal: React.FC<PublicBookingModalProps> = ({
  isOpen,
  onClose,
  court,
  startTime,
  date,
  onConfirmReservation,
}) => {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar y limpiar campos cada vez que se abre una nueva reserva (Requisito #14)
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFirstName('');
      setLastName('');
      setPhone('');
      setFormError(null);
      setConfirmError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!court) return null;

  const endTime = calculateEndTime(startTime, court.sport);
  const slotIntervalText = formatSlotInterval(startTime, court.sport);
  const formattedDate = formatDateReadable(date);
  const courtDisplayName = court.feature
    ? `${court.name} · ${court.feature}`
    : court.name;

  // Paso 1: Validar datos e ir a Revisión (Requisito #11, #12, #13)
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const rawPhone = phone.trim();

    if (!trimmedFirst) {
      setFormError('Por favor ingresá tu nombre.');
      return;
    }

    if (!trimmedLast) {
      setFormError('Por favor ingresá tu apellido.');
      return;
    }

    if (!rawPhone || !isValidPhone(rawPhone)) {
      setFormError('Por favor ingresá un número de teléfono válido (ej: 3564-445566).');
      return;
    }

    setStep('review');
  };

  // Paso 2: Confirmar reserva definitiva
  const handleFinalConfirm = async () => {
    setConfirmError(null);
    setIsSubmitting(true);

    try {
      const normalizedPhone = normalizePhone(phone);
      const result = await onConfirmReservation({
        court,
        startTime,
        endTime,
        date,
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: normalizedPhone,
        },
      });

      if (!result.success) {
        setConfirmError(
          result.error || 'No pudimos completar la reserva. Intentá nuevamente.'
        );
      }
    } catch {
      setConfirmError('No pudimos completar la reserva. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          {/* Fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Tarjeta del modal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 my-0 sm:my-auto"
          >
            {/* Cabecera */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5FAE] bg-blue-50 px-2 py-0.5 rounded-full">
                    {court.sportLabel}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">·</span>
                  <span className="text-xs font-bold text-slate-700">{courtDisplayName}</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 tracking-tight">
                  {step === 'form' ? 'Datos del Reservante' : 'Revisión de la Reserva'}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Cerrar"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* PASO 1: DATOS (Requisito #11: Nombre, Apellido, Teléfono únicamente) */}
            {step === 'form' && (
              <form onSubmit={handleProceedToReview} className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5 sm:gap-4 text-xs">
                {/* Resumen del turno seleccionado */}
                <div className="p-3 sm:p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 capitalize">
                      {formattedDate}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
                      {slotIntervalText}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Total</span>
                    <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                      ${court.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Error de validación */}
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                    <span className="font-semibold text-xs">{formError}</span>
                  </div>
                )}

                {/* Inputs */}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="booking-first-name" className="text-[11px] font-bold text-slate-700">
                        Nombre *
                      </label>
                      <input
                        id="booking-first-name"
                        type="text"
                        required
                        autoFocus
                        autoComplete="given-name"
                        autoCapitalize="words"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ej: Nahuel"
                        className="w-full h-11 sm:h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="booking-last-name" className="text-[11px] font-bold text-slate-700">
                        Apellido *
                      </label>
                      <input
                        id="booking-last-name"
                        type="text"
                        required
                        autoComplete="family-name"
                        autoCapitalize="words"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ej: Attar"
                        className="w-full h-11 sm:h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="booking-phone" className="text-[11px] font-bold text-slate-700">
                      Teléfono celular *
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej: 3564-445566"
                      className="w-full h-11 sm:h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white transition-colors"
                    />
                    <span className="text-[10px] text-slate-400">
                      Usaremos este número para la confirmación de tu reserva.
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-2 pb-3 sm:pb-0 flex items-center gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-11 sm:h-10 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="flex-1 h-11 sm:h-10 px-6 rounded-full bg-[#0D5FAE] hover:bg-[#094785] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Revisar reserva</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </form>
            )}

            {/* PASO 2: REVISIÓN ANTES DE CONFIRMAR (Requisito #13: Deporte, Cancha, Fecha, Horario, Nombre, Teléfono, Total) */}
            {step === 'review' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5 sm:gap-4 text-xs">
                {/* Alerta de error si el turno dejó de estar disponible (Requisito #17) */}
                {confirmError && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5">
                      warning
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-xs">Horario no disponible</span>
                      <p className="text-xs leading-relaxed text-amber-800">{confirmError}</p>
                    </div>
                  </div>
                )}

                {/* Resumen exacto según Requisito #13 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
                  <div className="flex flex-col gap-1 pb-2.5 border-b border-slate-200/80">
                    <div className="text-base font-extrabold text-slate-900">
                      {court.sportLabel} - {courtDisplayName}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 capitalize">
                      {formattedDate}
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between text-sm font-black text-[#0D5FAE] tabular-nums gap-1">
                      <span>{slotIntervalText}</span>
                      <span className="text-xs font-semibold text-slate-500">
                        Duración: {court.sport === 'futbol' ? '1 hora' : '1h 30m'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 pb-2.5 border-b border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">A nombre de </span>
                      <strong className="text-slate-900 font-bold">
                        {firstName} {lastName}
                      </strong>
                    </div>
                    <div className="text-slate-600 font-medium mt-0.5">
                      <span>Teléfono: </span>
                      <strong className="text-slate-800">{phone}</strong>
                    </div>
                  </div>

                  {/* Únicamente Total: $X (Requisito #4: sin información de dónde ni cómo se paga) */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-700 text-sm">Total:</span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                      ${court.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-2 pb-3 sm:pb-0 flex items-center gap-3 mt-auto">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setConfirmError(null);
                      setStep('form');
                    }}
                    className="h-11 sm:h-10 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Modificar</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalConfirm}
                    className={`flex-1 h-11 sm:h-10 px-6 rounded-full font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirmando...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Confirmar reserva</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
