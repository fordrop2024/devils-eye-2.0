import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Mic, Clock, Volume2, ArrowRight } from 'lucide-react';
import { playHudClick } from '../services/soundFx';

export const ScriptStudio: React.FC = () => {
  const { currentProject, navigateTo } = useApp();
  const segments = currentProject.script?.segments || [];

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <div>
          <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
            SCRIPT STUDIO // NARRATIVE EXPLAINER TELEPROMPTER
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Two-way linked narration segments synchronized with source movie scene timestamps.
          </p>
        </div>
        <button
          onClick={() => {
            playHudClick();
            navigateTo('voice-lab');
          }}
          className="px-3.5 py-1.5 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold tracking-wider flex items-center space-x-1.5 cursor-pointer"
        >
          <span>TRANSFER TO VOICE LAB</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-6 max-w-5xl mx-auto w-full space-y-4">
        {segments.length === 0 ? (
          <div className="p-8 bg-[#050b1c] border border-cyan-500/20 rounded-xl text-center">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">NO SCRIPT GENERATED YET</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Synthesize explainer beats in Story Engine or upload a movie in Command Center to generate full synchronized narration.
            </p>
          </div>
        ) : (
          segments.map((seg, idx) => (
            <div key={seg.id || idx} className="bg-[#050b1c] border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">SEGMENT #{seg.segmentIndex ?? (idx + 1)}</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {seg.startTime || seg.startTarget || '00:00:00'} - {seg.endTime || seg.endTarget || '00:01:00'} ({seg.durationSec ?? seg.targetDurationSec ?? 60}s)
                </span>
              </div>
              <p className="text-sm text-slate-200 mt-2 font-medium leading-relaxed">
                {seg.narrationText || seg.narration?.[0]?.text || seg.text || 'Dynamic scene narrative segment.'}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Visual: {seg.suggestedVisual || seg.visualNotes || 'Source footage'}</span>
                <span className="text-amber-400">Tone: {seg.emotionTone || seg.emotion || 'Dramatic'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
