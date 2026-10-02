import { OrderStatus, UserRole } from '../types';

/**
 * Penegakan Aturan 3: Mesin Status Linear & Hak Akses Peran
 * Urutan: WAITING_PAYMENT -> PROCESSING -> SHIPPED -> COMPLETED
 * Pembatalan darurat pada pesanan terkonfirmasi hanya boleh oleh 'owner' (Bu Dina)
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  role: UserRole
): boolean {
  // Terminal status cannot transition
  if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
    return false;
  }

  // Linear progression
  if (currentStatus === 'WAITING_PAYMENT') {
    if (nextStatus === 'PROCESSING') {
      return role === 'staff' || role === 'owner';
    }
    if (nextStatus === 'CANCELLED') {
      return role === 'staff' || role === 'owner';
    }
    return false;
  }

  if (currentStatus === 'PROCESSING') {
    if (nextStatus === 'SHIPPED') {
      return role === 'staff' || role === 'owner';
    }
    if (nextStatus === 'CANCELLED') {
      // HANYA Bu Dina (Owner) yang boleh membatalkan pesanan dapur terkonfirmasi
      return role === 'owner';
    }
    return false;
  }

  if (currentStatus === 'SHIPPED') {
    if (nextStatus === 'COMPLETED') {
      return role === 'staff' || role === 'owner';
    }
    if (nextStatus === 'CANCELLED') {
      // HANYA Bu Dina (Owner) yang boleh membatalkan jika ada kendala darurat
      return role === 'owner';
    }
    return false;
  }

  return false;
}
