import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Plus, Clock } from 'lucide-react';
import { playHudClick } from '../services/soundFx';

export const ContentPlanner: React.FC = () => {
  const { currentProject } = useApp();

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
          CONTENT RELEASE PLANNER
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Schedule production deadlines, YouTube upload slots, and promotional shorts campaigns.
        </p>
      </div>

      <div className="mt-6 max-w-5xl mx-auto w-full bg-[#050b1c] border border-cyan-500/20 rounded-xl p-6">
        <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-4">
          SCHEDULED CAMPAIGN
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-[#030612] border border-slate-800 rounded-lg flex justify-between items-center text-xs">
            <div>
              <span className="text-cyan-400 font-mono font-bold">FRIDAY 18:00 UTC</span>
              <div className="text-slate-200 font-bold mt-0.5">{currentProject.title} Main Explainer Premiere</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
              CONFIRMED
            </span>
          </div>
          <div className="p-3 bg-[#030612] border border-slate-800 rounded-lg flex justify-between items-center text-xs">
            <div>
              <span className="text-cyan-400 font-mono font-bold">SATURDAY 14:00 UTC</span>
              <div className="text-slate-200 font-bold mt-0.5">Vertical Shorts #1: The Shocking Twist</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
              SCHEDULED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
