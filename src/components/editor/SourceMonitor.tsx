/**
 * THE DEVIL'S EYE - SourceMonitor
 * Secondary NLE Source Monitor: In/Out Points, Raw Footage Scrubbing, Insert & Overwrite.
 */

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  ArrowDownToLine, 
  Layers, 
  Scissors, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  X
} from 'lucide-react';
import { playHudClick, playHudSuccess } from '../../services/soundFx';
import { Scene, Clip } from '../../types';

interface SourceMonitorProps {
  scene: Scene | null;
  onClose?: () => void;
  onInsertClip: (clip: Partial<Clip>, trackId: string) => void;
}

export const SourceMonitor: React.FC<SourceMonitorProps> = ({
  scene,
  onClose,
  onInsertClip
}) => {
  const [inPoint, setInPoint] = useState<number>(0);
  const [outPoint, setOutPoint] = useState<number>(scene ? scene.endSec - scene.startSec : 30);
  const [currentPlaySec, setCurrentPlaySec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  if (!scene) {
    return (
      <div className="h-44 bg-[#030713] border-b border-cyan-500/20 p-4 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs select-none">
        <Eye className="w-6 h-6 text-slate-600 mb-2" />
        <span className="text-slate-400 font-tech">SOURCE MONITOR (OFFLINE)</span>
        <span className="text-[10px] text-slate-600 mt-1">Select any movie scene in the Media Browser to audition raw footage</span>
      </div>
    );
  }

  const rawDuration = Math.max(1, scene.endSec - scene.startSec);
  const selectedDuration = Math.max(1, outPoint - inPoint);

  const handleInsert = () => {
    playHudSuccess();
    onInsertClip({
      title: scene.title || `Scene ${scene.sceneNumber}`,
      mediaType: 'video',
      duration: selectedDuration,
      sourceStart: scene.startSec + inPoint,
      sourceEnd: scene.startSec + outPoint,
      thumbnail: scene.thumbnail || scene.thumbnailUrl,
      sourceSceneId: scene.id,
      color: '#0284c7'
    }, 'track-v1');
  };

  return (
    <div className="h-56 bg-[#030713] border-b border-cyan-500/25 flex flex-col overflow-hidden select-none shrink-0 font-mono">
      {/* Header bar */}
      <div className="h-6 bg-[#060e20] border-b border-cyan-500/20 px-2.5 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-cyan-400 font-bold">SOURCE:</span>
          <span className="text-slate-200 truncate">{scene.title || `Scene ${scene.sceneNumber}`}</span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-cyan-300">SEL: {selectedDuration.toFixed(1)}s</span>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Monitor body: Left thumbnail + Right controls */}
      <div className="flex-1 flex p-2 gap-2 min-h-0">
        {/* Source Video Frame */}
        <div className="relative w-48 h-full rounded overflow-hidden border border-cyan-500/30 bg-black shrink-0">
          <img
            src={scene.thumbnail || scene.thumbnailUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'}
            alt="Source Footage"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-[9px] rounded text-cyan-300">
            {scene.timestampStart}
          </div>
        </div>

        {/* In/Out Trim Sliders & Info */}
        <div className="flex-1 flex flex-col justify-between py-0.5 text-xs">
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>TRIM RANGE: IN {inPoint.toFixed(1)}s → OUT {outPoint.toFixed(1)}s</span>
              <span className="text-amber-300 font-bold">{selectedDuration.toFixed(1)}s</span>
            </div>

            {/* In / Out Range Bar */}
            <div className="relative w-full h-4 bg-slate-950 rounded border border-cyan-500/30 overflow-hidden mb-2">
              <div 
                className="absolute top-0 bottom-0 bg-cyan-500/30 border-x-2 border-cyan-400"
                style={{
                  left: `${(inPoint / rawDuration) * 100}%`,
                  width: `${((outPoint - inPoint) / rawDuration) * 100}%`
                }}
              />
            </div>

            <div className="flex items-center space-x-2 text-[10px]">
              <button
                onClick={() => setInPoint(currentPlaySec)}
                className="px-2 py-0.5 rounded bg-[#09152a] hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 cursor-pointer"
                title="Mark In Point (I)"
              >
                [ MARK IN
              </button>
              <button
                onClick={() => setOutPoint(currentPlaySec || rawDuration)}
                className="px-2 py-0.5 rounded bg-[#09152a] hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 cursor-pointer"
                title="Mark Out Point (O)"
              >
                MARK OUT ]
              </button>
              <button
                onClick={() => {
                  setInPoint(0);
                  setOutPoint(rawDuration);
                }}
                className="text-[9px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                RESET
              </button>
            </div>
          </div>

          {/* Insert and Overwrite Buttons */}
          <div className="flex items-center space-x-2 pt-1 border-t border-cyan-500/15">
            <button
              onClick={handleInsert}
              className="flex-1 py-1 px-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-[11px] font-tech font-bold text-cyan-200 flex items-center justify-center space-x-1 cursor-pointer"
            >
              <ArrowDownToLine className="w-3 h-3" />
              <span>INSERT TO TIMELINE (,)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
