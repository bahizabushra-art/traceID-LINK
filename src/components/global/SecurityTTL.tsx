import React from 'react';
import { useRecon } from '../../context/ReconContext';
import { 
  ShieldCheck, 
  Database, 
  Terminal, 
  Play, 
  Server, 
  Lock, 
  CheckCircle2, 
  HardDrive, 
  Cpu, 
  RefreshCw,
  AlertCircle,
  Key,
  FileKey2
} from 'lucide-react';

export const SecurityTTL: React.FC = () => {
  const { 
    ttlTerminalLogs, 
    isTtlRunning, 
    runTtlPurgeSimulation 
  } = useRecon();

  return (
    <div className="space-y-6 font-sans">
      {/* Header Info */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FACC15]" />
              <h2 className="text-base font-bold text-[#FFFFFF] font-mono uppercase tracking-wide">
                Data Security & TTL Retention Engine
              </h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 font-medium">
              Zero-Cloud Exposure Sovereign Architecture & Automated 180-Day Partition Overwrite Engine
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#050505] text-[#22C55E] border border-[#27272A] text-xs font-mono font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>TLS 1.3 + HMAC SHA-256</span>
            </span>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="mt-4 pt-4 border-t border-[#27272A] flex flex-wrap gap-2.5 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#050505] border border-[#FACC15]/40 text-[#FACC15] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>6-Month Rolling Partition Active</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#050505] border border-[#22C55E]/40 text-[#22C55E] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Automated 180-Day TTL Overwrite Engine</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#050505] border border-cyan-800 text-[#06B6D4] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Air-Gapped Sovereign Shadow DB</span>
          </div>
        </div>
      </div>

      {/* Partition Monitor Widget & Interactive Purge Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Partition Monitor Widget */}
        <div className="md:col-span-6 bg-[#121212] border border-[#27272A] rounded-2xl p-5 font-mono text-xs space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <div className="flex items-center gap-2 text-[#FFFFFF] font-bold uppercase">
              <Database className="w-4 h-4 text-[#FACC15]" />
              <span>Active 180-Day Storage Partition</span>
            </div>
            <span className="text-[#22C55E] text-[11px] font-bold">Primary + Read-Replica OK</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[#FFFFFF] text-[11px]">
              <span>Partition Storage Footprint:</span>
              <span className="text-[#FACC15] font-bold">2.5 GB / 6.0 GB Allocated</span>
            </div>

            {/* Storage Progress Bar */}
            <div className="w-full bg-[#050505] border border-[#27272A] h-3 rounded-full overflow-hidden p-0.5">
              <div className="bg-[#FACC15] h-full rounded-full w-[41.6%] shadow-xs shadow-[#FACC15]"></div>
            </div>

            <div className="flex justify-between text-[10px] text-[#A1A1AA]">
              <span>90,00,000 Active Transaction Records</span>
              <span>180-Day Sliding Ledger Ring</span>
            </div>
          </div>

          {/* Forensic Specs */}
          <div className="p-3.5 rounded-xl bg-[#050505] border border-[#27272A] space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Database Engine:</span>
              <span className="text-[#FFFFFF]">PostgreSQL 16 Enterprise (Citus Partitioning)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Data Ingestion Mode:</span>
              <span className="text-[#FACC15]">Read-Replica Shadow DB Ingestion</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Purge Mechanism:</span>
              <span className="text-[#22C55E]">Physical TRUNCATE PARTITION CASCADE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Next Scheduled Purge:</span>
              <span className="text-[#FFFFFF]">Tonight at 00:01 BST (Dhaka)</span>
            </div>
          </div>

          {/* Purge Action Button: Bold Yellow Button */}
          <button
            id="simulate-daily-purge-btn"
            onClick={runTtlPurgeSimulation}
            disabled={isTtlRunning}
            className="w-full py-3 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#050505] font-bold text-xs font-mono tracking-wide shadow-md shadow-[#FACC15]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isTtlRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>EXECUTING MIDNIGHT PURGE CASCADE...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current stroke-none" />
                <span>SIMULATE DAILY MIDNIGHT TTL PURGE SCRIPT (00:01 AM)</span>
              </>
            )}
          </button>
        </div>

        {/* Live Terminal Output Simulation */}
        <div className="md:col-span-6 bg-[#050505] border border-[#27272A] rounded-2xl p-4 flex flex-col font-mono text-xs shadow-lg">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#27272A]">
            <div className="flex items-center gap-2 text-[#FFFFFF] font-bold text-[11px]">
              <Terminal className="w-4 h-4 text-[#FACC15]" />
              <span>Cron Daemon: /usr/local/bin/ttl_purge_cron.sh</span>
            </div>
            <span className="text-[10px] text-[#A1A1AA]">Dhaka (UTC+6)</span>
          </div>

          {/* Terminal Console Log Output */}
          <div className="mt-3 flex-1 overflow-y-auto max-h-64 space-y-1.5 text-[11px] custom-scrollbar pr-1">
            {ttlTerminalLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={`leading-relaxed ${
                  log.includes('SUCCESS') || log.includes('purged') 
                    ? 'text-[#22C55E] font-bold' 
                    : log.includes('WARN') || log.includes('OVERWRITE') 
                    ? 'text-[#FACC15]' 
                    : log.includes('TRUNCATE') 
                    ? 'text-[#FFFFFF] font-semibold' 
                    : 'text-[#A1A1AA]'
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#27272A] flex items-center justify-between text-[10px] text-[#A1A1AA]">
            <span>Exit code: 0 (OK)</span>
            <span className="text-[#22C55E]">Daemon Status: STANDBY (Next: 00:01 BST)</span>
          </div>
        </div>
      </div>

      {/* Interactive Zero Bank Password Guarantee Card */}
      <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#FACC15] text-[#050505] flex items-center justify-center font-bold">
            <Key className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FFFFFF] font-mono tracking-tight">
              Interactive Zero Bank Password Guarantee Architecture
            </h3>
            <p className="text-[11px] font-mono text-[#A1A1AA]">
              Cryptographic separation between merchant operational ledgers and financial banking portals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#050505] border border-[#27272A] space-y-1.5">
            <div className="flex items-center gap-2 text-[#FACC15] font-bold">
              <FileKey2 className="w-4 h-4" />
              <span>Zero Bank Password Storage</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              TraceID Link NEVER requests, ingests, or stores bank login credentials, OTPs, or merchant internet banking passwords. Statements are ingested via static encrypted exports.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-[#27272A] space-y-1.5">
            <div className="flex items-center gap-2 text-[#22C55E] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>HMAC SHA-256 Hashing</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              Every checkout API webhook payload and scraped OTC email transaction is stamped with a non-invertible SHA-256 HMAC signature verified before ledger injection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-[#27272A] space-y-1.5">
            <div className="flex items-center gap-2 text-[#06B6D4] font-bold">
              <Server className="w-4 h-4" />
              <span>Shadow DB Air-Gap</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              Audit queries execute exclusively against an air-gapped read-replica shadow database. Production order databases remain completely isolated from analytical load.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
