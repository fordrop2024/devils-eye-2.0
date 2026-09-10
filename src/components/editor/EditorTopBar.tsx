/**
 * THE DEVIL'S EYE - EditorTopBar
 * Professional NLE Control Bar: Project state, Timecode, Undo/Redo, Autosave, Versioning & Export.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Undo2, 
  Redo2, 
  Save, 
  DownloadCloud, 
  Magnet, 
  ZoomIn, 
  ZoomOut, 
  Clock, 
  Film, 
  ChevronDown, 
  History,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { playHudClick, playHudSuccess } from '../../services/soundFx';

interface EditorTopBarProps {
  playheadSec: number;
  totalDuration: number;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
  snapEnabled: boolean;
  setSnapEnabled: (s: boolean | ((prev: boolean) => boolean)) => void;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  playheadSec,
  totalDuration,
  zoomLevel,
  setZoomLevel,
  snapEnabled,
  setSnapEnabled
}) => {
  const { 
    currentProject, 
    undoTimeline, 
    redoTimeline, 
    canUndoTimeline, 
    canRedoTimeline,
    saveTimelineVersion,
    restoreTimelineVersion,
    timelineHistoryList,
    setIsExportModalOpen,
    navigateTo,
    addToast
  } = useApp();

  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');

  // Format seconds to SMPTE timecode HH:MM:SS:FF (at 24fps)
  const formatSMPTE = (sec: number): string => {
    const totalFrames = Math.floor(sec * 24);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const f = totalFrames % 24;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
  };

  const handleSaveSnapshot = () => {
    saveTimelineVersion(snapshotName || undefined);
    setIsSnapshotModalOpen(false);
    setSnapshotName('');
  };

  const activeVersion = currentProject.timelineVersions?.find(
    v => v.id === currentProject.activeTimelineVersionId
  ) || currentProject.timelineVersions?.[0] || {
    id: 'v1',
    name: 'V1 — AI First Cut'
  };

  return (
    <header className="h-13 bg-[#050b18] border-b border-cyan-500/25 px-3 flex items-center justify-between gap-2 select-none shrink-0 z-30">
      {/* Left: Project title & Timeline Version Selector */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigateTo('ai-first-cut')}
          className="flex items-center space-x-2 text-slate-300 hover:text-cyan-300 transition-colors group cursor-pointer"
          title="Return to AI First Cut Overview"
        >
          <div className="w-7 h-7 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            <Film className="w-3.5 h-3.5" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-mono tracking-wider text-cyan-400 font-bold uppercase">THE DEVIL'S EYE</div>
            <div className="text-xs font-display font-semibold text-slate-100 truncate max-w-[140px] md:max-w-[190px]">
              {currentProject.title}
            </div>
          </div>
        </button>

        <div className="h-5 w-[1px] bg-cyan-500/20 hidden md:block" />

        {/* Version Switcher (V1 AI First Cut, V2 Human Edit, V3 Revised, V4 Final) */}
        <div className="relative">
          <button
            onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#09152a] hover:bg-[#0c1c38] border border-cyan-500/30 text-xs font-mono text-cyan-200 cursor-pointer"
            title="Sequence Version Switcher"
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{activeVersion.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isVersionDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#050b18] border border-cyan-500/40 rounded-md shadow-2xl p-1.5 z-50 space-y-1 font-mono text-xs">
              <div className="text-[10px] uppercase text-cyan-400 font-tech px-2 py-1 border-b border-cyan-500/20">
                TIMELINE VERSIONS (AUTOSAVED)
              </div>
              {(currentProject.timelineVersions || []).map((ver) => (
                <button
                  key={ver.id}
                  onClick={() => {
                    restoreTimelineVersion(ver.id);
                    setIsVersionDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    ver.id === activeVersion.id 
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' 
                      : 'text-slate-300 hover:bg-[#09152a]'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold truncate">{ver.name}</div>
                    <div className="text-[10px] text-slate-400">{ver.timestamp} • {ver.clipCount || 0} clips</div>
                  </div>
                  {ver.id === activeVersion.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                  )}
                </button>
              ))}

              <button
                onClick={() => {
                  setIsVersionDropdownOpen(false);
                  setIsSnapshotModalOpen(true);
                }}
                className="w-full mt-1 px-2.5 py-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-[11px] font-tech flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Save className="w-3 h-3" />
                <span>SAVE NEW REVISION SNAPSHOT</span>
              </button>
            </div>
          )}
        </div>

        {/* Autosave Status Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>AUTOSAVED</span>
        </div>
      </div>

      {/* Center: Real SMPTE Timecode Counter */}
      <div className="flex items-center space-x-2 bg-[#02050f] border border-cyan-500/30 rounded px-3 py-1 font-mono text-xs shadow-inner">
        <Clock className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-cyan-300 font-bold tracking-wider">{formatSMPTE(playheadSec)}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400 tracking-wider">{formatSMPTE(totalDuration)}</span>
      </div>

      {/* Right: History, Undo/Redo, Snapping, Zoom, Export */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#09152a] rounded border border-cyan-500/20 p-0.5">
          <button
            onClick={() => undoTimeline()}
            disabled={!canUndoTimeline}
            className={`p-1.5 rounded text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors cursor-pointer ${
              !canUndoTimeline ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => redoTimeline()}
            disabled={!canRedoTimeline}
            className={`p-1.5 rounded text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors cursor-pointer ${
              !canRedoTimeline ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* History Action Drawer Trigger */}
        <button
          onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
          className="p-1.5 rounded bg-[#09152a] hover:bg-[#0c1c38] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 cursor-pointer hidden sm:flex items-center space-x-1 text-xs font-mono"
          title="Timeline Action History"
        >
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] hidden md:inline">HISTORY</span>
        </button>

        {/* Snapping Toggle */}
        <button
          onClick={() => {
            playHudClick();
            setSnapEnabled((prev: boolean) => !prev);
          }}
          className={`p-1.5 rounded border text-xs font-mono flex items-center space-x-1 transition-colors cursor-pointer ${
            snapEnabled 
              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.3)]' 
              : 'bg-[#09152a] border-cyan-500/20 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Magnetic Snapping (S)"
        >
          <Magnet className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">SNAP</span>
        </button>

        {/* Zoom Slider */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-[#09152a] border border-cyan-500/20 rounded px-2 py-1">
          <button 
            onClick={() => setZoomLevel(Math.max(0.4, Number((zoomLevel - 0.2).toFixed(1))))}
            className="text-slate-400 hover:text-cyan-300 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="0.4"
            max="3.0"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-16 h-1 accent-cyan-400 bg-slate-800 rounded cursor-pointer"
          />
          <button 
            onClick={() => setZoomLevel(Math.min(3.0, Number((zoomLevel + 0.2).toFixed(1))))}
            className="text-slate-400 hover:text-cyan-300 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-cyan-300 w-8 text-right">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Export Master Button */}
        <button
          onClick={() => {
            playHudClick();
            setIsExportModalOpen(true);
          }}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech font-bold text-xs px-3 py-1.5 rounded border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center space-x-1.5 cursor-pointer"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">EXPORT MASTER</span>
        </button>
      </div>

      {/* Snapshot Modal */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050b18] border border-cyan-500/40 rounded-lg p-5 max-w-md w-full space-y-4 shadow-2xl hud-corners">
            <div className="flex items-center space-x-2 text-cyan-300 font-tech font-bold text-sm">
              <Save className="w-4 h-4" />
              <span>SAVE REVISION SNAPSHOT</span>
            </div>
            <p className="text-xs text-slate-300">
              Create an immutable checkpoint of the multi-track timeline across all 4 video tracks and 5 audio stems.
            </p>
            <input
              type="text"
              placeholder="e.g. V2 — Director Cut Tightened"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              className="w-full bg-[#02050f] border border-cyan-500/40 rounded p-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-tech text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveSnapshot}
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-tech font-bold shadow-[0_0_10px_#00f0ff] cursor-pointer"
              >
                SAVE SNAPSHOT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer Modal */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-[#050b18] border-l border-cyan-500/40 w-80 h-full p-4 flex flex-col space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-tech text-xs font-bold">
                <History className="w-4 h-4" />
                <span>TIMELINE ACTION HISTORY</span>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Last {timelineHistoryList.length} recorded modifications:
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
              {timelineHistoryList.length === 0 ? (
                <div className="text-slate-500 text-center py-6 text-xs">No actions recorded yet</div>
              ) : (
                timelineHistoryList.map((item, i) => (
                  <div
                    key={item.id}
                    className="p-2 rounded bg-[#09152a] border border-cyan-500/15 flex items-start justify-between text-slate-300"
                  >
                    <div>
                      <div className="text-cyan-200 font-semibold">{item.description}</div>
                      <div className="text-[10px] text-slate-400">{item.timestamp}</div>
                    </div>
                    <span className="text-[10px] text-cyan-400/60 font-mono">#{timelineHistoryList.length - i}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
