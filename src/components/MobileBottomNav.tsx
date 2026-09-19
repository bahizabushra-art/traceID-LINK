import React, { useState } from 'react';
import { useRecon } from '../context/ReconContext';
import { 
  Layers, 
  FileCheck2, 
  Archive, 
  RotateCcw, 
  Camera,
  Barcode
} from 'lucide-react';
import { ActivePage } from '../types';
import { GlobalQuickScanModal } from './modals/GlobalQuickScanModal';

export const MobileBottomNav: React.FC = () => {
  const { activePage, setActivePage, returnParcels } = useRecon();
  const [isMobileScannerModalOpen, setIsMobileScannerModalOpen] = useState(false);

  const ghostCount = returnParcels.filter(p => p.vector3GhostException && !p.scannedAtWarehouse).length;

  return (
    <>
      <nav
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 inset-x-0 bg-[#050505]/95 backdrop-blur-md border-t border-[#27272A] z-40 px-2 py-1 shadow-2xl font-sans select-none"
      >
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto text-[10px] font-mono">
          {/* 1. Orders Stream */}
          <button
            id="mobile-nav-orders"
            type="button"
            onClick={() => setActivePage('orders')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all min-h-[48px] cursor-pointer ${
              activePage === 'orders' || activePage === 'track-a/orders' || activePage === 'track-b/orders' || activePage === 'track-b/ingestion'
                ? 'bg-[#121212] text-[#FACC15] font-bold border border-[#FACC15]/40'
                : 'text-[#A1A1AA] hover:text-[#FFFFFF]'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="truncate">Orders</span>
          </button>

          {/* 2. Reconciling Area (Audit) */}
          <button
            id="mobile-nav-audit"
            type="button"
            onClick={() => setActivePage('audit')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all min-h-[48px] cursor-pointer ${
              activePage === 'audit' || activePage === 'track-a/audit' || activePage === 'track-b/audit'
                ? 'bg-[#121212] text-[#FACC15] font-bold border border-[#FACC15]/40'
                : 'text-[#A1A1AA] hover:text-[#FFFFFF]'
            }`}
          >
            <FileCheck2 className="w-4 h-4 mb-0.5" />
            <span className="truncate">Audit</span>
          </button>

          {/* 3. CENTER HIGHLIGHTED QUICK BARCODE SCANNER (Direct 1-tap mobile operation!) */}
          <button
            id="mobile-nav-quick-barcode-scanner"
            type="button"
            onClick={() => setIsMobileScannerModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-extrabold shadow-lg shadow-[#FACC15]/30 min-h-[50px] cursor-pointer transform active:scale-95 transition-all -translate-y-1 border border-[#FACC15]"
            title="Scan Physical Return Barcode"
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[10px] tracking-tight font-black uppercase">Scan</span>
          </button>

          {/* 4. Returns Terminal */}
          <button
            id="mobile-nav-returns"
            type="button"
            onClick={() => setActivePage('returns')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all min-h-[48px] relative cursor-pointer ${
              activePage === 'returns' || activePage === 'return-policy' || activePage === 'track-b/warehouse'
                ? 'bg-[#121212] text-[#FACC15] font-bold border border-[#FACC15]/40'
                : 'text-[#A1A1AA] hover:text-[#FFFFFF]'
            }`}
          >
            <RotateCcw className="w-4 h-4 mb-0.5" />
            <span className="truncate">Returns</span>
            {ghostCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#A855F7] animate-pulse" />
            )}
          </button>

          {/* 5. Reports Archive */}
          <button
            id="mobile-nav-reports"
            type="button"
            onClick={() => setActivePage('reports')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all min-h-[48px] cursor-pointer ${
              activePage === 'reports'
                ? 'bg-[#121212] text-[#FACC15] font-bold border border-[#FACC15]/40'
                : 'text-[#A1A1AA] hover:text-[#FFFFFF]'
            }`}
          >
            <Archive className="w-4 h-4 mb-0.5" />
            <span className="truncate">Reports</span>
          </button>
        </div>
      </nav>

      {/* Global Quick Scan Barcode Viewport Modal for Mobile Bottom Nav */}
      <GlobalQuickScanModal 
        isOpen={isMobileScannerModalOpen} 
        onClose={() => setIsMobileScannerModalOpen(false)} 
      />
    </>
  );
};
