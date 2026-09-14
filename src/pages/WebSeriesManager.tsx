import React from 'react';
import { useApp } from '../context/AppContext';
import { Layers, Plus, Film } from 'lucide-react';

export const WebSeriesManager: React.FC = () => {
  const { currentProject } = useApp();

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
          MULTI-EPISODE WEB SERIES ARCHITECTURE
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Orchestrate season-spanning character arcs, recurring motifs, and multi-part explainer series.
        </p>
      </div>

      <div className="mt-6 max-w-5xl mx-auto w-full bg-[#050b1c] border border-cyan-500/20 rounded-xl p-6 text-center">
        <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-300">SERIES EPISODE WORKSPACE</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Convert standalone movies into multi-episode episodic explainers or manage multi-season web series with unified voice consistency.
        </p>
      </div>
    </div>
  );
};
