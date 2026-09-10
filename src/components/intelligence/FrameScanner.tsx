/**
 * THE DEVIL'S EYE - Visual Frame Scanner
 * Computer Vision & Neural Reticle Frame Analyzer.
 * Real-time bounding boxes, facial confidence, shot type classification.
 */

import React, { useState, useEffect } from 'react';
import { ScannedFrame } from '../../types';
import { 
  Scan, 
  Eye, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Tag, 
  Sparkles, 
  Sliders, 
  User, 
  Box,
  Layers
} from 'lucide-react';
import { playHudClick, playHudScan } from '../../services/soundFx';

interface FrameScannerProps {
  frames: ScannedFrame[];
  onSeekScene?: (sceneNumber: number) => void;
}

export const FrameScanner: React.FC<FrameScannerProps> = ({
  frames,
  onSeekScene,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBoxes, setShowBoxes] = useState(true);

  const activeFrame = frames[currentIndex] || {
    id: 'f-empty',
    timestamp: '00:00:00',
    timeSec: 0,
    sceneNumber: 1,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    detectedPeople: [{ name: 'Dom Cobb', confidence: 98, box: { x: 30, y: 15, w: 40, h: 70 } }],
    detectedObjects: [{ name: 'Brass Spinning Top', confidence: 96, box: { x: 55, y: 72, w: 12, h: 14 } }],
    visualTags: ['Close-Up', 'Low Key Noir', 'Shallow Depth of Field'],
    dominantColor: '#0a192f',
    lighting: 'Chiaroscuro Side Key',
    shotType: 'Close-Up' as const,
  };

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && frames.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % frames.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  const handleSelectFrame = (idx: number) => {
    playHudClick();
    setCurrentIndex(idx);
    if (onSeekScene && frames[idx]) {
      onSeekScene(frames[idx].sceneNumber);
    }
  };

  const togglePlayback = () => {
    playHudClick();
    setIsPlaying(!isPlaying);
  };

  const stepNext = () => {
    playHudClick();
    setCurrentIndex((prev) => (prev + 1) % frames.length);
  };

  const stepPrev = () => {
    playHudClick();
    setCurrentIndex((prev) => (prev - 1 + frames.length) % frames.length);
  };

  return (
    <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners space-y-4 bg-[#030816]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300">
            <Scan className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold text-slate-100 uppercase tracking-wider">
              MULTIMODAL FRAME SCANNER
            </h3>
            <p className="text-[11px] font-mono text-cyan-400/70">
              FRAME-BY-FRAME OPTICAL RECOGNITION & BOUNDING RETICLES
            </p>
          </div>
        </div>

        {/* Reticle Toggle */}
        <button
          onClick={() => {
            playHudClick();
            setShowBoxes(!showBoxes);
          }}
          className={`px-2.5 py-1 rounded text-xs font-tech flex items-center space-x-1.5 border transition-colors cursor-pointer ${
            showBoxes
              ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
              : 'bg-slate-900 border-slate-700 text-slate-500'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>{showBoxes ? 'HIDE RETICLES' : 'SHOW RETICLES'}</span>
        </button>
      </div>

      {/* Main Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Frame Canvas (Col 8) */}
        <div className="lg:col-span-8 flex flex-col space-y-2">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-cyan-500/40 bg-black group shadow-[0_0_25px_rgba(0,240,255,0.15)]">
            <img
              src={activeFrame.imageUrl}
              alt={`Frame ${activeFrame.timestamp}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Futuristic Scanline Overlay */}
            <div className="absolute inset-0 bg-scanline pointer-events-none opacity-40" />

            {/* Corner HUD Reticles */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-black/70 px-2 py-0.5 rounded border border-cyan-500/30">
              SCENE #{activeFrame.sceneNumber} • TIMECODE: {activeFrame.timestamp}
            </div>

            <div className="absolute top-2 right-2 text-[10px] font-mono text-cyan-400 bg-black/70 px-2 py-0.5 rounded border border-cyan-500/30">
              SHOT: {activeFrame.shotType}
            </div>

            {/* Detected People & Object Bounding Boxes */}
            {showBoxes && (
              <>
                {activeFrame.detectedPeople.map((p, idx) => (
                  <div
                    key={`p-${idx}`}
                    className="absolute border-2 border-cyan-400 bg-cyan-500/10 transition-all rounded pointer-events-none"
                    style={{
                      left: `${p.box.x}%`,
                      top: `${p.box.y}%`,
                      width: `${p.box.w}%`,
                      height: `${p.box.h}%`,
                    }}
                  >
                    <div className="absolute -top-5 left-0 bg-cyan-950/90 text-cyan-200 border border-cyan-400 text-[9px] font-mono px-1 rounded whitespace-nowrap">
                      PERSON: {p.name} [{p.confidence}%]
                    </div>
                  </div>
                ))}

                {activeFrame.detectedObjects.map((obj, idx) => (
                  <div
                    key={`obj-${idx}`}
                    className="absolute border-2 border-amber-400 bg-amber-500/10 transition-all rounded pointer-events-none"
                    style={{
                      left: `${obj.box.x}%`,
                      top: `${obj.box.y}%`,
                      width: `${obj.box.w}%`,
                      height: `${obj.box.h}%`,
                    }}
                  >
                    <div className="absolute -bottom-5 left-0 bg-amber-950/90 text-amber-200 border border-amber-400 text-[9px] font-mono px-1 rounded whitespace-nowrap">
                      OBJECT: {obj.name} [{obj.confidence}%]
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-cyan-300 bg-black/80 p-1.5 rounded border border-cyan-500/30 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>NEURAL VECTOR: OPTIC TENSOR 4K</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>LIGHTING: {activeFrame.lighting}</span>
                <span
                  className="w-3 h-3 rounded-full border border-white/40"
                  style={{ backgroundColor: activeFrame.dominantColor }}
                  title={`Color: ${activeFrame.dominantColor}`}
                />
              </div>
            </div>
          </div>

          {/* Scrubber Controls */}
          <div className="flex items-center justify-between p-2 rounded bg-[#02050f] border border-cyan-500/20 text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={stepPrev}
                className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 cursor-pointer"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={togglePlayback}
                className="px-3 py-1.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-200 font-tech font-bold flex items-center space-x-1.5 cursor-pointer shadow-[0_0_8px_rgba(0,240,255,0.3)]"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'PAUSE SCAN' : 'PLAY SCAN'}</span>
              </button>

              <button
                onClick={stepNext}
                className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              FRAME {currentIndex + 1} OF {frames.length}
            </div>
          </div>
        </div>

        {/* Optical Telemetry Breakdown (Col 4) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {/* Detected People */}
          <div className="p-3 rounded bg-[#02050f] border border-cyan-500/20 space-y-2">
            <div className="text-[11px] font-tech font-bold uppercase text-cyan-300 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Identified Entities ({activeFrame.detectedPeople.length})</span>
            </div>
            <div className="space-y-1.5">
              {activeFrame.detectedPeople.map((p, idx) => (
                <div key={idx} className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
                  <span className="font-tech text-slate-200">{p.name}</span>
                  <span className="font-mono text-cyan-400 text-[10px] font-bold">{p.confidence}% CONFIDENCE</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Objects */}
          <div className="p-3 rounded bg-[#02050f] border border-cyan-500/20 space-y-2">
            <div className="text-[11px] font-tech font-bold uppercase text-amber-300 flex items-center space-x-1.5">
              <Box className="w-3.5 h-3.5" />
              <span>Totems & Cinema Objects ({activeFrame.detectedObjects.length})</span>
            </div>
            <div className="space-y-1.5">
              {activeFrame.detectedObjects.map((obj, idx) => (
                <div key={idx} className="p-2 rounded bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
                  <span className="font-tech text-slate-200">{obj.name}</span>
                  <span className="font-mono text-amber-400 text-[10px] font-bold">{obj.confidence}% CONFIDENCE</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Tags */}
          <div className="p-3 rounded bg-[#02050f] border border-cyan-500/20 space-y-2">
            <div className="text-[11px] font-tech font-bold uppercase text-slate-300 flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Aesthetic & Lighting Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeFrame.visualTags.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Frame Gallery Grid */}
      <div className="space-y-2 pt-2 border-t border-cyan-500/20">
        <div className="text-[11px] font-tech font-bold uppercase text-slate-400">
          Keyframe Sampling Strip (Click to Inspect Frame)
        </div>
        <div className="grid grid-cols-5 gap-2 overflow-x-auto pb-1">
          {frames.map((f, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <div
                key={f.id}
                onClick={() => handleSelectFrame(idx)}
                className={`group relative aspect-video rounded overflow-hidden border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-102'
                    : 'border-slate-800 opacity-70 hover:opacity-100 hover:border-cyan-500/40'
                }`}
              >
                <img
                  src={f.imageUrl}
                  alt={f.timestamp}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[9px] font-mono text-cyan-300">
                  {f.timestamp}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
