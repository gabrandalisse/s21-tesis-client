import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  differenceInDays,
  isValid,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Safely parses any date input (ISO string, timestamp number, Date object)
 * into a valid Date object. Returns null if invalid.
 */
export function safeDate(date: string | number | Date | null | undefined): Date | null {
  if (!date) return null;
  try {
    const d = typeof date === 'string' ? (date.includes('T') ? parseISO(date) : new Date(date)) : new Date(date);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

/**
 * Returns human-friendly relative time in Spanish (e.g. "hace 5 minutos", "hace alrededor de 2 horas").
 */
export function formatRelativeTime(
  date: string | number | Date | null | undefined,
  fallback = 'Recientemente'
): string {
  const d = safeDate(date);
  if (!d) return fallback;

  try {
    return formatDistanceToNow(d, {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return fallback;
  }
}

/**
 * Specialized date/time formatter for chat lists:
 * - If today: returns time "HH:mm" (e.g. "14:30")
 * - If yesterday: returns "Ayer"
 * - If within the last 6 days: returns the day name capitalized (e.g. "Lunes", "Miércoles")
 * - If older: returns "d MMM" (e.g. "12 oct")
 */
export function formatChatListTime(
  date: string | number | Date | null | undefined,
  fallback = ''
): string {
  const d = safeDate(date);
  if (!d) return fallback;

  try {
    if (isToday(d)) {
      return format(d, 'HH:mm', { locale: es });
    }

    if (isYesterday(d)) {
      return 'Ayer';
    }

    const daysDiff = differenceInDays(new Date(), d);
    if (daysDiff < 7) {
      const dayName = format(d, 'EEEE', { locale: es });
      return dayName.charAt(0).toUpperCase() + dayName.slice(1);
    }

    return format(d, 'd MMM', { locale: es });
  } catch {
    return fallback;
  }
}

/**
 * Formats a message timestamp inside an open chat conversation (e.g. "14:30").
 */
export function formatMessageTime(
  date: string | number | Date | null | undefined,
  fallback = ''
): string {
  const d = safeDate(date);
  if (!d) return fallback;

  try {
    return format(d, 'HH:mm', { locale: es });
  } catch {
    return fallback;
  }
}

/**
 * Formats a full date in Spanish (e.g. "4 de octubre, 2026").
 */
export function formatFullDate(
  date: string | number | Date | null | undefined,
  fallback = 'Fecha no disponible'
): string {
  const d = safeDate(date);
  if (!d) return fallback;

  try {
    return format(d, "d 'de' MMMM, yyyy", { locale: es });
  } catch {
    return fallback;
  }
}

/**
 * Formats a short date in Spanish (e.g. "4 sep 2026").
 */
export function formatShortDate(
  date: string | number | Date | null | undefined,
  fallback = 'Fecha no disponible'
): string {
  const d = safeDate(date);
  if (!d) return fallback;

  try {
    return format(d, 'd MMM yyyy', { locale: es });
  } catch {
    return fallback;
  }
}
