/**
 * THE DEVIL'S EYE - Flagship Command Center
 * High-end cinematic hacker workstation with responsive desktop-first HUD layout.
 * Primary panels receive proper width and prominence:
 * - Tier 1: Movie Source + Active Scene Viewport + AI Analysis
 * - Tier 2: Real-Time Scan + Story Graph + Character Intelligence
 * - Tier 3: AI Director + System Logs Terminal
 * - Tier 4: Script Breakdown + AI First Cut Timeline + Quality & Export
 * - Tier 5: JARVIS AI Assistant Command Console Bar
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DevilEye, DevilEyeState } from '../components/common/DevilEye';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  CheckCircle2, 
  Clock, 
  Film, 
  Cpu, 
  Send, 
  Sparkles, 
  Check, 
  Terminal as TerminalIcon,
  ChevronRight,
  DownloadCloud,
  UploadCloud,
  FileText,
  User,
  Layers,
  Edit3,
  AlertCircle
} from 'lucide-react';
import { playHudClick, playHudScan } from '../services/soundFx';

export const CommandCenter: React.FC = () => {
  const { 
    currentProject, 
    executeAiCommand, 
    isAiThinking, 
    systemLogs, 
    navigateTo, 
    setIsExportModalOpen,
    activeMovieRecord,
    activeAnalysisJob,
    startAnalysisJob,
    isMovieUploading,
    movieUploadProgress,
    setIsIngestionCenterOpen,
  } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(4523); // Default playback position in seconds
  const [commandInput, setCommandInput] = useState('');
  const [selectedDirectorPrompt, setSelectedDirectorPrompt] = useState<string | null>(null);
  const [appliedDirectorPrompts, setAppliedDirectorPrompts] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime(prev => {
          if (prev >= (currentProject.durationSec || 7200)) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentProject.durationSec]);

  // Scroll logs to bottom on new entry
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [systemLogs]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCommandSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim() || isAiThinking) return;
    const prompt = commandInput;
    setCommandInput('');
    await executeAiCommand(prompt);
  };

  const handleApplyDirector = async () => {
    if (!selectedDirectorPrompt) return;
    playHudScan();
    setAppliedDirectorPrompts(prev => [...prev, selectedDirectorPrompt]);
    await executeAiCommand(selectedDirectorPrompt);
    setSelectedDirectorPrompt(null);
  };

  const directorPrompts = [
    'Increase emotional intensity in the first 60 seconds',
    'Use more close-ups for key moments',
    'Add suspense before the twist',
    'Shorten the exposition in the middle section',
    'Enhance the dream sequence with visual effects',
  ];

  // Derive active scene based on current playbackTime
  const activeScene = useMemo(() => {
    if (!currentProject.scenes || currentProject.scenes.length === 0) return null;
    return currentProject.scenes.find(
      s => playbackTime >= s.startSec && playbackTime <= s.endSec
    ) || currentProject.scenes[0];
  }, [currentProject.scenes, playbackTime]);

  // Derive real-time Devil's Eye state strictly from active job/movie telemetry
  const eyeState: DevilEyeState = useMemo(() => {
    if (activeAnalysisJob?.status === 'RUNNING') return 'ANALYZING';
    if (activeAnalysisJob?.status === 'FAILED') return 'ERROR';
    if (activeMovieRecord?.status === 'FAILED') return 'ERROR';
    if (isAiThinking) return 'THINKING';
    if (activeMovieRecord?.status === 'UPLOADING' || activeMovieRecord?.status === 'PROCESSING' || activeMovieRecord?.status === 'GEMINI_PROCESSING') return 'PROCESSING';
    if (activeMovieRecord?.geminiFileState === 'ACTIVE' && !activeAnalysisJob) return 'FOCUS';
    if (currentProject.analysisStatus === 'ANALYSIS COMPLETE') return 'WATCHING';
    return 'IDLE';
  }, [activeAnalysisJob, activeMovieRecord, isAiThinking, currentProject.analysisStatus]);

  // State checks for pipeline verification (Phase 2 real logic)
  const isAnalyzed = currentProject.analysisStatus === 'ANALYSIS COMPLETE' || activeAnalysisJob?.status === 'COMPLETED';
  const isAnalyzing = (currentProject.analysisStatus as string) === 'ANALYZING' || activeAnalysisJob?.status === 'RUNNING' || activeAnalysisJob?.status === 'QUEUED';
  const isGeminiProcessing = activeMovieRecord?.status === 'PROCESSING' || activeMovieRecord?.status === 'GEMINI_PROCESSING';
  const isGeminiActive = activeMovieRecord?.status === 'ACTIVE';
  const isGeminiFailed = activeMovieRecord?.status === 'FAILED';
  const hasVideo = Boolean(
    currentProject.videoSourceUrl || 
    (currentProject.mediaFiles && currentProject.mediaFiles.some(f => f.type === 'video')) || 
    (currentProject.durationSec && currentProject.durationSec > 0) ||
    activeMovieRecord
  );
  const hasAudio = Boolean(
    currentProject.mediaFiles?.some(f => f.type === 'audio' || (f.type === 'video' && (f.audioTracksCount || 0) > 0)) || 
    (currentProject.analysis?.audioScore && currentProject.analysis.audioScore > 0)
  );
  const hasFrames = Boolean(currentProject.scannedFrames && currentProject.scannedFrames.length > 0) || Boolean(currentProject.scenes && currentProject.scenes.length > 0);
  const hasStory = Boolean(currentProject.storyBeats && currentProject.storyBeats.length > 0);
  const hasScript = Boolean(currentProject.script?.segments && currentProject.script.segments.length > 0);

  const pipelineSteps = [
    { name: 'Video', done: hasVideo },
    { name: 'Audio', done: hasAudio },
    { name: 'Frames', done: hasFrames },
    { name: 'Analysis', done: isAnalyzed },
    { name: 'Story', done: hasStory },
    { name: 'Script', done: hasScript },
  ];

  // Active scene character detection info
  const detectedCharacterName = activeScene?.charactersInScene?.[0] || 
    currentProject.characters?.[0]?.name || 
    'LEAD CHARACTER';
  const characterRole = currentProject.characters?.find(c => c.name === detectedCharacterName)?.role || 'Main Character';
  const characterConfidence = activeScene?.confidence || 98;

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#02050f] text-slate-100 p-3.5 space-y-3.5 select-none font-sans bg-hud-grid">
      
      {/* TIER 1: MOVIE SOURCE + PRIMARY SCENE VIEWPORT + AI ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        
        {/* PANEL 1: MOVIE SOURCE (Col 3 on xl, Col 4 on lg) */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 min-w-[270px] hud-panel rounded-lg p-3.5 border border-cyan-500/30 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300">
                <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="tracking-wider truncate">MOVIE SOURCE</span>
              </div>
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                isGeminiActive
                  ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                  : isGeminiProcessing || isMovieUploading
                  ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40 animate-pulse'
                  : isGeminiFailed
                  ? 'text-rose-300 bg-rose-950/60 border-rose-500/40'
                  : hasVideo
                  ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40'
                  : 'text-amber-300 bg-amber-950/60 border-amber-500/40'
              }`}>
                {isGeminiActive
                  ? 'MOVIE READY'
                  : isGeminiProcessing
                  ? 'PROCESSING'
                  : isMovieUploading
                  ? 'UPLOADING'
                  : isGeminiFailed
                  ? 'FAILED'
                  : hasVideo
                  ? 'INGEST // OK'
                  : 'NO MOVIE'}
              </span>
            </div>

            {/* Poster & details */}
            <div className="flex space-x-3 mb-3">
              <div className="relative w-20 h-28 shrink-0 rounded overflow-hidden border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)] bg-black/60">
                <img
                  src={currentProject.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80'}
                  alt={currentProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-center text-cyan-300 py-0.5 truncate px-1">
                  {currentProject.title.toUpperCase()}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                <div className="font-tech font-bold text-slate-100 truncate text-sm" title={activeMovieRecord?.originalName || currentProject.title}>
                  {activeMovieRecord?.originalName || currentProject.videoSourceUrl || `${currentProject.title.toLowerCase().replace(/\s+/g, '_')}.mp4`}
                </div>
                <div className="text-[11px] font-mono text-cyan-400/80 truncate">
                  {activeMovieRecord?.fileSizeFormatted ? `${activeMovieRecord.fileSizeFormatted} • ` : ''}
                  {currentProject.duration || formatTime(currentProject.durationSec || 0)} • {currentProject.resolution || '1080p 24fps'}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(currentProject.genre || ['Cinema', 'Thriller']).slice(0, 3).map((g, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-mono">
                      {g}
                    </span>
                  ))}
                </div>
                <div className="pt-1">
                  {isAnalyzed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-tech text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>ANALYSIS COMPLETE</span>
                    </span>
                  ) : isAnalyzing ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-tech text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded animate-pulse">
                      <Clock className="w-3 h-3 shrink-0 animate-spin" />
                      <span>{activeAnalysisJob?.currentStep || 'ANALYZING WITH GEMINI...'}</span>
                    </span>
                  ) : isGeminiProcessing ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-tech text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded animate-pulse">
                      <Clock className="w-3 h-3 shrink-0 animate-spin" />
                      <span>GEMINI PROCESSING VIDEO...</span>
                    </span>
                  ) : isMovieUploading ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-tech text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded animate-pulse">
                      <Clock className="w-3 h-3 shrink-0 animate-spin" />
                      <span>UPLOADING {movieUploadProgress}%</span>
                    </span>
                  ) : isGeminiFailed ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-tech text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>INGESTION FAILED</span>
                      </span>
                      <div className="text-[10px] text-rose-300 font-mono line-clamp-2">
                        {activeMovieRecord?.errorMessage || 'Failed processing video in Gemini'}
                      </div>
                    </div>
                  ) : isGeminiActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-tech text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>MOVIE READY (GEMINI ACTIVE)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-tech text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>NO ANALYZED MOVIE AVAILABLE</span>
                    </span>
                  )}
                </div>

                {isGeminiActive && !isAnalyzed && !isAnalyzing && (
                  <button
                    onClick={async () => {
                      playHudClick();
                      await startAnalysisJob();
                    }}
                    className="w-full mt-1.5 py-1 px-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 border border-emerald-400/50 rounded text-[10px] font-tech font-bold text-white shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>START AI ANALYSIS (GEMINI)</span>
                  </button>
                )}

                {isGeminiProcessing && (
                  <div className="w-full mt-1.5 py-1 px-2 bg-cyan-950/60 border border-cyan-500/30 rounded text-[9.5px] font-mono text-cyan-300 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400 animate-spin" />
                    <span>POLLING GEMINI (WAITING FOR ACTIVE)...</span>
                  </div>
                )}

                {/* Direct Trigger to Ingestion Center */}
                <button
                  onClick={() => {
                    playHudClick();
                    setIsIngestionCenterOpen(true);
                  }}
                  className="w-full mt-2 py-1.5 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded text-[10px] font-tech font-bold text-cyan-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-cyan-300" />
                  <span>INGEST / UPLOAD REAL MOVIE</span>
                </button>
              </div>
            </div>

            {/* Pipeline Checklist */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-cyan-500/20 text-center">
              {pipelineSteps.map((step, idx) => (
                <div key={idx} className="bg-[#060c18] border border-cyan-500/20 rounded p-1">
                  {step.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-500 mx-auto mb-0.5" />
                  )}
                  <div className={`text-[9.5px] font-tech ${step.done ? 'text-slate-200' : 'text-slate-500'}`}>
                    {step.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigateTo('movie-intelligence')}
            className="w-full mt-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded text-[11px] font-tech text-cyan-300 hover:text-cyan-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>DEEP MULTIMODAL METRICS</span>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
          </button>
        </div>

        {/* PANEL 2: ACTIVE SCENE VIEWPORT (PROMINENT CINEMA WORKSPACE - Col 6 on xl, Col 8 on lg) */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-6 min-w-[340px] hud-panel rounded-lg p-3.5 border border-cyan-500/40 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2 text-xs">
              <div className="font-tech font-bold text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                <span className="truncate">
                  {activeScene 
                    ? `SCENE ${String(activeScene.sceneNumber).padStart(3, '0')} | ${activeScene.timestampStart} - ${activeScene.timestampEnd}`
                    : `SCENE 001 | 00:00:00 - ${currentProject.duration}`
                  }
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                FPS: {currentProject.fps || 24}.00
              </span>
            </div>

            {/* Video Viewport Stage */}
            <div className="relative aspect-video rounded overflow-hidden border border-cyan-500/40 bg-black shadow-[0_0_25px_rgba(0,240,255,0.15)] group">
              <img
                src={activeScene?.thumbnail || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80'}
                alt={`Scene frame ${activeScene?.sceneNumber || 1}`}
                className="w-full h-full object-cover filter contrast-105"
              />

              {/* HUD Facial Recognition Overlay Box */}
              <div className="absolute top-[18%] left-[36%] w-[34%] h-[56%] border-2 border-cyan-400/80 rounded pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                {/* Corner reticles */}
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-300" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-300" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-300" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-300" />

                {/* Target label tag */}
                <div className="absolute -bottom-7 right-0 bg-[#040a16]/95 border border-cyan-400/80 rounded px-2 py-0.5 text-[9px] font-mono text-cyan-200 whitespace-nowrap shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  <div className="font-bold text-cyan-300 uppercase">{detectedCharacterName}</div>
                  <div className="text-[8px] text-slate-400">{characterRole} • {characterConfidence}% Match</div>
                </div>
              </div>

              {/* Center crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <div className="w-8 h-8 border border-cyan-400 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                </div>
              </div>

              {/* Live waveform bar at bottom of video */}
              <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-black/90 to-transparent flex items-end px-2 space-x-0.5 pointer-events-none opacity-80">
                {[15, 30, 60, 45, 90, 35, 75, 40, 85, 95, 30, 65, 80, 50, 70, 90, 40, 60, 85, 55, 35, 75, 90, 60, 45, 85, 30, 70, 95, 40, 60, 75, 85, 50].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-400/80 rounded-t"
                    style={{ height: `${isPlaying ? (h * (0.6 + Math.sin(Date.now() / 150 + i) * 0.4)) : h * 0.5}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Scrubber & Controls */}
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                <span>{formatTime(playbackTime)}</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400">{currentProject.duration || formatTime(currentProject.durationSec || 0)}</span>
              </div>

              {/* Progress track */}
              <div 
                className="w-full bg-slate-900 h-1.5 rounded-full border border-cyan-500/30 overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  setPlaybackTime(Math.round(pct * (currentProject.durationSec || 7200)));
                  playHudClick();
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${(playbackTime / (currentProject.durationSec || 7200)) * 100}%` }}
                />
              </div>

              {/* Playback Button Bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      playHudClick();
                      setPlaybackTime(prev => Math.max(0, prev - 10));
                    }}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/40 cursor-pointer"
                    aria-label="Skip backward 10 seconds"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      playHudClick();
                      setIsPlaying(!isPlaying);
                    }}
                    className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_12px_#00f0ff] cursor-pointer"
                    aria-label={isPlaying ? "Pause playback" : "Start playback"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      playHudClick();
                      setPlaybackTime(prev => Math.min(currentProject.durationSec || 7200, prev + 10));
                    }}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/40 cursor-pointer"
                    aria-label="Skip forward 10 seconds"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">1x</span>
                  <button 
                    onClick={() => navigateTo('pro-editor')}
                    className="p-1 rounded hover:bg-slate-800 hover:text-cyan-300 cursor-pointer"
                    aria-label="Open in Pro Editor"
                    title="Open Fullscreen in Pro Editor"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: AI ANALYSIS SCORE & METRICS (Col 3 on xl, Col 12 on lg) */}
        <div className="col-span-12 lg:col-span-12 xl:col-span-3 min-w-[270px] hud-panel rounded-lg p-3.5 border border-cyan-500/30 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="tracking-wider">AI ANALYSIS</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80">
                SCORE // {isAnalyzed ? `${currentProject.analysis?.overallScore || 0}%` : isAnalyzing ? 'ANALYZING...' : 'PENDING'}
              </span>
            </div>

            {/* Devil's Eye Central AI Core Visualizer */}
            <div 
              onClick={() => navigateTo('eye-control')}
              className="flex flex-col items-center justify-center my-3 cursor-pointer group"
              title="Click to configure The Devil's Eye"
            >
              <DevilEye 
                size="md" 
                state={eyeState} 
                interactive={true} 
                className="mx-auto group-hover:scale-105 transition-transform" 
              />
              <div className="mt-2 text-center">
                <span className={`text-xl font-display font-black ${isAnalyzing ? 'text-amber-300 animate-pulse' : 'text-cyan-200'}`}>
                  {isAnalyzed ? `${currentProject.analysis?.overallScore || 0}%` : isAnalyzing ? 'ANALYZING' : '--'}
                </span>
                <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest group-hover:text-cyan-300 transition-colors">
                  {isAnalyzed ? 'OVERALL SCORE • EYE ACTIVE' : isAnalyzing ? 'ANALYSIS IN PROGRESS' : 'CLICK TO CONFIGURE EYE'}
                </span>
              </div>
            </div>

            {isGeminiActive && !isAnalyzed && !isAnalyzing && (
              <div className="mb-2">
                <button
                  onClick={async () => {
                    playHudClick();
                    await startAnalysisJob();
                  }}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 border border-emerald-400/50 rounded text-xs font-tech font-bold text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>START AI ANALYSIS</span>
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="mb-2 p-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-center">
                <div className="text-[10px] font-mono text-amber-300 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 animate-spin shrink-0 text-amber-400" />
                  <span className="truncate">{activeAnalysisJob?.currentStep || 'Gemini analyzing scenes & characters...'}</span>
                </div>
              </div>
            )}

            {/* Key Metrics Breakdown */}
            <div className="space-y-1.5 text-xs pt-2">
              {[
                { label: 'Characters', val: currentProject.characters?.length || currentProject.analysis?.charactersCount || 0 },
                { label: 'Key Events', val: currentProject.events?.length || currentProject.analysis?.keyEventsCount || 0 },
                { label: 'Twists', val: currentProject.twists?.length || currentProject.analysis?.twistsCount || 0 },
                { label: 'Suspense Points', val: currentProject.suspensePoints?.length || currentProject.analysis?.suspensePointsCount || 0 },
                { label: 'Emotional Moments', val: currentProject.emotionalMoments?.length || currentProject.analysis?.emotionalMomentsCount || 0 },
              ].map((m, idx) => (
                <div key={idx} className="flex items-center justify-between px-2 py-1 rounded bg-[#060c18] border border-cyan-500/15">
                  <span className="text-slate-300 font-tech text-[11px]">{m.label}</span>
                  <span className="font-terminal font-bold text-cyan-300 text-xs">{m.val}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigateTo('story-engine')}
            className="w-full mt-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded text-[11px] font-tech text-cyan-300 hover:text-cyan-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>EXPLORE STORY ENGINE</span>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
          </button>
        </div>

      </div>

      {/* TIER 2: REAL-TIME SCAN + STORY GRAPH + CHARACTER INTELLIGENCE (Generous 3-column desktop layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5 items-stretch">
        
        {/* PANEL 4: REAL-TIME SCAN & FRAME ANALYSIS (Col 4 on xl, Col 1 on md) */}
        <div className="col-span-1 md:col-span-1 xl:col-span-4 min-w-[280px] hud-panel rounded-lg p-3.5 border border-cyan-500/30 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="tracking-wider">REAL-TIME SCAN</span>
              </div>
              <span className={`text-[10px] font-mono ${isAnalyzed ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
                {isAnalyzed ? '● ACTIVE' : 'IDLE'}
              </span>
            </div>

            {/* Wireframe head scan simulation */}
            <div className="relative h-24 bg-[#030713] rounded border border-cyan-500/30 overflow-hidden flex items-center justify-center mb-2.5">
              <div className="absolute inset-0 bg-hud-grid opacity-30" />
              {/* Wireframe face vectors */}
              <div className="relative w-16 h-20 border border-cyan-400/40 rounded-full flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,240,255,0.3)]">
                <div className="w-10 h-14 border border-cyan-500/60 rounded-full" />
                <div className="absolute top-6 left-3 right-3 h-[1px] bg-cyan-400/60" />
                <div className="absolute top-10 left-4 right-4 h-[1px] bg-cyan-400/60" />
                <div className="absolute bottom-5 left-5 right-5 h-[1px] bg-cyan-400/60" />
                <div className="w-1 h-1 bg-cyan-300 rounded-full animate-ping" />
              </div>
              <div className="absolute top-1 left-2 text-[9px] font-mono text-cyan-400/70">
                BIOMETRIC MESH
              </div>
              <div className="absolute bottom-1 right-2 text-[9px] font-mono text-emerald-400">
                LOCKED: {isAnalyzed ? `${characterConfidence}%` : 'AWAITING SCAN'}
              </div>
            </div>

            {/* Character Detection Confidence List */}
            <div className="space-y-1 text-xs">
              <div className="text-[10px] font-tech uppercase text-cyan-400/80 mb-1">
                Character Detection Confidence
              </div>
              {(currentProject.characters && currentProject.characters.length > 0) ? (
                currentProject.characters.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-300 truncate max-w-[140px]">{c.name}</span>
                    <span className="font-mono text-cyan-300 font-bold">{c.confidence}%</span>
                  </div>
                ))
              ) : (
                <div className="text-[10px] font-mono text-slate-500 py-2">
                  No biometric signatures detected yet
                </div>
              )}
            </div>
          </div>

          {/* Frame Analysis Mini Reel */}
          <div className="pt-2 border-t border-cyan-500/20 mt-2">
            <div className="text-[10px] font-tech uppercase text-cyan-400/80 mb-1 flex items-center justify-between">
              <span>Frame Analysis</span>
              <span className="font-mono text-[9px] text-slate-500">
                {currentProject.scenes?.length || 0} SCENES
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(currentProject.scenes && currentProject.scenes.length > 0) ? (
                currentProject.scenes.slice(0, 4).map((s, idx) => (
                  <div key={idx} className="bg-[#050b18] border border-cyan-500/30 rounded p-1 text-center">
                    <div className="text-[8.5px] font-mono text-slate-400">Sc {String(s.sceneNumber).padStart(3, '0')}</div>
                    <div className="text-[9.5px] font-mono font-bold text-cyan-300">{s.confidence}%</div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 py-2 text-center text-[10px] font-mono text-slate-500 bg-[#050b18] border border-slate-800 rounded">
                  NO SCENES ANALYZED YET
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 5: STORY GRAPH (Col 4 on xl, Col 1 on md) */}
        <div className="col-span-1 md:col-span-1 xl:col-span-4 min-w-[280px] hud-panel rounded-lg p-3.5 border border-cyan-500/30 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2.5">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300">
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="tracking-wider">STORY GRAPH</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80">
                {currentProject.storyGraph?.length || 9} NODES
              </span>
            </div>

            {/* Interactive SVG Node Network */}
            <div className="relative h-48 bg-[#030713] rounded border border-cyan-500/30 overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 500 380">
                {/* Connections */}
                <line x1="250" y1="150" x2="120" y2="90" stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="250" y1="150" x2="380" y2="90" stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="250" y1="150" x2="420" y2="220" stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="250" y1="150" x2="250" y2="270" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="4 2" />
                <line x1="250" y1="150" x2="100" y2="230" stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="250" y1="150" x2="180" y2="320" stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="250" y1="150" x2="360" y2="320" stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="380" y1="90" x2="420" y2="220" stroke="#00f0ff" strokeWidth="1.2" strokeOpacity="0.3" />
                <line x1="250" y1="270" x2="250" y2="350" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.5" />

                {/* Central Node: Protagonist */}
                <circle cx="250" cy="150" r="26" fill="#0c1d38" stroke="#00f0ff" strokeWidth="2" />
                <text x="250" y="154" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  {currentProject.characters?.[0]?.name?.split(' ')?.[0] || 'Lead'}
                </text>

                {/* Sub Nodes */}
                <circle cx="120" cy="90" r="18" fill="#081427" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="120" y="93" fill="#cbd5e1" fontSize="9" textAnchor="middle">
                  {currentProject.characters?.[1]?.name?.split(' ')?.[0] || 'Ally'}
                </text>

                <circle cx="380" cy="90" r="18" fill="#081427" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="380" y="93" fill="#cbd5e1" fontSize="9" textAnchor="middle">
                  {currentProject.characters?.[2]?.name?.split(' ')?.[0] || 'Mentor'}
                </text>

                <circle cx="420" cy="220" r="18" fill="#081427" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="420" y="223" fill="#cbd5e1" fontSize="9" textAnchor="middle">
                  {currentProject.characters?.[3]?.name?.split(' ')?.[0] || 'Target'}
                </text>

                <circle cx="250" cy="270" r="20" fill="#2d1017" stroke="#ef4444" strokeWidth="1.8" />
                <text x="250" y="274" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {currentProject.characters?.[4]?.name?.split(' ')?.[0] || 'Nemesis'}
                </text>

                <circle cx="100" cy="230" r="17" fill="#081427" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="100" y="233" fill="#cbd5e1" fontSize="9" textAnchor="middle">Team</text>

                <circle cx="180" cy="320" r="17" fill="#081427" stroke="#a855f7" strokeWidth="1.5" />
                <text x="180" y="323" fill="#e9d5ff" fontSize="9" textAnchor="middle">Motif</text>

                <circle cx="360" cy="320" r="17" fill="#081427" stroke="#10b981" strokeWidth="1.5" />
                <text x="360" y="323" fill="#a7f3d0" fontSize="9" textAnchor="middle">Truth</text>
              </svg>
            </div>
          </div>

          {/* Graph Legend */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] font-mono text-slate-400 mt-2">
            <div>Characters: <strong className="text-cyan-300">{currentProject.characters?.length || 12}</strong></div>
            <div>Locations: <strong className="text-cyan-300">{currentProject.scenes?.length ? Math.min(8, currentProject.scenes.length) : 8}</strong></div>
            <div>Events: <strong className="text-cyan-300">{currentProject.events?.length || 38}</strong></div>
            <div>Twists: <strong className="text-cyan-300">{currentProject.twists?.length || 4}</strong></div>
          </div>
        </div>

        {/* PANEL 6: CHARACTER INTELLIGENCE (Col 4 on xl, Col 2 on md - Spacious, unclipped cards!) */}
        <div className="col-span-1 md:col-span-2 xl:col-span-4 min-w-[280px] hud-panel rounded-lg p-3.5 border border-cyan-500/30 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2.5">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300">
                <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="tracking-wider">CHARACTER INTELLIGENCE</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80">
                ROLES // {currentProject.characters?.length || 5} IDENTIFIED
              </span>
            </div>

            {/* Responsive character cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(currentProject.characters || []).slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="bg-[#050b18] border border-cyan-500/30 rounded p-2 flex items-center space-x-2.5 group hover:border-cyan-400 transition-colors"
                >
                  <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden border border-cyan-400/50">
                    <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-black/90 text-[7.5px] font-mono text-cyan-300 px-0.5">
                      {c.confidence}%
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-tech font-bold text-slate-100 truncate" title={c.name}>
                      {c.name}
                    </div>
                    <div className="text-[9px] font-mono text-cyan-400/80 truncate uppercase">
                      {c.role}
                    </div>
                    <div className="text-[8.5px] text-slate-400 truncate">
                      {c.archetype?.split('/')?.[0] || 'Protagonist'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Character quote highlight */}
          <div className="mt-3 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 italic font-serif">
            "{currentProject.characters?.[0]?.keyQuote || currentProject.synopsis || 'An idea is like a virus. Resilient. Highly contagious.'}"
            <span className="block text-[9px] font-mono font-normal text-cyan-400/70 not-italic mt-0.5">
              — {currentProject.characters?.[0]?.name || 'Protagonist'}
            </span>
          </div>
        </div>

      </div>

      {/* TIER 3: AI DIRECTOR + SYSTEM LOGS TERMINAL (2 balanced 6-column panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        
        {/* PANEL 7: AI DIRECTOR PROMPTS (Col 6 on lg) */}
        <div className="col-span-12 lg:col-span-6 min-w-[320px] hud-panel rounded-lg p-3.5 border border-cyan-500/30 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2.5">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="tracking-wider">AI DIRECTOR DIRECTIVES</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80">RECOMMENDED</span>
            </div>

            <div className="space-y-1.5">
              {directorPrompts.map((p, idx) => {
                const isSelected = selectedDirectorPrompt === p;
                const isApplied = appliedDirectorPrompts.includes(p);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      playHudClick();
                      setSelectedDirectorPrompt(isSelected ? null : p);
                    }}
                    className={`w-full text-left p-2 rounded border text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                        : 'bg-[#050b18] border-cyan-500/20 hover:border-cyan-500/50 text-slate-300'
                    }`}
                  >
                    <span className="break-words flex-1">{p}</span>
                    {isApplied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full border border-cyan-400/60 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleApplyDirector}
            disabled={!selectedDirectorPrompt || isAiThinking}
            className={`w-full mt-3 py-2 rounded text-xs font-tech font-bold tracking-wider uppercase border transition-all cursor-pointer ${
              selectedDirectorPrompt && !isAiThinking
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isAiThinking ? 'EXECUTING CINEMA DIRECTIVE...' : 'APPLY DIRECTIVE'}
          </button>
        </div>

        {/* PANEL 8: SYSTEM LOGS TERMINAL (Col 6 on lg) */}
        <div className="col-span-12 lg:col-span-6 min-w-[320px] hud-panel rounded-lg p-3.5 border border-cyan-500/30 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300">
                <TerminalIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="tracking-wider">SYSTEM LOGS TERMINAL</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
            </div>

            <div
              ref={terminalRef}
              className="h-48 overflow-y-auto font-terminal text-[10.5px] space-y-1 text-slate-400 bg-[#02050f] p-2.5 rounded border border-cyan-500/20"
            >
              {systemLogs.slice(0, 15).map((l) => (
                <div key={l.id} className="leading-tight break-words">
                  <span className="text-slate-600">[{l.timestamp}]</span>{' '}
                  <span
                    className={
                      l.level === 'ai'
                        ? 'text-cyan-300'
                        : l.level === 'success'
                        ? 'text-emerald-300 font-semibold'
                        : l.level === 'warn'
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }
                  >
                    {l.message}
                  </span>
                </div>
              ))}
              <div className="text-cyan-400 font-bold flex items-center gap-1 mt-1">
                <span>&gt; Ready for next command...</span>
                <span className="inline-block w-1.5 h-3 bg-cyan-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="text-[9px] font-mono text-slate-500 text-center mt-2">
            SECURE LOGS BUFFER // 50 RECENT ENTRIES
          </div>
        </div>

      </div>

      {/* TIER 4: SCRIPT BREAKDOWN + AI FIRST CUT TIMELINE + QUALITY & EXPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        
        {/* PANEL 9: SCRIPT BREAKDOWN (Col 4 on lg) */}
        <div className="col-span-12 lg:col-span-4 min-w-[280px] hud-panel rounded-lg p-3.5 border border-cyan-500/30 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2.5">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300">
                <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="tracking-wider">SCRIPT BREAKDOWN</span>
              </div>
              <button
                onClick={() => navigateTo('script-studio')}
                className="text-[10px] font-tech text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>STUDIO</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {(currentProject.script?.segments || []).map((seg) => (
                <div
                  key={seg.id}
                  className="p-2 rounded bg-[#060c18] border border-cyan-500/20 hover:border-cyan-500/50 transition-colors flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{seg.timestampTarget?.split(' - ')?.[0] || '00:00'}</span>
                      <span className="text-xs font-tech font-bold text-slate-100 truncate">{seg.title?.split(':')?.[0]}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {seg.hookLine}
                    </div>
                  </div>
                  <button
                    onClick={() => navigateTo('script-studio')}
                    className="text-slate-500 hover:text-cyan-300 p-1 cursor-pointer shrink-0"
                    aria-label="Edit segment in Script Studio"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigateTo('script-studio')}
            className="w-full mt-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded text-[11px] font-tech text-cyan-300 hover:text-cyan-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>EDIT COMPLETE SCRIPT STUDIO</span>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
          </button>
        </div>

        {/* PANEL 10: AI FIRST CUT TIMELINE (Col 5 on lg) */}
        <div className="col-span-12 lg:col-span-5 min-w-[340px] hud-panel rounded-lg p-3.5 border border-cyan-500/40 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
              <div className="flex items-center space-x-2.5 text-xs font-tech font-bold text-cyan-300">
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shrink-0" />
                <span>AI FIRST CUT</span>
                <span className="text-slate-600">|</span>
                <span className="text-cyan-400 font-mono">
                  {formatTime(currentProject.timeline?.totalDuration || 1472)}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                FIRST CUT READY
              </span>
            </div>

            {/* Thumbnail Film Strip Bar */}
            <div className="flex space-x-1 mb-2 overflow-x-auto pb-1">
              {currentProject.timeline?.tracks?.[0]?.clips?.map((clip) => (
                <div
                  key={clip.id}
                  className="h-10 w-16 shrink-0 rounded overflow-hidden border border-cyan-500/30 relative"
                >
                  <img src={clip.thumbnail} alt={clip.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[7px] font-mono text-cyan-300 text-center truncate px-0.5">
                    {clip.duration}s
                  </span>
                </div>
              ))}
            </div>

            {/* Multi-track Timeline Visualizer */}
            <div className="space-y-1 bg-[#02050e] border border-cyan-500/20 rounded p-1.5 font-mono text-[9px]">
              {(currentProject.timeline?.tracks || []).map((track) => (
                <div key={track.id} className="flex items-center space-x-2">
                  <span className="w-16 truncate text-slate-400 uppercase font-tech text-[10px]">
                    {track.name}
                  </span>
                  <div className="flex-1 h-4 bg-slate-950/80 rounded border border-slate-800 relative overflow-hidden flex items-center">
                    {track.clips.map((clip) => {
                      const totalDur = currentProject.timeline?.totalDuration || 1472;
                      const widthPct = Math.max(5, (clip.duration / totalDur) * 100);
                      return (
                        <div
                          key={clip.id}
                          className="h-full rounded-sm flex items-center px-1 truncate border border-black/30"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: clip.color,
                            opacity: 0.85,
                          }}
                          title={`${clip.title} (${clip.duration}s)`}
                        >
                          <span className="truncate text-white text-[8px] font-bold">{clip.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              onClick={() => navigateTo('ai-first-cut')}
              className="text-xs font-tech text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>ADVANCED TIMELINE</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigateTo('pro-editor')}
              className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 rounded text-xs font-tech text-cyan-200 cursor-pointer"
            >
              LAUNCH PRO EDITOR
            </button>
          </div>
        </div>

        {/* PANEL 11: QUALITY CHECK & EXPORT (Col 3 on lg) */}
        <div className="col-span-12 lg:col-span-3 min-w-[260px] hud-panel rounded-lg p-3.5 border border-cyan-500/30 hud-corners flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2.5">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="tracking-wider">QUALITY CHECK</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {currentProject.analysis?.overallScore || 92} / 100
              </span>
            </div>

            {/* Quality Checklist */}
            <div className="space-y-1 text-xs">
              {[
                { name: 'Narration Sync', pct: currentProject.analysis?.narrationSyncScore || 94 },
                { name: 'Scene Matching', pct: currentProject.analysis?.sceneMatchingScore || 91 },
                { name: 'Audio Stems', pct: currentProject.analysis?.audioScore || 88 },
                { name: 'Subtitles Accuracy', pct: currentProject.analysis?.subtitlesScore || 99 },
                { name: 'Pacing Cadence', pct: currentProject.analysis?.pacingScore || 90 },
                { name: 'Continuity Flow', pct: currentProject.analysis?.continuityScore || 92 },
              ].map((q, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center space-x-1.5 text-slate-300 text-[10.5px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{q.name}</span>
                  </div>
                  <span className="font-mono text-cyan-300 text-[10.5px] font-bold">{q.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Export CTA */}
          <div className="pt-2 border-t border-cyan-500/20 space-y-2 mt-2">
            <button
              onClick={() => {
                playHudClick();
                navigateTo('export');
              }}
              className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-white font-tech font-bold text-xs py-2 rounded border border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center space-x-2 cursor-pointer transition-all"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>EXPORT PRODUCTION MASTER</span>
            </button>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Ready for YouTube 4K</span>
              <span className="text-cyan-400">SRT + 9:16 Shorts</span>
            </div>
          </div>
        </div>

      </div>

      {/* TIER 5: JARVIS AI ASSISTANT COMMAND CONSOLE BAR */}
      <div className="hud-panel rounded-lg p-3 border border-cyan-500/40 hud-corners flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        {/* Left: AI Core indicator */}
        <div 
          onClick={() => navigateTo('eye-control')}
          className="flex items-center space-x-3 shrink-0 cursor-pointer group"
          title="Open Devil's Eye Control Center"
        >
          <DevilEye 
            size="sm" 
            state={eyeState} 
            interactive={true} 
          />
          <div>
            <div className="text-xs font-tech font-bold text-cyan-200 group-hover:text-red-400 transition-colors">THE DEVIL'S EYE AI</div>
            <div className="text-[10px] font-mono text-slate-400">
              {isAiThinking ? 'SYNTHESIZING DIRECTIVE...' : 'AWAITING YOUR CINEMA COMMAND • CONFIGURE'}
            </div>
          </div>
        </div>

        {/* Center: Command input form */}
        <form onSubmit={handleCommandSubmit} className="flex-1 w-full max-w-2xl flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Tell The Devil's Eye what you want... (e.g. 'Build the first cut', 'Make opening suspenseful', 'Create 5 shorts')"
              className="w-full bg-[#030713] border border-cyan-500/40 rounded px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={isAiThinking || !commandInput.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold p-2 rounded shadow-[0_0_10px_#00f0ff] transition-all cursor-pointer"
            aria-label="Send AI Command"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Right: Quick action chips */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {[
            'Make it more engaging',
            'Remove unnecessary clips',
            'Add more suspense',
            'Shorten by 20 seconds',
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                playHudClick();
                executeAiCommand(chip);
              }}
              className="text-[10px] font-tech px-2 py-1 rounded bg-[#060c18] border border-cyan-500/20 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-200 transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
