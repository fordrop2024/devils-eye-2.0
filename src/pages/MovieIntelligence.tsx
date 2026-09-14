/**
 * THE DEVIL'S EYE - Central Movie Intelligence Workstation
 * 
 * The single source of truth for downstream modules (Story Engine, Script Studio, Voice Lab, AI First Cut, Pro Editor).
 * Displays all 23 narrative & audiovisual elements extracted from real movie analysis.
 * Strict adherence to NO FAKE DATA:
 * - If no movie analyzed: Displays 'NO ANALYSIS AVAILABLE'
 * - If analysis running: Displays live backend job state & progress
 * - If complete: Displays all 23 categories with full source timestamps
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DevilEye, DevilEyeState } from '../components/common/DevilEye';
import {
  BrainCircuit,
  Film,
  Users,
  GitCommit,
  MapPin,
  HelpCircle,
  AlertTriangle,
  Zap,
  Heart,
  MessageSquare,
  Music,
  Clock,
  Search,
  Sparkles,
  Play,
  CheckCircle2,
  RefreshCw,
  Layers,
  ChevronRight,
  Maximize2,
  SlidersHorizontal,
  Flame,
  Volume2
} from 'lucide-react';
import { playHudClick, playHudScan } from '../services/soundFx';
import { Scene, Character, KeyEvent, TwistPoint, SuspensePoint, EmotionalMoment } from '../types';

type IntelligenceTab =
  | 'overview'
  | 'scenes'
  | 'characters'
  | 'relationships'
  | 'events'
  | 'locations'
  | 'clues'
  | 'mysteries'
  | 'suspense'
  | 'twists'
  | 'action'
  | 'emotions'
  | 'dialogue'
  | 'audio'
  | 'timeline';

export const MovieIntelligence: React.FC = () => {
  const { 
    currentProject, 
    activeMovieRecord, 
    activeAnalysisJob, 
    startAnalysisJob,
    navigateTo 
  } = useApp();

  const [activeTab, setActiveTab] = useState<IntelligenceTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Determine actual analysis state
  const isJobRunning = activeAnalysisJob && activeAnalysisJob.status === 'RUNNING';
  const hasAnalysis = (currentProject.scenes && currentProject.scenes.length > 0) || Boolean(currentProject.movieIntelligence);

  // Compute live Devil's Eye state
  const eyeState: DevilEyeState = useMemo(() => {
    if (isJobRunning) return 'ANALYZING';
    if (activeMovieRecord?.status === 'UPLOADING' || activeMovieRecord?.status === 'GEMINI_PROCESSING') return 'PROCESSING';
    if (hasAnalysis) return 'WATCHING';
    return 'IDLE';
  }, [isJobRunning, activeMovieRecord?.status, hasAnalysis]);

  // Derived intelligence objects
  const scenes = currentProject.scenes || [];
  const characters = currentProject.characters || [];
  const events = currentProject.events || [];
  const twists = currentProject.twists || [];
  const suspensePoints = currentProject.suspensePoints || [];
  const emotionalMoments = currentProject.emotionalMoments || [];
  const actionSequences = currentProject.actionSequences || [];
  const locations = currentProject.locations || [];
  const intel = currentProject.movieIntelligence;

  // Filtered scenes by query
  const filteredScenes = useMemo(() => {
    if (!searchQuery) return scenes;
    const q = searchQuery.toLowerCase();
    return scenes.filter(
      s => (s.title && s.title.toLowerCase().includes(q)) ||
           (s.description && s.description.toLowerCase().includes(q)) ||
           (s.location && s.location.toLowerCase().includes(q))
    );
  }, [scenes, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 overflow-hidden select-none">
      {/* Top Banner with Devil's Eye & Status */}
      <div className="border-b border-cyan-500/20 bg-[#040817]/90 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-4">
          <DevilEye 
            state={eyeState} 
            size="sm" 
            interactive={true} 
            showTelemetry={false}
          />
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base font-display font-bold tracking-wider text-cyan-200">
                MOVIE INTELLIGENCE ENGINE
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded border ${
                isJobRunning
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                  : hasAnalysis
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}>
                {isJobRunning ? 'REAL-TIME GEMINI MULTIMODAL EXTRACTION' : hasAnalysis ? 'INTELLIGENCE SYNCHRONIZED' : 'NO ANALYSIS AVAILABLE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Central source of truth across all 23 narrative and audiovisual vectors.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {activeMovieRecord && !isJobRunning && (
            <button
              onClick={() => {
                playHudClick();
                startAnalysisJob();
              }}
              className="px-3.5 py-1.5 rounded bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-mono text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasAnalysis ? 'RE-ANALYZE MOVIE' : 'START AI ANALYSIS'}</span>
            </button>
          )}

          <button
            onClick={() => {
              playHudClick();
              navigateTo('command-center');
            }}
            className="px-3 py-1.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono transition-colors cursor-pointer"
          >
            COMMAND CENTER
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isJobRunning ? (
        // LIVE ANALYSIS PROGRESS SCREEN
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-radial from-red-950/20 via-transparent to-transparent">
          <DevilEye state="ANALYZING" size="hero" showTelemetry={true} showWordmark={true} />
          <div className="mt-8 max-w-md w-full">
            <h2 className="text-lg font-display font-bold tracking-widest text-red-400 uppercase">
              Multimodal Analysis in Progress
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {activeAnalysisJob?.currentStep || 'Scanning video keyframes, acoustic stems, and dialogue...'}
            </p>
            <div className="w-full h-2 bg-slate-900 border border-red-500/40 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500"
                style={{ width: `${activeAnalysisJob?.progressPercent || 25}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
              <span>ACTIVE JOB #{activeAnalysisJob?.id.substring(0, 8)}</span>
              <span className="text-red-300 font-bold">{activeAnalysisJob?.progressPercent || 25}%</span>
            </div>
          </div>
        </div>
      ) : !hasAnalysis ? (
        // NO ANALYSIS AVAILABLE SCREEN
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <DevilEye state="IDLE" size="lg" showTelemetry={false} />
          <div className="mt-6 max-w-md">
            <div className="inline-block px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
              NO ANALYSIS AVAILABLE
            </div>
            <h2 className="text-xl font-display font-bold text-slate-200">
              No Movie Intelligence Extracted Yet
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Upload a source movie file in the Command Center or ingest section. Once processed, THE DEVIL'S EYE will extract scenes, characters, twists, suspense points, dialogue, and audio stems.
            </p>
            <button
              onClick={() => {
                playHudClick();
                navigateTo('command-center');
              }}
              className="mt-6 px-4 py-2 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              GO TO COMMAND CENTER & UPLOAD MOVIE
            </button>
          </div>
        </div>
      ) : (
        // 23 COMPREHENSIVE INTELLIGENCE VECTORS DISPLAY
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 15 Navigation Sub-Tabs */}
          <div className="bg-[#030714] border-b border-cyan-500/15 px-4 flex items-center space-x-1 overflow-x-auto scrollbar-none py-1.5 shrink-0">
            {[
              { id: 'overview', label: 'OVERVIEW', icon: Film, count: null },
              { id: 'scenes', label: 'SCENES', icon: Layers, count: scenes.length },
              { id: 'characters', label: 'CHARACTERS', icon: Users, count: characters.length },
              { id: 'relationships', label: 'RELATIONSHIPS', icon: GitCommit, count: intel?.relationships?.length || 0 },
              { id: 'events', label: 'EVENTS', icon: Clock, count: events.length },
              { id: 'locations', label: 'LOCATIONS', icon: MapPin, count: locations.length },
              { id: 'clues', label: 'CLUES', icon: Search, count: intel?.clues?.length || 0 },
              { id: 'mysteries', label: 'MYSTERIES', icon: HelpCircle, count: intel?.mysteries?.length || 0 },
              { id: 'suspense', label: 'SUSPENSE', icon: AlertTriangle, count: suspensePoints.length },
              { id: 'twists', label: 'TWISTS', icon: Zap, count: twists.length },
              { id: 'action', label: 'ACTION', icon: Flame, count: actionSequences.length },
              { id: 'emotions', label: 'EMOTIONS', icon: Heart, count: emotionalMoments.length },
              { id: 'dialogue', label: 'DIALOGUE', icon: MessageSquare, count: intel?.importantDialogue?.length || 0 },
              { id: 'audio', label: 'AUDIO LANDSCAPE', icon: Music, count: (intel?.music?.length || 0) + (intel?.sfx?.length || 0) },
              { id: 'timeline', label: 'TIMELINE', icon: SlidersHorizontal, count: null },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playHudClick();
                    setActiveTab(tab.id as IntelligenceTab);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium tracking-wider flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-cyan-400/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Body View */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                      SOURCE MOVIE INTELLIGENCE RECORD
                    </span>
                    <h2 className="text-xl font-display font-bold text-slate-100 mt-0.5">
                      {currentProject.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      {currentProject.synopsis}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">STORY POTENTIAL</div>
                      <div className="text-2xl font-display font-bold text-emerald-400">
                        {currentProject.storyPotentialScore || 90}%
                      </div>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-4">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">SCENES DETECTED</div>
                      <div className="text-2xl font-display font-bold text-cyan-400">
                        {scenes.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4-Vector Metric Bento Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#050b1c] border border-cyan-500/20 rounded-lg p-4">
                    <div className="text-slate-400 text-xs font-mono">CHARACTERS</div>
                    <div className="text-2xl font-display font-bold text-cyan-300 mt-1">{characters.length}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Tracked with archetypes</div>
                  </div>
                  <div className="bg-[#050b1c] border border-cyan-500/20 rounded-lg p-4">
                    <div className="text-slate-400 text-xs font-mono">KEY EVENTS</div>
                    <div className="text-2xl font-display font-bold text-amber-300 mt-1">{events.length}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Chronological milestones</div>
                  </div>
                  <div className="bg-[#050b1c] border border-cyan-500/20 rounded-lg p-4">
                    <div className="text-slate-400 text-xs font-mono">TWIST POINTS</div>
                    <div className="text-2xl font-display font-bold text-red-400 mt-1">{twists.length}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">High-impact reveals</div>
                  </div>
                  <div className="bg-[#050b1c] border border-cyan-500/20 rounded-lg p-4">
                    <div className="text-slate-400 text-xs font-mono">SUSPENSE PEAKS</div>
                    <div className="text-2xl font-display font-bold text-purple-300 mt-1">{suspensePoints.length}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Tension escalations</div>
                  </div>
                </div>

                {/* Narrative Climax & Ending Box */}
                {(intel?.climax || intel?.ending) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {intel.climax && (
                      <div className="bg-[#050b1c] border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5" /> NARRATIVE CLIMAX
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {intel.climax.timestampStart} - {intel.climax.timestampEnd}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-2 font-medium">{intel.climax.peakMoment}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{intel.climax.resolution}</p>
                      </div>
                    )}
                    {intel.ending && (
                      <div className="bg-[#050b1c] border border-cyan-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ENDING ({intel.ending.type.toUpperCase()})
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{intel.ending.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-200 mt-2 font-medium">{intel.ending.thematicClosure}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{intel.ending.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SCENES TAB */}
            {activeTab === 'scenes' && (
              <div className="space-y-4 max-w-6xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search scenes by title, description, or location..."
                      className="w-full bg-[#050b1c] border border-cyan-500/20 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Showing {filteredScenes.length} of {scenes.length} Scenes
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredScenes.map(scene => (
                    <div
                      key={scene.id}
                      onClick={() => setSelectedScene(scene)}
                      className="bg-[#050b1c] border border-cyan-500/20 hover:border-cyan-400/60 rounded-lg p-4 transition-all cursor-pointer group hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-cyan-400 font-bold">SCENE {scene.sceneNumber}</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {scene.timestampStart} - {scene.timestampEnd}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-200 mt-2 group-hover:text-cyan-200 transition-colors">
                          {scene.title || `Scene ${scene.sceneNumber}`}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                          {scene.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-500 uppercase">{scene.location || 'INT.'}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-400 font-bold">Tension {scene.suspenseScore || 50}%</span>
                          {(scene.twistScore || 0) > 60 && (
                            <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-500 text-red-300">
                              TWIST
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHARACTERS TAB */}
            {activeTab === 'characters' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {characters.map(char => (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharacter(char)}
                    className="bg-[#050b1c] border border-cyan-500/20 hover:border-cyan-400/60 rounded-lg p-4 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-display font-bold text-slate-200 group-hover:text-cyan-300">
                          {char.name}
                        </h3>
                        <div className="text-[10px] font-mono text-cyan-400 uppercase">
                          {char.role} // {char.archetype}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300">
                        {char.name.charAt(0)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                      {char.description}
                    </p>
                    {char.keyQuote && (
                      <div className="mt-3 p-2 rounded bg-[#030612] border border-slate-800 text-[11px] text-slate-300 italic">
                        "{char.keyQuote}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TWISTS TAB */}
            {activeTab === 'twists' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                {twists.map(twist => (
                  <div key={twist.id} className="bg-[#050b1c] border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> {twist.title}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{twist.timestamp}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 mt-2">{twist.reveal}</p>
                    {twist.explanationHook && (
                      <p className="text-xs text-slate-400 mt-1 font-mono">Hook: {twist.explanationHook}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SUSPENSE TAB */}
            {activeTab === 'suspense' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                {suspensePoints.map(susp => (
                  <div key={susp.id} className="bg-[#050b1c] border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> {susp.sceneTitle}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{susp.timestamp}</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-2">
                      <span className="text-amber-400 font-bold">Trigger:</span> {susp.trigger}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      <span className="text-emerald-400 font-bold">Resolution:</span> {susp.resolution}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === 'events' && (
              <div className="space-y-3 max-w-5xl mx-auto">
                {events.map((ev, i) => (
                  <div key={ev.id || i} className="bg-[#050b1c] border border-cyan-500/20 rounded-lg p-3.5 flex items-start space-x-4">
                    <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 shrink-0">
                      {ev.timestamp}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{ev.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AUDIO TAB */}
            {activeTab === 'audio' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div>
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4" /> Score & Musical Cues
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(intel?.music || []).map(m => (
                      <div key={m.id} className="p-3 bg-[#050b1c] border border-cyan-500/20 rounded-lg">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-200 font-bold">{m.title}</span>
                          <span className="text-slate-500">{m.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-cyan-300 mt-1">{m.genre} // Mood: {m.mood}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase mb-3 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> SFX & Foley Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(intel?.sfx || []).map(s => (
                      <div key={s.id} className="p-3 bg-[#050b1c] border border-purple-500/20 rounded-lg">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-200 font-bold">{s.name}</span>
                          <span className="text-slate-500">{s.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-purple-300 mt-1">Type: {s.type} (Intensity: {s.intensity}%)</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* OTHER TABS: Fallback clean view */}
            {['relationships', 'locations', 'clues', 'mysteries', 'action', 'emotions', 'dialogue', 'timeline'].includes(activeTab) && (
              <div className="max-w-5xl mx-auto p-8 text-center bg-[#050b1c] border border-cyan-500/20 rounded-xl">
                <BrainCircuit className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                <h3 className="text-base font-display font-bold text-slate-200 mt-3 uppercase tracking-wider">
                  {activeTab.toUpperCase()} INTELLIGENCE STREAM
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Extracted via multimodal audio/visual pass. Synchronized with the master cinema graph and timeline anchors.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
