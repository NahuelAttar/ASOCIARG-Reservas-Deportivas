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
  feature?: string; // Característica relevante concisa: ej: "Cristal", "Techada", "Polvo de ladrillo", "Sintético Pro"
  price: number; // Tarifa fijada por el club para el turno (solo lectura)
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface PublicReservation {
  id: string; // ID interno únicamente para React keys y estado (no visible al usuario)
  clubId?: string;
  courtId: string;
  courtName: string;
  feature?: string;
  sport: SportType;
  sportLabel: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "12:00"
  endTime: string; // "13:30"
  price: number;
  customer: CustomerData;
  createdAt: string;
}

// Horarios de turnos desde las 9am con 1h 30m para Pádel y Tenis
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

/**
 * Convierte una hora en formato HH:mm a minutos totales del día
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Determina si dos intervalos de tiempo se superponen.
 * Maneja el caso de medianoche (ej: 22:30 a 00:00).
 */
export function doIntervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  let aEnd = timeToMinutes(endA);
  if (aEnd <= aStart) aEnd += 24 * 60;

  const bStart = timeToMinutes(startB);
  let bEnd = timeToMinutes(endB);
  if (bEnd <= bStart) bEnd += 24 * 60;

  return aStart < bEnd && aEnd > bStart;
}
