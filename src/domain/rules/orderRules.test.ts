import { describe, it, expect } from 'vitest';
import { calculateOrderTotal, validateOrderCreation } from './orderRules';

describe('Order Rules & Absolute Constraints', () => {
  describe('Rule 1: Total Tagihan Tidak Boleh Kurang dari Rp0', () => {
    it('should calculate order total correctly with flat delivery fee of Rp10.000', () => {
      const subtotal = 50000; // 2 x 25.000
      const deliveryFee = 10000;
      const discount = 0;

      const total = calculateOrderTotal(subtotal, deliveryFee, discount);
      expect(total).toBe(60000);
    });

    it('should clamp total to 0 if discount exceeds subtotal + delivery fee', () => {
      const subtotal = 20000;
      const deliveryFee = 10000;
      const discount = 35000; // 30.000 - 35.000 = -5.000

      const total = calculateOrderTotal(subtotal, deliveryFee, discount);
      expect(total).toBe(0); // Clamped, total never negative
    });

    it('should reject order if subtotal is 0 or less', () => {
      const result = validateOrderCreation({
        subtotalMenu: 0,
        items: [],
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/minimal 1 porsi/i);
    });

    it('should reject order if any item has 0 or negative quantity', () => {
      const result = validateOrderCreation({
        subtotalMenu: 25000,
        items: [{ menuId: 'm1', quantity: 0 }],
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/minimal 1 porsi/i);
    });
  });
});
