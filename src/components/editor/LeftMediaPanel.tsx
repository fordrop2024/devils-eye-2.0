/**
 * THE DEVIL'S EYE - LeftMediaPanel
 * Media Browser, Effects, Transitions, Audio Bank, Text, Captions & Project Assets.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FolderOpen, 
  Sparkles, 
  Layers, 
  Volume2, 
  Type, 
  Subtitles, 
  Film, 
  Plus, 
  Search, 
  Play, 
  Eye, 
  Sliders, 
  Flame, 
  Music,
  Check
} from 'lucide-react';
import { playHudClick, playHudSuccess } from '../../services/soundFx';
import { Scene, Clip } from '../../types';

interface LeftMediaPanelProps {
  onSelectSourceScene: (scene: Scene) => void;
  onAddClipToTrack: (clip: Partial<Clip>, trackId: string) => void;
  selectedSceneId: string | null;
}

export const LeftMediaPanel: React.FC<LeftMediaPanelProps> = ({
  onSelectSourceScene,
  onAddClipToTrack,
  selectedSceneId
}) => {
  const { currentProject, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'media' | 'effects' | 'transitions' | 'audio' | 'text' | 'captions' | 'assets'>('media');
  const [searchQuery, setSearchQuery] = useState('');

  const scenes = currentProject.scenes || [];
  const filteredScenes = scenes.filter(s => 
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.characters?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Audio SFX Library presets
  const sfxLibrary = [
    { id: 'sfx-braam', title: 'Hans Zimmer Braaam Horn', type: 'music', duration: 4.5, color: '#ec4899' },
    { id: 'sfx-subdrop', title: 'Sub-Bass Cinema Impact', type: 'sfx', duration: 3.0, color: '#f59e0b' },
    { id: 'sfx-riser', title: 'Shepard Tone Tension Riser', type: 'sfx', duration: 6.0, color: '#f59e0b' },
    { id: 'sfx-heartbeat', title: 'Muffled Heartbeat Loop', type: 'sfx', duration: 8.0, color: '#f59e0b' },
    { id: 'sfx-whoosh', title: 'Kinetic Whip Whoosh', type: 'sfx', duration: 1.2, color: '#f59e0b' },
    { id: 'sfx-drone', title: 'Deep Limbo Ambient Drone', type: 'ambient', duration: 12.0, color: '#06b6d4' }
  ];

  // Text title templates
  const textTemplates = [
    { id: 'txt-title', title: 'Cinematic Title Card', defaultText: "THE ARCHITECTURE OF A LIE", type: 'title' },
    { id: 'txt-hook', title: 'Suspense Hook Banner', defaultText: "WHAT IF YOUR MEMORY IS FORGED?", type: 'hook' },
    { id: 'txt-lower3', title: 'Character Lower Third', defaultText: "DOM COBB // MASTER EXTRACTOR", type: 'lower3' },
    { id: 'txt-chapter', title: 'Act Chapter Marker', defaultText: "ACT III: THE LIMBO COLLAPSE", type: 'chapter' }
  ];

  // LUT Presets
  const lutPresets = [
    { id: 'Teal & Orange', desc: 'Blockbuster Hollywood warmth & cool shadows' },
    { id: 'Blade Runner Amber', desc: 'Neo-noir dystopian sodium-vapor amber' },
    { id: 'Noir Monochrome', desc: 'High-contrast stark chiaroscuro black & white' },
    { id: 'Matrix Green', desc: 'Phosphor terminal green tint & crushed blacks' },
    { id: 'Bleach Bypass', desc: 'Desaturated gritty silver halide silver retention' }
  ];

  // Transitions
  const transitionPresets = [
    { id: 'cross_dissolve', name: 'Cross Dissolve', desc: 'Smooth alpha interpolation' },
    { id: 'dip_to_black', name: 'Dip to Black', desc: 'Pacing breath between acts' },
    { id: 'dip_to_white', name: 'Dip to White / Flash', desc: 'Dream awakening shock' },
    { id: 'whip_pan', name: 'Whip Pan Blur', desc: 'High-speed kinetic cut' }
  ];

  return (
    <aside className="w-72 lg:w-80 h-full bg-[#050b18] border-r border-cyan-500/25 flex flex-col select-none shrink-0 overflow-hidden">
      {/* Top Tab Bar (NLE Project Bin Tabs) */}
      <div className="flex items-center overflow-x-auto scrollbar-none bg-[#030712] border-b border-cyan-500/20 text-[11px] font-tech text-slate-400 p-1 gap-0.5">
        {[
          { id: 'media', label: 'Media', icon: FolderOpen },
          { id: 'effects', label: 'FX', icon: Sparkles },
          { id: 'transitions', label: 'Cuts', icon: Layers },
          { id: 'audio', label: 'Audio', icon: Volume2 },
          { id: 'text', label: 'Titles', icon: Type },
          { id: 'captions', label: 'Captions', icon: Subtitles },
          { id: 'assets', label: 'Bin', icon: Film }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHudClick();
                setActiveTab(tab.id as unknown as typeof activeTab);
              }}
              className={`px-2 py-1.5 rounded flex items-center space-x-1 shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : 'hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Media Browser (Footage & Scenes) */}
      {activeTab === 'media' && (
        <div className="flex-1 flex flex-col overflow-hidden p-2.5 space-y-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search scene footage, characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#02050f] border border-cyan-500/30 rounded pl-8 pr-2 py-1.5 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>{filteredScenes.length} SCENES INDEXED</span>
            <span className="text-cyan-400">CLICK TO PREVIEW</span>
          </div>

          {/* Scene list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredScenes.map((scene) => {
              const isSelected = selectedSceneId === scene.id;
              const durationSec = scene.endSec - scene.startSec;
              return (
                <div
                  key={scene.id}
                  onClick={() => onSelectSourceScene(scene)}
                  className={`group p-2 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'bg-[#081224] border-cyan-500/15 hover:border-cyan-500/40 hover:bg-[#0c1a33]'
                  }`}
                >
                  <div className="flex space-x-2">
                    <div className="relative w-24 h-15 rounded overflow-hidden shrink-0 border border-cyan-500/30 bg-black">
                      <img
                        src={scene.thumbnail || scene.thumbnailUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                        alt={scene.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-[9px] font-mono px-1 rounded text-cyan-300">
                        {durationSec}s
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold font-display text-slate-100 truncate">
                          {scene.title || `Scene ${scene.sceneNumber}`}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {scene.timestampStart} - {scene.timestampEnd}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-1 text-[9px] font-mono text-cyan-300">
                          <Flame className="w-2.5 h-2.5 text-amber-400" />
                          <span>Twist {scene.twistScore}%</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddClipToTrack({
                              title: scene.title || `Scene ${scene.sceneNumber}`,
                              mediaType: 'video',
                              duration: Math.min(30, durationSec),
                              sourceStart: scene.startSec,
                              sourceEnd: scene.startSec + Math.min(30, durationSec),
                              thumbnail: scene.thumbnail || scene.thumbnailUrl,
                              sourceSceneId: scene.id,
                              color: '#0284c7'
                            }, 'track-v1');
                            addToast('Clip Added', `Added "${scene.title}" to Timeline V1`, 'success');
                          }}
                          className="px-1.5 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-[10px] font-mono text-cyan-300 flex items-center space-x-0.5 cursor-pointer"
                          title="Insert to Timeline V1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>V1</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Effects (3D LUTs & Optics) */}
      {activeTab === 'effects' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
          <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
            CINEMATIC 3D LUT COLOR GRADING
          </div>
          <div className="space-y-1.5">
            {lutPresets.map((lut) => (
              <div
                key={lut.id}
                className="p-2 rounded bg-[#081224] border border-cyan-500/20 hover:border-cyan-400 text-slate-200 transition-colors flex flex-col space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">{lut.id}</span>
                  <button
                    onClick={() => {
                      playHudSuccess();
                      addToast('LUT Applied', `Applied ${lut.id} to Master Sequence`, 'success');
                    }}
                    className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] hover:bg-cyan-900 cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">{lut.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1 pt-2">
            OPTICAL POST-PROCESSING
          </div>
          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2 rounded bg-[#081224] border border-cyan-500/20 cursor-pointer text-slate-300">
              <span>Cinematic 2.39:1 Letterbox</span>
              <input type="checkbox" defaultChecked className="accent-cyan-400" />
            </label>
            <label className="flex items-center justify-between p-2 rounded bg-[#081224] border border-cyan-500/20 cursor-pointer text-slate-300">
              <span>35mm Kodak Grain Overlay</span>
              <input type="checkbox" defaultChecked className="accent-cyan-400" />
            </label>
            <label className="flex items-center justify-between p-2 rounded bg-[#081224] border border-cyan-500/20 cursor-pointer text-slate-300">
              <span>Anamorphic Flare Blooms</span>
              <input type="checkbox" className="accent-cyan-400" />
            </label>
          </div>
        </div>
      )}

      {/* Tab 3: Transitions */}
      {activeTab === 'transitions' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
          <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
            SEAMLESS NLE TRANSITIONS
          </div>
          {transitionPresets.map((tr) => (
            <div
              key={tr.id}
              className="p-2.5 rounded bg-[#081224] border border-cyan-500/20 hover:border-cyan-400 flex items-center justify-between cursor-pointer group"
            >
              <div>
                <div className="font-bold text-slate-200 group-hover:text-cyan-300">{tr.name}</div>
                <div className="text-[10px] text-slate-400">{tr.desc}</div>
              </div>
              <button
                onClick={() => {
                  playHudClick();
                  addToast('Transition Ready', `Drag or apply "${tr.name}" to cut point`, 'info');
                }}
                className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] cursor-pointer"
              >
                INSERT
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Audio SFX & Music Bank */}
      {activeTab === 'audio' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
          <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
            CINEMA SFX & MUSIC STEMS
          </div>
          {sfxLibrary.map((item) => (
            <div
              key={item.id}
              className="p-2 rounded bg-[#081224] border border-cyan-500/20 flex items-center justify-between text-slate-200"
            >
              <div className="min-w-0 pr-2">
                <div className="font-bold truncate text-cyan-200">{item.title}</div>
                <div className="text-[10px] text-slate-400">{item.duration}s • {item.type.toUpperCase()}</div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => {
                    playHudClick();
                    addToast('Preview Audio', `Auditioning ${item.title}...`, 'info');
                  }}
                  className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 cursor-pointer"
                  title="Audition"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
                <button
                  onClick={() => {
                    onAddClipToTrack({
                      title: item.title,
                      mediaType: item.type as any,
                      duration: item.duration,
                      sourceStart: 0,
                      sourceEnd: item.duration,
                      color: item.color,
                      volume: 85
                    }, item.type === 'music' ? 'track-a4' : item.type === 'ambient' ? 'track-a5' : 'track-a3');
                    addToast('Stem Added', `Added ${item.title} to audio track`, 'success');
                  }}
                  className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] cursor-pointer"
                >
                  + TRACK
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Text / Titles */}
      {activeTab === 'text' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
          <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
            TEXT & LOWER THIRDS
          </div>
          {textTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-2.5 rounded bg-[#081224] border border-cyan-500/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{tpl.title}</span>
                <button
                  onClick={() => {
                    onAddClipToTrack({
                      title: `Text: ${tpl.title}`,
                      mediaType: 'subtitles',
                      duration: 6,
                      sourceStart: 0,
                      sourceEnd: 6,
                      color: '#a855f7',
                      text: tpl.defaultText,
                      fontFamily: 'Montserrat',
                      fontSize: 28,
                      textColor: '#ffffff',
                      textBgColor: 'rgba(0,0,0,0.8)',
                      textAlignment: 'center',
                      animationPreset: 'fade'
                    }, 'track-v3');
                    addToast('Text Card Added', `Inserted ${tpl.title} onto Track V3`, 'success');
                  }}
                  className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] cursor-pointer"
                >
                  + ADD V3
                </button>
              </div>
              <div className="p-1.5 rounded bg-[#02050f] border border-cyan-500/10 text-[11px] text-cyan-300 font-serif italic">
                "{tpl.defaultText}"
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Captions */}
      {activeTab === 'captions' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
          <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
            ACTIVE EXPLORER SUBTITLES
          </div>
          {(currentProject.subtitles || []).slice(0, 8).map((sub, i) => (
            <div
              key={sub.id}
              className="p-2 rounded bg-[#081224] border border-cyan-500/15 space-y-1"
            >
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>CUE #{i + 1} ({sub.speaker || 'Narrator'})</span>
                <span className="text-cyan-400">{sub.startSec.toFixed(1)}s - {sub.endSec.toFixed(1)}s</span>
              </div>
              <p className="text-slate-200 text-xs font-sans leading-relaxed">
                "{sub.text}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 7: Project Assets Bin */}
      {activeTab === 'assets' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
          <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
            PROJECT BIN STATISTICS
          </div>
          <div className="bg-[#081224] p-3 rounded border border-cyan-500/20 space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span>Total Video Tracks:</span>
              <span className="text-cyan-300 font-bold">4 (V1-V4)</span>
            </div>
            <div className="flex justify-between">
              <span>Total Audio Stems:</span>
              <span className="text-cyan-300 font-bold">5 (A1-A5)</span>
            </div>
            <div className="flex justify-between">
              <span>Clips on Timeline:</span>
              <span className="text-cyan-300 font-bold">
                {currentProject.timeline.tracks.reduce((acc, t) => acc + t.clips.length, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Source Footage Bank:</span>
              <span className="text-cyan-300 font-bold">{scenes.length} Scenes</span>
            </div>
            <div className="flex justify-between">
              <span>Explainer Duration:</span>
              <span className="text-cyan-300 font-bold">
                {Math.floor(currentProject.timeline.totalDuration / 60)}:{(currentProject.timeline.totalDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
