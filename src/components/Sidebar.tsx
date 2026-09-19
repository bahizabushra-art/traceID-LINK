import React from 'react';
import { useRecon } from '../context/ReconContext';
import { useAuth } from '../context/AuthContext';
import { ActivePage } from '../types';
import { 
  Layers, 
  FileCheck2, 
  Archive, 
  RotateCcw, 
  ShieldCheck, 
  LogOut, 
  X, 
  Database,
  ArrowRight,
  Server,
  Store,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    currentTrack, 
    setCurrentTrack, 
    isMobileNavOpen, 
    setIsMobileNavOpen,
    returnParcels
  } = useRecon();
  const { user, logout } = useAuth();

  // Count active ghost return exceptions for badge
  const ghostCount = returnParcels.filter(p => p.vector3GhostException && !p.scannedAtWarehouse).length;

  const unifiedNavItems = [
    ...(currentTrack === 'track-a' ? [
      {
        id: 'track-a/dashboard' as ActivePage,
        label: 'Executive & Performance Metrics',
        subtext: 'Monthly Success Rates & Recharts',
        icon: PieIcon,
        badge: 'Pie Chart',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
      }
    ] : []),
    {
      id: 'orders' as ActivePage,
      label: 'Inbound Order Stream',
      subtext: currentTrack === 'track-a' ? '4 Payment Combinations' : 'IMAP Feed & Dispatch',
      icon: Layers,
      badge: 'LIVE',
      badgeColor: 'bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/40'
    },
    {
      id: 'audit' as ActivePage,
      label: 'Reconciling Area',
      subtext: currentTrack === 'track-a' ? 'Cron + Courier 3PL CSV' : 'Simultaneous Dual-File',
      icon: FileCheck2,
      badge: currentTrack === 'track-a' ? '3-Vector' : 'Dual-File',
      badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700'
    },
    {
      id: 'reports' as ActivePage,
      label: '5-Table Reconciled Audit Center',
      subtext: 'Archive, Filters & Multi-CSV Export',
      icon: Archive,
      badge: '5 Tables',
      badgeColor: 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
    },
    {
      id: 'returns' as ActivePage,
      label: 'Return Verification Terminal',
      subtext: 'Reverse Logistics & Gate Scanner',
      icon: RotateCcw,
      badge: ghostCount > 0 ? `${ghostCount} Ghost Flag` : 'Verified',
      badgeColor: ghostCount > 0 
        ? 'bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/40' 
        : 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
    },
    {
      id: 'security' as ActivePage,
      label: 'Data Security & TTL Retention',
      subtext: '6-Month Rolling Partition & Purge',
      icon: ShieldCheck,
      badge: '180d TTL',
      badgeColor: 'bg-cyan-950 text-[#06B6D4] border-cyan-800'
    }
  ];

  const handleNavClick = (pageId: ActivePage) => {
    setActivePage(pageId);
    setIsMobileNavOpen(false);
  };

  const renderContent = (isMobile: boolean = false) => (
    <>
      {/* Brand Header */}
      <div className="p-4 border-b border-[#27272A] bg-[#050505]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Cryptographic Linked Nodes Logo */}
            <div className="w-10 h-10 rounded-xl bg-[#121212] border-2 border-[#FACC15] flex items-center justify-center text-[#FACC15] shadow-md shadow-[#FACC15]/20">
              <svg 
                className="w-5 h-5 stroke-current" 
                viewBox="0 0 24 24" 
                fill="none" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <circle cx="6" cy="18" r="2.5" />
                <circle cx="18" cy="18" r="2.5" />
                <line x1="8.5" y1="6" x2="15.5" y2="6" strokeDasharray="2 2" />
                <line x1="6" y1="8.5" x2="6" y2="15.5" />
                <line x1="18" y1="8.5" x2="18" y2="15.5" />
                <line x1="8.5" y1="18" x2="15.5" y2="18" strokeDasharray="2 2" />
                <line x1="8" y1="8" x2="16" y2="16" />
              </svg>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-[#FFFFFF] tracking-tight">TraceID Link</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] font-mono truncate">FinTech Recon Middleware</p>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suite Mode Switcher Toggle:
            [ TRACK A: ENTERPRISE API HUB ] | [ TRACK B: SME PORTAL ] */}
        <div className="mt-4 p-1 rounded-xl bg-[#121212] border border-[#27272A] grid grid-cols-2 gap-1 font-mono text-[11px]">
          <button
            id="sidebar-toggle-track-a"
            type="button"
            onClick={() => {
              setCurrentTrack('track-a');
              // Ensure we are on one of the unified pages
              if (!['orders', 'audit', 'reports', 'returns', 'security'].includes(activePage)) {
                setActivePage('orders');
              }
            }}
            className={`py-2 px-1.5 rounded-lg text-center transition-all cursor-pointer font-bold ${
              currentTrack === 'track-a'
                ? 'bg-[#FACC15] text-[#050505] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-zinc-900'
            }`}
          >
            TRACK A: API HUB
          </button>

          <button
            id="sidebar-toggle-track-b"
            type="button"
            onClick={() => {
              setCurrentTrack('track-b');
              if (!['orders', 'audit', 'reports', 'returns', 'security'].includes(activePage)) {
                setActivePage('orders');
              }
            }}
            className={`py-2 px-1.5 rounded-lg text-center transition-all cursor-pointer font-bold ${
              currentTrack === 'track-b'
                ? 'bg-[#FACC15] text-[#050505] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-zinc-900'
            }`}
          >
            TRACK B: SME PORTAL
          </button>
        </div>
      </div>

      {/* Unified Navigation Menu (IDENTICAL 5-Page Structure for both Track A & Track B) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        <div className="px-2 pb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
            Unified Workspaces
          </span>
        </div>

        {unifiedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || 
            (item.id === 'orders' && (activePage === 'track-a/orders' || activePage === 'track-b/orders')) ||
            (item.id === 'audit' && (activePage === 'track-a/audit' || activePage === 'track-b/audit')) ||
            (item.id === 'returns' && activePage === 'return-policy');

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group border cursor-pointer min-h-[46px] ${
                isActive
                  ? 'bg-[#121212] text-[#FFFFFF] border-[#FACC15] shadow-sm shadow-[#FACC15]/10'
                  : 'text-[#A1A1AA] border-transparent hover:text-[#FFFFFF] hover:bg-[#121212] hover:border-[#27272A]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#FACC15] text-[#050505]' : 'bg-[#121212] text-[#A1A1AA] group-hover:text-[#FACC15]'
                }`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className={`font-bold tracking-tight truncate ${isActive ? 'text-[#FFFFFF]' : 'text-zinc-300 group-hover:text-white'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-[#A1A1AA] font-mono truncate">
                    {item.subtext}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ml-1.5 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Persistent Retention & Storage Partition Footer */}
      <div className="p-3.5 border-t border-[#27272A] bg-[#050505] text-[11px] font-mono space-y-2.5">
        <div className="flex items-center justify-between text-[#A1A1AA]">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Partition TTL</span>
          </div>
          <span className="text-[#22C55E] font-bold">180d Active</span>
        </div>

        <div className="w-full bg-[#121212] border border-[#27272A] h-2 rounded-full overflow-hidden">
          <div className="bg-[#FACC15] h-full w-[42%] rounded-full shadow-xs shadow-[#FACC15]" />
        </div>

        <div className="flex justify-between text-[10px] text-[#A1A1AA]">
          <span>2.5 GB / 6.0 GB Max</span>
          <span>90,00,000 Records</span>
        </div>

        {user && (
          <div className="p-2 rounded-lg bg-[#121E36]/80 border border-[#233B6B] text-[10px] font-mono">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SUPABASE AUTH:</span>
            </div>
            <div className="text-slate-200 truncate mt-0.5" title={user.email}>
              {user.email}
            </div>
          </div>
        )}

        <button
          onClick={async () => {
            await logout();
            setActivePage('login');
          }}
          className="w-full mt-2 py-2 px-3 rounded-lg bg-[#121212] hover:bg-rose-950/40 border border-[#27272A] hover:border-rose-700/60 text-[11px] text-[#A1A1AA] hover:text-rose-300 font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Sign Out / Lock Workspace</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#050505] text-[#FFFFFF] border-r border-[#27272A] flex-col shrink-0 select-none h-screen sticky top-0 font-sans">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-[85vw] max-w-xs bg-[#050505] text-[#FFFFFF] border-r border-[#27272A] flex flex-col select-none h-full shadow-2xl z-10 font-sans">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
