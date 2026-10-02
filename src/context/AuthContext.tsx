import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '../domain/types';

interface AuthContextType {
  role: UserRole;
  userName: string;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  initialRole = 'guest',
}: {
  children: React.ReactNode;
  initialRole?: UserRole;
}) {
  const [role, setRoleState] = useState<UserRole>(initialRole);

  const getUserName = (r: UserRole): string => {
    switch (r) {
      case 'owner':
        return 'Bu Dina';
      case 'staff':
        return 'Rani';
      default:
        return 'Warga';
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        userName: getUserName(role),
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
