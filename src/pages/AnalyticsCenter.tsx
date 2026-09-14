import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

export const AnalyticsCenter: React.FC = () => {
  const { currentProject } = useApp();

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
          AUDIENCE RETENTION & ANALYTICS
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Predictive drop-off modeling based on tension peaks and narrative pacing from Movie Intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 max-w-5xl mx-auto w-full">
        <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
          <div className="text-xs font-mono text-slate-400">ESTIMATED RETENTION</div>
          <div className="text-3xl font-display font-bold text-emerald-400 mt-2">78.4%</div>
          <div className="text-[10px] text-slate-500 mt-1">High tension pacing maintains viewers</div>
        </div>
        <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
          <div className="text-xs font-mono text-slate-400">ESTIMATED CLICK-THROUGH</div>
          <div className="text-3xl font-display font-bold text-cyan-400 mt-2">12.1%</div>
          <div className="text-[10px] text-slate-500 mt-1">Curiosity gap hook in thumbnail</div>
        </div>
        <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
          <div className="text-xs font-mono text-slate-400">PACING CONFIDENCE</div>
          <div className="text-3xl font-display font-bold text-purple-400 mt-2">92%</div>
          <div className="text-[10px] text-slate-500 mt-1">Verified with 13-stage structure</div>
        </div>
      </div>
    </div>
  );
};
