import React from 'react';
import { 
  Database, 
  Server, 
  ShieldCheck, 
  Trash2, 
  Clock, 
  Activity, 
  X, 
  Terminal, 
  Play, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { useRecon } from '../../context/ReconContext';

interface ShadowDbModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShadowDbModal: React.FC<ShadowDbModalProps> = ({ isOpen, onClose }) => {
  const { 
    shadowDbTelemetry, 
    ttlPurgeLogs, 
    ttlTerminalLogs, 
    isTtlRunning, 
    executeDailyTtlPurge 
  } = useRecon();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b101d] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        
        {/* Modal Header */}
        <div className="p-5 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Read-Replica Shadow DB & Rolling 180-Day TTL Architecture
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Zero Checkout Impact (Isolated)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Mandatory production security: Master DB checkout traffic isolation and 180-day automated partition purge.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Dual Instance Architecture Visualizer: Master DB vs Shadow Read-Replica */}
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Instance Topology & Workload Isolation Matrix</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Master Database Card */}
              <div className="p-4 rounded-xl bg-[#09101d] border border-blue-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-blue-400" />
                      Primary Master DB (OLTP)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                      Port 5432 (Write-Heavy)
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans mt-2">
                    Dedicated exclusively to live customer checkout, payment webhooks, and warehouse physical gate scanning. Protected against heavy analytics locks.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Host:</span>
                    <span className="text-slate-200">{shadowDbTelemetry.primaryMaster.host}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>CPU Utilization:</span>
                    <span className="text-emerald-400 font-bold">{shadowDbTelemetry.primaryMaster.cpuLoadPercent}% (Low/Healthy)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Active Client Connections:</span>
                    <span className="text-slate-200">{shadowDbTelemetry.primaryMaster.activeConnections} pool conns</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Analytics Lock Contention:</span>
                    <span className="text-emerald-400 font-bold">{shadowDbTelemetry.primaryMaster.analyticsLockContention}</span>
                  </div>
                </div>
              </div>

              {/* Shadow Read-Replica Card */}
              <div className="p-4 rounded-xl bg-[#0e1124] border border-purple-800/80 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-purple-400" />
                      Shadow Read-Replica (OLAP)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800">
                      Port 5433 (Read-Only)
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans mt-2">
                    Asynchronous replica executing the automated Midnight 3-Vector Return Audit Engine and complex multi-year settlement reconciliation.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Replica Host:</span>
                    <span className="text-slate-200">{shadowDbTelemetry.shadowReadReplica.host}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Replication Lag:</span>
                    <span className="text-emerald-400 font-bold">{shadowDbTelemetry.shadowReadReplica.replicationLagMs} ms (Near Real-time)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>3-Vector Audit Queries Executed:</span>
                    <span className="text-purple-300 font-bold">{shadowDbTelemetry.shadowReadReplica.auditQueriesExecuted.toLocaleString()} queries</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Average Query Latency:</span>
                    <span className="text-cyan-300 font-bold">{shadowDbTelemetry.shadowReadReplica.averageQueryLatencyMs} ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rolling 180-Day TTL Partition Management */}
          <div className="p-5 rounded-xl bg-[#09101d] border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Rolling 180-Day TTL Partition Policy (6-Month Active Window)</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Data retention for return audit records is strictly capped at 180 days. Expired daily rows are pruned to preserve indexing speed and zero query degradation.
                </p>
              </div>

              <button
                type="button"
                onClick={executeDailyTtlPurge}
                disabled={isTtlRunning}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shrink-0 ${
                  isTtlRunning
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 cursor-wait animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95'
                }`}
              >
                {isTtlRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing 00:01 AM Purge...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Trigger 00:01 AM TTL Purge</span>
                  </>
                )}
              </button>
            </div>

            {/* SQL Execution Banner */}
            <div className="mt-4 p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-cyan-300">DELETE FROM</span>
                <span className="text-white">transaction_ledger</span>
                <span className="text-cyan-300">WHERE</span>
                <span className="text-amber-300">transaction_date &lt; (CURRENT_DATE - INTERVAL '180 days');</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 shrink-0 ml-2">
                Partition Key: transaction_date
              </span>
            </div>

            {/* Live Terminal Output */}
            <div className="mt-4 p-3 rounded-lg bg-[#070b14] border border-slate-800 text-[11px] space-y-1.5 font-mono max-h-36 overflow-y-auto">
              <div className="text-slate-500 text-[10px] flex items-center justify-between">
                <span>TERMINAL STDOUT (syslog @ /var/log/ttl_audit.log):</span>
                <span>Active Retention Window: 180 Days</span>
              </div>
              {ttlTerminalLogs.map((log, idx) => (
                <div key={idx} className="text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 mr-1.5">❯</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            {/* Historical TTL Purge Logs Table */}
            <div className="mt-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Recent Daily Partition Purge History:
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1628] text-slate-400 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Purge ID</th>
                      <th className="py-2 px-3">Execution Time</th>
                      <th className="py-2 px-3">Records Purged</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                    {ttlPurgeLogs.map(p => (
                      <tr key={p.id} className="hover:bg-[#121c33]">
                        <td className="py-2 px-3 text-cyan-400 font-bold">{p.id}</td>
                        <td className="py-2 px-3 text-slate-400">{p.timestamp}</td>
                        <td className="py-2 px-3 text-amber-400 font-bold">
                          {p.recordsPurged.toLocaleString()} rows
                        </td>
                        <td className="py-2 px-3 text-slate-300">{p.durationMs} ms</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0e1628] border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Total Active Clustered Ledger: <strong className="text-white">{shadowDbTelemetry.totalLedgerRows.toLocaleString()}</strong> rows (Oldest: <strong className="text-cyan-400">{shadowDbTelemetry.oldestRecordDate}</strong>)
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Close Telemetry View
          </button>
        </div>

      </div>
    </div>
  );
};
