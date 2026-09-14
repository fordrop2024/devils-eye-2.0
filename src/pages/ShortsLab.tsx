import React from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Sparkles, Play, Flame } from 'lucide-react';
import { playHudClick } from '../services/soundFx';

export const ShortsLab: React.FC = () => {
  const { currentProject } = useApp();
  const twists = currentProject.twists || [];
  const actionMoments = currentProject.actionSequences || [];

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
          SHORTS & REELS LAB // 9:16 VERTICAL AUTO-EXTRACTION
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Transforms high-intensity twists and action climaxes from Movie Intelligence into viral vertical clips.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 max-w-5xl mx-auto w-full">
        {twists.slice(0, 3).map((twist, i) => (
          <div key={twist.id || i} className="bg-[#050b1c] border border-red-500/30 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-red-400">
                <span className="flex items-center gap-1 font-bold">
                  <Flame className="w-3.5 h-3.5" /> 9:16 VIRAL CANDIDATE
                </span>
                <span>{twist.timestamp}</span>
              </div>
              <div className="w-full aspect-[9/16] max-h-64 bg-slate-900 rounded-lg my-3 border border-slate-800 flex items-center justify-center">
                <Play className="w-8 h-8 text-red-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">{twist.title}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{twist.reveal}</p>
            </div>
            <button
              onClick={playHudClick}
              className="mt-4 w-full py-2 rounded bg-red-600/20 border border-red-500/50 text-red-300 hover:bg-red-600/30 text-xs font-mono font-bold tracking-wider cursor-pointer"
            >
              RENDER VERTICAL SHORT
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
