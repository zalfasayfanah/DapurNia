/**
 * Validasi batas jam pemesanan harian (Cut-off 12.00 WIB)
 */
export function isOrderTimeValid(currentTime: Date = new Date(), cutoffHour: number = 12, cutoffMinute: number = 0): boolean {
  // Calculate WIB hour (UTC+7)
  const utcHours = currentTime.getUTCHours();
  const utcMinutes = currentTime.getUTCMinutes();
  
  const wibHours = (utcHours + 7) % 24;
  const wibMinutes = utcMinutes;

  if (wibHours > cutoffHour) {
    return false;
  }
  if (wibHours === cutoffHour && wibMinutes >= cutoffMinute) {
    return false;
  }

  return true;
}
