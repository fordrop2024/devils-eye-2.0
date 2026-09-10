/**
 * THE DEVIL'S EYE - Persistent Futuristic Navigation Sidebar
 * 17 dedicated workstation modules with holographic HUD styling.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';
import {
  LayoutDashboard,
  Film,
  BrainCircuit,
  GitFork,
  FileText,
  Mic,
  Clapperboard,
  Sliders,
  Subtitles,
  Smartphone,
  Image,
  Search,
  Youtube,
  BarChart3,
  Calendar,
  Layers,
  Settings,
  Eye,
  ChevronRight,
  X
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
  { id: 'movie-library', label: 'Movie Library', icon: Film },
  { id: 'movie-intelligence', label: 'Movie Intelligence', icon: BrainCircuit, tag: 'AI' },
  { id: 'story-engine', label: 'Story Engine', icon: GitFork },
  { id: 'script-studio', label: 'Script Studio', icon: FileText },
  { id: 'voice-lab', label: 'Voice Lab', icon: Mic },
  { id: 'ai-first-cut', label: 'AI First Cut', icon: Clapperboard, tag: 'AUTO' },
  { id: 'pro-editor', label: 'Pro Editor', icon: Sliders },
  { id: 'subtitle-studio', label: 'Subtitle Studio', icon: Subtitles },
  { id: 'shorts-lab', label: 'Shorts Lab', icon: Smartphone, tag: '9:16' },
  { id: 'thumbnail-lab', label: 'Thumbnail Lab', icon: Image },
  { id: 'seo-center', label: 'SEO Center', icon: Search },
  { id: 'youtube', label: 'YouTube Pipeline', icon: Youtube },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'content-planner', label: 'Content Planner', icon: Calendar },
  { id: 'web-series', label: 'Web Series', icon: Layers },
  { id: 'settings', label: 'Settings & Core', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activePage, navigateTo, isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        w-64 lg:w-56 bg-[#030611] border-r border-cyan-500/20 flex flex-col justify-between select-none relative z-40 shrink-0 h-[calc(100vh-3.5rem)]
        transition-all duration-300 ease-in-out
        ${isMobileSidebarOpen 
          ? 'fixed inset-y-0 left-0 top-14 shadow-2xl flex z-50' 
          : 'hidden lg:flex'
        }
      `}>
        {/* Top Logo and Identity */}
        <div>
          <div className="px-3 py-3.5 border-b border-cyan-500/15 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]">
                <Eye className="w-4 h-4 text-cyan-300 animate-pulse" />
                <div className="absolute inset-0 rounded-lg border border-cyan-300/40 animate-ping opacity-20 pointer-events-none" />
              </div>
              <div>
                <div className="text-[13px] font-display font-bold tracking-wider text-cyan-200">
                  THE DEVIL'S EYE
                </div>
                <div className="text-[9px] font-mono tracking-widest text-cyan-400/60 uppercase">
                  CINEMA AI COMMAND
                </div>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-cyan-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        {/* Navigation List */}
        <nav className="p-1.5 space-y-0.5 max-h-[calc(100vh-19rem)] overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full group text-left px-2.5 py-1.5 rounded transition-all duration-150 flex items-center justify-between text-xs cursor-pointer relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/50 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                {/* Active neon strip indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-cyan-400 rounded-r shadow-[0_0_8px_#00f0ff]" />
                )}

                <div className="flex items-center space-x-2.5 truncate pl-1">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-cyan-400'
                    }`}
                  />
                  <span className="truncate tracking-wide font-tech text-[12.5px]">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {item.tag && (
                    <span className={`text-[8.5px] font-mono px-1 py-0.2 rounded border uppercase ${
                      isActive
                        ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:border-cyan-500/30'
                    }`}>
                      {item.tag}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 text-cyan-400/80" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Holographic Radar / Motto Widget matching screenshot */}
      <div className="p-3 border-t border-cyan-500/20 bg-[#02050f]/80 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-cyan-500/5 blur-xl pointer-events-none" />

        {/* Circular HUD gizmo */}
        <div className="relative w-16 h-16 mx-auto mb-2">
          {/* Outer ring with tick marks */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed animate-[spin_20s_linear_infinite]" />
          {/* Inner ring */}
          <div className="absolute inset-1.5 rounded-full border border-cyan-400/40 animate-[spin_10s_linear_infinite_reverse]" />
          {/* Center core */}
          <div className="absolute inset-3 rounded-full bg-cyan-950/60 border border-cyan-400/70 flex items-center justify-center shadow-[inset_0_0_8px_rgba(0,240,255,0.4)]">
            <span className="text-cyan-300 font-display font-bold text-xs">AI</span>
          </div>
        </div>

        <div className="text-[11px] font-serif italic text-cyan-300/80 tracking-wide">
          "Better Stories. Bigger Audience."
        </div>
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
          THE DEVIL'S EYE CORE
        </div>
      </div>
    </aside>
    </>
  );
};
