export type SportType = 'futbol' | 'padel' | 'tenis';

export interface Court {
  id: string;
  name: string;
  sport: SportType;
  sportLabel: string;
  basePrice: number;
  isCovered?: boolean;
  surface?: string;
  description?: string;
}

export interface Person {
  id: string;
  name: string;
  phone: string;
  dni?: string;
  isMember: boolean;
  memberNumber?: string;
}

// Estado conceptual del turno deportivo
export type ReservationStatus =
  | 'reservada'
  | 'en_juego'
  | 'finalizada'
  | 'cancelada'
  | 'no_asistio'
  | 'bloqueada';

// Estado conceptual de la cobranza
export type PaymentStatus = 'pendiente' | 'pagada';

// Medios de pago del club
export type PaymentMethod =
  | 'Efectivo'
  | 'Transferencia'
  | 'QR / Mercado Pago'
  | 'Tarjeta'
  | 'Otro';

export type BlockReason = 'Mantenimiento' | 'Torneo' | 'Uso interno' | 'Otro';

export interface Reservation {
  id: string;
  courtId: string;
  courtName: string;
  sport: SportType;
  date: string; // YYYY-MM-DD
  startTime: string; // "18:00"
  endTime: string; // "19:30" (Pádel/Tenis 1h30m, Fútbol 1h)
  person: Person;
  price: number; // Importe histórico inmutable fijado al crear la reserva
  suggestedPrice?: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  customPaymentMethod?: string; // Descripción cuando corresponda "Otro"
  paidAmount?: number;
  paidAt?: string; // Fecha y hora en que se registró el cobro
  isBlocked?: boolean;
  blockReason?: BlockReason;
  notes?: string;
  createdAt: string;
}

// Duración oficial en minutos: Pádel y Tenis 90 min (1h 30m), Fútbol 60 min (1h)
export function getSportDurationMinutes(sport: SportType): number {
  if (sport === 'padel' || sport === 'tenis') {
    return 90;
  }
  return 60;
}

// Calcula el horario de fin exacto según el deporte (1h 30m para pádel y tenis, 1h para fútbol)
export function calculateEndTime(startTime: string, sport: SportType): string {
  const parts = startTime.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const duration = getSportDurationMinutes(sport);

  const totalMinutes = h * 60 + m + duration;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;

  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

// Determina el estado de juego de la reserva según horario actual
export function computeReservationStatus(
  reservation: Reservation,
  currentDate = '2024-10-30',
  currentTime = '20:30'
): ReservationStatus {
  if (
    reservation.status === 'cancelada' ||
    reservation.status === 'no_asistio' ||
    reservation.status === 'bloqueada'
  ) {
    return reservation.status;
  }

  // Comparación por fecha
  if (reservation.date < currentDate) {
    return 'finalizada';
  }
  if (reservation.date > currentDate) {
    return 'reservada';
  }

  // Misma fecha: comparar por horario
  if (currentTime < reservation.startTime) {
    return 'reservada';
  }
  if (currentTime >= reservation.startTime && currentTime < reservation.endTime) {
    return 'en_juego';
  }
  return 'finalizada';
}
