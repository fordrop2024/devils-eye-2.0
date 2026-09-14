import React from 'react';
import { useApp } from '../context/AppContext';
import { Image, Sparkles, Download, Eye } from 'lucide-react';
import { playHudClick } from '../services/soundFx';

export const ThumbnailLab: React.FC = () => {
  const { currentProject } = useApp();

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
          THUMBNAIL LAB // HIGH-CTR VISUAL SYNTHESIS
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Extracts climactic 4K source video stills and pairs them with high-CTR curiosity typography.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-5xl mx-auto w-full">
        {[
          { title: 'The Shocking Climax Reveal', hook: 'DID YOU CATCH THIS DETAIL?', ctr: 94 },
          { title: 'The Real Meaning Behind the Ending', hook: 'THE SECRET NO ONE NOTICED', ctr: 89 }
        ].map((th, idx) => (
          <div key={idx} className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-4 flex flex-col justify-between">
            <div className="w-full aspect-video bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden group">
              <span className="text-sm font-display font-black text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] px-4 text-center">
                {th.hook}
              </span>
            </div>
            <div className="mt-4 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-bold">{th.title}</span>
              <span className="text-emerald-400 font-bold">EST. CTR: {th.ctr}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
