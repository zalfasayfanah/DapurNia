import { describe, it, expect } from 'vitest';
import { isValidStatusTransition } from './stateMachine';
import { OrderStatus, UserRole } from '../types';

describe('Rule 3: State Machine Guard & Linear Progression', () => {
  it('should allow WAITING_PAYMENT -> PROCESSING by staff or owner', () => {
    expect(isValidStatusTransition('WAITING_PAYMENT', 'PROCESSING', 'staff')).toBe(true);
    expect(isValidStatusTransition('WAITING_PAYMENT', 'PROCESSING', 'owner')).toBe(true);
    expect(isValidStatusTransition('WAITING_PAYMENT', 'PROCESSING', 'guest')).toBe(false);
  });

  it('should allow WAITING_PAYMENT -> CANCELLED by staff, owner, or system', () => {
    expect(isValidStatusTransition('WAITING_PAYMENT', 'CANCELLED', 'staff')).toBe(true);
    expect(isValidStatusTransition('WAITING_PAYMENT', 'CANCELLED', 'owner')).toBe(true);
  });

  it('should allow PROCESSING -> SHIPPED by staff and owner', () => {
    expect(isValidStatusTransition('PROCESSING', 'SHIPPED', 'staff')).toBe(true);
    expect(isValidStatusTransition('PROCESSING', 'SHIPPED', 'owner')).toBe(true);
  });

  it('should allow SHIPPED -> COMPLETED by staff and owner', () => {
    expect(isValidStatusTransition('SHIPPED', 'COMPLETED', 'staff')).toBe(true);
    expect(isValidStatusTransition('SHIPPED', 'COMPLETED', 'owner')).toBe(true);
  });

  it('should ONLY allow owner (Bu Dina) to cancel confirmed orders (PROCESSING / SHIPPED)', () => {
    // Staff (Rani) CANNOT cancel once confirmed
    expect(isValidStatusTransition('PROCESSING', 'CANCELLED', 'staff')).toBe(false);
    expect(isValidStatusTransition('SHIPPED', 'CANCELLED', 'staff')).toBe(false);

    // Owner (Dina) CAN cancel in emergency
    expect(isValidStatusTransition('PROCESSING', 'CANCELLED', 'owner')).toBe(true);
    expect(isValidStatusTransition('SHIPPED', 'CANCELLED', 'owner')).toBe(true);
  });

  it('should reject status skips (e.g. WAITING_PAYMENT directly to SHIPPED or COMPLETED)', () => {
    expect(isValidStatusTransition('WAITING_PAYMENT', 'SHIPPED', 'owner')).toBe(false);
    expect(isValidStatusTransition('WAITING_PAYMENT', 'COMPLETED', 'owner')).toBe(false);
    expect(isValidStatusTransition('PROCESSING', 'COMPLETED', 'owner')).toBe(false);
  });

  it('should reject transitions from terminal states (COMPLETED or CANCELLED)', () => {
    expect(isValidStatusTransition('COMPLETED', 'PROCESSING', 'owner')).toBe(false);
    expect(isValidStatusTransition('CANCELLED', 'WAITING_PAYMENT', 'owner')).toBe(false);
    expect(isValidStatusTransition('CANCELLED', 'PROCESSING', 'owner')).toBe(false);
  });
});
