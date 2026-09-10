/**
 * THE DEVIL'S EYE - TimelineTrackView
 * Professional Multi-Track NLE Timeline: V1-V4, A1-A5, SUB, Ruler, Playhead, Split, Trim & Ripple.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Scissors, 
  Trash2, 
  Copy, 
  MousePointer, 
  Move, 
  Bookmark, 
  Split, 
  Magnet,
  Maximize2
} from 'lucide-react';
import { playHudClick, playHudScan, playHudSuccess } from '../../services/soundFx';
import { TimelineTrack, Clip, TimelineMarker } from '../../types';

interface TimelineTrackViewProps {
  playheadSec: number;
  onSeek: (sec: number) => void;
  selectedClipId: string | null;
  onSelectClip: (clip: Clip | null) => void;
  zoomLevel: number;
  snapEnabled: boolean;
}

export const TimelineTrackView: React.FC<TimelineTrackViewProps> = ({
  playheadSec,
  onSeek,
  selectedClipId,
  onSelectClip,
  zoomLevel,
  snapEnabled
}) => {
  const { 
    currentProject, 
    recordTimelineAction, 
    undoTimeline, 
    redoTimeline, 
    addToast 
  } = useApp();

  const [activeTool, setActiveTool] = useState<'select' | 'razor' | 'trim'>('select');
  const [copiedClip, setCopiedClip] = useState<Clip | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const tracksContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingPlayhead = useRef<boolean>(false);
  const isDraggingClip = useRef<{ clipId: string; initialStart: number; dragStartX: number } | null>(null);
  const isTrimmingClip = useRef<{ clipId: string; edge: 'start' | 'end'; initialStart: number; initialDuration: number; dragStartX: number } | null>(null);

  const tracks = currentProject.timeline.tracks || [];
  const totalDuration = currentProject.timeline.totalDuration || 1472;

  // Pixels per second calculation based on zoomLevel
  const basePxPerSec = 2.8 * zoomLevel;
  const timelineWidthPx = Math.max(1200, totalDuration * basePxPerSec);

  // Timecode helper
  const formatSecs = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Track Header Actions (Lock, Mute, Solo, Visibility)
  const toggleTrackLock = (trackId: string) => {
    const updatedTracks = tracks.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t);
    recordTimelineAction('Toggle Track Lock', { ...currentProject.timeline, tracks: updatedTracks });
  };

  const toggleTrackMute = (trackId: string) => {
    const updatedTracks = tracks.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t);
    recordTimelineAction('Toggle Track Mute', { ...currentProject.timeline, tracks: updatedTracks });
  };

  const toggleTrackSolo = (trackId: string) => {
    const target = tracks.find(t => t.id === trackId);
    const willSolo = !target?.solo;
    const updatedTracks = tracks.map(t => ({
      ...t,
      solo: t.id === trackId ? willSolo : false
    }));
    recordTimelineAction('Toggle Track Solo', { ...currentProject.timeline, tracks: updatedTracks });
  };

  const toggleTrackVisibility = (trackId: string) => {
    const updatedTracks = tracks.map(t => t.id === trackId ? { ...t, visible: t.visible === false ? true : false } : t);
    recordTimelineAction('Toggle Track Visibility', { ...currentProject.timeline, tracks: updatedTracks });
  };

  // Find clip by id
  const findClip = (clipId: string): { clip: Clip; track: TimelineTrack } | null => {
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) return { clip, track };
    }
    return null;
  };

  // Split Clip at Playhead (Ctrl+K or Razor Tool)
  const handleSplitAtPlayhead = (targetClipId?: string) => {
    const clipToSplitId = targetClipId || selectedClipId;
    if (!clipToSplitId) {
      addToast('Split Warning', 'Select a clip or position playhead over a clip to split', 'warn');
      return;
    }

    const match = findClip(clipToSplitId);
    if (!match) return;
    const { clip, track } = match;

    if (track.locked) {
      addToast('Track Locked', 'Cannot edit clips on a locked track', 'warn');
      return;
    }

    if (playheadSec <= clip.startTime || playheadSec >= clip.startTime + clip.duration) {
      addToast('Cannot Split', 'Playhead is outside the clip boundaries', 'warn');
      return;
    }

    const firstDuration = playheadSec - clip.startTime;
    const secondDuration = clip.duration - firstDuration;

    const clipA: Clip = {
      ...clip,
      id: `${clip.id}-pt1-${Date.now().toString(36)}`,
      duration: firstDuration,
      sourceEnd: clip.sourceStart + firstDuration
    };

    const clipB: Clip = {
      ...clip,
      id: `${clip.id}-pt2-${Date.now().toString(36)}`,
      startTime: playheadSec,
      duration: secondDuration,
      sourceStart: clip.sourceStart + firstDuration,
      sourceEnd: clip.sourceEnd
    };

    const updatedTracks = tracks.map(t => {
      if (t.id === track.id) {
        return {
          ...t,
          clips: t.clips.flatMap(c => c.id === clip.id ? [clipA, clipB] : [c])
        };
      }
      return t;
    });

    playHudClick();
    recordTimelineAction(`Split Clip: ${clip.title}`, { ...currentProject.timeline, tracks: updatedTracks });
    onSelectClip(clipB);
    addToast('Clip Split', `Split "${clip.title}" at ${formatSecs(playheadSec)}`, 'success');
  };

  // Delete Clip
  const handleDeleteSelected = () => {
    if (!selectedClipId) return;
    const match = findClip(selectedClipId);
    if (!match) return;
    const { clip, track } = match;
    if (track.locked) return;

    const updatedTracks = tracks.map(t => {
      if (t.id === track.id) {
        return {
          ...t,
          clips: t.clips.filter(c => c.id !== clip.id)
        };
      }
      return t;
    });

    recordTimelineAction(`Delete Clip: ${clip.title}`, { ...currentProject.timeline, tracks: updatedTracks });
    onSelectClip(null);
    addToast('Clip Deleted', `Removed "${clip.title}"`, 'info');
  };

  // Ripple Delete (Closes the gap after deleting the clip)
  const handleRippleDelete = () => {
    if (!selectedClipId) return;
    const match = findClip(selectedClipId);
    if (!match) return;
    const { clip, track } = match;
    if (track.locked) return;

    const deletedDuration = clip.duration;
    const deletedStart = clip.startTime;

    const updatedTracks = tracks.map(t => {
      if (t.id === track.id) {
        return {
          ...t,
          clips: t.clips
            .filter(c => c.id !== clip.id)
            .map(c => c.startTime > deletedStart ? { ...c, startTime: Math.max(0, c.startTime - deletedDuration) } : c)
        };
      }
      return t;
    });

    recordTimelineAction(`Ripple Delete: ${clip.title}`, { ...currentProject.timeline, tracks: updatedTracks });
    onSelectClip(null);
    addToast('Ripple Delete', `Closed gap of ${deletedDuration}s`, 'success');
  };

  // Duplicate Clip
  const handleDuplicate = () => {
    if (!selectedClipId) return;
    const match = findClip(selectedClipId);
    if (!match) return;
    const { clip, track } = match;
    if (track.locked) return;

    const newClip: Clip = {
      ...clip,
      id: `${clip.id}-dup-${Date.now().toString(36)}`,
      startTime: clip.startTime + clip.duration,
      title: `${clip.title} (Copy)`
    };

    const updatedTracks = tracks.map(t => {
      if (t.id === track.id) {
        return {
          ...t,
          clips: [...t.clips, newClip].sort((a, b) => a.startTime - b.startTime)
        };
      }
      return t;
    });

    recordTimelineAction(`Duplicate Clip: ${clip.title}`, { ...currentProject.timeline, tracks: updatedTracks });
    onSelectClip(newClip);
    addToast('Clip Duplicated', `Duplicated "${clip.title}"`, 'success');
  };

  // Add Marker at Playhead
  const handleAddMarker = () => {
    const newMarker: TimelineMarker = {
      id: `marker-${Date.now().toString(36)}`,
      timeSec: playheadSec,
      label: `Cue ${formatSecs(playheadSec)}`,
      color: '#06b6d4'
    };
    const updatedMarkers = [...(currentProject.timeline.markers || []), newMarker];
    recordTimelineAction(`Add Marker at ${formatSecs(playheadSec)}`, { ...currentProject.timeline, markers: updatedMarkers });
    addToast('Marker Added', `Created cue at ${formatSecs(playheadSec)}`, 'info');
  };

  // Mouse scrubbing & dragging handlers
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tracksContainerRef.current) return;
    isDraggingPlayhead.current = true;
    const rect = tracksContainerRef.current.getBoundingClientRect();
    const scrollLeft = tracksContainerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const newSec = Math.max(0, Math.min(totalDuration, clickX / basePxPerSec));
    onSeek(newSec);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!tracksContainerRef.current) return;
    const rect = tracksContainerRef.current.getBoundingClientRect();
    const scrollLeft = tracksContainerRef.current.scrollLeft;
    const curX = e.clientX - rect.left + scrollLeft;

    if (isDraggingPlayhead.current) {
      const newSec = Math.max(0, Math.min(totalDuration, curX / basePxPerSec));
      onSeek(newSec);
      return;
    }

    if (isDraggingClip.current) {
      const { clipId, initialStart, dragStartX } = isDraggingClip.current;
      const deltaSec = (e.clientX - dragStartX) / basePxPerSec;
      let newStart = Math.max(0, initialStart + deltaSec);

      // Snapping
      if (snapEnabled) {
        if (Math.abs(newStart - playheadSec) < 3) newStart = playheadSec;
      }

      // Update clip in local tracks
      const match = findClip(clipId);
      if (match && !match.track.locked) {
        match.clip.startTime = Number(newStart.toFixed(2));
      }
      return;
    }

    if (isTrimmingClip.current) {
      const { clipId, edge, initialStart, initialDuration, dragStartX } = isTrimmingClip.current;
      const deltaSec = (e.clientX - dragStartX) / basePxPerSec;
      const match = findClip(clipId);
      if (!match || match.track.locked) return;

      if (edge === 'end') {
        match.clip.duration = Math.max(1, Number((initialDuration + deltaSec).toFixed(2)));
      } else {
        const newStart = Math.max(0, initialStart + deltaSec);
        const newDur = Math.max(1, initialDuration - deltaSec);
        match.clip.startTime = Number(newStart.toFixed(2));
        match.clip.duration = Number(newDur.toFixed(2));
      }
    }
  }, [basePxPerSec, totalDuration, onSeek, snapEnabled, playheadSec]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingClip.current || isTrimmingClip.current) {
      recordTimelineAction('Update Clip Position / Trim', { ...currentProject.timeline, tracks: [...tracks] });
    }
    isDraggingPlayhead.current = false;
    isDraggingClip.current = null;
    isTrimmingClip.current = null;
  }, [tracks, currentProject.timeline, recordTimelineAction]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="h-72 lg:h-84 bg-[#030611] border-t border-cyan-500/25 flex flex-col select-none overflow-hidden shrink-0">
      {/* Timeline Controls Toolbar */}
      <div className="h-8 bg-[#040816] border-b border-cyan-500/20 px-3 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
        {/* Left: Tools (Select V, Razor C, Trim B) */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTool('select')}
            className={`px-2 py-1 rounded flex items-center space-x-1 cursor-pointer transition-colors ${
              activeTool === 'select' ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/50' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Selection Tool (V)"
          >
            <MousePointer className="w-3 h-3" />
            <span className="text-[10px]">SELECTION (V)</span>
          </button>

          <button
            onClick={() => setActiveTool('razor')}
            className={`px-2 py-1 rounded flex items-center space-x-1 cursor-pointer transition-colors ${
              activeTool === 'razor' ? 'bg-amber-950 text-amber-300 border border-amber-400/50' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Razor Split Tool (C)"
          >
            <Scissors className="w-3 h-3" />
            <span className="text-[10px]">RAZOR (C)</span>
          </button>

          <div className="h-4 w-[1px] bg-cyan-500/20 mx-1" />

          <button
            onClick={() => handleSplitAtPlayhead()}
            className="px-2 py-1 rounded bg-[#09152a] hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-cyan-500/20 flex items-center space-x-1 cursor-pointer"
            title="Split Clip at Playhead (Ctrl+K)"
          >
            <Split className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px]">SPLIT AT PLAYHEAD</span>
          </button>

          <button
            onClick={handleRippleDelete}
            disabled={!selectedClipId}
            className={`px-2 py-1 rounded border border-cyan-500/20 flex items-center space-x-1 cursor-pointer ${
              selectedClipId ? 'bg-[#09152a] hover:bg-rose-950 text-slate-300 hover:text-rose-300' : 'opacity-30 cursor-not-allowed'
            }`}
            title="Ripple Delete Gap (Shift+Del)"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span className="text-[10px]">RIPPLE DELETE</span>
          </button>

          <button
            onClick={handleDuplicate}
            disabled={!selectedClipId}
            className={`px-2 py-1 rounded border border-cyan-500/20 flex items-center space-x-1 cursor-pointer ${
              selectedClipId ? 'bg-[#09152a] hover:bg-cyan-950 text-slate-300 hover:text-cyan-300' : 'opacity-30 cursor-not-allowed'
            }`}
            title="Duplicate Clip (Ctrl+D)"
          >
            <Copy className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px]">DUPLICATE</span>
          </button>

          <button
            onClick={handleAddMarker}
            className="px-2 py-1 rounded bg-[#09152a] hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-cyan-500/20 flex items-center space-x-1 cursor-pointer"
            title="Add Cue Marker (M)"
          >
            <Bookmark className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px]">MARKER</span>
          </button>
        </div>

        {/* Right: Tracks Summary */}
        <div className="flex items-center space-x-3 text-[10px] text-slate-400">
          <span>{tracks.length} TRACKS (4 VIDEO • 5 AUDIO • 1 SUB)</span>
          <span className="text-cyan-400">{tracks.reduce((acc, t) => acc + t.clips.length, 0)} CLIPS</span>
        </div>
      </div>

      {/* Main Track Grid: Left Track Headers + Right Timeline Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Fixed Track Headers */}
        <div className="w-36 lg:w-44 bg-[#040816] border-r border-cyan-500/25 flex flex-col shrink-0 select-none overflow-y-auto">
          {/* Ruler placeholder top */}
          <div className="h-6 bg-[#030612] border-b border-cyan-500/20 px-2 flex items-center text-[10px] text-slate-400 font-mono">
            <span>TRACKS</span>
          </div>

          {/* Track Labels & Controls */}
          {tracks.map((track) => {
            const isVideo = track.type === 'video';
            return (
              <div
                key={track.id}
                className="h-10 border-b border-cyan-500/15 px-2 flex items-center justify-between bg-[#050b1a] hover:bg-[#071128] transition-colors"
              >
                <div className="flex items-center space-x-1.5 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="text-xs font-mono font-bold text-slate-200 truncate" title={track.name}>
                    {track.name}
                  </span>
                </div>

                {/* Header buttons: Lock, Mute, Solo, Visibility */}
                <div className="flex items-center space-x-1 text-slate-400 shrink-0">
                  <button
                    onClick={() => toggleTrackLock(track.id)}
                    className={`p-0.5 rounded cursor-pointer ${track.locked ? 'text-amber-400' : 'hover:text-slate-200'}`}
                    title={track.locked ? 'Unlock Track' : 'Lock Track'}
                  >
                    {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>

                  <button
                    onClick={() => toggleTrackMute(track.id)}
                    className={`px-1 rounded text-[9px] font-bold cursor-pointer ${
                      track.muted ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'hover:text-slate-200'
                    }`}
                    title="Mute Track"
                  >
                    M
                  </button>

                  <button
                    onClick={() => toggleTrackSolo(track.id)}
                    className={`px-1 rounded text-[9px] font-bold cursor-pointer ${
                      track.solo ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'hover:text-slate-200'
                    }`}
                    title="Solo Track"
                  >
                    S
                  </button>

                  <button
                    onClick={() => toggleTrackVisibility(track.id)}
                    className={`p-0.5 rounded cursor-pointer ${
                      track.visible === false ? 'text-slate-600' : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                    title="Toggle Visibility"
                  >
                    {track.visible === false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Scrollable Timeline Canvas & Time Ruler */}
        <div 
          ref={tracksContainerRef}
          className="flex-1 flex flex-col overflow-x-auto overflow-y-auto relative bg-[#02050f]"
        >
          {/* Top Time Ruler */}
          <div
            onMouseDown={handleRulerMouseDown}
            className="h-6 bg-[#030716] border-b border-cyan-500/20 relative cursor-pointer shrink-0"
            style={{ width: `${timelineWidthPx}px` }}
          >
            {/* Time ticks every 30 or 60 seconds */}
            {Array.from({ length: Math.ceil(totalDuration / 30) + 1 }).map((_, i) => {
              const sec = i * 30;
              const leftPx = sec * basePxPerSec;
              const isMajor = sec % 60 === 0;
              return (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{ left: `${leftPx}px` }}
                >
                  <div className={`w-[1px] ${isMajor ? 'h-3 bg-cyan-400/60' : 'h-1.5 bg-slate-700'}`} />
                  {isMajor && (
                    <span className="text-[9px] font-mono text-cyan-400/80 ml-1 select-none">
                      {formatSecs(sec)}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Timeline Markers */}
            {(currentProject.timeline.markers || []).map((marker) => (
              <div
                key={marker.id}
                className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
                style={{ left: `${marker.timeSec * basePxPerSec}px` }}
              >
                <div className="w-2 h-2 rotate-45 bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
                <span className="text-[8px] font-mono text-cyan-300 bg-black/80 px-1 rounded -mt-0.5">
                  {marker.label}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Tracks Lane Container */}
          <div 
            className="relative flex-1"
            style={{ width: `${timelineWidthPx}px` }}
          >
            {/* Playhead Red Needle extending down across all tracks */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-30 pointer-events-none shadow-[0_0_10px_#ef4444]"
              style={{ left: `${playheadSec * basePxPerSec}px` }}
            >
              {/* Playhead Handle Top */}
              <div className="w-3.5 h-3.5 bg-red-500 rotate-45 -translate-x-1.5 -translate-y-1.5 shadow-[0_0_8px_#ef4444]" />
            </div>

            {/* Render Each Track Lane */}
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`h-10 border-b border-cyan-500/10 relative overflow-hidden transition-opacity ${
                  track.visible === false ? 'opacity-30' : ''
                }`}
                style={{ backgroundColor: track.type === 'video' ? '#030814' : '#040b1a' }}
              >
                {/* Clips on this track */}
                {track.clips.map((clip) => {
                  const leftPx = clip.startTime * basePxPerSec;
                  const widthPx = Math.max(16, clip.duration * basePxPerSec);
                  const isSelected = selectedClipId === clip.id;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeTool === 'razor') {
                          handleSplitAtPlayhead(clip.id);
                        } else {
                          onSelectClip(clip);
                        }
                      }}
                      onMouseDown={(e) => {
                        if (activeTool === 'select' && !track.locked) {
                          isDraggingClip.current = {
                            clipId: clip.id,
                            initialStart: clip.startTime,
                            dragStartX: e.clientX
                          };
                        }
                      }}
                      className={`absolute top-1 bottom-1 rounded border flex items-center justify-between px-2 overflow-hidden text-xs font-mono select-none group transition-all ${
                        isSelected 
                          ? 'border-white ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)] z-20' 
                          : 'border-black/50 hover:brightness-110 z-10'
                      }`}
                      style={{
                        left: `${leftPx}px`,
                        width: `${widthPx}px`,
                        backgroundColor: clip.color || (track.type === 'video' ? '#0284c7' : '#059669')
                      }}
                    >
                      {/* Left Trim Handle */}
                      {!track.locked && (
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            isTrimmingClip.current = {
                              clipId: clip.id,
                              edge: 'start',
                              initialStart: clip.startTime,
                              initialDuration: clip.duration,
                              dragStartX: e.clientX
                            };
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/40 cursor-ew-resize opacity-0 group-hover:opacity-100 z-25"
                          title="Trim In Point"
                        />
                      )}

                      {/* Content: Thumbnail or Waveform + Title */}
                      <div className="flex items-center space-x-1.5 min-w-0 overflow-hidden pointer-events-none">
                        {clip.thumbnail && (
                          <img
                            src={clip.thumbnail}
                            alt=""
                            className="w-5 h-5 rounded object-cover shrink-0 border border-white/30"
                          />
                        )}
                        <span className="font-bold text-white text-[11px] truncate drop-shadow">
                          {clip.title}
                        </span>
                        <span className="text-[9px] text-white/80 font-mono shrink-0">
                          ({clip.duration}s)
                        </span>
                      </div>

                      {/* Right Trim Handle */}
                      {!track.locked && (
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            isTrimmingClip.current = {
                              clipId: clip.id,
                              edge: 'end',
                              initialStart: clip.startTime,
                              initialDuration: clip.duration,
                              dragStartX: e.clientX
                            };
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/40 cursor-ew-resize opacity-0 group-hover:opacity-100 z-25"
                          title="Trim Out Point"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
