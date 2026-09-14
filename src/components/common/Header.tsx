/**
 * THE DEVIL'S EYE - Top Holographic Status Bar
 * Displays live AI core status, GPU/MEM telemetry, project switcher, and user clearance.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DevilEye, DevilEyeState } from './DevilEye';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Volume2, 
  VolumeX, 
  User, 
  Settings, 
  Sparkles, 
  ChevronDown, 
  DownloadCloud,
  LogOut,
  Menu
} from 'lucide-react';
import { playHudClick } from '../../services/soundFx';

export const Header: React.FC = () => {
  const { 
    systemStatus, 
    aiCoreVersion, 
    gpuUsage, 
    memUsage, 
    tokensUsed,
    projects, 
    currentProject, 
    setCurrentProjectId, 
    user, 
    logout, 
    soundMuted, 
    toggleSound,
    navigateTo,
    setIsExportModalOpen,
    toggleMobileSidebar,
    activeAnalysisJob,
    activeMovieRecord,
    isAiThinking
  } = useApp();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Derive real-time Devil's Eye state strictly from active job/movie telemetry
  const eyeState: DevilEyeState = useMemo(() => {
    if (activeAnalysisJob?.status === 'RUNNING') return 'ANALYZING';
    if (activeAnalysisJob?.status === 'FAILED') return 'ERROR';
    if (activeMovieRecord?.status === 'FAILED') return 'ERROR';
    if (isAiThinking) return 'THINKING';
    if (activeMovieRecord?.status === 'UPLOADING' || activeMovieRecord?.status === 'GEMINI_PROCESSING') return 'PROCESSING';
    if (activeMovieRecord?.geminiFileState === 'ACTIVE' && !activeAnalysisJob) return 'FOCUS';
    if (currentProject.analysisStatus === 'ANALYSIS COMPLETE') return 'WATCHING';
    return 'IDLE';
  }, [activeAnalysisJob, activeMovieRecord, isAiThinking, currentProject.analysisStatus]);

  return (
    <header className="h-14 bg-[#040814]/90 border-b border-cyan-500/20 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none relative">
      {/* Subtle top cyan line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Left section: System status & AI Core */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => {
            playHudClick();
            toggleMobileSidebar();
          }}
          className="lg:hidden p-1.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Devil's Eye AI Logo & Live State */}
        <div 
          onClick={() => navigateTo('eye-control')}
          className="flex items-center space-x-2 cursor-pointer group"
          title="Open The Devil's Eye AI Core Control Center"
        >
          <DevilEye size="xs" state={eyeState} interactive={true} />
        </div>

        {/* Status indicator pill */}
        <div className="flex items-center space-x-2 bg-slate-900/80 border border-emerald-500/40 rounded-full px-2.5 sm:px-3 py-1 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-[10px] sm:text-[11px] font-tech font-semibold tracking-wider text-emerald-300">
            SYSTEM {systemStatus}
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-3 text-xs text-cyan-300/70 border-l border-cyan-500/20 pl-4 font-terminal">
          <span className="text-cyan-400 font-semibold">{aiCoreVersion.split(' - ')[0]}</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300/80 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            MULTIMODAL ANALYSIS ACTIVE
          </span>
        </div>
      </div>

      {/* Center: Live GPU & Memory gauges */}
      <div className="hidden xl:flex items-center space-x-6 text-[11px] font-tech text-slate-400">
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>GPU</span>
          <div className="w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700" 
              style={{ width: `${gpuUsage}%` }} 
            />
          </div>
          <span className="font-terminal text-cyan-300 font-semibold">{gpuUsage}%</span>
        </div>

        <div className="flex items-center space-x-2">
          <HardDrive className="w-3.5 h-3.5 text-purple-400" />
          <span>MEM</span>
          <div className="w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-purple-500/30">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700" 
              style={{ width: `${memUsage}%` }} 
            />
          </div>
          <span className="font-terminal text-purple-300 font-semibold">{memUsage}%</span>
        </div>

        <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-4 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>TOKENS</span>
          <span className="font-terminal text-amber-300 font-semibold">
            {tokensUsed.toLocaleString()} / 100K
          </span>
        </div>
      </div>

      {/* Right section: Project switcher & controls */}
      <div className="flex items-center space-x-3">
        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => {
              playHudClick();
              setIsProjectDropdownOpen(!isProjectDropdownOpen);
            }}
            className="flex items-center space-x-2 bg-[#091322] hover:bg-[#0e1d35] border border-cyan-500/30 hover:border-cyan-400/60 rounded px-3 py-1.5 text-xs text-slate-200 transition-colors"
          >
            <span className="text-cyan-400 font-mono text-[10px] uppercase">Proj:</span>
            <span className="font-medium max-w-[140px] truncate text-slate-100">{currentProject.title}</span>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400/80" />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#080f1e] border border-cyan-500/40 rounded shadow-2xl p-1 z-50 hud-corners font-sans">
              <div className="text-[10px] font-tech uppercase text-cyan-400/70 px-3 py-1 border-b border-cyan-500/20">
                Switch Cinema Project
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentProjectId(p.id);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between transition-colors ${
                      p.id === currentProject.id 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.type.toUpperCase()} • {p.duration}</div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono">
                      {p.status.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-cyan-500/20 pt-1">
                <button
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    navigateTo('movie-library');
                  }}
                  className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 py-1.5 hover:bg-cyan-500/10 rounded transition-colors font-tech"
                >
                  + Ingest New Project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Export Button */}
        <button
          onClick={() => {
            playHudClick();
            navigateTo('export');
          }}
          className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 rounded px-3 py-1.5 text-xs font-tech font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span>EXPORT</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          title={soundMuted ? 'Unmute Futuristic HUD Audio' : 'Mute Futuristic HUD Audio'}
          className={`p-1.5 rounded border transition-colors cursor-pointer ${
            soundMuted 
              ? 'border-slate-800 text-slate-500 hover:text-slate-300' 
              : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
          }`}
        >
          {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* User Pill */}
        <div className="relative">
          <button
            onClick={() => {
              playHudClick();
              setIsUserMenuOpen(!isUserMenuOpen);
            }}
            className="flex items-center space-x-2 bg-[#091322] hover:bg-[#0e1d35] border border-cyan-500/20 rounded-full pl-2 pr-3 py-1 text-xs text-slate-200 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 text-[10px] font-bold">
              <User className="w-3 h-3" />
            </div>
            <span className="font-tech text-xs hidden md:inline">{user?.name || 'Operator'}</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#080f1e] border border-cyan-500/40 rounded shadow-2xl p-1 z-50 font-sans">
              <div className="px-3 py-2 border-b border-cyan-500/20">
                <div className="text-xs font-semibold text-slate-200">{user?.name || 'Operator'}</div>
                <div className="text-[10px] text-cyan-400/80 font-mono">{user?.role || 'Guest Clearance'}</div>
              </div>
              <button
                onClick={() => {
                  navigateTo('settings');
                  setIsUserMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/80 rounded flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                Settings & API
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsUserMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect Core
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
