/**
 * Normaliza un número de teléfono eliminando caracteres no numéricos excepto el signo más (+) inicial.
 */
export function normalizePhone(rawPhone: string): string {
  const trimmed = rawPhone.trim();
  const hasPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');
  // Si no tiene prefijo +, remover el 0 inicial si existe (ej: 03564 -> 3564)
  if (!hasPlus && digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Valida si el teléfono ingresado cumple con un formato razonable de teléfono móvil.
 * Rechaza explícitamente textos o combinaciones con letras como 'abc', '123', 'hola123'.
 * Acepta formatos válidos con números, espacios, guiones, paréntesis y '+' opcional:
 * - 3564-445566
 * - 3564445566
 * - +54 9 3564 445566
 * - +543564445566
 * Requiere que la cantidad de dígitos esté entre 8 y 15.
 */
export function isValidPhone(rawPhone: string): boolean {
  if (!rawPhone || typeof rawPhone !== 'string') return false;
  const trimmed = rawPhone.trim();
  // Rechaza cualquier entrada que contenga letras o símbolos inválidos
  if (!/^[\+]?[\d\s\-\(\)\.]+$/.test(trimmed)) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Normaliza el teléfono para su uso en enlaces de WhatsApp (https://wa.me/NUMERO).
 * Conserva el código de país cuando el usuario lo proporciona y no lo duplica.
 */
export function formatPhoneForWhatsApp(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';

  // Remover prefijo interurbano nacional (ej: 03564 -> 3564)
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }

  // Si ya tiene código internacional de Argentina con el 9 (549...)
  if (digits.startsWith('549') && digits.length >= 12) {
    return digits;
  }
  // Si tiene código de Argentina sin el 9 (543564...)
  if (digits.startsWith('54') && digits.length >= 11) {
    return `549${digits.slice(2)}`;
  }
  // Si es un número móvil argentino local de 10 dígitos (ej: 3564445566)
  if (digits.length === 10) {
    return `549${digits}`;
  }
  return digits;
}
