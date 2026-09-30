import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Court, Person, Reservation, ReservationStatus, PaymentStatus, computeReservationStatus } from '../types';

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

  // Editable tariff (stored historically in the reservation)
  const [price, setPrice] = useState<number>(12000);
  const [notes, setNotes] = useState<string>('');

  // Sync state on drawer open
  useEffect(() => {
    if (mode === 'detail' && reservation) {
      setCourtId(reservation.courtId);
      setDate(reservation.date);
      setStartTime(reservation.startTime);
      setPrice(reservation.price);
      setNotes(reservation.notes || '');
      setSelectedPersonId(reservation.person.id);
      setNewName(reservation.person.name);
      setNewPhone(reservation.person.phone);
      setNewDni(reservation.person.dni || '');
      setPersonMode(reservation.person.id.startsWith('ext-') ? 'new' : 'search');
      setIsChangingPerson(false);
    } else if (mode === 'new') {
      const activeCourt = courts.find((c) => c.id === (prefillCourtId || courts[0]?.id));
      setCourtId(activeCourt ? activeCourt.id : courts[0]?.id || 'padel-1');
      setDate(prefillDate || '2024-10-30');
      setStartTime(prefillTime || '19:00');
      setPrice(activeCourt ? activeCourt.basePrice : 12000);
      setNotes('');
      setPersonMode('search');
      setSelectedPersonId(people[0]?.id || '');
      setNewName('');
      setNewPhone('');
      setNewDni('');
      setPersonSearchQuery('');
      setIsChangingPerson(false);
    }
  }, [isOpen, mode, reservation, prefillCourtId, prefillTime, prefillDate, courts, people]);

  const currentCourt = courts.find((c) => c.id === courtId) || courts[0];
  const suggestedPrice = currentCourt ? currentCourt.basePrice : 12000;

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

  // Clean phone for WhatsApp integration
  const activePhone =
    mode === 'detail' && reservation
      ? reservation.person.phone
      : personMode === 'new'
      ? newPhone
      : selectedPerson?.phone || '';
  const cleanPhone = activePhone.replace(/[^0-9]/g, '');

  const startH = parseInt(startTime.split(':')[0], 10) || 19;
  const endH = startH + 1;
  const formattedEndTime = `${endH.toString().padStart(2, '0')}:00`;

  // Submit new reservation: Al confirmar, queda en estado Reservada y cobro Pendiente
  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();

    let personObj: Person;
    if (personMode === 'new') {
      if (!newName.trim() || !newPhone.trim()) {
        alert('Por favor ingresá Nombre y Teléfono del reservante.');
        return;
      }
      personObj = {
        id: `ext-${Date.now()}`,
        name: newName.trim(),
        phone: newPhone.trim(),
        dni: newDni.trim() || undefined,
        isMember: false,
      };
    } else {
      personObj = selectedPerson || people[0];
    }

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
                        <label className="text-[10px] text-slate-400 font-semibold">Cancha</label>
                        <select
                          value={courtId}
                          onChange={(e) => {
                            setCourtId(e.target.value);
                            const c = courts.find((ct) => ct.id === e.target.value);
                            if (c) setPrice(c.basePrice);
                          }}
                          className="w-full mt-0.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0D5FAE]"
                        >
                          {courts.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} (${c.basePrice.toLocaleString('es-AR')})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold">Horario inicio</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full mt-0.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0D5FAE]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Reservante */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Datos del Jugador / Cliente
                      </span>

                      <div className="inline-flex p-0.5 bg-slate-100 rounded-full text-[11px] font-medium border border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => {
                            setPersonMode('search');
                            setIsChangingPerson(false);
                          }}
                          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            personMode === 'search'
                              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Buscar
                        </button>
                        <button
                          type="button"
                          onClick={() => setPersonMode('new')}
                          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            personMode === 'new'
                              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Nuevo
                        </button>
                      </div>
                    </div>

                    {personMode === 'search' ? (
                      selectedPerson && !isChangingPerson ? (
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                              {selectedPerson.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">
                                  {selectedPerson.name}
                                </span>
                                {selectedPerson.isMember && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0D5FAE]">
                                    Socio #{selectedPerson.memberNumber}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {selectedPerson.phone}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsChangingPerson(true)}
                            className="text-xs font-semibold text-[#0D5FAE] hover:underline cursor-pointer"
                          >
                            Cambiar
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                              search
                            </span>
                            <input
                              type="text"
                              autoFocus
                              value={personSearchQuery}
                              onChange={(e) => setPersonSearchQuery(e.target.value)}
                              placeholder="Buscar por nombre o teléfono..."
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D5FAE] focus:bg-white"
                            />
                          </div>

                          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-36 overflow-y-auto">
                            {filteredPeople.slice(0, 4).map((p) => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  setSelectedPersonId(p.id);
                                  setIsChangingPerson(false);
                                }}
                                className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    {p.isMember && (
                                      <span className="text-[10px] text-[#0D5FAE]">
                                        (Socio #{p.memberNumber})
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400">{p.phone}</span>
                                </div>
                                {selectedPersonId === p.id && (
                                  <span className="material-symbols-outlined text-[#0D5FAE] text-[16px]">
                                    check
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-500">
                            Nombre completo *
                          </label>
                          <input
                            type="text"
                            required
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ej: Marcelo Rossi"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0D5FAE]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase text-slate-500">
                            Teléfono de contacto (WhatsApp) *
                          </label>
                          <input
                            type="tel"
                            required
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="Ej: 3564-445566"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0D5FAE]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Importe del turno (Guardado inmutablemente en la reserva) */}
                  <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Precio del Turno
                      </span>
                      <button
                        type="button"
                        onClick={() => setPrice(suggestedPrice)}
                        className="text-[11px] text-[#0D5FAE] hover:underline font-medium cursor-pointer"
                      >
                        Tarifa base: ${suggestedPrice.toLocaleString('es-AR')}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold text-lg">$</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-base text-slate-900 focus:outline-none focus:border-[#0D5FAE] tabular-nums"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Este importe quedará registrado en la reserva. Se cobrará una vez jugado el turno.
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
                            ? `Medio: ${reservation.paymentMethod}`
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
                            Pagado · {reservation.paymentMethod === 'Otro' && reservation.customPaymentMethod ? `Otro: ${reservation.customPaymentMethod}` : reservation.paymentMethod || 'Efectivo'} · ${reservation.price.toLocaleString('es-AR')}
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
