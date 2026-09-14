import React from 'react';
import { useApp } from '../context/AppContext';
import { Youtube, UploadCloud, CheckCircle2, Clock } from 'lucide-react';
import { playHudClick } from '../services/soundFx';

export const YouTubePipeline: React.FC = () => {
  const { currentProject, addToast } = useApp();

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
          YOUTUBE PUBLISHING PIPELINE
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Direct API distribution, scheduled premiere queue, and copyright clearance checks.
        </p>
      </div>

      <div className="mt-6 max-w-5xl mx-auto w-full bg-[#050b1c] border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Ready to Publish: {currentProject.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Estimated export duration: {currentProject.duration || '00:00:00'}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playHudClick();
              addToast('Channel Sync Ready', 'Connect YouTube OAuth in Settings or Export package directly.', 'info');
            }}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold tracking-wider cursor-pointer"
          >
            STAGE PUBLISHING QUEUE
          </button>
        </div>
      </div>
    </div>
  );
};
