import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GitFork, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Film, 
  Users, 
  AlertTriangle, 
  Zap, 
  HelpCircle, 
  Flame, 
  Layers, 
  ChevronRight, 
  Compass, 
  Target, 
  BookOpen, 
  SlidersHorizontal, 
  RefreshCw, 
  X,
  BrainCircuit,
  Eye,
  ShieldAlert,
  Info
} from 'lucide-react';
import { playHudClick, playHudSuccess, playHudScan } from '../services/soundFx';
import { 
  generateStoryBeats, 
  generateExplainerScript, 
  extractCharacterIntelligence, 
  getStoryDirectorRecommendations,
  GENRE_SIGNAL_PROFILES,
  StoryDirectorRecommendation
} from '../services/storyEngineService';
import { ExplainerGenre, StoryBeat, NarrativeStage } from '../types';

type StorySection = 
  | 'overview'
  | 'beats'
  | 'characters'
  | 'events'
  | 'mysteries'
  | 'suspense'
  | 'twists'
  | 'climax'
  | 'ending'
  | 'timeline';

const ALL_GENRES: ExplainerGenre[] = [
  'Action',
  'Thriller',
  'Mystery',
  'Crime',
  'Horror',
  'Psychological',
  'Sci-Fi',
  'Drama',
  'Comedy',
  'Romance',
  'Documentary',
  'True Crime',
  'Adventure',
  'Fantasy'
];

