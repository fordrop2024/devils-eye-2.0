/**
 * THE DEVIL'S EYE - Cinema Export Center & Publishing Package Modal
 * Dedicated interface supporting YouTube Explainer (16:9) and Shorts (9:16),
 * detailed export settings (Resolution, FPS, Video/Audio Bitrates, Burn-in Subtitles, Metadata),
 * real-time browser encoding capability diagnostics,
 * and 1-Click Consolidated Publishing Package export.
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExportSettingsConfig } from '../../types';
import { 
  X, 
  DownloadCloud, 
  Youtube, 
  Smartphone, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  Sliders, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  AlertTriangle,
  Package,
  Layers,
  FileCode,
  Volume2
} from 'lucide-react';
import { playHudClick, playHudScan, playHudSuccess } from '../../services/soundFx';
import { 
  detectBrowserCapabilities, 
  synthesizeMasterVideo, 
  downloadFullPublishingPackage 
} from '../../services/exportService';
import { downloadFile } from '../../services/subtitleService';

export const ExportModal: React.FC = () => {
  const { 
    isExportModalOpen, 
    setIsExportModalOpen, 
    currentProject, 
    addToast,
    addLog
  } = useApp();

  // Active Tab: 'single' (custom format) or 'bundle' (complete publishing package)
  const [exportMode, setExportMode] = useState<'single' | 'bundle'>('bundle');

  // Format selection
  const [selectedFormatType, setSelectedFormatType] = useState<'youtube_16_9' | 'shorts_9_16'>('youtube_16_9');

  // Export Settings Config
  const [settings, setSettings] = useState<ExportSettingsConfig>({
    resolution: '1080p (1920x1080)',
    aspectRatio: '16:9',
    fps: 24,
    videoBitrateMbps: 16,
    audioBitrateKbps: 320,
    burnInSubtitles: true,
    subtitleStyle: 'cyber_cyan',
    subtitleLanguage: 'English',
    exportMetadata: true,
    includeAudioStems: true
  });

  // Browser diagnostics
  const [browserCaps, setBrowserCaps] = useState(detectBrowserCapabilities());

  useEffect(() => {
    if (isExportModalOpen) {
      setBrowserCaps(detectBrowserCapabilities());
    }
  }, [isExportModalOpen]);

  // Sync aspect ratio when format changes
  const handleSelectFormat = (type: 'youtube_16_9' | 'shorts_9_16') => {
    setSelectedFormatType(type);
    if (type === 'shorts_9_16') {
      setSettings(prev => ({
        ...prev,
        aspectRatio: '9:16',
        resolution: 'Shorts (1080x1920)',
        fps: 30,
        subtitleStyle: 'karaoke_glow'
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        aspectRatio: '16:9',
        resolution: '1080p (1920x1080)',
        fps: 24,
        subtitleStyle: 'cyber_cyan'
      }));
    }
  };

  // Rendering state
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');

  if (!isExportModalOpen) return null;

  // Execute single format export
  const handleStartSingleExport = async () => {
    setIsRendering(true);
    setRenderProgress(5);
    setRenderStage('Initializing Cinema Rasterizer...');
    playHudScan();
    addToast('Cinema Export Started', `Synthesizing ${settings.aspectRatio === '9:16' ? 'Vertical 9:16 Short' : '16:9 Master Reel'}...`, 'info');
    addLog(`Export Center: Starting render for ${currentProject.title} (${settings.resolution}, ${settings.fps}fps)`, 'ai');

    try {
      const result = await synthesizeMasterVideo(currentProject, settings, (pct, stage) => {
        setRenderProgress(pct);
        setRenderStage(stage);
      });

      downloadFile(result.blob, result.filename, result.mimeType);

      // Also export metadata JSON if enabled
      if (settings.exportMetadata) {
        const metaStr = JSON.stringify({
          project: currentProject.title,
          exportSettings: settings,
          timeline: currentProject.timeline,
          duration: currentProject.duration,
          exportedAt: new Date().toISOString()
        }, null, 2);
        downloadFile(metaStr, `${currentProject.title.replace(/\s+/g, '_')}_timeline_metadata.json`, 'application/json');
      }

      playHudSuccess();
      addToast('Export Complete', `Successfully downloaded ${result.filename}`, 'success');
      addLog(`Export Center: Video exported (${result.filename})`, 'success');
      setIsExportModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Export Error', 'Encountered error during video synthesis; fallback data generated.', 'error');
    } finally {
      setIsRendering(false);
    }
  };

  // Execute full consolidated Publishing Package export
  const handleStartBundleExport = async () => {
    setIsRendering(true);
    setRenderProgress(5);
    setRenderStage('Compiling Master Publishing Package...');
    playHudScan();
    addToast('Publishing Package', 'Exporting Video, SRT, VTT, Thumbnails & SEO Kit...', 'info');
    addLog(`Export Center: Generating full publishing package for ${currentProject.title}`, 'ai');

    try {
      await downloadFullPublishingPackage(currentProject, settings, (pct, stage) => {
        setRenderProgress(pct);
        setRenderStage(stage);
      });

      playHudSuccess();
      addToast('Publishing Package Ready', 'All assets downloaded to your system!', 'success');
      addLog(`Export Center: Publishing package dispatched successfully`, 'success');
      setIsExportModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Export Error', 'Failed to compile package bundle', 'error');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="hud-panel max-w-2xl w-full rounded-xl border border-cyan-500/40 p-5 relative shadow-[0_0_60px_rgba(0,240,255,0.2)] hud-corners-all max-h-[92vh] flex flex-col overflow-hidden bg-[#030714]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <DownloadCloud className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-cyan-200 tracking-wide">
                CINEMA EXPORT CENTER & PUBLISHING ENGINE
              </h2>
              <div className="text-[11px] font-mono text-cyan-400/70">
                PROJECT: {currentProject.title} • MASTER ASSETS PIPELINE
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              playHudClick();
              setIsExportModalOpen(false);
            }}
            className="text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Rendering Progress State */}
        {isRendering ? (
          <div className="py-12 px-6 text-center space-y-5 my-auto">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-dashed animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(0,240,255,0.4)]" />
              <div className="absolute inset-4 rounded-full bg-cyan-950/90 flex flex-col items-center justify-center font-mono text-cyan-300 font-bold text-base">
                <span>{renderProgress}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display font-bold text-sm text-cyan-200 uppercase tracking-wider">
                SYNTHESIZING PRODUCTION ARTIFACTS
              </div>
              <div className="text-xs font-mono text-cyan-400/80">
                {renderStage || 'Processing frames, subtitles and audio multiplexing...'}
              </div>
            </div>

            <div className="w-full bg-slate-900 border border-cyan-500/40 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-300 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          </div>
        ) : (
          /* Normal Configuration Mode */
          <div className="overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Mode Switcher: 1-Click Consolidated Package vs Custom Format */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#02050f] border border-cyan-500/30 rounded-lg">
              <button
                onClick={() => setExportMode('bundle')}
                className={`p-2.5 rounded text-left flex items-center space-x-2.5 cursor-pointer transition-all ${
                  exportMode === 'bundle'
                    ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-tech font-bold text-xs text-cyan-200">1-CLICK PUBLISHING PACKAGE</div>
                  <div className="text-[10px] text-slate-400">Master Video + SRT + VTT + Thumbnails + SEO Kit</div>
                </div>
              </button>

              <button
                onClick={() => setExportMode('single')}
                className={`p-2.5 rounded text-left flex items-center space-x-2.5 cursor-pointer transition-all ${
                  exportMode === 'single'
                    ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-tech font-bold text-xs text-cyan-200">CUSTOM FORMAT RENDER</div>
                  <div className="text-[10px] text-slate-400">Granular Bitrates, FPS, Stems & Burn-in Options</div>
                </div>
              </button>
            </div>

            {/* Target Format Options */}
            <div className="space-y-2">
              <div className="text-xs font-tech uppercase text-cyan-300 flex items-center justify-between">
                <span>Select Primary Aspect Target</span>
                <span className="text-[10px] font-mono text-slate-400">PROJECT RESOLUTION</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* YouTube 16:9 */}
                <button
                  onClick={() => handleSelectFormat('youtube_16_9')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all space-y-1 ${
                    selectedFormatType === 'youtube_16_9'
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-[#040918] border-slate-800 text-slate-300 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold font-tech text-xs text-cyan-200">
                      <Youtube className="w-4 h-4 text-rose-400" />
                      <span>YouTube Explainer (16:9)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">1080p / 4K</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Cinema widescreen presentation with chapter markers and high-bitrate audio.
                  </p>
                </button>

                {/* Shorts 9:16 */}
                <button
                  onClick={() => handleSelectFormat('shorts_9_16')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all space-y-1 ${
                    selectedFormatType === 'shorts_9_16'
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-[#040918] border-slate-800 text-slate-300 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold font-tech text-xs text-cyan-200">
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                      <span>Shorts / Reels / TikTok (9:16)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">1080x1920</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Vertical auto-cropped framing with animated keyword captions & dramatic zoom.
                  </p>
                </button>
              </div>
            </div>

            {/* Granular Settings Grid */}
            <div className="p-3.5 bg-[#02050f] border border-cyan-500/20 rounded-lg space-y-3">
              <div className="text-[11px] font-tech text-cyan-300 uppercase pb-1 border-b border-cyan-500/15 flex items-center justify-between">
                <span>EXPORT SPECIFICATIONS</span>
                <span className="text-[10px] font-mono text-slate-400">ENCODING PARAMETERS</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Resolution */}
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Resolution:</label>
                  <select
                    value={settings.resolution}
                    onChange={(e) => setSettings({ ...settings, resolution: e.target.value as typeof settings.resolution })}
                    className="w-full bg-[#040918] border border-cyan-500/30 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="1080p (1920x1080)">1080p Full HD</option>
                    <option value="4K UHD (3840x2160)">4K UHD Master</option>
                    <option value="720p (1280x720)">720p Fast Proxy</option>
                    <option value="1440p (2560x1440)">1440p 2K QHD</option>
                    <option value="Shorts (1080x1920)">Shorts (1080x1920)</option>
                  </select>
                </div>

                {/* Frame Rate */}
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Frame Rate:</label>
                  <select
                    value={settings.fps}
                    onChange={(e) => setSettings({ ...settings, fps: parseInt(e.target.value) as typeof settings.fps })}
                    className="w-full bg-[#040918] border border-cyan-500/30 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value={24}>24 fps (Cinema Standard)</option>
                    <option value={30}>30 fps (Web Streaming)</option>
                    <option value={60}>60 fps (High Smooth)</option>
                  </select>
                </div>

                {/* Video Bitrate */}
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Video Bitrate:</label>
                  <select
                    value={settings.videoBitrateMbps}
                    onChange={(e) => setSettings({ ...settings, videoBitrateMbps: parseInt(e.target.value) })}
                    className="w-full bg-[#040918] border border-cyan-500/30 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value={8}>8 Mbps (Web Light)</option>
                    <option value={16}>16 Mbps (High Quality)</option>
                    <option value={45}>45 Mbps (Master Pro)</option>
                  </select>
                </div>

                {/* Audio Bitrate */}
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Audio Bitrate:</label>
                  <select
                    value={settings.audioBitrateKbps}
                    onChange={(e) => setSettings({ ...settings, audioBitrateKbps: parseInt(e.target.value) })}
                    className="w-full bg-[#040918] border border-cyan-500/30 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value={128}>128 kbps AAC</option>
                    <option value={192}>192 kbps Standard</option>
                    <option value={320}>320 kbps Cinema Hi-Fi</option>
                  </select>
                </div>
              </div>

              {/* Checkbox Toggles: Burn-in Subtitles, Metadata, Audio Stems */}
              <div className="pt-2 border-t border-cyan-500/15 flex flex-wrap gap-4 text-xs text-slate-300 font-mono">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.burnInSubtitles}
                    onChange={(e) => setSettings({ ...settings, burnInSubtitles: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span>Burn-in Cinema Subtitles</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.exportMetadata}
                    onChange={(e) => setSettings({ ...settings, exportMetadata: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span>Export Timeline EDL & Metadata</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.includeAudioStems}
                    onChange={(e) => setSettings({ ...settings, includeAudioStems: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span>Multiplex Low-Drone Sub Audio</span>
                </label>
              </div>
            </div>

            {/* Browser Encoding Capabilities & Transparency Panel */}
            <div className="p-3 bg-[#040918] border border-cyan-500/20 rounded-lg space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center space-x-1.5 text-cyan-300 font-bold">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CLIENT BROWSER ENCODING ENGINE STATUS</span>
                </span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[10px]">
                {browserCaps.notes} (MIME: <code className="text-cyan-300">{browserCaps.preferredMimeType}</code>, HW Accel: {browserCaps.hardwareAccelerationEstimated ? 'Enabled' : 'Software Rasterizer'})
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3 shrink-0">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded text-xs font-tech text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 cursor-pointer"
              >
                CANCEL
              </button>

              {exportMode === 'bundle' ? (
                <button
                  onClick={handleStartBundleExport}
                  className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-tech font-bold text-xs px-5 py-2.5 rounded border border-cyan-400/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center space-x-2 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>DISPATCH COMPLETE PUBLISHING PACKAGE</span>
                </button>
              ) : (
                <button
                  onClick={handleStartSingleExport}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech font-bold text-xs px-5 py-2.5 rounded border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>START CINEMA MASTER RENDER</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
