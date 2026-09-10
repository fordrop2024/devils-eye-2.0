/**
 * THE DEVIL'S EYE - RightInspectorPanel
 * Inspector / Properties (Video, Audio, Text), Multi-Channel Mixer & AI Director Assistant.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sliders, 
  Sparkles, 
  Volume2, 
  Type, 
  RotateCw, 
  Eye, 
  Film, 
  Check, 
  Cpu, 
  Flame, 
  FastForward, 
  Crop, 
  Layers,
  Send,
  Loader2
} from 'lucide-react';
import { playHudClick, playHudScan, playHudSuccess } from '../../services/soundFx';
import { Clip, TimelineTrack } from '../../types';

interface RightInspectorPanelProps {
  selectedClip: Clip | null;
  onUpdateClip: (updatedClip: Clip) => void;
}

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  selectedClip,
  onUpdateClip
}) => {
  const { 
    currentProject, 
    runAiEditorCommand, 
    isAiThinking, 
    aiOperationStatus,
    recordTimelineAction, 
    addToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inspector' | 'mixer' | 'ai'>('inspector');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLastResponse, setAiLastResponse] = useState<string | null>(null);

  // 10 Explicit AI Director Commands required by specification
  const aiPresetCommands = [
    "Make the first 60 seconds more engaging.",
    "Remove unnecessary clips.",
    "Make this scene more mysterious.",
    "Use more close-ups.",
    "Shorten this section by 20 seconds.",
    "Increase suspense.",
    "Add appropriate SFX.",
    "Make this 20 minutes.",
    "Replace this clip with a stronger scene.",
    "Make narration more dramatic."
  ];

  const handleRunAiCommand = async (commandToRun: string) => {
    if (!commandToRun.trim() || isAiThinking) return;
    try {
      const response = await runAiEditorCommand(commandToRun, selectedClip?.id);
      setAiLastResponse(response);
      setAiPrompt('');
    } catch (err) {
      addToast('AI Command Error', 'Failed to execute editor command', 'error');
    }
  };

  // Helper to safely update current clip properties
  const updateProp = <K extends keyof Clip>(key: K, value: Clip[K]) => {
    if (!selectedClip) return;
    const updated = { ...selectedClip, [key]: value };
    onUpdateClip(updated);
  };

  const tracks = currentProject.timeline.tracks || [];

  return (
    <aside className="w-72 lg:w-84 h-full bg-[#050b18] border-l border-cyan-500/25 flex flex-col select-none shrink-0 overflow-hidden font-mono text-xs">
      {/* Tab Navigation (Inspector / Mixer / AI Assistant) */}
      <div className="flex items-center bg-[#030712] border-b border-cyan-500/20 text-[11px] font-tech text-slate-400 p-1 gap-1">
        {[
          { id: 'inspector', label: 'Inspector', icon: Sliders },
          { id: 'mixer', label: 'Mixer', icon: Volume2 },
          { id: 'ai', label: 'AI Director', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHudClick();
                setActiveTab(tab.id as any);
              }}
              className={`flex-1 py-1.5 rounded flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
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

      {/* Tab 1: Clip Inspector & Properties */}
      {activeTab === 'inspector' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {!selectedClip ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <Sliders className="w-8 h-8 mx-auto text-slate-600" />
              <div className="font-tech text-slate-400">NO CLIP SELECTED</div>
              <p className="text-[11px] text-slate-600 px-4">
                Click on any video, audio, or subtitle clip on the timeline to adjust properties.
              </p>
            </div>
          ) : (
            <>
              {/* Selected Clip Header */}
              <div className="p-2.5 rounded bg-[#081224] border border-cyan-500/30 space-y-1">
                <div className="text-[10px] text-cyan-400 font-tech uppercase">SELECTED CLIP</div>
                <div className="font-bold text-slate-100 text-sm truncate">{selectedClip.title}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Start: {selectedClip.startTime}s</span>
                  <span className="text-amber-300">Duration: {selectedClip.duration}s</span>
                  <span className="uppercase text-cyan-300">{selectedClip.mediaType}</span>
                </div>
              </div>

              {/* Video Specific Properties (Transform, Speed, Crop, Transitions) */}
              {(selectedClip.mediaType === 'video' || !selectedClip.mediaType) && (
                <div className="space-y-3">
                  <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
                    VIDEO TRANSFORM & COMPOSITING
                  </div>

                  {/* Scale */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Scale</span>
                      <span className="text-cyan-300">{Math.round((selectedClip.scale || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={selectedClip.scale || 1}
                      onChange={(e) => updateProp('scale', parseFloat(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Opacity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Opacity</span>
                      <span className="text-cyan-300">{Math.round((selectedClip.opacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedClip.opacity ?? 1}
                      onChange={(e) => updateProp('opacity', parseFloat(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Rotation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Rotation</span>
                      <span className="text-cyan-300">{selectedClip.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={selectedClip.rotation || 0}
                      onChange={(e) => updateProp('rotation', parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Speed & Retime */}
                  <div className="pt-2 border-t border-cyan-500/15 space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Playback Speed</span>
                      <span className="text-cyan-300 font-bold">{selectedClip.speed || 1.0}x</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[0.5, 1.0, 1.25, 2.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateProp('speed', s)}
                          className={`py-1 rounded border text-[10px] cursor-pointer ${
                            (selectedClip.speed || 1.0) === s
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                              : 'bg-[#09152a] border-cyan-500/20 text-slate-400'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 text-[11px]">
                        <input
                          type="checkbox"
                          checked={selectedClip.isReversed || false}
                          onChange={(e) => updateProp('isReversed', e.target.checked)}
                          className="accent-cyan-400"
                        />
                        <span>Reverse</span>
                      </label>

                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 text-[11px] ml-4">
                        <input
                          type="checkbox"
                          checked={selectedClip.isFreezeFrame || false}
                          onChange={(e) => updateProp('isFreezeFrame', e.target.checked)}
                          className="accent-cyan-400"
                        />
                        <span>Freeze Frame</span>
                      </label>
                    </div>
                  </div>

                  {/* AI Selection Provenance */}
                  {selectedClip.selectionReason && (
                    <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30 space-y-1">
                      <div className="flex items-center space-x-1 text-[10px] text-cyan-300 font-tech">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>AI SELECTION CONFIDENCE: {Math.round((selectedClip.selectionConfidence || 0.94) * 100)}%</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-sans italic">
                        "{selectedClip.selectionReason}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Audio Specific Properties */}
              {(selectedClip.mediaType === 'narration' || selectedClip.mediaType === 'dialogue' || selectedClip.mediaType === 'sfx' || selectedClip.mediaType === 'music') && (
                <div className="space-y-3">
                  <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
                    AUDIO STEM CONTROLS
                  </div>

                  {/* Volume dB */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Volume (dB)</span>
                      <span className="text-cyan-300">{selectedClip.volumeDb || 0} dB</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="6"
                      value={selectedClip.volumeDb || 0}
                      onChange={(e) => updateProp('volumeDb', parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Pan */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Stereo Pan</span>
                      <span className="text-cyan-300">{selectedClip.pan || 0}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={selectedClip.pan || 0}
                      onChange={(e) => updateProp('pan', parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Fades */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400">Fade In (s)</span>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={selectedClip.fadeInSec || 0}
                        onChange={(e) => updateProp('fadeInSec', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#09152a] border border-cyan-500/30 rounded p-1 text-cyan-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Fade Out (s)</span>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={selectedClip.fadeOutSec || 0}
                        onChange={(e) => updateProp('fadeOutSec', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#09152a] border border-cyan-500/30 rounded p-1 text-cyan-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Text Specific Properties */}
              {selectedClip.mediaType === 'subtitles' && (
                <div className="space-y-3">
                  <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
                    TEXT & CAPTION FORMATTING
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-300 text-[11px]">Text Content</span>
                    <textarea
                      rows={3}
                      value={selectedClip.text || ''}
                      onChange={(e) => updateProp('text', e.target.value)}
                      className="w-full bg-[#09152a] border border-cyan-500/30 rounded p-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Font Size (px)</span>
                      <input
                        type="number"
                        value={selectedClip.fontSize || 28}
                        onChange={(e) => updateProp('fontSize', parseInt(e.target.value) || 28)}
                        className="w-full bg-[#09152a] border border-cyan-500/30 rounded p-1 text-cyan-200"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400">Animation</span>
                      <select
                        value={selectedClip.animationPreset || 'fade'}
                        onChange={(e) => updateProp('animationPreset', e.target.value as any)}
                        className="w-full bg-[#09152a] border border-cyan-500/30 rounded p-1 text-cyan-200"
                      >
                        <option value="fade">Fade In/Out</option>
                        <option value="pop">Pop Impact</option>
                        <option value="typewriter">Typewriter</option>
                        <option value="karaoke">Karaoke Glow</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 2: Audio Master Mixer */}
      {activeTab === 'mixer' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1">
            5.1 STEMS AUDIO CONSOLE
          </div>

          <div className="space-y-3">
            {[
              { id: 'master', name: 'MASTER OUT', vol: 88, color: '#00f0ff' },
              { id: 'track-a1', name: 'A1 VOICE (ARES)', vol: 92, color: '#10b981' },
              { id: 'track-a2', name: 'A2 DIALOGUE', vol: 78, color: '#3b82f6' },
              { id: 'track-a3', name: 'A3 SFX IMPACTS', vol: 85, color: '#f59e0b' },
              { id: 'track-a4', name: 'A4 HANS ZIMMER', vol: 70, color: '#ec4899' },
              { id: 'track-a5', name: 'A5 AMBIENT LIMBO', vol: 60, color: '#06b6d4' }
            ].map((ch) => (
              <div key={ch.id} className="p-2 rounded bg-[#081224] border border-cyan-500/20 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-200">{ch.name}</span>
                  <span className="text-cyan-300 font-mono">{ch.vol}%</span>
                </div>

                {/* Simulated Peak Meter */}
                <div className="w-full bg-[#02050f] h-2 rounded overflow-hidden flex border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 rounded"
                    style={{ width: `${ch.vol}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={ch.vol}
                  className="w-full accent-cyan-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Director & Editor Assistant */}
      {activeTab === 'ai' && (
        <div className="flex-1 flex flex-col p-3 space-y-3 overflow-hidden">
          <div className="text-[10px] uppercase font-tech text-cyan-400 border-b border-cyan-500/20 pb-1 flex items-center justify-between">
            <span>AI CINEMA DIRECTOR</span>
            <span className="text-emerald-400 font-mono">AUTONOMOUS</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-tight">
            Directly mutate the timeline structure, pacing, B-roll cutaways and SFX using conversational AI commands.
          </p>

          {/* AI Response Callout */}
          {aiLastResponse && (
            <div className="p-2.5 rounded bg-cyan-950/70 border border-cyan-400/50 space-y-1 text-cyan-200 text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
                <Check className="w-3 h-3" />
                <span>COMMAND EXECUTED ON TIMELINE:</span>
              </div>
              <p className="text-slate-100 text-[11px] font-sans leading-relaxed">
                {aiLastResponse}
              </p>
            </div>
          )}

          {/* Preset Commands Grid (Direct from User Specification) */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            <div className="text-[10px] text-slate-400 uppercase font-tech">DIRECTOR PRESETS:</div>
            {aiPresetCommands.map((cmd, i) => (
              <button
                key={i}
                onClick={() => handleRunAiCommand(cmd)}
                disabled={isAiThinking}
                className="w-full text-left p-2 rounded bg-[#081224] border border-cyan-500/20 hover:border-cyan-400 hover:bg-[#0c1c38] text-slate-200 hover:text-cyan-200 transition-all text-xs font-mono cursor-pointer flex items-center justify-between group"
              >
                <span className="truncate pr-2">"{cmd}"</span>
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 opacity-40 group-hover:opacity-100" />
              </button>
            ))}
          </div>

          {/* AI Command Input Bar */}
          <div className="pt-2 border-t border-cyan-500/20 space-y-2 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Give command (e.g. 'Increase suspense at 04:00')..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunAiCommand(aiPrompt);
                }}
                disabled={isAiThinking}
                className="w-full bg-[#02050f] border border-cyan-500/40 rounded p-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
              />
              <button
                onClick={() => handleRunAiCommand(aiPrompt)}
                disabled={!aiPrompt.trim() || isAiThinking}
                className={`absolute right-1.5 top-1.5 p-1 rounded cursor-pointer ${
                  aiPrompt.trim() && !isAiThinking ? 'bg-cyan-500 text-black shadow-[0_0_8px_#00f0ff]' : 'text-slate-600'
                }`}
              >
                {isAiThinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isAiThinking && (
              <div className="flex items-center space-x-2 text-[10px] text-cyan-300 font-mono animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                <span className="truncate">{aiOperationStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
