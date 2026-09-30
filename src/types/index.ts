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

export type ReservationStatus =
  | 'confirmada'
  | 'pendiente'
  | 'cancelada'
  | 'no_asistio'
  | 'bloqueada';

export type PaymentStatus = 'pagado' | 'pendiente';

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Mercado Pago' | 'Otro';

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
  price: number; // Editable tariff
  suggestedPrice: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  isBlocked?: boolean;
  blockReason?: BlockReason;
  notes?: string;
  createdAt: string;
}
