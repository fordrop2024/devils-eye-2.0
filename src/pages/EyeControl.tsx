/**
 * THE DEVIL'S EYE - Dedicated AI Eye Control Center
 * Real-time Hue Shifter, Preset Selector, Animation Engine, Motion Tracking & State Triggers.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DevilEye, DevilEyeState } from '../components/common/DevilEye';
import { COLOR_PRESETS } from '../services/eyeConfigDefaults';
import { EyeColorPreset, EyeResponseMode } from '../types';
import { 
  Eye, 
  Sparkles, 
  RotateCw, 
  Sliders, 
  Activity, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  Zap, 
  Radio, 
  Crosshair, 
  Compass,
  Layers,
  Palette,
  Play,
  Volume2
} from 'lucide-react';
import { playHudClick, playHudScan, playHudSuccess, playHudWarning } from '../services/soundFx';

export const EyeControl: React.FC = () => {
  const { 
    eyeConfig, 
    updateEyeConfig, 
    resetEyeConfig, 
    saveEyeConfig, 
    exportEyeConfig, 
    importEyeConfig, 
    devilEyeState, 
    setDevilEyeStateOverride,
    addToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'color' | 'animation' | 'movement' | 'states' | 'events'>('color');
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Quick state tester
  const allStates: DevilEyeState[] = [
    'IDLE',
    'WATCHING',
    'THINKING',
    'PROCESSING',
    'ANALYZING',
    'FOCUS',
    'ALERT',
    'WARNING',
    'ERROR',
    'SUCCESS',
    'SLEEP',
    'WAKE-UP',
    'DEVIL MODE'
  ];

  const presets: { id: EyeColorPreset; label: string; bg: string; border: string; text: string }[] = [
    { id: 'red', label: 'Crimson 8K', bg: 'bg-red-950/80', border: 'border-red-500', text: 'text-red-400' },
    { id: 'blue', label: 'Cobalt', bg: 'bg-blue-950/80', border: 'border-blue-500', text: 'text-blue-400' },
    { id: 'green', label: 'Emerald', bg: 'bg-emerald-950/80', border: 'border-emerald-500', text: 'text-emerald-400' },
    { id: 'purple', label: 'Amethyst', bg: 'bg-purple-950/80', border: 'border-purple-500', text: 'text-purple-400' },
    { id: 'white', label: 'Spectral', bg: 'bg-slate-900', border: 'border-slate-300', text: 'text-slate-200' },
    { id: 'cyan', label: 'Cyber Cyan', bg: 'bg-cyan-950/80', border: 'border-cyan-500', text: 'text-cyan-400' },
    { id: 'orange', label: 'Solar Flame', bg: 'bg-orange-950/80', border: 'border-orange-500', text: 'text-orange-400' },
  ];

  const applyPreset = (presetKey: EyeColorPreset) => {
    playHudClick();
    const configDelta = COLOR_PRESETS[presetKey];
    if (configDelta) {
      updateEyeConfig(configDelta);
      addToast('Preset Applied', `Eye visual core calibrated to ${presetKey.toUpperCase()}`, 'success');
    }
  };

  const handleSave = () => {
    saveEyeConfig();
    addToast('Configuration Saved', 'All eye parameters synchronized and persisted globally', 'success');
  };

  const handleReset = () => {
    resetEyeConfig();
    setDevilEyeStateOverride(null);
    addToast('Settings Restored', 'Eye configuration reset to default Crimson 8K state', 'info');
  };

  const handleExport = () => {
    playHudClick();
    const jsonStr = exportEyeConfig();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devils-eye-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Export Complete', 'Downloaded eye configuration JSON profile', 'success');
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const success = importEyeConfig(importJsonText);
    if (success) {
      setShowImportModal(false);
      setImportJsonText('');
      addToast('Profile Loaded', 'Imported eye configuration profile successfully', 'success');
    } else {
      addToast('Import Failed', 'Invalid configuration JSON format', 'error');
    }
  };

  // Trigger simulated event
  const triggerEvent = (eventName: string, targetState: DevilEyeState, durationMs: number = 3000) => {
    playHudScan();
    setDevilEyeStateOverride(targetState);
    addToast('Event Triggered', `${eventName} -> Eye switched to ${targetState}`, 'info');
    setTimeout(() => {
      setDevilEyeStateOverride(null);
    }, durationMs);
  };

  return (
    <div className="h-full flex flex-col bg-[#02050f] text-slate-100 overflow-y-auto font-sans select-none">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-cyan-500/20 bg-[#040816] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-display font-bold tracking-wider text-slate-100 flex items-center space-x-2">
              <span>DEVIL'S EYE CONTROL CENTER</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 border border-red-500/60 text-red-300">
                ACTIVE AI ENTITY
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Real-time chromatic calibration, neural motion dynamics, and state trigger control.
            </p>
          </div>
        </div>

        {/* Global Save / Reset / Import / Export Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Reset to 8K Red Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEFAULT</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>IMPORT</span>
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono flex items-center space-x-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SAVE CONFIG</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Stage (Live Preview) + Right Stage (Tabs & Controls) */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left 5 Cols: Live Interactive Devil's Eye Preview */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-[#050b1a] border border-cyan-500/25 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[440px]">
            {/* Holographic background grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#081329_1px,transparent_1px),linear-gradient(to_bottom,#081329_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

            {/* Live Status Header */}
            <div className="w-full flex items-center justify-between border-b border-cyan-500/15 pb-3 mb-6 relative z-10 text-xs font-mono">
              <span className="text-slate-400">CORE VIEWPORT</span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-bold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>{eyeConfig.colorPreset.toUpperCase()} • {devilEyeState}</span>
              </span>
            </div>

            {/* THE HERO EYE LIVE PREVIEW */}
            <div className="relative z-10 my-auto p-4 flex flex-col items-center">
              <DevilEye 
                size="hero" 
                state={devilEyeState} 
                showWordmark={true} 
                showTelemetry={true} 
                interactive={true} 
              />
            </div>

            {/* Quick Live State Telemetry Footer */}
            <div className="w-full grid grid-cols-3 gap-2 border-t border-cyan-500/15 pt-3 mt-6 relative z-10 text-[11px] font-mono text-center">
              <div className="p-1.5 rounded bg-[#030611] border border-slate-800">
                <div className="text-slate-500 text-[9px] uppercase">Hue Angle</div>
                <div className="text-cyan-300 font-bold">{eyeConfig.hue}°</div>
              </div>
              <div className="p-1.5 rounded bg-[#030611] border border-slate-800">
                <div className="text-slate-500 text-[9px] uppercase">Speed</div>
                <div className="text-cyan-300 font-bold">{eyeConfig.animationSpeed}x</div>
              </div>
              <div className="p-1.5 rounded bg-[#030611] border border-slate-800">
                <div className="text-slate-500 text-[9px] uppercase">Response</div>
                <div className="text-cyan-300 font-bold capitalize">{eyeConfig.responseMode}</div>
              </div>
            </div>
          </div>

          {/* Preset Buttons Palette */}
          <div className="bg-[#050b1a] border border-cyan-500/20 rounded-xl p-4">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Color Presets</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`px-2.5 py-2 rounded border text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer ${
                    eyeConfig.colorPreset === p.id
                      ? `${p.bg} ${p.border} ${p.text} shadow-md`
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span>{p.label}</span>
                  {eyeConfig.colorPreset === p.id && <Check className="w-3.5 h-3.5 ml-1 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Configuration Workspace */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-cyan-500/20 bg-[#050b1a] rounded-t-xl p-1 gap-1 text-xs font-mono">
            {[
              { id: 'color', label: 'Color & Hue', icon: Palette },
              { id: 'animation', label: 'Animation Engine', icon: Sparkles },
              { id: 'movement', label: 'Motion & Tracking', icon: Crosshair },
              { id: 'states', label: 'AI States (13)', icon: Activity },
              { id: 'events', label: 'Event Triggers', icon: Zap }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playHudClick();
                    setActiveSubTab(tab.id as any);
                  }}
                  className={`flex-1 py-2 px-3 rounded flex items-center justify-center space-x-1.5 transition-all cursor-pointer font-bold ${
                    isActive
                      ? 'bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-500/50 text-red-300 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: COLOR & LIVE HUE SHIFTER */}
          {activeSubTab === 'color' && (
            <div className="bg-[#050b1a] border border-cyan-500/20 rounded-b-xl p-6 space-y-6">
              {/* REAL-TIME RAINBOW HUE SHIFTER */}
              <div className="space-y-3 p-4 rounded-xl bg-[#030612] border border-cyan-500/30">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="font-bold text-cyan-300 flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>REAL-TIME HUE SHIFTER (0° - 360°)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-cyan-400">
                    {eyeConfig.hue}°
                  </span>
                </div>
                
                {/* Rainbow Gradient Track Slider */}
                <div className="relative pt-1 pb-1">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={eyeConfig.hue}
                    onChange={(e) => {
                      const newHue = parseInt(e.target.value, 10);
                      updateEyeConfig({ hue: newHue, colorPreset: 'custom' });
                    }}
                    className="w-full h-4 rounded-lg appearance-none cursor-pointer focus:outline-none"
                    style={{
                      background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0° Red</span>
                  <span>60° Yellow</span>
                  <span>120° Green</span>
                  <span>180° Cyan</span>
                  <span>240° Blue</span>
                  <span>300° Purple</span>
                  <span>360° Red</span>
                </div>
              </div>

              {/* Saturation & Brightness Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Saturation</span>
                    <span className="text-cyan-300 font-bold">{eyeConfig.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={5}
                    value={eyeConfig.saturation}
                    onChange={(e) => updateEyeConfig({ saturation: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Brightness</span>
                    <span className="text-cyan-300 font-bold">{eyeConfig.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={5}
                    value={eyeConfig.brightness}
                    onChange={(e) => updateEyeConfig({ brightness: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Iris, Pupil & Glow Color Inputs */}
              <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-3 text-xs font-mono">
                <div className="font-bold text-slate-300 uppercase tracking-wider">
                  Individual Color Overrides
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1">Iris Core Color</label>
                    <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded border border-slate-800">
                      <input
                        type="color"
                        value={eyeConfig.irisColor}
                        onChange={(e) => updateEyeConfig({ irisColor: e.target.value })}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-slate-200">{eyeConfig.irisColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1">Outer Glow Accent</label>
                    <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded border border-slate-800">
                      <input
                        type="color"
                        value={eyeConfig.outerAccentColor}
                        onChange={(e) => updateEyeConfig({ outerAccentColor: e.target.value })}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-slate-200">{eyeConfig.outerAccentColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1">HUD Reticle Color</label>
                    <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded border border-slate-800">
                      <input
                        type="color"
                        value={eyeConfig.hudColor}
                        onChange={(e) => updateEyeConfig({ hudColor: e.target.value })}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-slate-200">{eyeConfig.hudColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANIMATION ENGINE */}
          {activeSubTab === 'animation' && (
            <div className="bg-[#050b1a] border border-cyan-500/20 rounded-b-xl p-6 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Animation Speed */}
                <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Overall Animation Speed</span>
                    <span className="text-cyan-300 font-bold">{eyeConfig.animationSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={eyeConfig.animationSpeed}
                    onChange={(e) => updateEyeConfig({ animationSpeed: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.2x Slow</span>
                    <span>1.0x Normal</span>
                    <span>3.0x Hyper</span>
                  </div>
                </div>

                {/* Blink Frequency */}
                <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Blink Interval</span>
                    <span className="text-cyan-300 font-bold">{eyeConfig.blinkFrequency}s</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={15}
                    step={1}
                    value={eyeConfig.blinkFrequency}
                    onChange={(e) => updateEyeConfig({ blinkFrequency: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>2s Rapid</span>
                    <span>5s Cinematic</span>
                    <span>15s Cold Gaze</span>
                  </div>
                </div>

                {/* Blink Duration */}
                <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Shutter Shutter Speed</span>
                    <span className="text-cyan-300 font-bold">{eyeConfig.blinkDuration}ms</span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={300}
                    step={20}
                    value={eyeConfig.blinkDuration}
                    onChange={(e) => updateEyeConfig({ blinkDuration: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Iris Rotation Speed */}
                <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Iris HUD Orbit Cycle</span>
                    <span className="text-cyan-300 font-bold">{eyeConfig.irisRotationSpeed}s</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={eyeConfig.irisRotationSpeed}
                    onChange={(e) => updateEyeConfig({ irisRotationSpeed: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Glow Intensity */}
                <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Aura Glow Intensity</span>
                    <span className="text-cyan-300 font-bold">{eyeConfig.glowIntensity}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    value={eyeConfig.glowIntensity}
                    onChange={(e) => updateEyeConfig({ glowIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* HUD Reticle Intensity */}
                <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>HUD Reticle Intensity</span>
                    <span className="text-cyan-300 font-bold">{Math.round(eyeConfig.hudIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={eyeConfig.hudIntensity}
                    onChange={(e) => updateEyeConfig({ hudIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MOTION & TRACKING */}
          {activeSubTab === 'movement' && (
            <div className="bg-[#050b1a] border border-cyan-500/20 rounded-b-xl p-6 space-y-6 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#030612] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-200">Cursor Attention Tracking</div>
                    <div className="text-slate-500 text-[11px]">Pupil dynamically tracks mouse cursor across the screen</div>
                  </div>
                  <button
                    onClick={() => updateEyeConfig({ cursorTracking: !eyeConfig.cursorTracking })}
                    className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                      eyeConfig.cursorTracking
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {eyeConfig.cursorTracking ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-slate-300">
                    <span>Tracking Sensitivity</span>
                    <span className="text-cyan-300 font-bold">{eyeConfig.movementSensitivity}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={eyeConfig.movementSensitivity}
                    onChange={(e) => updateEyeConfig({ movementSensitivity: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <label className="text-slate-300 block">Response Mode</label>
                  <select
                    value={eyeConfig.responseMode}
                    onChange={(e) => updateEyeConfig({ responseMode: e.target.value as EyeResponseMode })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  >
                    <option value="reactive">Reactive (Follow Cursor Naturally)</option>
                    <option value="scanning">Hypnotic Scanning (Autonomous Sweep)</option>
                    <option value="fixed">Fixed Forward (Locked Stare)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI STATES */}
          {activeSubTab === 'states' && (
            <div className="bg-[#050b1a] border border-cyan-500/20 rounded-b-xl p-6 space-y-4 text-xs font-mono">
              <div className="text-slate-400 text-xs">
                Click any state below to manually trigger the Devil's Eye visual core and observe its real-time response:
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {allStates.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      playHudClick();
                      setDevilEyeStateOverride(st);
                      addToast('State Override', `Devil's Eye state set to ${st}`, 'info');
                    }}
                    className={`px-3 py-2.5 rounded border text-left flex items-center justify-between transition-all cursor-pointer ${
                      devilEyeState === st
                        ? 'bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.3)] font-bold'
                        : 'bg-[#030612] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{st}</span>
                    {devilEyeState === st && <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    playHudClick();
                    setDevilEyeStateOverride(null);
                    addToast('Auto Mode', "Devil's Eye returned to autonomous reactive mode", 'success');
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono cursor-pointer"
                >
                  Clear Override (Return to Autonomous)
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: EVENT TRIGGERS */}
          {activeSubTab === 'events' && (
            <div className="bg-[#050b1a] border border-cyan-500/20 rounded-b-xl p-6 space-y-3 text-xs font-mono">
              <div className="text-slate-400 text-xs mb-2">
                Simulate real pipeline events and verify that the Devil's Eye reacts instantaneously:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { event: 'UPLOAD_STARTED', state: 'PROCESSING', duration: 4000 },
                  { event: 'GEMINI_FILE_PROCESSING', state: 'ANALYZING', duration: 4000 },
                  { event: 'ANALYSIS_STARTED', state: 'ANALYZING', duration: 4000 },
                  { event: 'ANALYSIS_COMPLETED', state: 'SUCCESS', duration: 3000 },
                  { event: 'AI_THINKING', state: 'THINKING', duration: 3000 },
                  { event: 'CRITICAL_ALERT', state: 'ALERT', duration: 3000 },
                  { event: 'SYSTEM_ERROR', state: 'ERROR', duration: 3000 },
                  { event: 'DEVIL_MODE_ACTIVATION', state: 'DEVIL MODE', duration: 5000 },
                ].map((item) => (
                  <button
                    key={item.event}
                    onClick={() => triggerEvent(item.event, item.state as DevilEyeState, item.duration)}
                    className="p-3 rounded-lg bg-[#030612] border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-cyan-300">{item.event}</div>
                      <div className="text-[10px] text-slate-500">Triggers: {item.state}</div>
                    </div>
                    <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Configuration Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050b1a] border border-cyan-500/30 rounded-xl max-w-lg w-full p-6 space-y-4 font-mono text-xs shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Import Eye Configuration Profile</span>
            </h3>
            <p className="text-slate-400 text-[11px]">
              Paste exported Devil's Eye JSON configuration below:
            </p>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{ "colorPreset": "blue", "hue": 215, ... }'
              className="w-full p-3 rounded bg-[#02050e] border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
              >
                Apply Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
