/**
 * Normaliza un número de teléfono eliminando caracteres no numéricos excepto el signo más (+) inicial.
 */
export function normalizePhone(rawPhone: string): string {
  const trimmed = rawPhone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Valida si el teléfono ingresado cumple con un formato razonable de teléfono móvil.
 * Acepta formatos como:
 * - 3564-445566
 * - 3564445566
 * - +54 9 3564 445566
 * - 11 5566-7788
 * Requiere que la cantidad de dígitos esté entre 8 y 15.
 */
export function isValidPhone(rawPhone: string): boolean {
  if (!rawPhone || typeof rawPhone !== 'string') return false;
  const digits = rawPhone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Normaliza el teléfono para su uso en enlaces de WhatsApp.
 */
export function formatPhoneForWhatsApp(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  // Si ya tiene código internacional de Argentina (54 o 549) u otro país
  if (digits.startsWith('549') && digits.length >= 12) {
    return digits;
  }
  if (digits.startsWith('54') && digits.length >= 11) {
    return `549${digits.slice(2)}`;
  }
  // Si es un número local de 10 dígitos (ej: 3564445566), antepone 549
  if (digits.length === 10) {
    return `549${digits}`;
  }
  return digits;
}
