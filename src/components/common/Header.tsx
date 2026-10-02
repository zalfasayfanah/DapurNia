import React from 'react';
import { UtensilsCrossed, ShieldAlert, User, ChefHat, Crown } from 'lucide-react';
import { UserRole } from '../../domain/types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export function Header({ currentRole, onRoleChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-600 via-brand-600 to-amber-600 text-white shadow-lg">
      <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Dapur Nia</h1>
            <p className="text-orange-100 text-sm font-medium">Katering Kompleks Griya Indah</p>
          </div>
        </div>

        {onRoleChange && (
          <div className="flex items-center bg-black/20 backdrop-blur-md rounded-2xl p-1 border border-white/20">
            <button
              type="button"
              onClick={() => onRoleChange('guest')}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${
                currentRole === 'guest'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Warga
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('staff')}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${
                currentRole === 'staff'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              Rani
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('owner')}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${
                currentRole === 'owner'
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              Bu Dina
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
