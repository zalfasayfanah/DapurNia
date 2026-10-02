import { describe, it, expect } from 'vitest';
import { normalizeWhatsApp, isInsideComplex } from './customerValidator';
import { isOrderTimeValid } from './cutoffValidator';

describe('Domain Validators', () => {
  describe('Customer Validator', () => {
    it('should normalize various WhatsApp number formats to standard 08xxx', () => {
      expect(normalizeWhatsApp('0812-3456-7890')).toBe('081234567890');
      expect(normalizeWhatsApp('+62 812 3456 7890')).toBe('081234567890');
      expect(normalizeWhatsApp('6281234567890')).toBe('081234567890');
      expect(normalizeWhatsApp('081234567890')).toBe('081234567890');
    });

    it('should validate address within Kompleks Griya Indah', () => {
      expect(isInsideComplex('Kompleks Griya Indah Blok A No. 1')).toBe(true);
      expect(isInsideComplex('Griya Indah Blok B2 No. 5')).toBe(true);
      expect(isInsideComplex('Blok C3 No. 10')).toBe(true);
      expect(isInsideComplex('Jl. Melati No. 10, Desa Sebelah')).toBe(false);
      expect(isInsideComplex('')).toBe(false);
    });
  });

  describe('Cut-off Time Validator', () => {
    it('should allow ordering before 12:00 WIB', () => {
      // 09:30 WIB
      const morningTime = new Date('2026-10-02T02:30:00.000Z'); // 09:30 UTC+7
      expect(isOrderTimeValid(morningTime, 12)).toBe(true);
    });

    it('should reject ordering at or after 12:00 WIB', () => {
      // 12:00 WIB
      const noonTime = new Date('2026-10-02T05:00:00.000Z'); // 12:00 UTC+7
      expect(isOrderTimeValid(noonTime, 12)).toBe(false);

      // 13:30 WIB
      const afternoonTime = new Date('2026-10-02T06:30:00.000Z'); // 13:30 UTC+7
      expect(isOrderTimeValid(afternoonTime, 12)).toBe(false);
    });
  });
});
