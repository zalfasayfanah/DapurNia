/**
 * Penegakan Aturan 1: Total Tagihan Tidak Boleh Kurang dari Rp0
 */
export function calculateOrderTotal(subtotal: number, deliveryFee: number = 10000, discount: number = 0): number {
  const calculated = subtotal + deliveryFee - discount;
  return Math.max(0, calculated);
}

export interface ValidateOrderInput {
  subtotalMenu: number;
  items: Array<{
    menuId: string;
    quantity: number;
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateOrderCreation(input: ValidateOrderInput): ValidationResult {
  if (!input.items || input.items.length === 0) {
    return {
      isValid: false,
      error: 'Pesanan wajib berisi minimal 1 porsi.',
    };
  }

  for (const item of input.items) {
    if (!item.quantity || item.quantity < 1) {
      return {
        isValid: false,
        error: 'Jumlah pesanan minimal 1 porsi per menu.',
      };
    }
  }

  if (input.subtotalMenu <= 0) {
    return {
      isValid: false,
      error: 'Total harga menu minimal 1 porsi.',
    };
  }

  return { isValid: true };
}
