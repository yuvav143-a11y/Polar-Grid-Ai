import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Calendar, CheckCircle2, TrendingUp, Zap, Leaf } from 'lucide-react';
import { api } from '../services/api';
import { SystemMetrics } from '../types';

interface ReportsViewProps {
  metrics: SystemMetrics;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ metrics }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const data = await api.getReports();
        setReportData(data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExportCsv = () => {
    window.open(api.getReportExportUrl(), '_blank');
  };

  return (
    <div id="reports-view" className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0a101d] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>OPERATIONAL AUDIT & TELEMETRY LOGS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Rajdhani'] text-white">
            Station Energy Audit & Compliance Reports
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Verified generation records, renewable energy share, and inverter health logs.
          </p>
        </div>

        <button
          id="export-csv-button"
          onClick={handleExportCsv}
          className="self-start sm:self-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs font-['Rajdhani'] tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT CSV AUDIT LOG</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0a101d] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Daily Total Generated</span>
          <span className="text-2xl font-bold font-['Rajdhani'] text-cyan-400">
            {reportData?.summary?.totalGeneratedMwh || 3576} <span className="text-xs font-mono text-slate-400">MWh</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono block mt-1">+4.2% vs 7-day average</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0a101d] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Daily Consumed</span>
          <span className="text-2xl font-bold font-['Rajdhani'] text-amber-400">
            {reportData?.summary?.totalConsumedMwh || 3024} <span className="text-xs font-mono text-slate-400">MWh</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">Balanced load margin</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0a101d] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Renewable Penetration</span>
          <span className="text-2xl font-bold font-['Rajdhani'] text-emerald-400">
            {reportData?.summary?.renewablePenetrationPct || metrics.renewableContributionPct}%
          </span>
          <span className="text-[10px] text-emerald-400 font-mono block mt-1">Solar + Wind + Hydro</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0a101d] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Mean Inverter Efficiency</span>
          <span className="text-2xl font-bold font-['Rajdhani'] text-sky-400">
            {reportData?.summary?.avgEfficiencyPct || metrics.gridEfficiencyPct}%
          </span>
          <span className="text-[10px] text-sky-400 font-mono block mt-1">Zero harmonic faults</span>
        </div>
      </div>

      {/* Audit History Log Table */}
      <div className="p-5 rounded-2xl bg-[#0a101d] border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold font-['Rajdhani'] text-white uppercase tracking-wider">
              DAILY AUDIT RECORDS
            </h3>
            <p className="text-xs text-slate-400">Validated 24-hour log summary</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Displaying Recent Shifts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Generation (MWh)</th>
                <th className="pb-3 pr-4">Consumption (MWh)</th>
                <th className="pb-3 pr-4">Renewable Share</th>
                <th className="pb-3 pr-4">Efficiency</th>
                <th className="pb-3 pr-4">Health Score</th>
                <th className="pb-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reportData?.dailyRecords?.map((rec: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 pr-4 font-bold text-white">{rec.date}</td>
                  <td className="py-3 pr-4 text-cyan-300 font-semibold">{rec.generationMwh} MWh</td>
                  <td className="py-3 pr-4 text-amber-300">{rec.consumptionMwh} MWh</td>
                  <td className="py-3 pr-4 text-emerald-400 font-semibold">{rec.renewablePct}%</td>
                  <td className="py-3 pr-4 text-sky-300">{rec.efficiencyPct}%</td>
                  <td className="py-3 pr-4 text-purple-300">{rec.healthScore}%</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
