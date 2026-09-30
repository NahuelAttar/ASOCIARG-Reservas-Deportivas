import React, { useState } from 'react';
import { Header } from './components/Header';
import { AgendaView } from './components/AgendaView';
import { ReservationsView } from './components/ReservationsView';
import { BookingDrawer } from './components/BookingDrawer';
import { BlockSlotModal } from './components/BlockSlotModal';
import { BaseRatesModal } from './components/BaseRatesModal';
import { Toast } from './components/Toast';

import {
  INITIAL_COURTS,
  INITIAL_PEOPLE,
  INITIAL_RESERVATIONS,
} from './data/mockData';
import { Court, Person, Reservation, BlockReason } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'agenda' | 'reservas'>('agenda');
  const [currentDate, setCurrentDate] = useState<string>('2024-10-30');

  // Core Data State
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);

  // Unified Drawer state (Handles both New and Detail)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'new' | 'detail'>('new');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [prefillCourtId, setPrefillCourtId] = useState<string>('padel-1');
  const [prefillTime, setPrefillTime] = useState<string>('19:00');

  // Utility modals
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isBaseRatesModalOpen, setIsBaseRatesModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open drawer for a new booking from an agenda slot
  const handleSelectSlot = (courtId: string, time: string) => {
    setPrefillCourtId(courtId);
    setPrefillTime(time);
    setSelectedReservation(null);
    setDrawerMode('new');
    setIsDrawerOpen(true);
  };

  // Open drawer from top bar "+ Nueva reserva"
  const handleOpenNewBookingGeneral = () => {
    setPrefillCourtId(courts[0]?.id || 'padel-1');
    setPrefillTime('19:00');
    setSelectedReservation(null);
    setDrawerMode('new');
    setIsDrawerOpen(true);
  };

  // Open drawer to inspect an existing reservation
  const handleSelectReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDrawerMode('detail');
    setIsDrawerOpen(true);
  };

  // Save or edit a reservation
  const handleSaveReservation = (data: Partial<Reservation> & { id?: string }) => {
    if (data.id) {
      // Editing existing reservation
      setReservations(
        reservations.map((r) => (r.id === data.id ? ({ ...r, ...data } as Reservation) : r))
      );
      showToast('Reserva actualizada');
    } else {
      // Creating new reservation
      const newRes: Reservation = {
        id: `res-${Date.now()}`,
        courtId: data.courtId || 'padel-1',
        courtName: data.courtName || 'Cancha',
        sport: data.sport || 'padel',
        date: data.date || currentDate,
        startTime: data.startTime || '19:00',
        endTime: data.endTime || '20:00',
        person: data.person || people[0],
        price: data.price || 12000,
        suggestedPrice: data.suggestedPrice || 12000,
        status: data.status || 'confirmada',
        paymentStatus: data.paymentStatus || 'pagado',
        paymentMethod: data.paymentMethod || 'Mercado Pago',
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };

      // Also remember new person if external
      if (newRes.person.id.startsWith('ext-') && !people.some((p) => p.id === newRes.person.id)) {
        setPeople([...people, newRes.person]);
      }

      setReservations([newRes, ...reservations]);
      showToast('Reserva confirmada');
    }

    setIsDrawerOpen(false);
  };

  // Cancel reservation
  const handleCancelReservation = (id: string) => {
    setReservations(
      reservations.map((r) => (r.id === id ? { ...r, status: 'cancelada' } : r))
    );
    setIsDrawerOpen(false);
    showToast('Turno cancelado y liberado');
  };

  // Mark no show
  const handleMarkNoShow = (id: string) => {
    setReservations(
      reservations.map((r) => (r.id === id ? { ...r, status: 'no_asistio' } : r))
    );
    setIsDrawerOpen(false);
    showToast('Marcado como "No se presentó"');
  };

  // Mark as paid
  const handleMarkPaid = (id: string) => {
    setReservations(
      reservations.map((r) => (r.id === id ? { ...r, paymentStatus: 'pagado' } : r))
    );
    showToast('Turno marcado como pagado');
  };

  // Block a slot directly from agenda
  const handleConfirmBlock = (data: {
    courtId: string;
    startTime: string;
    endTime: string;
    reason: BlockReason;
    notes?: string;
  }) => {
    const court = courts.find((c) => c.id === data.courtId);
    const blockRes: Reservation = {
      id: `block-${Date.now()}`,
      courtId: data.courtId,
      courtName: court ? court.name : 'Cancha',
      sport: court ? court.sport : 'padel',
      date: currentDate,
      startTime: data.startTime,
      endTime: data.endTime,
      person: {
        id: 'staff-block',
        name: `Bloqueo: ${data.reason}`,
        phone: '',
        isMember: false,
      },
      price: 0,
      suggestedPrice: 0,
      status: 'bloqueada',
      paymentStatus: 'pagado',
      paymentMethod: 'Otro',
      isBlocked: true,
      blockReason: data.reason,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    setReservations([blockRes, ...reservations]);
    showToast(`Cancha bloqueada por ${data.reason}`);
  };

  // Update base rate for a court
  const handleUpdateCourtPrice = (courtId: string, newPrice: number) => {
    setCourts(
      courts.map((c) => (c.id === courtId ? { ...c, basePrice: newPrice } : c))
    );
    showToast('Precio base actualizado');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#0D5FAE]/15 selection:text-[#0D5FAE]">
      {/* Header focused strictly on sports reservations */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onOpenNewBooking={handleOpenNewBookingGeneral}
        onOpenBlockSlot={() => setIsBlockModalOpen(true)}
        onOpenBaseRates={() => setIsBaseRatesModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-4">
        {currentTab === 'agenda' ? (
          <AgendaView
            courts={courts}
            reservations={reservations}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onSelectSlot={handleSelectSlot}
            onSelectReservation={handleSelectReservation}
          />
        ) : (
          <ReservationsView
            reservations={reservations}
            courts={courts}
            onSelectReservation={handleSelectReservation}
          />
        )}
      </main>

      {/* Side Drawer: New Booking & Existing Booking Details */}
      <BookingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        courts={courts}
        people={people}
        mode={drawerMode}
        reservation={selectedReservation}
        prefillCourtId={prefillCourtId}
        prefillTime={prefillTime}
        prefillDate={currentDate}
        onSaveReservation={handleSaveReservation}
        onCancelReservation={handleCancelReservation}
        onMarkNoShow={handleMarkNoShow}
        onMarkPaid={handleMarkPaid}
      />

      {/* Quick Block Slot Modal */}
      <BlockSlotModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        courts={courts}
        onConfirmBlock={handleConfirmBlock}
      />

      {/* Base Rates Simple Configuration Modal */}
      <BaseRatesModal
        isOpen={isBaseRatesModalOpen}
        onClose={() => setIsBaseRatesModalOpen(false)}
        courts={courts}
        onUpdateCourtPrice={handleUpdateCourtPrice}
      />

      {/* Floating feedback toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
