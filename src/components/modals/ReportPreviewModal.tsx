import React from 'react';
import { ReconciledReportBatch, AuditRecord } from '../../types';
import { formatBDT } from '../../data/mockData';
import { Table, X, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface Props {
  batch: ReconciledReportBatch | null;
  auditRecords: AuditRecord[];
  onClose: () => void;
  onDownload: (batch: ReconciledReportBatch) => void;
}

export const ReportPreviewModal: React.FC<Props> = ({
  batch,
  auditRecords,
  onClose,
  onDownload
}) => {
  if (!batch) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#0B0F19] border border-[#1F293D] rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Spreadsheet Structure Preview: {batch.fileName}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Batch ID: <span className="font-mono text-cyan-300">{batch.batchId}</span> • 
                Mode: <span className="font-mono text-slate-200">{batch.trackMode}</span> • 
                Retention: <span className="text-amber-400 font-mono">180-Day Fiscal Partition</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs p-1 rounded bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explicit Column Outputs Note */}
        <div className="p-2.5 rounded bg-[#0b101c] border border-blue-900/40 text-[11px] font-mono text-slate-300 flex items-center justify-between">
          <span>
            Schema Columns: <code className="text-cyan-400">TraceID</code>, <code className="text-cyan-400">Order_Amount</code>, <code className="text-cyan-400">Settled_Amount</code>, <code className="text-cyan-400">Status_Label</code>, <code className="text-cyan-400">Mismatch_Gap_BDT</code>
          </span>
          <span className="text-emerald-400 font-bold">100% Deterministic Export Format</span>
        </div>

        {/* Spreadsheet Data Grid */}
        <div className="overflow-x-auto border border-[#1F293D] rounded-lg max-h-96 custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0e1628] text-slate-300 border-b border-[#1F293D] text-[11px] sticky top-0">
              <tr>
                <th className="py-2.5 px-4 font-semibold">TraceID</th>
                <th className="py-2.5 px-4 font-semibold">Order_Amount</th>
                <th className="py-2.5 px-4 font-semibold">Settled_Amount</th>
                <th className="py-2.5 px-4 font-semibold">Status_Label</th>
                <th className="py-2.5 px-4 font-semibold text-right">Mismatch_Gap_BDT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172238] bg-[#070b14] text-slate-300">
              {auditRecords.map(rec => {
                const orderAmt = rec.dbAmount === 'ABSENT' ? 0 : rec.dbAmount;
                const settledAmt = rec.settledAmount === 'ABSENT' ? 0 : rec.settledAmount;
                const gap = orderAmt - settledAmt;

                return (
                  <tr key={rec.id} className="hover:bg-[#10192e] transition-colors">
                    <td className="py-2.5 px-4 font-bold text-white">
                      <span className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700">
                        {rec.traceId}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {rec.dbAmount === 'ABSENT' ? (
                        <span className="text-rose-400 font-bold">ABSENT</span>
                      ) : (
                        formatBDT(rec.dbAmount)
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {rec.settledAmount === 'ABSENT' ? (
                        <span className="text-amber-400 font-bold">ABSENT</span>
                      ) : (
                        formatBDT(rec.settledAmount)
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        rec.status === 'MATCHED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold">
                      {gap === 0 ? (
                        <span className="text-emerald-400">0.00</span>
                      ) : (
                        <span className="text-rose-400">{gap.toFixed(2)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer with Download */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1F293D]">
          <span className="text-xs text-slate-400 font-mono">
            {batch.totalRows.toLocaleString()} Records Indexed • Checksum: SHA256:8f2a...
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
            >
              Close Preview
            </button>
            <button
              onClick={() => onDownload(batch)}
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Verified CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
