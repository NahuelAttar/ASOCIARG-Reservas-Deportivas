import { SportType, calculateEndTime } from '../types';

/**
 * Returns today's actual date in YYYY-MM-DD format based on local client time.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Current dynamic today's date
export const PORTAL_BASE_TODAY = getTodayDateString();

/**
 * Checks whether a given YYYY-MM-DD date is strictly in the past relative to the portal base today.
 */
export function isPastDate(dateStr: string, minDate: string = getTodayDateString()): boolean {
  return dateStr < minDate;
}

/**
 * Steps a YYYY-MM-DD date by an offset of days (+1 or -1), preventing navigation to past dates.
 */
export function stepDate(currentDateStr: string, offset: number, minDate: string = getTodayDateString()): string {
  try {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
    dateObj.setDate(dateObj.getDate() + offset);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    const target = `${newY}-${newM}-${newD}`;

    if (offset < 0 && isPastDate(target, minDate)) {
      return minDate;
    }
    return target;
  } catch {
    return currentDateStr;
  }
}

/**
 * Formats a YYYY-MM-DD date into a friendly readable string, e.g., "Miércoles 30 de octubre".
 * Avoids any timezone/DST drift by setting the time to 12:00:00 (noon).
 */
export function formatDateReadable(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
    const weekday = dateObj.toLocaleDateString('es-AR', { weekday: 'long' });
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('es-AR', { month: 'long' });
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalizedWeekday} ${day} de ${month}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats a YYYY-MM-DD date into a short badge string, e.g., "Mié 30 Oct".
 */
export function formatDateShort(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
    const weekday = dateObj.toLocaleDateString('es-AR', { weekday: 'short' });
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('es-AR', { month: 'short' });
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalizedWeekday} ${day} ${month}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns the full time interval representation, e.g. "12:00 a 13:30 hs".
 */
export function formatSlotInterval(startTime: string, sport: SportType): string {
  const endTime = calculateEndTime(startTime, sport);
  return `${startTime} a ${endTime} hs`;
}
