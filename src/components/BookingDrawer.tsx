import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Court,
  Person,
  Reservation,
  computeReservationStatus,
  calculateEndTime,
  getSportDurationMinutes,
  getSportSlots,
} from '../types';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Court[];
  people: Person[];
  mode: 'new' | 'detail';
  reservation?: Reservation | null;
  prefillCourtId?: string;
  prefillTime?: string;
  prefillDate?: string;
  onSaveReservation: (data: Partial<Reservation> & { id?: string }) => void;
  onCancelReservation?: (id: string) => void;
  onMarkNoShow?: (id: string) => void;
  onOpenPaymentModal?: (reservation: Reservation) => void;
}

export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  onClose,
  courts,
  people,
  mode,
  reservation,
  prefillCourtId,
  prefillTime,
  prefillDate,
  onSaveReservation,
  onCancelReservation,
  onMarkNoShow,
  onOpenPaymentModal,
}) => {
  // Slot selection
  const [courtId, setCourtId] = useState<string>(prefillCourtId || courts[0]?.id || 'padel-1');
  const [date, setDate] = useState<string>(prefillDate || '2024-10-30');
  const [startTime, setStartTime] = useState<string>(prefillTime || '19:00');

  // Person handling: search vs new person
  const [personMode, setPersonMode] = useState<'search' | 'new'>('search');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [personSearchQuery, setPersonSearchQuery] = useState<string>('');
  const [isChangingPerson, setIsChangingPerson] = useState<boolean>(false);

  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newDni, setNewDni] = useState<string>('');

  // Editable tariff: numeric value + formatted display with dots/commas and NO sticky zero
  const [price, setPrice] = useState<number>(12000);
  const [priceDisplay, setPriceDisplay] = useState<string>('12.000');
  const [notes, setNotes] = useState<string>('');

  // Sync state on drawer open
  useEffect(() => {
    if (mode === 'detail' && reservation) {
      setCourtId(reservation.courtId);
      setDate(reservation.date);
      setStartTime(reservation.startTime);
      setPrice(reservation.price);
      setPriceDisplay(reservation.price.toLocaleString('es-AR'));
      setNotes(reservation.notes || '');
      setSelectedPersonId(reservation.person.id);
      setNewName(reservation.person.name);
      setNewPhone(reservation.person.phone);
      setNewDni(reservation.person.dni || '');
      setPersonMode(reservation.person.id.startsWith('ext-') ? 'new' : 'search');
      setIsChangingPerson(false);
    } else if (mode === 'new') {
      const activeCourt = courts.find((c) => c.id === (prefillCourtId || courts[0]?.id));
      const activeSlots = getSportSlots(activeCourt?.sport || 'padel');
      setCourtId(activeCourt ? activeCourt.id : courts[0]?.id || 'padel-1');
      setDate(prefillDate || '2024-10-30');
      setStartTime(
        prefillTime && activeSlots.includes(prefillTime)
          ? prefillTime
          : activeSlots[0] || '09:00'
      );
      const baseP = activeCourt ? activeCourt.basePrice : 12000;
      setPrice(baseP);
      setPriceDisplay(baseP.toLocaleString('es-AR'));
      setNotes('');
      setPersonMode('new');
      setSelectedPersonId('');
      setNewName('');
      setNewPhone('');
      setNewDni('');
      setPersonSearchQuery('');
      setIsChangingPerson(false);
    }
  }, [isOpen, mode, reservation, prefillCourtId, prefillTime, prefillDate, courts, people]);

  const currentCourt = courts.find((c) => c.id === courtId) || courts[0];
  const suggestedPrice = currentCourt ? currentCourt.basePrice : 12000;

  // Formatted price change without annoying leading zero and with thousand separators
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setPrice(0);
      setPriceDisplay('');
      return;
    }
    const val = parseInt(raw, 10);
    setPrice(val);
    setPriceDisplay(val.toLocaleString('es-AR'));
  };

  // Filtered people for autocomplete
  const filteredPeople = people.filter((p) => {
    if (!personSearchQuery.trim()) return true;
    const q = personSearchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.dni && p.dni.includes(q)) ||
      (p.memberNumber && p.memberNumber.includes(q))
    );
  });

  const selectedPerson =
    people.find((p) => p.id === selectedPersonId) ||
    (reservation ? reservation.person : people[0]);

  // Duración: Pádel y Tenis 1h 30m, Fútbol 1h
  const formattedEndTime = calculateEndTime(startTime, currentCourt?.sport || 'padel');
  const durationMinutes = getSportDurationMinutes(currentCourt?.sport || 'padel');
  const durationText = durationMinutes === 90 ? '1 hora y media' : '1 hora';

  // Submit new reservation: Al confirmar, queda en estado Reservada y cobro Pendiente
  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      alert('Por favor ingresá el Nombre de la persona que reserva el turno.');
      return;
    }

    const existingPerson = people.find((p) => p.id === selectedPersonId);

    const personObj: Person = {
      id: existingPerson ? existingPerson.id : `ext-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || 'Sin teléfono',
      dni: newDni.trim() || existingPerson?.dni || undefined,
      isMember: existingPerson ? existingPerson.isMember : false,
      memberNumber: existingPerson ? existingPerson.memberNumber : undefined,
    };

    onSaveReservation({
      courtId: currentCourt.id,
      courtName: currentCourt.name,
      sport: currentCourt.sport,
      date,
      startTime,
      endTime: formattedEndTime,
      person: personObj,
      price: Number(price) || suggestedPrice,
      suggestedPrice,
      status: 'reservada',
      paymentStatus: 'pendiente',
      notes,
    });
  };

  // Determinar estado de juego conceptual
  const computedStatus = reservation ? computeReservationStatus(reservation) : 'reservada';

  // Format payment date
  const formatPaidAt = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with fade animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs z-40"
          />

          {/* Slide-over Drawer Panel with spring physics */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col justify-between overflow-hidden sm:rounded-l-3xl border-l border-slate-200/90"
          >
            {mode === 'new' ? (
              /* ========================================================= */
              /* 1. CREAR RESERVA - FLUJO REAL: SIN PREGUNTAR PAGO          */
              /* ========================================================= */
              <form onSubmit={handleSubmitNew} className="flex-1 flex flex-col justify-between overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0D5FAE]">
                      <span>{currentCourt?.sportLabel}</span>
                      <span>·</span>
                      <span>{currentCourt?.name}</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-0.5 tracking-tight">
                      Nueva Reserva
                    </h2>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">
                      {startTime} a {formattedEndTime} hs · {date}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    aria-label="Cerrar"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </motion.button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 text-xs">
                  {/* 1. Cancha y Horario Selector */}
                  <div className="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Instalación y Horario
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold">Cancha (Deporte)</label>
                        <select
                          value={courtId}
                          onChange={(e) => {
                            const newCourtId = e.target.value;
                            setCourtId(newCourtId);
                            const c = courts.find((ct) => ct.id === newCourtId);
                            if (c) {
                              setPrice(c.basePrice);
                              setPriceDisplay(c.basePrice.toLocaleString('es-AR'));
                              const slots = getSportSlots(c.sport);
                              if (!slots.includes(startTime)) {
                                setStartTime(slots[0]);
                              }
                            }
                          }}
                          className="w-full mt-0.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0D5FAE]"
                        >
                          <optgroup label="Pádel">
                            {courts
                              .filter((c) => c.sport === 'padel')
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  Pádel · {c.name} (${c.basePrice.toLocaleString('es-AR')})
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Fútbol 7">
                            {courts
                              .filter((c) => c.sport === 'futbol')
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  Fútbol 7 · {c.name} (${c.basePrice.toLocaleString('es-AR')})
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Tenis">
                            {courts
                              .filter((c) => c.sport === 'tenis')
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  Tenis · {c.name} (${c.basePrice.toLocaleString('es-AR')})
                                </option>
                              ))}
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold">Turno / Horario</label>
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full mt-0.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0D5FAE]"
                        >
                          {getSportSlots(currentCourt?.sport || 'padel').map((slot) => {
                            const endSlot = calculateEndTime(slot, currentCourt.sport);
                            return (
                              <option key={slot} value={slot}>
                                {slot} a {endSlot} hs
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 2. Reservante (Cualquier persona puede reservar: se carga el nombre directamente) */}
                  <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Datos del Jugador / Reservante
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Cualquier persona puede reservar
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          if (selectedPersonId) setSelectedPersonId('');
                        }}
                        placeholder="Ej: Marcelo Rossi"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0D5FAE]"
                      />

                      {/* Sugerencias rápidas si el nombre coincide con algún contacto registrado */}
                      {newName.trim().length >= 2 && !selectedPersonId && (
                        (() => {
                          const matches = people.filter((p) =>
                            p.name.toLowerCase().includes(newName.toLowerCase().trim())
                          );
                          if (matches.length === 0) return null;
                          return (
                            <div className="mt-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs divide-y divide-slate-100 max-h-32 overflow-y-auto">
                              <span className="block px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Contactos registrados:
                              </span>
                              {matches.slice(0, 3).map((match) => (
                                <button
                                  key={match.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPersonId(match.id);
                                    setNewName(match.name);
                                    setNewPhone(match.phone);
                                  }}
                                  className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer"
                                >
                                  <span className="font-semibold text-xs text-slate-800">
                                    {match.name}
                                    {match.isMember && (
                                      <span className="ml-1 text-[10px] text-[#0D5FAE]">
                                        (Socio #{match.memberNumber})
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{match.phone}</span>
                                </button>
                              ))}
                            </div>
                          );
                        })()
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">
                        Teléfono de contacto (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Ej: 3564-445566"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0D5FAE]"
                      />
                    </div>
                  </div>

                  {/* 3. Importe del turno con formato de puntos y SIN el 0 molesto */}
                  <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Precio del Turno
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPrice(suggestedPrice);
                          setPriceDisplay(suggestedPrice.toLocaleString('es-AR'));
                        }}
                        className="text-[11px] text-[#0D5FAE] hover:underline font-medium cursor-pointer"
                      >
                        Tarifa base: ${suggestedPrice.toLocaleString('es-AR')}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold text-lg">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={priceDisplay}
                        placeholder="0"
                        onChange={handlePriceChange}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-base text-slate-900 focus:outline-none focus:border-[#0D5FAE] tabular-nums"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Importe del turno. Se cobrará una vez finalizado el partido.
                    </span>
                  </div>

                  {/* 4. Notas opcionales */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Observaciones (opcional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Alquila paletas, solicita iluminación..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0D5FAE] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Footer: Confirmar reserva (sin cobrar) */}
                <div className="p-5 border-t border-slate-100 flex items-center gap-3 bg-slate-50/70">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={onClose}
                    className="py-3 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-full bg-[#0D5FAE] hover:bg-[#094785] text-white font-extrabold text-sm transition-all shadow-md cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <span>Confirmar Reserva</span>
                    <span>·</span>
                    <span className="tabular-nums">${Number(price).toLocaleString('es-AR')}</span>
                  </motion.button>
                </div>
              </form>
            ) : (
              /* ========================================================= */
              /* 2. DETALLE DE RESERVA - CON ESTADOS SEPARADOS Y COBRANZA  */
              /* ========================================================= */
              reservation && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Ficha de Reserva
                        </span>
                        {/* Estado conceptual de la reserva */}
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            computedStatus === 'en_juego'
                              ? 'bg-blue-100 text-[#0D5FAE] animate-pulse'
                              : computedStatus === 'finalizada'
                              ? 'bg-slate-200 text-slate-700'
                              : computedStatus === 'cancelada'
                              ? 'bg-red-100 text-red-700'
                              : computedStatus === 'no_asistio'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {computedStatus === 'en_juego'
                            ? 'En juego'
                            : computedStatus === 'finalizada'
                            ? 'Finalizada'
                            : computedStatus === 'cancelada'
                            ? 'Cancelada'
                            : computedStatus === 'no_asistio'
                            ? 'No se presentó'
                            : 'Reservada'}
                        </span>
                      </div>
                      <h2 className="text-lg font-extrabold text-slate-900 mt-1 tracking-tight">
                        {reservation.courtName}
                      </h2>
                      <div className="text-xs font-semibold text-slate-500 mt-0.5 tabular-nums">
                        {reservation.startTime} a {reservation.endTime} hs · {reservation.date}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={onClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      aria-label="Cerrar"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </motion.button>
                  </div>

                  {/* Ficha Information Body */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 text-xs">
                    {/* Persona */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Jugador / Reservante
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-slate-900">
                          {reservation.person.name}
                        </span>
                        {reservation.person.isMember && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0D5FAE]">
                            Socio #{reservation.person.memberNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 font-medium">
                        {reservation.person.phone}
                      </div>
                    </div>

                    {/* Importe & Estado de Cobro */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Importe del Turno
                        </span>
                        <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                          ${reservation.price.toLocaleString('es-AR')}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {reservation.paymentStatus === 'pagada' && reservation.paymentMethod
                            ? `Medio: ${
                                reservation.paymentMethod === 'Otro' && reservation.customPaymentMethod
                                  ? `Otro (${reservation.customPaymentMethod})`
                                  : reservation.paymentMethod
                              }`
                            : 'Pendiente de cobro'}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Estado de Cobro
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                reservation.paymentStatus === 'pagada'
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                            />
                            <span
                              className={`text-xs font-bold ${
                                reservation.paymentStatus === 'pagada'
                                  ? 'text-emerald-800'
                                  : 'text-amber-800'
                              }`}
                            >
                              {reservation.paymentStatus === 'pagada' ? 'Pagada' : 'Pendiente'}
                            </span>
                          </div>
                        </div>

                        {reservation.paymentStatus === 'pagada' && (
                          <div className="text-[10px] text-slate-400 font-medium">
                            {formatPaidAt(reservation.paidAt)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACCIÓN CONTEXTUAL: COBRAR TURNO (Si está pendiente) */}
                    {reservation.paymentStatus === 'pendiente' && onOpenPaymentModal && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-emerald-700">
                              point_of_sale
                            </span>
                            <span>Turno listo para cobrar</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                            Total a cobrar: <strong>${reservation.price.toLocaleString('es-AR')}</strong>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenPaymentModal(reservation);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-xs cursor-pointer transition-colors whitespace-nowrap"
                        >
                          Cobrar turno
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Registro de Cobro si ya fue pagada */}
                    {reservation.paymentStatus === 'pagada' && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        </div>
                        <div className="text-xs">
                          <div className="font-extrabold text-slate-900">
                            Pagado ·{' '}
                            {reservation.paymentMethod === 'Otro' && reservation.customPaymentMethod
                              ? `Otro: ${reservation.customPaymentMethod}`
                              : reservation.paymentMethod || 'Efectivo'}{' '}
                            · ${reservation.price.toLocaleString('es-AR')}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            Cobranza registrada correctamente
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Operational Reception Actions */}
                    <div className="pt-2 flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Opciones del turno
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => onMarkNoShow?.(reservation.id)}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer text-center transition-colors"
                        >
                          No se presentó
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => onCancelReservation?.(reservation.id)}
                          className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs cursor-pointer text-center transition-colors border border-red-200/60"
                        >
                          Cancelar turno
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/70">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cerrar
                    </motion.button>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
