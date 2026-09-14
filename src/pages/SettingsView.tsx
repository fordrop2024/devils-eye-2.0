import React from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Key, Cpu, Volume2, Shield } from 'lucide-react';
import { playHudClick } from '../services/soundFx';

export const SettingsView: React.FC = () => {
  const { 
    aiCoreVersion, 
    soundMuted, 
    toggleSound, 
    user, 
    logout 
  } = useApp();

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
          SETTINGS & AI CORE CONFIGURATION
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          System telemetry, audio feedback preferences, and multimodal engine status.
        </p>
      </div>

      <div className="space-y-6 mt-6 max-w-5xl mx-auto w-full">
        <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
          <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-4">
            AI CORE & NEURAL ENGINE
          </h3>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center p-3 rounded bg-[#030612] border border-slate-800">
              <span className="text-slate-400">Core Engine Model</span>
              <span className="text-cyan-300 font-bold">{aiCoreVersion}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded bg-[#030612] border border-slate-800">
              <span className="text-slate-400">Audio Feedback Effects</span>
              <button
                onClick={() => {
                  playHudClick();
                  toggleSound();
                }}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  soundMuted ? 'bg-slate-800 text-slate-400' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                }`}
              >
                {soundMuted ? 'MUTED' : 'ENABLED'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
          <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-4">
            USER CLEARANCE
          </h3>
          <div className="flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-slate-200">{user?.name || 'Guest Director'}</div>
              <div className="text-[11px] font-mono text-cyan-400">{user?.email || 'cinema.director@devils-eye.ai'}</div>
            </div>
            <button
              onClick={() => {
                playHudClick();
                logout();
              }}
              className="px-3.5 py-1.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 font-mono text-xs cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
