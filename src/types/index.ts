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
  startTime: string; // "19:00"
  endTime: string; // "20:00"
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
