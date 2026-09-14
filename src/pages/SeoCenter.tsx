import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Sparkles, Copy, Check } from 'lucide-react';
import { playHudClick } from '../services/soundFx';

export const SeoCenter: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const events = currentProject.events || [];

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
          SEO & METADATA PACKAGING
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Algorithmic YouTube title variants, timestamps, description, and chapter markers.
        </p>
      </div>

      <div className="space-y-6 mt-6 max-w-5xl mx-auto w-full">
        {/* Title Variants */}
        <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
          <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-3">
            RECOMMENDED TITLE VARIANTS
          </h3>
          <div className="space-y-2">
            {[
              `${currentProject.title} Ending Explained: The Truth Finally Revealed`,
              `Why You Completely Misunderstood ${currentProject.title}`,
              `10 Hidden Details in ${currentProject.title} That Change Everything`
            ].map((title, i) => (
              <div key={i} className="p-3 bg-[#030612] border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                <span className="text-slate-200 font-medium">{title}</span>
                <button
                  onClick={() => {
                    playHudClick();
                    navigator.clipboard.writeText(title);
                    addToast('Copied', 'Title copied to clipboard', 'info');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-300 text-[10px] font-mono cursor-pointer"
                >
                  COPY
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chapters */}
        <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
          <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-3">
            YOUTUBE TIMESTAMP CHAPTERS
          </h3>
          <div className="p-3 bg-[#030612] border border-slate-800 rounded-lg font-mono text-xs text-cyan-400/90 leading-relaxed">
            <div>00:00 - Introduction & The Core Premise</div>
            {events.slice(0, 6).map((ev, i) => (
              <div key={i}>{ev.timestamp} - {ev.title}</div>
            ))}
            <div>{currentProject.duration || '20:00'} - Final Verdict & Summary</div>
          </div>
        </div>
      </div>
    </div>
  );
};
