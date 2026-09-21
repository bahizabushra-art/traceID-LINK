import React, { useState, useEffect } from 'react';
import { useRecon } from '../context/ReconContext';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  Clock, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Menu, 
  LogOut,
  Sparkles,
  Layers,
  Store,
  FileCheck2,
  Barcode,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { GlobalQuickScanModal } from './modals/GlobalQuickScanModal';

export const Header: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    currentTrack, 
    setCurrentTrack,
    isBankVarianceToggled, 
    setIsBankVarianceToggled,
    setIsMobileNavOpen
  } = useRecon();
  const { user, logout } = useAuth();

  const [bdTime, setBdTime] = useState<string>('');
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dhaka',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      setBdTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    switch (activePage) {
      case 'orders':
        return currentTrack === 'track-a' 
          ? { title: 'Orders', sub: 'Inbound sales and payment records' }
          : { title: 'Orders', sub: 'Inbound sales and parcel dispatch' };
      case 'audit':
        return currentTrack === 'track-a'
          ? { title: 'Reconciliation', sub: 'Automated settlement and payout audit' }
          : { title: 'Reconciliation', sub: 'Payment and courier statement reconciliation' };
      case 'reports':
        return { title: 'Reports', sub: 'Settlement archive and downloadable ledgers' };
      case 'returns':
        return { title: 'Returns', sub: 'Reverse logistics and return package verification' };
      default:
        return { title: 'TraceID Link', sub: 'Settlement Reconciliation' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <>
      <header className="bg-[#050505] border-b border-[#27272A] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 font-sans">
        {/* Left: Mobile Menu & Current Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="header-mobile-menu-btn"
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-[#121212] border border-[#27272A] text-[#FACC15] hover:text-white transition-colors shrink-0"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FACC15]">
                {currentTrack === 'track-a' ? 'TRACK A • ENTERPRISE' : 'TRACK B • MERCHANT'}
              </span>
              <span className="text-zinc-700 hidden sm:inline">•</span>
              <span className="text-[10px] font-mono text-[#A1A1AA] hidden sm:inline">
                DHAKA REGION (UTC+6)
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#FFFFFF] tracking-tight truncate mt-0.5">
              {pageInfo.title}
            </h1>
            <p className="text-[11px] text-[#A1A1AA] hidden md:block truncate">
              {pageInfo.sub}
            </p>
          </div>
        </div>

        {/* Right: Operational Controls & Global Quick Barcode Scanner */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Mode Badge */}
          <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-[#121212] border border-[#27272A] text-xs font-mono">
            <span className="text-[#A1A1AA] mr-1.5 hidden sm:inline">Track:</span>
            {currentTrack === 'track-a' ? (
              <span className="text-[#FACC15] font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15] animate-pulse"></span>
                Track A (Enterprise)
              </span>
            ) : (
              <span className="text-[#FACC15] font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15] animate-pulse"></span>
                Track B (Merchant)
              </span>
            )}
          </div>

          {/* Quick Scan Return Barcode Button */}
          <button
            id="global-quick-scan-barcode-btn"
            onClick={() => setIsScanModalOpen(true)}
            title="Scan return barcode to verify package"
            className="px-3 py-1.5 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-mono text-xs font-bold tracking-tight shadow-md shadow-[#FACC15]/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4 stroke-[2.5]" />
            <span>Scan Return</span>
          </button>

          {/* Bank Sum Balance / Gap Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#27272A] text-xs font-mono">
            <Scale className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <span className="text-[#A1A1AA]">Bank Sum:</span>
            {isBankVarianceToggled ? (
              <span className="text-[#EF4444] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                - BDT 10,000 Gap
              </span>
            ) : (
              <span className="text-[#22C55E] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Balanced
              </span>
            )}
            <button
              id="header-bank-gap-toggle-btn"
              onClick={() => setIsBankVarianceToggled(prev => !prev)}
              className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-[#A1A1AA] hover:text-white transition-colors"
              title="Toggle between Balanced Ledger and Under-Settled Gap simulation"
            >
              {isBankVarianceToggled ? 'Reset' : 'Simulate Gap'}
            </button>
          </div>

          {/* Dhaka BST Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121212] border border-[#27272A] text-xs font-mono text-[#A1A1AA]">
            <Clock className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>{bdTime || 'BST (UTC+6)'}</span>
          </div>

          {/* Authenticated Merchant User Pill */}
          {user && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#121E36] border border-[#233B6B] text-xs font-mono">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center text-[10px] font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-cyan-200 font-bold max-w-[140px] truncate text-[11px]">
                  {user.email}
                </span>
                <span className="text-[9px] text-cyan-400/80 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Verified Merchant
                </span>
              </div>
            </div>
          )}

          {/* Logout / Switch User to Login Gateway */}
          <button
            id="header-logout-btn"
            onClick={async () => {
              await logout();
              setActivePage('login');
            }}
            title="Sign Out & Return to Login Gateway"
            className="p-2 rounded-lg bg-[#121212] hover:bg-rose-950/40 border border-[#27272A] hover:border-rose-700/60 text-[#A1A1AA] hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-mono">Logout</span>
          </button>
        </div>
      </header>

      {/* Global Quick Scan Barcode Viewport Modal */}
      <GlobalQuickScanModal 
        isOpen={isScanModalOpen} 
        onClose={() => setIsScanModalOpen(false)} 
      />
    </>
  );
};
