import React, { useState } from 'react';
import { PublicHeader } from './components/PublicHeader';
import { PublicBookingView } from './components/PublicBookingView';
import { PublicBookingModal } from './components/PublicBookingModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { Toast } from './components/Toast';

import {
  MOCK_CLUB,
  INITIAL_COURTS,
  INITIAL_PUBLIC_RESERVATIONS,
} from './data/mockData';
import { Court, CustomerData, PublicReservation } from './types';
import { PORTAL_BASE_TODAY } from './utils/dateUtils';

export default function App() {
  const [club] = useState(MOCK_CLUB);
  const [currentDate, setCurrentDate] = useState<string>(PORTAL_BASE_TODAY);
  const [courts] = useState<Court[]>(INITIAL_COURTS);
  const [reservations, setReservations] = useState<PublicReservation[]>(
    INITIAL_PUBLIC_RESERVATIONS
  );

  // Modal for filling customer booking data & review
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('19:00');

  // Modal for displaying booking receipt voucher
  const [confirmedReservation, setConfirmedReservation] =
    useState<PublicReservation | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open booking modal when a user taps an available slot
  const handleSelectSlot = (court: Court, startTime: string) => {
    setSelectedCourt(court);
    setSelectedTime(startTime);
    setIsBookingModalOpen(true);
  };

  // Confirm booking with anti-collision / double booking validation (Requisitos #11 & #12)
  const handleConfirmReservation = async (data: {
    court: Court;
    startTime: string;
    endTime: string;
    date: string;
    customer: CustomerData;
  }): Promise<{ success: boolean; error?: string }> => {
    // Check if the slot became occupied in the meantime
    const isAlreadyTaken = reservations.some(
      (r) =>
        r.courtId === data.court.id &&
        r.date === data.date &&
        (r.startTime === data.startTime ||
          (data.startTime >= r.startTime && data.startTime < r.endTime))
    );

    if (isAlreadyTaken) {
      return {
        success: false,
        error:
          'No pudimos confirmar la reserva. El horario seleccionado ya no se encuentra disponible. Por favor, elegí otro horario.',
      };
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newReservation: PublicReservation = {
      id: `res-${Date.now()}`,
      bookingCode: `RES-${randomCode}`,
      clubId: club.id,
      courtId: data.court.id,
      courtName: data.court.name,
      sport: data.court.sport,
      sportLabel: data.court.sportLabel,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      price: data.court.price,
      customer: data.customer,
      createdAt: new Date().toISOString(),
    };

    setReservations((prev) => [newReservation, ...prev]);
    setIsBookingModalOpen(false);
    setConfirmedReservation(newReservation);
    setIsConfirmationOpen(true);
    showToast('¡Turno confirmado con éxito!');

    return { success: true };
  };

  // Public cancellation action (Requisito #13: preparado para cancelación pública)
  const handleCancelReservation = (reservationId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    setIsConfirmationOpen(false);
    setConfirmedReservation(null);
    showToast('Reserva cancelada con éxito. El horario quedó disponible nuevamente.');
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    setConfirmedReservation(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#0D5FAE]/15 selection:text-[#0D5FAE]">
      {/* Public Header with Club Identity, Link and Date Selector */}
      <PublicHeader
        club={club}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      {/* Main Public Portal Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Portal Greeting Banner */}
        <div className="mb-4 bg-gradient-to-r from-[#0D5FAE] to-[#1E3A8A] text-white rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
              {club.name}
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Portal de Reservas de Canchas
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
              Consultá disponibilidad de turnos en tiempo real y reservá tu cancha en segundos.
            </p>
          </div>
          {/* Subtle decoration */}
          <div className="absolute -right-6 -bottom-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
        </div>

        {/* Public Booking View: Sport tabs, Court cards, and available time slots */}
        <PublicBookingView
          courts={courts}
          reservations={reservations}
          currentDate={currentDate}
          onSelectSlot={handleSelectSlot}
        />
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">{club.name}</span>
            <span>·</span>
            <span>{club.address}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
            <span>Tel: {club.phone}</span>
            <a
              href={`https://api.whatsapp.com/send?phone=${club.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#0D5FAE] hover:underline flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-[14px]">chat</span>
              <span>WhatsApp Oficial</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Booking Form Modal with Step 1 (Inputs) and Step 2 (Review) */}
      <PublicBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        club={club}
        court={selectedCourt}
        startTime={selectedTime}
        date={currentDate}
        onConfirmReservation={handleConfirmReservation}
      />

      {/* Booking Confirmation Receipt Modal with WhatsApp Voucher & Cancel */}
      <BookingConfirmationModal
        isOpen={isConfirmationOpen}
        reservation={confirmedReservation}
        club={club}
        onClose={handleCloseConfirmation}
        onCancelReservation={handleCancelReservation}
      />

      {/* Floating feedback toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
