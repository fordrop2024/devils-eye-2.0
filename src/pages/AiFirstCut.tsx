import React from 'react';
import { useApp } from '../context/AppContext';
import { Clapperboard, Sparkles, Play, Sliders, CheckCircle2 } from 'lucide-react';
import { playHudClick } from '../services/soundFx';

export const AiFirstCut: React.FC = () => {
  const { 
    currentProject, 
    runAiFirstCut, 
    isFirstCutRunning, 
    firstCutStage, 
    firstCutProgress, 
    navigateTo 
  } = useApp();

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <div>
          <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
            AI FIRST CUT // MULTITRACK TIMELINE COMPOSITOR
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated visual conform aligning narration, source B-roll, subtitles, and SFX stems.
          </p>
        </div>
        <button
          onClick={() => {
            playHudClick();
            navigateTo('pro-editor');
          }}
          className="px-3.5 py-1.5 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold tracking-wider cursor-pointer"
        >
          OPEN PRO EDITOR
        </button>
      </div>

      <div className="mt-8 max-w-2xl mx-auto w-full text-center bg-[#050b1c] border border-cyan-500/20 rounded-xl p-8 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-400/60 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <Clapperboard className="w-8 h-8 text-cyan-300" />
        </div>

        <h3 className="text-base font-bold text-slate-100 mt-4">
          AUTOMATIC MULTITRACK COMPOSITION
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Analyzed scenes from Movie Intelligence are matched frame-accurately with narration audio stems across 6 synchronized tracks.
        </p>

        {isFirstCutRunning ? (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-mono text-cyan-300 mb-2">
              <span>{firstCutStage}</span>
              <span>{firstCutProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${firstCutProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              playHudClick();
              runAiFirstCut();
            }}
            className="mt-6 px-6 py-2.5 rounded bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-xs font-bold tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center space-x-2 mx-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>EXECUTE AI FIRST CUT PIPELINE</span>
          </button>
        )}
      </div>
    </div>
  );
};
