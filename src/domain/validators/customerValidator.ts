/**
 * Normalisasi nomor WhatsApp menjadi format tunggal 08xxxxxxxxxx
 */
export function normalizeWhatsApp(phone: string): string {
  if (!phone) return '';
  // Remove non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Handle +62 or 62 prefix -> convert to 0
  if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2);
  }

  return digits;
}

/**
 * Validasi alamat berada di dalam Kompleks Griya Indah
 */
export function isInsideComplex(address: string, allowedKeywords: string[] = ['griya indah', 'blok']): boolean {
  if (!address || typeof address !== 'string') return false;
  const lowerAddress = address.trim().toLowerCase();
  if (lowerAddress.length === 0) return false;

  return allowedKeywords.some((keyword) => lowerAddress.includes(keyword.toLowerCase()));
}
