/**
 * THE DEVIL'S EYE - ProgramMonitor
 * Large High-Precision NLE Program Viewport with Subtitle Engine, Transport Bar & Safe Guides.
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Grid, 
  Eye, 
  Volume2, 
  VolumeX, 
  Layers,
  Flag
} from 'lucide-react';
import { playHudClick } from '../../services/soundFx';
import { Clip, Subtitle } from '../../types';

interface ProgramMonitorProps {
  playheadSec: number;
  totalDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (sec: number) => void;
  activeVideoClips: Clip[];
  activeSubtitle: Subtitle | null;
  activeLut?: string;
  letterboxEnabled?: boolean;
}

export const ProgramMonitor: React.FC<ProgramMonitorProps> = ({
  playheadSec,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onSeek,
  activeVideoClips,
  activeSubtitle,
  activeLut = 'Teal & Orange',
  letterboxEnabled = true
}) => {
  const [showSafeGuides, setShowSafeGuides] = useState(false);
  const [playbackRes, setPlaybackRes] = useState<'Full' | '1/2' | '1/4'>('Full');
  const [isMuted, setIsMuted] = useState(false);

  // Topmost video clip determines the visual canvas image
  const topClip = activeVideoClips[0];
  const frameThumbnail = topClip?.thumbnail || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80';

  // Format timecode HH:MM:SS:FF
  const formatTimecode = (sec: number) => {
    const totalFrames = Math.floor(sec * 24);
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const f = totalFrames % 24;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#02050e] border-b border-cyan-500/20 overflow-hidden relative select-none">
      {/* Viewport Header Bar */}
      <div className="h-7 bg-[#040814] border-b border-cyan-500/15 px-3 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400 font-bold uppercase tracking-wider">PROGRAM MONITOR</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">SEQUENCE MASTER (V1-V4)</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSafeGuides(!showSafeGuides)}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded cursor-pointer ${
              showSafeGuides ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'hover:text-slate-200'
            }`}
            title="Action/Title Safe Guides"
          >
            <Grid className="w-3 h-3" />
            <span className="hidden sm:inline">SAFE GUIDES</span>
          </button>

          <div className="flex items-center space-x-1">
            <span className="text-slate-500">RES:</span>
            <select
              value={playbackRes}
              onChange={(e) => setPlaybackRes(e.target.value as any)}
              className="bg-[#09152a] text-cyan-300 border border-cyan-500/20 rounded px-1 py-0.2 text-[10px] cursor-pointer"
            >
              <option value="Full">Full (4K)</option>
              <option value="1/2">1/2 (1080p)</option>
              <option value="1/4">1/4 (720p)</option>
            </select>
          </div>

          <span className="text-emerald-400 font-mono hidden md:inline">24.00 FPS</span>
        </div>
      </div>

      {/* Center Video Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden p-2 min-h-0">
        <div className="relative w-full h-full max-h-[460px] aspect-video rounded overflow-hidden border border-cyan-500/30 bg-[#010308] shadow-[0_0_35px_rgba(0,0,0,0.8)] flex items-center justify-center">
          {/* Main Frame Layer with 3D LUT Simulation */}
          <img
            src={frameThumbnail}
            alt="Program Output"
            className={`w-full h-full object-cover transition-all duration-150 ${
              playbackRes === '1/4' ? 'blur-[0.5px]' : ''
            } ${
              activeLut === 'Noir Monochrome' ? 'grayscale contrast-125' :
              activeLut === 'Teal & Orange' ? 'contrast-110 saturate-125' :
              activeLut === 'Matrix Green' ? 'hue-rotate-60' :
              activeLut === 'Blade Runner Amber' ? 'sepia-50 saturate-150' : ''
            }`}
          />

          {/* Letterbox Bars (Cinematic 2.39:1 Anamorphic Scope) */}
          {letterboxEnabled && (
            <>
              <div className="absolute top-0 inset-x-0 h-[8%] bg-black z-20 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-[8%] bg-black z-20 pointer-events-none" />
            </>
          )}

          {/* Safe Margins Overlay (90% Action Safe / 80% Title Safe) */}
          {showSafeGuides && (
            <div className="absolute inset-0 pointer-events-none z-25">
              {/* 90% Action Safe */}
              <div className="absolute inset-[5%] border border-cyan-400/40 border-dashed" />
              {/* 80% Title Safe */}
              <div className="absolute inset-[10%] border border-amber-400/40 border-dashed" />
              {/* Crosshair Center */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none flex items-center justify-center">
                <div className="w-full h-[1px] bg-cyan-400/50" />
                <div className="h-full w-[1px] bg-cyan-400/50 absolute" />
              </div>
            </div>
          )}

          {/* Real-Time Subtitle Rendering Engine */}
          {activeSubtitle && (
            <div className="absolute bottom-[10%] inset-x-6 text-center z-30 pointer-events-none transition-all duration-150">
              <span className="inline-block bg-black/85 backdrop-blur-sm border border-cyan-400/40 text-amber-200 text-xs md:text-sm font-serif font-bold tracking-wide px-3.5 py-1.5 rounded shadow-2xl max-w-2xl leading-relaxed">
                "{activeSubtitle.text}"
              </span>
            </div>
          )}

          {/* Active Clip Info HUD Badge */}
          {topClip && (
            <div className="absolute top-2 left-2 bg-black/85 border border-cyan-500/40 px-2 py-0.5 rounded text-[9px] font-mono text-cyan-300 z-20 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="truncate max-w-[200px]">{topClip.title}</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400">{topClip.duration}s</span>
            </div>
          )}

          {/* Live Timecode Floating Badge */}
          <div className="absolute top-2 right-2 bg-black/85 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 font-bold z-20">
            {formatTimecode(playheadSec)}
          </div>
        </div>
      </div>

      {/* Program Transport Controls Bar */}
      <div className="h-10 bg-[#040814] border-t border-cyan-500/20 px-3 flex items-center justify-between shrink-0">
        {/* Left: Jump to Previous Edit / Step 1 frame */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSeek(Math.max(0, playheadSec - 5))}
            className="p-1.5 rounded text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 cursor-pointer"
            title="Jump to Previous Edit (Up Arrow)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSeek(Math.max(0, Number((playheadSec - 1/24).toFixed(3))))}
            className="p-1.5 rounded text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 cursor-pointer"
            title="Step 1 Frame Back (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Primary Play / Pause Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              playHudClick();
              onTogglePlay();
            }}
            className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_12px_#00f0ff] transition-all cursor-pointer"
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="text-xs font-mono font-bold text-cyan-300 bg-[#09152a] px-2 py-0.5 rounded border border-cyan-500/30">
            {formatTimecode(playheadSec)}
          </div>
        </div>

        {/* Right: Step 1 frame forward / Jump Next Edit / Mute toggle */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSeek(Math.min(totalDuration, Number((playheadSec + 1/24).toFixed(3))))}
            className="p-1.5 rounded text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 cursor-pointer"
            title="Step 1 Frame Forward (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSeek(Math.min(totalDuration, playheadSec + 5))}
            className="p-1.5 rounded text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 cursor-pointer"
            title="Jump to Next Edit (Down Arrow)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-cyan-500/20 mx-1" />

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded cursor-pointer ${
              isMuted ? 'text-rose-400' : 'text-slate-400 hover:text-cyan-300'
            }`}
            title="Mute Master Preview"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
