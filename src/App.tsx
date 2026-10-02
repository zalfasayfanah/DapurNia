import React, { useState } from 'react';
import { UserRole } from './domain/types';
import { ServiceProvider, useServices } from './context/ServiceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { CustomerPortal } from './features/customer/CustomerPortal';
import { KitchenDashboard } from './features/staff/KitchenDashboard';
import { OwnerDashboard } from './features/owner/OwnerDashboard';

interface AppProps {
  serverTime?: Date;
  initialRole?: UserRole;
}

function MainAppShell({ serverTime }: { serverTime?: Date }) {
  const { unifiedAdapter } = useServices();
  const { role, userName, setRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      <Header currentRole={role} onRoleChange={setRole} />

      <main className="flex-1 w-full max-w-2xl mx-auto pt-2">
        {role === 'guest' && (
          <CustomerPortal adapter={unifiedAdapter} serverTime={serverTime} />
        )}

        {role === 'staff' && (
          <KitchenDashboard
            adapter={unifiedAdapter}
            userRole="staff"
            userName={userName}
          />
        )}

        {role === 'owner' && <OwnerDashboard adapter={unifiedAdapter} />}
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200 mt-auto bg-white">
        <p className="font-bold text-slate-600">Dapur Nia &copy; {new Date().getFullYear()}</p>
        <p>Katering Harian Khusus Kompleks Griya Indah &bull; Porsi Terbatas 60 Porsi/Hari</p>
      </footer>
    </div>
  );
}

export default function App({ serverTime, initialRole = 'guest' }: AppProps) {
  return (
    <ServiceProvider>
      <AuthProvider initialRole={initialRole}>
        <MainAppShell serverTime={serverTime} />
      </AuthProvider>
    </ServiceProvider>
  );
}
