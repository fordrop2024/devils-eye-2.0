import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subtitles, Download, Sparkles, Sliders, Check } from 'lucide-react';
import { playHudClick } from '../services/soundFx';
import { exportSubtitlesAsSrt, exportSubtitlesAsVtt, downloadFile } from '../services/subtitleService';

export const SubtitleStudio: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const [stylePreset, setStylePreset] = useState<'cyber_cyan' | 'cinema_yellow' | 'karaoke_glow'>('cyber_cyan');
  const subtitles = currentProject.subtitles || [];

  const handleExportSrt = () => {
    playHudClick();
    const srt = exportSubtitlesAsSrt(subtitles);
    downloadFile(srt, `${currentProject.title || 'subtitles'}.srt`);
    addToast('SRT Exported', 'Subtitles downloaded successfully.', 'success');
  };

  const handleExportVtt = () => {
    playHudClick();
    const vtt = exportSubtitlesAsVtt(subtitles);
    downloadFile(vtt, `${currentProject.title || 'subtitles'}.vtt`, 'text/vtt');
    addToast('WebVTT Exported', 'Subtitles downloaded successfully.', 'success');
  };

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 max-w-5xl mx-auto w-full">
        <div>
          <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider">
            SUBTITLE STUDIO // DYNAMIC KINETIC CAPTIONS
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-generate and style multi-language subtitles derived from movie intelligence and voice segments.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportSrt}
            className="px-3 py-1.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT .SRT</span>
          </button>
          <button
            onClick={handleExportVtt}
            className="px-3 py-1.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT .VTT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 max-w-5xl mx-auto w-full">
        {/* Style Controls */}
        <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
            CAPTION AESTHETICS
          </h3>
          <div className="space-y-2">
            {[
              { id: 'cyber_cyan', label: 'Cyber Cyan Glow', desc: 'Futuristic high-contrast' },
              { id: 'cinema_yellow', label: 'Cinema Yellow', desc: 'Classic movie theater font' },
              { id: 'karaoke_glow', label: 'Karaoke Word Pulse', desc: 'Viral social media shorts style' }
            ].map(preset => (
              <div
                key={preset.id}
                onClick={() => setStylePreset(preset.id as any)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  stylePreset === preset.id
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{preset.label}</div>
                <div className="text-[10px] text-slate-500">{preset.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subtitle Cue List */}
        <div className="md:col-span-2 bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
          <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-4">
            SUBTITLE CUE LIST ({subtitles.length} CUES)
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {subtitles.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No subtitle cues loaded yet. Subtitles generate automatically during AI First Cut or script narration.
              </p>
            ) : (
              subtitles.map(sub => (
                <div key={sub.id} className="p-2.5 rounded bg-[#030612] border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-200 font-medium">{sub.text}</span>
                  <span className="text-[11px] font-mono text-cyan-400 shrink-0 ml-3">{sub.startTime}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
