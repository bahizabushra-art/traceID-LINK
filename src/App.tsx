import React from 'react';
import { ReconProvider, useRecon } from './context/ReconContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginGateway } from './components/LoginGateway';
import { OrdersStream } from './components/trackA/OrdersStream';
import { CourierAuditArea } from './components/trackA/CourierAuditArea';
import { PassiveIngestionHub } from './components/trackB/PassiveIngestionHub';
import { DualFileReconcile } from './components/trackB/DualFileReconcile';
import { ReportsArchive } from './components/global/ReportsArchive';
import { ReturnPolicy } from './components/ReturnPolicy';
import { ShippingLabelModal } from './components/modals/ShippingLabelModal';

const AppContent: React.FC = () => {
  const { 
    activePage, 
    currentTrack, 
    activeLabelModalParcel, 
    setActiveLabelModalParcel 
  } = useRecon();
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state during initial Supabase session verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono text-[#A1A1AA]">Initializing Secure Merchant Session...</span>
      </div>
    );
  }

  // Auth Gate: Merchants MUST log in before seeing the dashboard
  if (
    !isAuthenticated || 
    activePage === 'login' || 
    activePage === 'register' || 
    activePage === 'forgot-password' || 
    activePage === 'reset-password' || 
    activePage === 'portal-select'
  ) {
    const mode = activePage === 'register' 
      ? 'signup' 
      : activePage === 'forgot-password' 
      ? 'forgot' 
      : activePage === 'reset-password' 
      ? 'recovery' 
      : 'signin';
    return <LoginGateway initialMode={mode} />;
  }

  // Unified 5-Page routing based on activePage & currentTrack
  const renderActivePage = () => {
    switch (activePage) {
      // 1. Inbound Order Stream
      case 'orders':
      case 'track-a/orders':
      case 'track-b/orders':
      case 'track-b/ingestion':
        return currentTrack === 'track-a' ? <OrdersStream /> : <PassiveIngestionHub />;

      // 2. Reconciling Area
      case 'audit':
      case 'track-a/audit':
      case 'track-b/audit':
        return currentTrack === 'track-a' ? <CourierAuditArea /> : <DualFileReconcile />;

      // 3. 5-Table Reconciled Audit Center
      case 'reports':
        return <ReportsArchive />;

      // 4. Return Verification Terminal
      case 'returns':
      case 'return-policy':
      case 'track-b/warehouse':
        return <ReturnPolicy />;

      default:
        return currentTrack === 'track-a' ? <OrdersStream /> : <PassiveIngestionHub />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-[#FFFFFF] font-sans antialiased selection:bg-[#FACC15] selection:text-[#050505]">
      {/* Structural Sidebar (Desktop Sticky & Mobile Slide-Out Drawer) */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 pb-24 lg:pb-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Android Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Shipping Label Modal */}
      {activeLabelModalParcel && (
        <ShippingLabelModal
          parcel={activeLabelModalParcel}
          onClose={() => setActiveLabelModalParcel(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ReconProvider>
        <AppContent />
      </ReconProvider>
    </AuthProvider>
  );
}
