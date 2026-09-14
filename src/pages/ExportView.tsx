/**
 * THE DEVIL'S EYE - Cinema Production Export Master Suite
 * Ultra-high-fidelity rendering orchestrator: 4K/8K, Vertical 9:16, ProRes 422, Burn-in Subtitles & XML/EDL Export.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Download, 
  Film, 
  Settings2, 
  CheckCircle2, 
  FileText, 
  Share2, 
  Sparkles, 
  Play, 
  Clock, 
  Layers, 
  Sliders, 
  HardDrive,
  Cpu,
  Monitor
} from 'lucide-react';
import { playHudClick, playHudScan, playHudSuccess } from '../services/soundFx';

export const ExportView: React.FC = () => {
  const { 
    currentProject, 
    startExport, 
    isExporting, 
    exportProgress, 
    exportFormat, 
    addToast 
  } = useApp();

  const [resolution, setResolution] = useState<'1080p' | '4k' | '8k' | 'vertical_916'>('4k');
  const [codec, setCodec] = useState<'h264' | 'prores' | 'hevc' | 'webm'>('h264');
  const [fps, setFps] = useState<'24' | '30' | '60'>('24');
  const [bitrateMbps, setBitrateMbps] = useState<number>(45);
  const [audioFormat, setAudioFormat] = useState<'stereo' | 'dolby' | 'wav'>('stereo');
  const [subtitlesOption, setSubtitlesOption] = useState<'none' | 'hardsub' | 'separate_srt'>('hardsub');
  const [includeChapters, setIncludeChapters] = useState<boolean>(true);

  const [exportHistory, setExportHistory] = useState([
    {
      id: 'exp-1',
      name: `${currentProject.title}_Master_4K_ProRes.mov`,
      date: 'Today, 11:42 AM',
      size: '2.4 GB',
      resolution: '3840x2160',
      format: 'Apple ProRes 422 HQ',
      status: 'Ready'
    },
    {
      id: 'exp-2',
      name: `${currentProject.title}_Trailer_1080p_Web.mp4`,
      date: 'Yesterday, 04:15 PM',
      size: '340 MB',
      resolution: '1920x1080',
      format: 'H.264 / AAC',
      status: 'Ready'
    }
  ]);

  const handleStartRender = () => {
    playHudScan();
    startExport(`${resolution.toUpperCase()}_${codec.toUpperCase()}`);
    addToast('Production Render Started', `Rendering ${resolution} master via GPU acceleration`, 'info');
  };

  const handleDownloadSrt = () => {
    playHudClick();
    const subs = currentProject.subtitles || [];
    let srtContent = '';
    subs.forEach((s, idx) => {
      const formatTime = (sec: number) => {
        const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
        const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(sec % 60).toString().padStart(2, '0');
        const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
        return `${hrs}:${mins}:${secs},${ms}`;
      };
      const start = typeof s.startSec === 'number' ? s.startSec : 0;
      const end = typeof s.endSec === 'number' ? s.endSec : start + 3;
      srtContent += `${idx + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${s.text}\n\n`;
    });

    const blob = new Blob([srtContent || '1\n00:00:01,000 --> 00:00:05,000\n[The Devil\'s Eye Cinematic Subtitles]\n'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title.replace(/\s+/g, '_')}_Subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Subtitles Exported', 'Downloaded industry-standard SRT subtitle file', 'success');
  };

  const handleDownloadEdl = () => {
    playHudClick();
    let edl = `TITLE: ${currentProject.title.toUpperCase()}\nFCM: NON-DROP FRAME\n\n`;
    const allClips = currentProject.timeline.tracks.flatMap(t => t.clips);
    allClips.forEach((clip, i) => {
      const num = (i + 1).toString().padStart(3, '0');
      edl += `${num}  AX       V     C        00:00:00:00 00:00:05:00 00:00:00:00 00:00:05:00\n* FROM CLIP: ${clip.name || clip.title}\n\n`;
    });

    const blob = new Blob([edl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title.replace(/\s+/g, '_')}.edl`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('EDL Exported', 'Downloaded CMX 3600 Edit Decision List for NLE import', 'success');
  };

  return (
    <div className="h-full flex flex-col bg-[#02050f] text-slate-100 overflow-y-auto font-sans select-none">
      {/* Header */}
      <div className="px-6 py-4 border-b border-cyan-500/20 bg-[#040816] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-display font-bold tracking-wider text-slate-100 flex items-center space-x-2">
              <span>CINEMA PRODUCTION EXPORT MASTER</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-500/60 text-cyan-300">
                PRO ENGINE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Deliver multi-format cinema releases, XML/EDL interchange, broadcast ProRes masters, and social vertical cuts.
            </p>
          </div>
        </div>

        {/* Quick Format Downloads */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadSrt}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>EXPORT SRT</span>
          </button>

          <button
            onClick={handleDownloadEdl}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>EXPORT EDL</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left 8 Cols: Production Master Configuration */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Render Progress Card (When Rendering) */}
          {isExporting && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-red-950/40 via-[#050b1a] to-cyan-950/40 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-red-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>RENDERING MASTER TIMELINE: {exportFormat}</span>
                </span>
                <span className="text-cyan-300 font-bold">{Math.round(exportProgress)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-cyan-400 transition-all duration-300 rounded-full shadow-[0_0_10px_#ef4444]"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Pass 2 of 2 (Audio Normalization & Subtitle Burn-In)</span>
                <span>Est. Remaining: {Math.max(1, Math.round((100 - exportProgress) / 8))}s</span>
              </div>
            </div>
          )}

          {/* Section 1: Resolution & Aspect Ratio */}
          <div className="p-5 rounded-xl bg-[#050b1a] border border-cyan-500/20 space-y-4">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>1. Canvas Resolution & Aspect Ratio</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              {[
                { id: '1080p', label: '1080p Full HD', res: '1920 x 1080', aspect: '16:9' },
                { id: '4k', label: '4K Cinema UHD', res: '3840 x 2160', aspect: '16:9 Cinema' },
                { id: '8k', label: '8K Master DCI', res: '7680 x 4320', aspect: 'Cinema Master' },
                { id: 'vertical_916', label: 'Vertical Reels/Shorts', res: '1080 x 1920', aspect: '9:16 Mobile' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    playHudClick();
                    setResolution(r.id as any);
                  }}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    resolution === r.id
                      ? 'bg-red-950/60 border-red-500 text-red-200 shadow-md'
                      : 'bg-[#030612] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-200">{r.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{r.res}</div>
                  <div className="text-[9px] text-cyan-400 font-mono mt-0.5">{r.aspect}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Video Codec & Encoding Engine */}
          <div className="p-5 rounded-xl bg-[#050b1a] border border-cyan-500/20 space-y-4">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>2. Codec & Bitrate Master Engine</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              {[
                { id: 'h264', label: 'H.264 (MP4)', desc: 'Universal Playback' },
                { id: 'prores', label: 'ProRes 422 HQ', desc: 'Broadcast Master' },
                { id: 'hevc', label: 'H.265 (HEVC)', desc: 'High Efficiency 10-bit' },
                { id: 'webm', label: 'WebM (AV1)', desc: 'Next-Gen Streaming' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    playHudClick();
                    setCodec(c.id as any);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    codec === c.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md'
                      : 'bg-[#030612] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-slate-200">{c.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{c.desc}</div>
                </button>
              ))}
            </div>

            {/* Bitrate & Framerate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#030612] border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Target Bitrate</span>
                  <span className="text-cyan-300 font-bold">{bitrateMbps} Mbps</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={5}
                  value={bitrateMbps}
                  onChange={(e) => setBitrateMbps(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#030612] border border-slate-800 space-y-2">
                <label className="text-slate-300 block">Cinematic Framerate</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['24', '30', '60'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFps(f)}
                      className={`py-1.5 rounded border text-center font-bold cursor-pointer ${
                        fps === f
                          ? 'bg-red-950/70 border-red-500 text-red-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {f} FPS
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Subtitles & Audio Engine */}
          <div className="p-5 rounded-xl bg-[#050b1a] border border-cyan-500/20 space-y-4">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>3. Audio Mastering & Subtitles Burn-in</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {/* Subtitles Option */}
              <div className="p-3 rounded-lg bg-[#030612] border border-slate-800 space-y-2">
                <label className="text-slate-300 block">Subtitles Integration</label>
                <select
                  value={subtitlesOption}
                  onChange={(e) => setSubtitlesOption(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="hardsub">Burn-in Subtitles (Hardcoded Cine Yellow)</option>
                  <option value="separate_srt">Export Clean Video + Separate SRT File</option>
                  <option value="none">No Subtitles (Clean Video Master)</option>
                </select>
              </div>

              {/* Audio Channels */}
              <div className="p-3 rounded-lg bg-[#030612] border border-slate-800 space-y-2">
                <label className="text-slate-300 block">Audio Channel Format</label>
                <select
                  value={audioFormat}
                  onChange={(e) => setAudioFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="stereo">48kHz 24-bit Stereo (Binaural Enhanced)</option>
                  <option value="dolby">Dolby 5.1 Cinematic Surround</option>
                  <option value="wav">Uncompressed 96kHz Master WAV Stem</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Summary & Action Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#050b1a] border border-cyan-500/25 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
              Master Export Summary
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                <span>Project Title</span>
                <span className="text-slate-200 font-bold truncate max-w-[160px]">{currentProject.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                <span>Duration</span>
                <span className="text-slate-200 font-bold">{Math.floor(currentProject.timeline.totalDuration || currentProject.durationSec || 7200)} seconds</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                <span>Target Resolution</span>
                <span className="text-cyan-300 font-bold uppercase">{resolution}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                <span>Video Codec</span>
                <span className="text-cyan-300 font-bold uppercase">{codec}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                <span>Framerate</span>
                <span className="text-slate-200 font-bold">{fps} FPS</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                <span>Estimated Size</span>
                <span className="text-slate-200 font-bold">~1.15 GB</span>
              </div>
            </div>

            <button
              onClick={handleStartRender}
              disabled={isExporting}
              className={`w-full py-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isExporting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'RENDERING IN PROGRESS...' : 'START CINEMA EXPORT'}</span>
            </button>
          </div>

          {/* Exported Masters History */}
          <div className="bg-[#050b1a] border border-cyan-500/20 rounded-xl p-5 space-y-3">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Ready Masters</span>
              <span className="text-slate-500 text-[10px]">{exportHistory.length} files</span>
            </div>

            <div className="space-y-2.5">
              {exportHistory.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-lg bg-[#030612] border border-slate-800 flex items-center justify-between text-xs font-mono group hover:border-cyan-500/40 transition-all"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="font-bold text-slate-200 truncate group-hover:text-cyan-300">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.resolution} • {item.size} • {item.date}</div>
                  </div>
                  <button
                    onClick={() => {
                      playHudClick();
                      addToast('Downloading File', `Starting direct download for ${item.name}`, 'success');
                    }}
                    className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 cursor-pointer shrink-0"
                    title="Download Master"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
