export type SportType = 'futbol' | 'padel' | 'tenis';

export interface ClubInfo {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  logoLetter?: string;
}

export interface Court {
  id: string;
  name: string;
  sport: SportType;
  sportLabel: string;
  price: number; // Precio fijado por el club para el turno (solo lectura para el público)
  isCovered?: boolean;
  surface?: string;
  description?: string;
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  phone: string;
  notes?: string;
}

export interface PublicReservation {
  id: string;
  bookingCode: string; // ej: "RES-8492"
  clubId: string;
  courtId: string;
  courtName: string;
  sport: SportType;
  sportLabel: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "19:00"
  endTime: string; // "20:30"
  price: number;
  customer: CustomerData;
  createdAt: string;
}

// Horarios de turnos desde las 9am con 1h 30m para Pádel y Tenis:
export const PADEL_TENIS_SLOTS: string[] = [
  '09:00',
  '10:30',
  '12:00',
  '13:30',
  '15:00',
  '16:30',
  '18:00',
  '19:30',
  '21:00',
  '22:30',
];

// Fútbol: turnos de 1 hora desde las 9am
export const FUTBOL_SLOTS: string[] = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

export function getSportSlots(sport: SportType): string[] {
  return sport === 'futbol' ? FUTBOL_SLOTS : PADEL_TENIS_SLOTS;
}

export function getSportDurationMinutes(sport: SportType): number {
  return sport === 'futbol' ? 60 : 90;
}

export function calculateEndTime(startTime: string, sport: SportType): string {
  const [hStr, mStr] = startTime.split(':');
  const startHours = parseInt(hStr, 10);
  const startMins = parseInt(mStr, 10);
  const duration = getSportDurationMinutes(sport);

  const totalMins = startHours * 60 + startMins + duration;
  const endHours = Math.floor(totalMins / 60) % 24;
  const endMinutes = totalMins % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}
