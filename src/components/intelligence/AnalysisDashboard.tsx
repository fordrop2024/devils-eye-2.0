/**
 * THE DEVIL'S EYE - Cinema AI Analysis Dashboard
 * Structured High-Level Intelligence Breakdown.
 * Tabs: CHARACTERS, KEY EVENTS, TWISTS, SUSPENSE POINTS,
 * EMOTIONAL MOMENTS, ACTION SEQUENCES, LOCATIONS, IMPORTANT OBJECTS.
 */

import React, { useState } from 'react';
import { Project } from '../../types';
import { 
  Users, 
  Sparkles, 
  Zap, 
  Flame, 
  Heart, 
  Swords, 
  MapPin, 
  Box, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { playHudClick } from '../../services/soundFx';

interface AnalysisDashboardProps {
  project: Project;
  onStartAnalysis?: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  project,
  onStartAnalysis,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'characters' | 'events' | 'twists' | 'suspense' | 'emotional' | 'action' | 'locations' | 'objects'
  >('characters');

  const [actFilter, setActFilter] = useState<'All' | 'Beginning' | 'Middle' | 'Climax' | 'Ending'>('All');

  const isAnalyzed = project.analysisStatus === 'ANALYSIS COMPLETE' || (project.characters && project.characters.length > 0);

  const categories = [
    { id: 'characters', label: 'CHARACTERS', count: project.characters?.length || 0, icon: Users },
    { id: 'events', label: 'KEY EVENTS', count: project.events?.length || 0, icon: Sparkles },
    { id: 'twists', label: 'TWISTS', count: project.twists?.length || 0, icon: Zap },
    { id: 'suspense', label: 'SUSPENSE POINTS', count: project.suspensePoints?.length || 0, icon: Flame },
    { id: 'emotional', label: 'EMOTIONAL MOMENTS', count: project.emotionalMoments?.length || 0, icon: Heart },
    { id: 'action', label: 'ACTION SEQUENCES', count: project.actionSequences?.length || 0, icon: Swords },
    { id: 'locations', label: 'LOCATIONS', count: project.locations?.length || 0, icon: MapPin },
    { id: 'objects', label: 'IMPORTANT OBJECTS', count: project.objects?.length || 0, icon: Box },
  ];

  if (!isAnalyzed) {
    return (
      <div className="hud-panel p-8 rounded-lg border border-amber-500/40 hud-corners bg-[#040816] text-center space-y-5">
        <div className="inline-flex p-4 rounded-full bg-amber-950/60 border border-amber-500/50 text-amber-400">
          <AlertTriangle className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-1.5 max-w-lg mx-auto">
          <div className="text-xl font-display font-bold text-amber-300 tracking-wider">
            STATUS: NOT ANALYZED
          </div>
          <p className="text-xs font-mono text-slate-300">
            THIS CINEMA SOURCE HAS NOT PASSED THROUGH THE 8-PASS NEURAL ANALYSIS ENGINE. NO SYNTHETIC OR INVENTED METRICS ARE ACTIVE.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              playHudClick();
              if (onStartAnalysis) onStartAnalysis();
            }}
            className="px-6 py-2.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech font-bold text-xs border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)] inline-flex items-center space-x-2 cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>RUN 8-PASS CINEMA AI ANALYSIS PIPELINE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* High-Level Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                playHudClick();
                setActiveCategory(c.id as typeof activeCategory);
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-[#030816] border-cyan-500/20 text-slate-400 hover:border-cyan-500/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-base font-bold text-slate-100">{c.count}</span>
              </div>
              <span className="text-[10px] font-tech font-bold uppercase truncate">{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Category Detail Card */}
      <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners space-y-4 bg-[#030816]">
        
        {/* CHARACTERS VIEW */}
        {activeCategory === 'characters' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 text-xs font-tech text-cyan-300">
              <span className="font-bold uppercase">Biometric Character Vectors ({project.characters.length})</span>
              <span className="font-mono text-slate-400 text-[10px]">FACIAL GEOMETRY & RELATIONAL NETWORKS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {project.characters.map((char) => (
                <div
                  key={char.id}
                  className="p-3.5 rounded-lg bg-[#02050f] border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={char.avatar}
                      alt={char.name}
                      className="w-14 h-14 rounded-lg object-cover border border-cyan-500/40 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-tech font-bold text-slate-100 truncate text-sm">{char.name}</h4>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 text-[9px] font-mono">
                          {char.confidence}% CONF
                        </span>
                      </div>
                      <div className="text-[11px] text-cyan-400 font-mono">{char.actor}</div>
                      <div className="text-[10px] text-slate-400 font-tech uppercase mt-0.5">
                        {char.archetype} • {char.screenTimeMinutes}m Screen Time
                      </div>
                    </div>
                  </div>

                  {char.aliases && char.aliases.length > 0 && (
                    <div className="text-[10px] font-mono text-slate-400">
                      ALIASES: <span className="text-slate-300">{char.aliases.join(', ')}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-2">
                    {char.description}
                  </p>

                  {char.keyQuote && (
                    <div className="text-[11px] font-mono text-amber-300/90 italic bg-amber-950/20 p-1.5 rounded border border-amber-500/20">
                      "{char.keyQuote}"
                    </div>
                  )}

                  {char.relationships && char.relationships.length > 0 && (
                    <div className="pt-2 border-t border-cyan-500/10 space-y-1">
                      <div className="text-[9px] font-tech text-cyan-400 uppercase">Key Relational Bonds:</div>
                      <div className="space-y-1 text-[10px] font-mono text-slate-400">
                        {char.relationships.map((rel, rIdx) => (
                          <div key={rIdx} className="truncate">
                            • <span className="text-cyan-300">{rel.targetName}</span> ({rel.relationType}): {rel.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KEY EVENTS VIEW */}
        {activeCategory === 'events' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-2 text-xs">
              <div className="font-tech font-bold text-cyan-300 uppercase">
                Narrative Milestones & Causal Beats ({project.events?.length || 0})
              </div>

              {/* Act Filter */}
              <div className="flex items-center space-x-1 font-tech text-[11px]">
                {(['All', 'Beginning', 'Middle', 'Climax', 'Ending'] as const).map((act) => (
                  <button
                    key={act}
                    onClick={() => {
                      playHudClick();
                      setActFilter(act);
                    }}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      actFilter === act
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {(project.events || [])
                .filter(ev => actFilter === 'All' || ev.act === actFilter)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg bg-[#02050f] border border-cyan-500/20 hover:border-cyan-400/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="px-2 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] whitespace-nowrap">
                        {ev.timestamp}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-tech font-bold text-slate-100 text-sm">{ev.title}</h4>
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[9px] font-mono">
                            ACT: {ev.act}
                          </span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs">{ev.description}</p>
                        <div className="text-[11px] font-mono text-cyan-400/90 pt-0.5">
                          IMPACT: <span className="text-slate-300">{ev.impact}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end md:self-center flex-shrink-0">
                      <div className="text-right font-mono text-[10px]">
                        <div className="text-amber-300 font-bold">{ev.importance}% IMPORTANCE</div>
                        <div className="text-slate-500">{ev.sceneId}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TWISTS VIEW */}
        {activeCategory === 'twists' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 text-xs font-tech text-cyan-300">
              <span className="font-bold uppercase">Identified Plot Twists & Psychological Reversals ({project.twists?.length || 0})</span>
              <span className="font-mono text-slate-400 text-[10px]">OPTIMIZED FOR YOUTUBE EXPLAINER HOOKS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(project.twists || []).map((twist) => (
                <div
                  key={twist.id}
                  className="p-4 rounded-lg bg-[#02050f] border border-cyan-500/20 hover:border-cyan-400/40 transition-all space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-[10px]">
                      {twist.timestamp}
                    </span>
                    <span className="font-mono text-amber-300 font-bold text-xs">
                      TWIST IMPACT: {twist.twistScore}%
                    </span>
                  </div>

                  <h4 className="font-tech font-bold text-slate-100 text-sm">{twist.title}</h4>
                  <p className="text-slate-300 font-sans leading-relaxed">{twist.reveal}</p>

                  <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
                    <span className="font-bold text-cyan-200">EXPLAINER HOOK: </span>
                    {twist.explanationHook}
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-tech text-slate-400 uppercase">Foreshadowing Clues:</span>
                    <ul className="list-disc list-inside text-[10px] font-mono text-slate-300 space-y-0.5">
                      {twist.foreshadowingClues.map((clue, cIdx) => (
                        <li key={cIdx}>{clue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUSPENSE POINTS VIEW */}
        {activeCategory === 'suspense' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 text-xs font-tech text-cyan-300">
              <span className="font-bold uppercase">Suspense Peaks & Tension Curves ({project.suspensePoints?.length || 0})</span>
              <span className="font-mono text-slate-400 text-[10px]">RETENTION CURVE ANCHORS</span>
            </div>

            <div className="space-y-2">
              {(project.suspensePoints || []).map((sp) => (
                <div
                  key={sp.id}
                  className="p-3 rounded-lg bg-[#02050f] border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div className="px-2 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] whitespace-nowrap">
                      {sp.timestamp}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-tech font-bold text-slate-100 text-sm">{sp.sceneTitle}</h4>
                      <div className="text-[11px] text-slate-300">
                        <span className="text-amber-400 font-bold">TRIGGER: </span>
                        {sp.trigger}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <span className="text-cyan-400 font-bold">RESOLUTION: </span>
                        {sp.resolution}
                      </div>
                    </div>
                  </div>

                  <div className="w-32 flex-shrink-0 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">TENSION</span>
                      <span className="text-rose-400 font-bold">{sp.tensionLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${sp.tensionLevel}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMOTIONAL MOMENTS VIEW */}
        {activeCategory === 'emotional' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 text-xs font-tech text-cyan-300">
              <span className="font-bold uppercase">Emotional Resonance & Catharsis ({project.emotionalMoments?.length || 0})</span>
              <span className="font-mono text-slate-400 text-[10px]">CHARACTER TRANSFORMATION MARKERS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(project.emotionalMoments || []).map((em) => (
                <div
                  key={em.id}
                  className="p-3.5 rounded-lg bg-[#02050f] border border-cyan-500/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400">{em.timestamp}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300 font-tech text-[10px] font-bold">
                      {em.emotionType.toUpperCase()}
                    </span>
                  </div>

                  <div className="font-tech font-bold text-slate-100">{em.character}</div>
                  <p className="text-slate-300 font-sans text-xs">{em.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-cyan-500/10 text-[10px] font-mono text-slate-400">
                    <span>INTENSITY</span>
                    <span className="text-rose-400 font-bold">{em.intensity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION SEQUENCES VIEW */}
        {activeCategory === 'action' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 text-xs font-tech text-cyan-300">
              <span className="font-bold uppercase">Action Sequences & Choreography ({project.actionSequences?.length || 0})</span>
              <span className="font-mono text-slate-400 text-[10px]">PACING & KINETIC ENERGY</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(project.actionSequences || []).map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-lg bg-[#02050f] border border-cyan-500/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400">{act.timestamp}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-400 text-blue-300 font-tech text-[10px]">
                      {act.choreographyPacing}
                    </span>
                  </div>

                  <h4 className="font-tech font-bold text-slate-100 text-sm">{act.title}</h4>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {act.vehiclesOrWeapons.map((v, vIdx) => (
                      <span key={vIdx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                        {v}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10 text-[10px] font-mono text-slate-400">
                    <span>INTENSITY</span>
                    <span className="text-cyan-300 font-bold">{act.intensity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOCATIONS VIEW */}
        {activeCategory === 'locations' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 text-xs font-tech text-cyan-300">
              <span className="font-bold uppercase">Cinematic Locations & Environments ({project.locations?.length || 0})</span>
              <span className="font-mono text-slate-400 text-[10px]">SPATIAL CONTINUITY & ATMOSPHERE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(project.locations || []).map((loc) => (
                <div
                  key={loc.id}
                  className="rounded-lg bg-[#02050f] border border-cyan-500/20 overflow-hidden flex flex-col text-xs"
                >
                  <div className="aspect-video w-full relative">
                    <img
                      src={loc.thumbnail}
                      alt={loc.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300">
                      FIRST SEEN: {loc.firstSeen}
                    </div>
                  </div>

                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-tech font-bold text-slate-100 text-sm">{loc.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{loc.sceneCount} Scenes</span>
                      </div>
                      <p className="text-[11px] text-cyan-400/90 font-mono mt-0.5">{loc.atmosphere}</p>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{loc.significance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IMPORTANT OBJECTS VIEW */}
        {activeCategory === 'objects' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 text-xs font-tech text-cyan-300">
              <span className="font-bold uppercase">Totems, MacGuffins & Prop Vectors ({project.objects?.length || 0})</span>
              <span className="font-mono text-slate-400 text-[10px]">PSYCHOLOGICAL ANCHORS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(project.objects || []).map((obj) => (
                <div
                  key={obj.id}
                  className="rounded-lg bg-[#02050f] border border-cyan-500/20 overflow-hidden flex flex-col text-xs"
                >
                  <div className="aspect-video w-full relative">
                    <img
                      src={obj.thumbnail}
                      alt={obj.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {obj.isTotemOrMacGuffin && (
                      <div className="absolute top-2 right-2 bg-amber-950/90 border border-amber-500 text-amber-300 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                        TOTEM / MACGUFFIN
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-tech font-bold text-slate-100 text-sm">{obj.name}</h4>
                      <div className="text-[10px] font-mono text-cyan-400">
                        OWNER: <span className="text-slate-200">{obj.ownerCharacter}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{obj.significance}</p>

                    <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-cyan-500/10">
                      FIRST OBSERVED: {obj.firstSeen}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