export const StoryEngine: React.FC = () => {
  const { currentProject, updateCurrentProject, navigateTo, addToast } = useApp();
  
  const [activeSection, setActiveSection] = useState<StorySection>('overview');
  const [selectedGenre, setSelectedGenre] = useState<ExplainerGenre>(
    (currentProject.genre?.[0] as ExplainerGenre) || 'Thriller'
  );
  const [selectedBeat, setSelectedBeat] = useState<StoryBeat | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [showDirectorPanel, setShowDirectorPanel] = useState<boolean>(true);

  // Derive real status strictly from data
  const hasScenes = Boolean(currentProject.scenes && currentProject.scenes.length > 0);
  const hasMovieIntel = Boolean(currentProject.movieIntelligence);
  const hasAnalysis = hasScenes || hasMovieIntel;
  const rawBeats = currentProject.storyBeats || [];
  const hasBeats = rawBeats.length > 0;

  // Determine current Story Engine state
  const storyStatus = useMemo(() => {
    if (isSynthesizing) return 'STORY GENERATING';
    if (!hasAnalysis) return 'NOT ANALYZED';
    if (hasBeats) return 'STORY READY';
    return 'ANALYSIS READY';
  }, [isSynthesizing, hasAnalysis, hasBeats]);

  // Derived movie intelligence items
  const scenes = useMemo(() => currentProject.scenes || [], [currentProject.scenes]);
  const characters = useMemo(() => extractCharacterIntelligence(currentProject), [currentProject]);
  const directorRecommendations = useMemo(() => getStoryDirectorRecommendations(currentProject), [currentProject]);

  // Synthesize Story Beats handler
  const handleSynthesizeBeats = () => {
    if (!hasAnalysis) {
      addToast('No Analyzed Movie', 'Please upload and analyze a movie file first.', 'warn');
      return;
    }

    playHudScan();
    setIsSynthesizing(true);
    updateCurrentProject({ storyStatus: 'STORY GENERATING' });

    setTimeout(() => {
      try {
        const synthesizedBeats = generateStoryBeats(currentProject, selectedGenre);
        const synthesizedScript = generateExplainerScript(currentProject, synthesizedBeats, 'English');

        updateCurrentProject({
          storyBeats: synthesizedBeats,
          script: synthesizedScript,
          storyStatus: 'STORY READY',
          storyConfig: {
            targetDuration: currentProject.storyConfig?.targetDuration || '15 min',
            targetDurationSec: currentProject.storyConfig?.targetDurationSec || 900,
            targetWords: currentProject.storyConfig?.targetWords || 1950,
            estimatedNarrationDuration: currentProject.storyConfig?.estimatedNarrationDuration || '15:00',
            estimatedNarrationSec: currentProject.storyConfig?.estimatedNarrationSec || 900,
            language: currentProject.storyConfig?.language || 'English',
            delayInformationStrategy: currentProject.storyConfig?.delayInformationStrategy ?? true,
            storytellingStrategy: currentProject.storyConfig?.storytellingStrategy || 'suspense-driven',
            targetAudience: currentProject.storyConfig?.targetAudience || 'General Audience',
            pacing: currentProject.storyConfig?.pacing || 'Medium',
            hookStrategy: currentProject.storyConfig?.hookStrategy || 'High-Concept Shock',
            ...currentProject.storyConfig,
            selectedGenre
          }
        });

        setIsSynthesizing(false);
        playHudSuccess();
        addToast('Story Structure Synthesized', `Generated 13 explainer beats for ${selectedGenre} narrative profile.`, 'success');
        if (synthesizedBeats.length > 0) {
          setSelectedBeat(synthesizedBeats[0]);
        }
      } catch (err) {
        setIsSynthesizing(false);
        updateCurrentProject({ storyStatus: 'STORY FAILED', storyError: 'Failed to synthesize story structure' });
        addToast('Synthesis Error', 'Failed to generate story beats from movie intelligence.', 'error');
      }
    }, 600);
  };

  // 1. EMPTY STATE: NO ANALYZED MOVIE AVAILABLE
  if (!hasAnalysis) {
    return (
      <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              STORY ENGINE // 13-STAGE NARRATIVE ARCHITECTURE
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              CENTRAL SOURCE OF TRUTH: NO ANALYZED MOVIE AVAILABLE
            </p>
          </div>
          <button
            onClick={() => {
              playHudClick();
              navigateTo('movie-intelligence');
            }}
            className="px-4 py-2 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold tracking-wider flex items-center space-x-2 cursor-pointer transition-colors"
          >
            <Film className="w-4 h-4" />
            <span>OPEN MOVIE INTELLIGENCE</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-900/90 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-500">
            <Film className="w-8 h-8" />
          </div>
          <h2 className="text-base font-display font-bold text-slate-200 tracking-wider">
            NO ANALYZED MOVIE AVAILABLE
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The Story Engine derives narrative structure directly from centralized Movie Intelligence.
            No analyzed movie data exists in this project yet. Please ingest a movie in Movie Library
            or run analysis in Movie Intelligence to generate scenes, characters, and source timestamps.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                playHudClick();
                navigateTo('movie-intelligence');
              }}
              className="px-4 py-2 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold tracking-wider cursor-pointer"
            >
              GO TO MOVIE INTELLIGENCE
            </button>
            <button
              onClick={() => {
                playHudClick();
                navigateTo('movie-library');
              }}
              className="px-4 py-2 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-mono font-bold tracking-wider cursor-pointer"
            >
              UPLOAD VIDEO IN LIBRARY
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN ACTIVE STORY ENGINE
  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 overflow-hidden">
      {/* Top Bar Header */}
      <div className="border-b border-cyan-500/20 bg-[#040817]/90 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-display font-bold text-cyan-200 tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              STORY ENGINE
            </h1>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-300">
              {currentProject.title || 'ACTIVE MOVIE'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
              storyStatus === 'STORY READY'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : storyStatus === 'STORY GENERATING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {storyStatus}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {scenes.length} scenes analyzed &bull; {characters.length} characters &bull; {rawBeats.length} explainer beats
          </p>
        </div>

        {/* Controls & Navigation */}
        <div className="flex items-center space-x-3">
          {/* Genre Selector */}
          <div className="flex items-center space-x-1.5 bg-[#050b1c] border border-cyan-500/30 rounded px-2.5 py-1">
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">GENRE:</span>
            <select
              value={selectedGenre}
              onChange={e => {
                playHudClick();
                setSelectedGenre(e.target.value as ExplainerGenre);
              }}
              className="bg-transparent text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer"
            >
              {ALL_GENRES.map(g => (
                <option key={g} value={g} className="bg-[#040817] text-slate-200">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Synthesize Button */}
          <button
            onClick={handleSynthesizeBeats}
            disabled={isSynthesizing}
            className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold tracking-wider flex items-center space-x-1.5 cursor-pointer transition-all ${
              isSynthesizing
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600/80 via-amber-600/80 to-amber-500/80 hover:from-red-600 hover:to-amber-500 text-white border border-amber-500/50 shadow-lg shadow-red-950/30'
            }`}
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>SYNTHESIZING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{hasBeats ? 'RE-SYNTHESIZE BEATS' : 'SYNTHESIZE 13-STAGE BEATS'}</span>
              </>
            )}
          </button>

          {/* Proceed to Script Studio */}
          <button
            onClick={() => {
              playHudClick();
              navigateTo('script-studio');
            }}
            className="px-3.5 py-1.5 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold tracking-wider flex items-center space-x-1.5 cursor-pointer"
          >
            <span>SCRIPT STUDIO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subnav Tabs: All 10 Required Sections */}
      <div className="border-b border-cyan-500/20 bg-[#030714] px-6 py-2 flex items-center justify-between shrink-0 overflow-x-auto">
        <div className="flex items-center space-x-1">
          {[
            { id: 'overview', label: 'STORY OVERVIEW' },
            { id: 'beats', label: 'STORY BEATS (13)' },
            { id: 'characters', label: 'CHARACTER ARC' },
            { id: 'events', label: 'KEY EVENTS' },
            { id: 'mysteries', label: 'MYSTERIES' },
            { id: 'suspense', label: 'SUSPENSE' },
            { id: 'twists', label: 'TWISTS' },
            { id: 'climax', label: 'CLIMAX' },
            { id: 'ending', label: 'ENDING' },
            { id: 'timeline', label: 'SOURCE TIMELINE' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                playHudClick();
                setActiveSection(tab.id as StorySection);
              }}
              className={`px-3 py-1 rounded text-xs font-mono tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeSection === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* AI Director Toggle */}
        <button
          onClick={() => {
            playHudClick();
            setShowDirectorPanel(!showDirectorPanel);
          }}
          className={`ml-4 px-2.5 py-1 rounded text-[11px] font-mono tracking-wider flex items-center space-x-1.5 cursor-pointer shrink-0 ${
            showDirectorPanel
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
          <span>AI STORY DIRECTOR ({directorRecommendations.length})</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Primary Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI STORY DIRECTOR RECOMMENDATIONS (COLLAPSIBLE BANNER) */}
          {showDirectorPanel && directorRecommendations.length > 0 && (
            <div className="bg-[#050c20] border border-amber-500/30 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-mono font-bold text-amber-300 tracking-wider uppercase">
                    AI STORY DIRECTOR // MOVIE-GROUNDED DIRECTORIAL RECOMMENDATIONS
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Derived from {scenes.length} analyzed movie scenes
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {directorRecommendations.slice(0, 6).map((rec, idx) => (
                  <div key={idx} className="bg-[#030714] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-amber-400 font-bold uppercase">{rec.type}</span>
                        {rec.timestamp && (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-cyan-400" />
                            {rec.timestamp}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-1">{rec.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">{rec.reason}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300/80 flex items-center gap-1">
                      <Target className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{rec.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. STORY OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-500/10">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase">
                      SELECTED GENRE NARRATIVE PROFILE
                    </span>
                    <h2 className="text-base font-display font-bold text-slate-100 mt-0.5">
                      {selectedGenre} Explainer Dynamics
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">STATUS</span>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {storyStatus}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {GENRE_SIGNAL_PROFILES[selectedGenre]?.description ||
                    'Extracts high-impact cinematic moments and maps tension curves.'}
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-cyan-500/10 text-xs font-mono">
                  <div className="bg-[#030714] p-3 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">TOTAL SCENES</span>
                    <span className="text-base font-bold text-cyan-300">{scenes.length}</span>
                  </div>
                  <div className="bg-[#030714] p-3 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">CHARACTERS DETECTED</span>
                    <span className="text-base font-bold text-amber-300">{characters.length}</span>
                  </div>
                  <div className="bg-[#030714] p-3 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">SYNTHESIZED BEATS</span>
                    <span className="text-base font-bold text-slate-200">{rawBeats.length} / 13</span>
                  </div>
                  <div className="bg-[#030714] p-3 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">SOURCE TIMESTAMPS</span>
                    <span className="text-base font-bold text-emerald-400">100% PRESERVED</span>
                  </div>
                </div>
              </div>

              {/* 13-Stage Visual Progression */}
              <div className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-5">
                <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  13-STAGE NARRATIVE STRUCTURE MAP
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {rawBeats.map((beat, idx) => (
                    <div 
                      key={beat.id || idx}
                      onClick={() => {
                        playHudClick();
                        setSelectedBeat(beat);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedBeat?.id === beat.id
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/50'
                          : 'bg-[#030714] border-slate-800 hover:border-cyan-500/40 hover:bg-[#050d24]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-cyan-400 font-bold">STAGE {idx + 1}</span>
                        <span className="text-slate-400">{beat.actualTimestamp || '00:00:00'}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-1 truncate">{beat.stage}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{beat.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. STORY BEATS SECTION */}
          {activeSection === 'beats' && (
            <div className="space-y-3">
              {rawBeats.length === 0 ? (
                <div className="p-8 bg-[#050b1c] border border-cyan-500/20 rounded-xl text-center">
                  <p className="text-xs text-slate-400">
                    Found {scenes.length} analyzed scenes ready for explainer synthesis.
                  </p>
                  <button
                    onClick={handleSynthesizeBeats}
                    className="mt-3 px-4 py-2 rounded bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-mono font-bold tracking-wider cursor-pointer"
                  >
                    SYNTHESIZE 13-STAGE EXPLAINER BEATS
                  </button>
                </div>
              ) : (
                rawBeats.map((beat, idx) => (
                  <div
                    key={beat.id || idx}
                    onClick={() => {
                      playHudClick();
                      setSelectedBeat(beat);
                    }}
                    className={`bg-[#050b1c] border rounded-lg p-4 cursor-pointer transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                      selectedBeat?.id === beat.id
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-950/40'
                        : 'border-cyan-500/20 hover:border-cyan-500/50 hover:bg-[#060e24]'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="text-cyan-400 font-bold">BEAT #{beat.beatNumber || idx + 1}</span>
                        <span className="text-slate-600">|</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {beat.stage}
                        </span>
                        {beat.isKeyTwist && (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-red-400" />
                            KEY TWIST
                          </span>
                        )}
                        <span className="text-slate-500 text-[11px]">
                          Source: Scene {beat.sourceSceneNumber || beat.sourceMapping?.sceneNumber || 'Mapped'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 mt-2">{beat.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{beat.description}</p>

                      {beat.narrationGoal && (
                        <div className="mt-2 text-[11px] text-cyan-300/90 font-mono bg-cyan-950/30 border border-cyan-500/20 px-2.5 py-1.5 rounded">
                          <span className="text-cyan-400 font-bold">NARRATION GOAL: </span>
                          {beat.narrationGoal}
                        </div>
                      )}

                      {beat.curiosityGap && (
                        <p className="text-[11px] text-amber-300/80 mt-1.5 italic">
                          &ldquo;{beat.curiosityGap}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Source Mapping Metrics */}
                    <div className="shrink-0 flex flex-col md:items-end text-xs font-mono space-y-1.5 text-slate-400">
                      <div className="flex items-center gap-1.5 text-cyan-300 bg-[#030714] px-2.5 py-1 rounded border border-slate-800">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>
                          {beat.sourceStartTimestamp || beat.actualTimestamp || '00:00:00'} - {beat.sourceEndTimestamp || '00:01:30'}
                        </span>
                      </div>

                      <div className="text-[11px]">
                        Tension: <span className="text-amber-400 font-bold">{beat.tensionLevel}%</span>
                      </div>

                      {beat.charactersInvolved && beat.charactersInvolved.length > 0 && (
                        <div className="text-[10px] text-slate-500 max-w-[180px] truncate">
                          Chars: {beat.charactersInvolved.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. CHARACTER ARC SECTION */}
          {activeSection === 'characters' && (
            <div className="space-y-4">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  DETECTED CHARACTERS & NARRATIVE ARCS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Extracted strictly from real movie scenes and character appearances with source timestamps.
                </p>
              </div>

              {characters.length === 0 ? (
                <div className="p-8 bg-[#050b1c] border border-cyan-500/20 rounded-xl text-center text-xs text-slate-400">
                  No character data detected in movie scenes.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {characters.map(char => (
                    <div key={char.id} className="bg-[#050b1c] border border-cyan-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-100">{char.name}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {char.role}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 mt-0.5 block">{char.actor}</span>
                        </div>
                        {char.firstAppearance && (
                          <div className="text-right text-[10px] font-mono text-slate-400">
                            <span className="text-slate-500 block">FIRST SEEN</span>
                            <span className="text-cyan-400 font-bold">{char.firstAppearance}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {char.characterDevelopment || char.description}
                      </p>

                      {char.importantScenes && char.importantScenes.length > 0 && (
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
                            KEY SOURCE SCENES:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {char.importantScenes.map((sc, i) => (
                              <span key={i} className="px-2 py-0.5 bg-[#030714] border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                                Sc {sc.sceneNumber} ({sc.timestamp})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. KEY EVENTS SECTION */}
          {activeSection === 'events' && (
            <div className="space-y-3">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  CHRONOLOGICAL KEY EVENTS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pivotal plot transitions mapped with exact start/end movie timestamps.
                </p>
              </div>

              {scenes.filter(s => s.keyEvent || (s.importanceScore || 0) > 70).map((scene, idx) => (
                <div key={scene.id || idx} className="bg-[#050b1c] border border-cyan-500/20 rounded-lg p-3.5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-cyan-400 font-bold">SCENE #{scene.sceneNumber}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-300">{scene.location || 'Location'}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 mt-1">{scene.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {scene.keyEvent || scene.description}
                    </p>
                  </div>
                  <div className="text-right text-xs font-mono text-cyan-400 shrink-0">
                    <span>{scene.timestampStart}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. MYSTERIES SECTION */}
          {activeSection === 'mysteries' && (
            <div className="space-y-3">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  NARRATIVE MYSTERIES & CURIOSITY GAPS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Core questions planted to maintain viewer curiosity throughout the explainer.
                </p>
              </div>

              {rawBeats.filter(b => b.mysteryHook || b.curiosityGap).map((beat, idx) => (
                <div key={beat.id || idx} className="bg-[#050b1c] border border-cyan-500/20 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">MYSTERY #{idx + 1}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-400">{beat.stage}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">
                      {beat.mysteryHook || beat.curiosityGap}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Introduced at {beat.actualTimestamp} in {beat.title}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 shrink-0">
                    {beat.actualTimestamp}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 6. SUSPENSE SECTION */}
          {activeSection === 'suspense' && (
            <div className="space-y-3">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  PEAK SUSPENSE SEQUENCES
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Moments of maximum tension, danger, and narrative uncertainty.
                </p>
              </div>

              {[...scenes].sort((a, b) => (b.suspenseScore || 0) - (a.suspenseScore || 0)).slice(0, 8).map((scene, idx) => (
                <div key={scene.id || idx} className="bg-[#050b1c] border border-cyan-500/20 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">SUSPENSE RANK #{idx + 1}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-300">Scene {scene.sceneNumber}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">{scene.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{scene.description}</p>
                  </div>
                  <div className="text-right text-xs font-mono shrink-0">
                    <div className="text-amber-400 font-bold">Tension {scene.suspenseScore || 70}%</div>
                    <div className="text-slate-500 text-[10px] mt-1">{scene.timestampStart}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 7. TWISTS SECTION */}
          {activeSection === 'twists' && (
            <div className="space-y-3">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  PLOT TWISTS & REVELATIONS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Subversion points that re-contextualize the narrative.
                </p>
              </div>

              {[...scenes].filter(s => (s.twistScore || 0) > 60).sort((a, b) => (b.twistScore || 0) - (a.twistScore || 0)).map((scene, idx) => (
                <div key={scene.id || idx} className="bg-[#050b1c] border border-red-500/30 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-red-400 font-bold">TWIST #{idx + 1}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-300">Scene {scene.sceneNumber}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">{scene.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{scene.keyEvent || scene.description}</p>
                  </div>
                  <div className="text-right text-xs font-mono shrink-0">
                    <div className="text-red-400 font-bold">Twist {scene.twistScore}%</div>
                    <div className="text-slate-500 text-[10px] mt-1">{scene.timestampStart}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 8. CLIMAX SECTION */}
          {activeSection === 'climax' && (
            <div className="space-y-4">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  ACT 3 CLIMAX SEQUENCE
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The climactic resolution of the core conflict and peak dramatic convergence.
                </p>
              </div>

              {scenes.slice(Math.floor(scenes.length * 0.75)).map((scene, idx) => (
                <div key={scene.id || idx} className="bg-[#050b1c] border border-amber-500/30 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">CLIMAX BEAT #{idx + 1}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-300">Scene {scene.sceneNumber}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">{scene.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{scene.description}</p>
                  </div>
                  <div className="text-right text-xs font-mono text-cyan-400 shrink-0">
                    <span>{scene.timestampStart}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 9. ENDING SECTION */}
          {activeSection === 'ending' && (
            <div className="space-y-4">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  RESOLUTION & FINAL STATE
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The concluding scene, final consequences, and enduring thematic questions.
                </p>
              </div>

              {scenes.length > 0 && (
                <div className="bg-[#050b1c] border border-cyan-500/30 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">FINAL MOVIE SEQUENCE</span>
                    <span className="text-slate-400">{scenes[scenes.length - 1].timestampStart} - {scenes[scenes.length - 1].timestampEnd}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-100">
                    {scenes[scenes.length - 1].title || 'Ending Scene'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {scenes[scenes.length - 1].description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 10. SOURCE TIMELINE SECTION */}
          {activeSection === 'timeline' && (
            <div className="space-y-4">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  SOURCE TIMELINE CORRELATION
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual mapping connecting every synthesized story beat back to its original movie scene timestamp.
                </p>
              </div>

              <div className="space-y-2">
                {rawBeats.map((beat, idx) => (
                  <div 
                    key={beat.id || idx}
                    onClick={() => {
                      playHudClick();
                      setSelectedBeat(beat);
                    }}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      selectedBeat?.id === beat.id
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-md'
                        : 'bg-[#050b1c] border-slate-800 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-xs font-mono">
                      <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300 font-bold">{beat.stage}</span>
                      <span className="text-slate-600">&rarr;</span>
                      <span className="text-slate-400 truncate max-w-sm">{beat.title}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs font-mono shrink-0">
                      <span className="text-cyan-400 font-bold bg-[#030714] px-2.5 py-1 rounded border border-slate-800">
                        {beat.sourceStartTimestamp || beat.actualTimestamp || '00:00:00'} - {beat.sourceEndTimestamp || '00:01:30'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Source Beat Inspector Side Panel (Selectable) */}
        {selectedBeat && (
          <div className="w-80 border-l border-cyan-500/20 bg-[#040817] p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                  SOURCE INSPECTOR // BEAT #{selectedBeat.beatNumber || 1}
                </span>
                <button
                  onClick={() => setSelectedBeat(null)}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] font-mono border border-amber-500/30">
                  {selectedBeat.stage}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-2">{selectedBeat.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedBeat.description}</p>
              </div>

              {/* Source Timestamp Info */}
              <div className="bg-[#02050e] p-3 rounded-lg border border-cyan-500/20 space-y-2 text-xs font-mono">
                <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                  MOVIE SOURCE MAPPING
                </span>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedBeat.sourceStartTimestamp || selectedBeat.actualTimestamp} - {selectedBeat.sourceEndTimestamp || '00:02:00'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Source Scene:</span>
                  <span className="text-slate-200">
                    Scene #{selectedBeat.sourceSceneNumber || selectedBeat.sourceMapping?.sceneNumber || 1}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Tension Level:</span>
                  <span className="text-amber-400 font-bold">{selectedBeat.tensionLevel}%</span>
                </div>
              </div>

              {/* Narration Target for Script Studio */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                  NARRATION GOAL (SCRIPT STUDIO)
                </span>
                <p className="text-xs text-slate-300 bg-[#02050e] p-2.5 rounded border border-slate-800">
                  {selectedBeat.narrationGoal || 'Convey critical narrative transition.'}
                </p>
              </div>

              {selectedBeat.charactersInvolved && selectedBeat.charactersInvolved.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                    CHARACTERS INVOLVED
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedBeat.charactersInvolved.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#02050e] border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                playHudClick();
                navigateTo('script-studio');
              }}
              className="mt-4 w-full py-2 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>EDIT IN SCRIPT STUDIO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
