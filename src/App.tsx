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
import { Court, CustomerData, PublicReservation, doIntervalsOverlap } from './types';
import { PORTAL_BASE_TODAY } from './utils/dateUtils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error Boundary amigable para el portal público (Requisito #18)
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#0D5FAE]">
              info
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Algo salió mal
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              No pudimos cargar el portal correctamente. Intentá nuevamente.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#0D5FAE] text-white font-extrabold text-xs cursor-pointer shadow-xs"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PortalApp() {
  const [club] = useState(MOCK_CLUB);
  const [currentDate, setCurrentDate] = useState<string>(PORTAL_BASE_TODAY);
  const [courts] = useState<Court[]>(INITIAL_COURTS);
  const [reservations, setReservations] = useState<PublicReservation[]>(
    INITIAL_PUBLIC_RESERVATIONS
  );

  // Modal para completar datos del reservante y revisión
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('19:00');

  // Modal para mostrar confirmación
  const [confirmedReservation, setConfirmedReservation] =
    useState<PublicReservation | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Toast flotante
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Abrir modal de reserva al tocar un turno disponible
  const handleSelectSlot = (court: Court, startTime: string) => {
    setSelectedCourt(court);
    setSelectedTime(startTime);
    setIsBookingModalOpen(true);
  };

  // Confirmar reserva con verificación de superposición de intervalos (Requisito #20)
  const handleConfirmReservation = async (data: {
    court: Court;
    startTime: string;
    endTime: string;
    date: string;
    customer: CustomerData;
  }): Promise<{ success: boolean; error?: string }> => {
    // Comprobar superposición real de intervalos
    const isAlreadyTaken = reservations.some(
      (r) =>
        r.courtId === data.court.id &&
        r.date === data.date &&
        doIntervalsOverlap(data.startTime, data.endTime, r.startTime, r.endTime)
    );

    if (isAlreadyTaken) {
      return {
        success: false,
        error: 'Ese horario ya no está disponible. Elegí otro horario.',
      };
    }

    // Reserva confirmada (sin bookingCode visible - Requisito #5)
    const newReservation: PublicReservation = {
      id: `res-${Date.now()}`,
      clubId: club.id,
      courtId: data.court.id,
      courtName: data.court.name,
      feature: data.court.feature,
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

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    setConfirmedReservation(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#0D5FAE]/15 selection:text-[#0D5FAE]">
      {/* Cabecera pública con identidad y selector de fecha */}
      <PublicHeader
        club={club}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      {/* Contenedor principal del portal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6">
        {/* Banner público neutral (Requisito #16: sin prometer tiempo real) */}
        <div className="mb-3 sm:mb-4 bg-gradient-to-r from-[#0D5FAE] to-[#1E3A8A] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
              {club.name}
            </span>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight mt-0.5 sm:mt-1">
              Portal de Reservas de Canchas
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
              Consultá los horarios disponibles y reservá tu cancha.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
        </div>

        {/* Vista pública de reservas: Pestañas de deporte, canchas y turnos */}
        <PublicBookingView
          courts={courts}
          reservations={reservations}
          currentDate={currentDate}
          onSelectSlot={handleSelectSlot}
        />
      </main>

      {/* Pie de página público */}
      <footer className="bg-white border-t border-slate-200/80 py-4 sm:py-6 px-3 sm:px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-center text-[11px] sm:text-xs">
            <span className="font-extrabold text-slate-800">{club.name}</span>
            <span>·</span>
            <span className="truncate">{club.address}</span>
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
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modal de Reserva: Paso 1 (Datos) y Paso 2 (Revisión) */}
      <PublicBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        court={selectedCourt}
        startTime={selectedTime}
        date={currentDate}
        onConfirmReservation={handleConfirmReservation}
      />

      {/* Modal de Confirmación y Comprobante (Requisito #1: sin cancelación) */}
      <BookingConfirmationModal
        isOpen={isConfirmationOpen}
        reservation={confirmedReservation}
        club={club}
        onClose={handleCloseConfirmation}
      />

      {/* Toast informativo */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PortalApp />
    </ErrorBoundary>
  );
}
