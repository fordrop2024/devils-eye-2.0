/**
 * THE DEVIL'S EYE - Voice Lab & Advanced Voice Acting Studio
 * 
 * Core Voice System:
 * - One Master Voice Identity (Male or Female) per project, consistent across all 60 acting modes
 * - 60 Professional Acting Modes (Natural, Cinematic, Drama, Horror, Mystery, Climax, Mature 18+, etc.)
 * - Emotion Mixer (Neutral, Happy, Sad, Angry, Fear, Suspense, Dramatic, etc.) with 4-axis dynamic sliders
 * - Precision Delivery Controls (Speed, Pitch, Volume, Sentence/Paragraph Pauses, Emphasis, Safe/Mature language)
 * - Custom Natural Language Voice Direction with cinema presets
 * - Script Voice Map with AI Recommendations (Accept, Edit, Override) and Single-Segment / Batch Synthesis
 * - Real Audio Duration Extraction & Synchronization with Editor Timeline & Subtitles
 * - Voice Consistency Validator with 1-Click Repair
 * - A/B Voice Take Comparator & Cost-Protected In-Memory Cache
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  Sliders, 
  Sparkles, 
  Check, 
  Music, 
  Activity, 
  CheckCircle2, 
  Key, 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  FileAudio, 
  Clock, 
  Layers, 
  Radio, 
  VolumeX, 
  ChevronRight, 
  Film, 
  Code,
  Languages,
  Lock,
  RefreshCw,
  Zap,
  Wand2,
  Search,
  Filter,
  Flame,
  SplitSquareVertical,
  Database,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
  CheckCheck,
  Award
} from 'lucide-react';
import { 
  MASTER_VOICES,
  GCP_VOICE_MODELS, 
  GcpVoiceModel, 
  synthesizeVoiceSpeech,
  compileActingModeSsml,
  getCachedAudioTakes,
  SynthesisResult
} from '../services/ttsService';
import { 
  VOICE_ACTING_MODES, 
  getVoiceActingModeById, 
  getRecommendedModeForScene 
} from '../services/voiceModesData';
import { validateProjectVoiceConsistency } from '../services/voiceConsistencyService';
import { VoiceLabSettings, WordTiming, MasterNarratorProfile, ScriptSegment } from '../types';
import { playHudClick, playHudScan, playHudSuccess, playHudWarning } from '../services/soundFx';

export const VoiceLab: React.FC = () => {
  const { 
    currentProject, 
    updateCurrentProject, 
    addToast, 
    updateMasterVoiceIdentity, 
    updateMasterNarratorProfile,
    repairVoiceConsistency,
    navigateTo 
  } = useApp();

  const script = currentProject.script;
  const segments = script?.segments || [];

  // Master Voice profile state
  const masterVoiceId = currentProject.masterNarratorVoiceId || currentProject.voiceSettings?.selectedVoiceId || 'hi-IN-Neural2-B';
  const masterProfile = currentProject.masterNarratorProfile || {
    provider: 'google',
    voiceId: masterVoiceId,
    voiceName: masterVoiceId,
    gender: 'male',
    language: 'hi-IN',
    mode: 'cinematic',
    speakingRate: 1.0,
    pitch: 0,
    volumeGainDb: 0,
    intensity: 75,
    emotion: 'Dramatic',
    styleInstructions: 'Cinematic narrator with deliberate dramatic pauses.',
    enabled: true,
    energy: 70,
    dramaticLevel: 85,
    suspenseLevel: 60,
    pauseStrength: 75,
    sentencePauseMs: 500,
    paragraphPauseMs: 900,
    emphasisStrength: 75,
    emotionLevel: 75,
    safeLanguageMode: 'NORMAL'
  };

  const voiceSettings: VoiceLabSettings = currentProject.voiceSettings || {
    gcpConfigured: false,
    selectedLanguage: masterProfile.language || 'hi-IN',
    selectedVoiceId: masterVoiceId,
    gender: masterProfile.gender || 'male',
    speakingRate: masterProfile.speakingRate || 1.0,
    pitch: masterProfile.pitch || 0,
    volumeGainDb: masterProfile.volumeGainDb || 0,
    deliveryPreset: masterProfile.mode || 'Cinematic',
    ssmlMode: false,
    ssmlText: '',
    pauseMs: masterProfile.sentencePauseMs || 450,
    customPronunciations: []
  };

  // Navigation & Subtabs
  const [activeTab, setActiveTab] = useState<'modes' | 'mixer' | 'direction' | 'scriptmap' | 'abcompare' | 'cache' | 'ssml'>('scriptmap');
  
  // Search & Filters for 60 modes
  const [modeSearch, setModeSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Preview / Playback state
  const [previewText, setPreviewText] = useState<string>(
    "The top keeps spinning on the polished marble table without a single wobble. Cobb never left the dream."
  );
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSpokenWord, setCurrentSpokenWord] = useState<string>('');
  const [lastAudioResult, setLastAudioResult] = useState<SynthesisResult | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>(voiceSettings.gcpApiKey || '');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // A/B Comparison state
  const [takeAMode, setTakeAMode] = useState<string>('cinematic');
  const [takeAIntensity, setTakeAIntensity] = useState<number>(75);
  const [takeBMode, setTakeBMode] = useState<string>('suspense');
  const [takeBIntensity, setTakeBIntensity] = useState<number>(90);
  const [takeAResult, setTakeAResult] = useState<SynthesisResult | null>(null);
  const [takeBResult, setTakeBResult] = useState<SynthesisResult | null>(null);
  const [activeABPlayback, setActiveABPlayback] = useState<'A' | 'B' | null>(null);

  // Custom Direction input
  const [customDirectionInput, setCustomDirectionInput] = useState<string>('');

  // Audio elements & Canvas Waveform ref
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Voice Consistency validation
  const consistencyReport = useMemo(() => {
    return validateProjectVoiceConsistency(currentProject);
  }, [currentProject]);

  // Current active mode details
  const activeModeDetails = useMemo(() => {
    return getVoiceActingModeById(masterProfile.mode);
  }, [masterProfile.mode]);

  // Filtered acting modes
  const filteredActingModes = useMemo(() => {
    return VOICE_ACTING_MODES.filter(m => {
      const matchSearch = modeSearch === '' || 
        m.name.toLowerCase().includes(modeSearch.toLowerCase()) || 
        m.description.toLowerCase().includes(modeSearch.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || m.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [modeSearch, selectedCategory]);

  // Animated Waveform effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      ctx.beginPath();
      ctx.strokeStyle = isPlaying ? '#00f0ff' : '#1e293b';
      ctx.lineWidth = 2;

      for (let x = 0; x < width; x++) {
        const amplitude = isPlaying ? (masterProfile.intensity / 100) * 16 : 3;
        const freq = isPlaying ? 0.04 : 0.01;
        const y = mid + Math.sin(x * freq + phase) * amplitude * Math.cos(x * 0.01);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += isPlaying ? 0.12 : 0.02;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, masterProfile.intensity]);

  // Handle Master Voice Identity Switch (Male / Female)
  const handleSelectMasterVoice = (gender: 'male' | 'female', langVariant: 'hindi' | 'englishIndia' | 'usGlobal') => {
    playHudClick();
    const model = MASTER_VOICES[gender][langVariant];
    updateMasterVoiceIdentity(gender, model.id, model.languageCode);
  };

  // Handle Acting Mode Change (Keeps Master Voice ID!)
  const handleSelectActingMode = (modeId: string) => {
    playHudClick();
    const mode = getVoiceActingModeById(modeId);
    updateMasterNarratorProfile({
      mode: mode.id,
      intensity: mode.defaultIntensity,
      emotion: mode.defaultEmotion,
      energy: mode.defaultEnergy,
      dramaticLevel: mode.defaultDramatic,
      suspenseLevel: mode.defaultSuspense,
      speakingRate: mode.defaultRate,
      pitch: mode.defaultPitch,
      sentencePauseMs: mode.pauseSentenceMs,
      paragraphPauseMs: mode.pauseParagraphMs,
      styleInstructions: mode.stylePrompt
    });
    addToast(
      'Voice Acting Mode Applied',
      `Switched performance to ${mode.name}. Master Voice Identity remains strictly locked.`,
      'info'
    );
  };

  // Synthesize Sample Preview
  const handleSynthesizePreview = async (overrideMode?: string, overrideIntensity?: number) => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    playHudScan();

    try {
      const result = await synthesizeVoiceSpeech(
        previewText,
        {
          ...voiceSettings,
          selectedVoiceId: masterVoiceId,
          masterProfile
        },
        (word) => setCurrentSpokenWord(word),
        overrideMode || masterProfile.mode,
        overrideIntensity ?? masterProfile.intensity
      );

      setLastAudioResult(result);

      if (result.audioUrl) {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = result.audioUrl;
          audioPlayerRef.current.play();
          setIsPlaying(true);
          audioPlayerRef.current.onended = () => {
            setIsPlaying(false);
            setCurrentSpokenWord('');
          };
        }
      } else {
        // Live speech synthesis running
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), (result.durationSec || 4) * 1000);
      }

      playHudSuccess();
      addToast(
        result.status === 'cached' ? 'Audio Served from Cache' : 'Voice Synthesis Completed',
        result.message,
        'success'
      );
    } catch (err: any) {
      playHudWarning();
      addToast('Synthesis Error', err.message || 'Failed to synthesize speech', 'error');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Synthesize Single Segment
  const handleSynthesizeSegment = async (seg: ScriptSegment, idx: number) => {
    playHudClick();
    const textToVoice = seg.narration?.[0]?.text || seg.hookLine || seg.title;
    if (!textToVoice) return;

    const segmentMode = seg.voiceMode || masterProfile.mode;
    const segmentIntensity = seg.voiceIntensity ?? masterProfile.intensity;

    addToast('Synthesizing Segment', `Generating narration for Segment ${idx + 1} (${segmentMode.toUpperCase()})...`, 'info');

    try {
      const result = await synthesizeVoiceSpeech(
        textToVoice,
        {
          ...voiceSettings,
          selectedVoiceId: masterVoiceId,
          masterProfile
        },
        undefined,
        segmentMode,
        segmentIntensity
      );

      // Update segment with real audio duration and URL
      const updatedSegments = [...segments];
      updatedSegments[idx] = {
        ...updatedSegments[idx],
        audioUrl: result.audioUrl,
        audioDurationSec: result.durationSec,
        generationStatus: 'ready',
        voiceMode: segmentMode,
        voiceIntensity: segmentIntensity,
        voiceEmotion: masterProfile.emotion,
        narration: [
          {
            ...(updatedSegments[idx].narration?.[0] || { id: `narr-${idx}`, text: textToVoice }),
            voiceActorId: masterVoiceId,
            audioUrl: result.audioUrl || undefined,
            durationSec: result.durationSec
          }
        ],
        audioTiming: {
          startSec: updatedSegments[idx].startSec || idx * 12,
          endSec: (updatedSegments[idx].startSec || idx * 12) + result.durationSec,
          durationSec: result.durationSec,
          voiceActorId: masterVoiceId,
          audioUrl: result.audioUrl
        }
      };

      // Also synchronize into Timeline narration track!
      const updatedTimeline = { ...currentProject.timeline };
      if (updatedTimeline && updatedTimeline.tracks) {
        const narrationTrack = updatedTimeline.tracks.find(t => 
          t.type === 'narration' || t.name.toLowerCase().includes('narration') || t.id.includes('narration')
        );
        if (narrationTrack && narrationTrack.clips) {
          const targetClip = narrationTrack.clips.find(c => c.title.includes(`Stage ${idx + 1}`) || c.id.includes(seg.id));
          if (targetClip) {
            targetClip.duration = result.durationSec;
            targetClip.sourceEnd = targetClip.sourceStart + result.durationSec;
            targetClip.volume = 0.95;
            targetClip.title = `[${masterProfile.gender.toUpperCase()} / ${segmentMode.toUpperCase()}] ${seg.title}`;
          }
        }
      }

      updateCurrentProject({
        script: {
          ...currentProject.script,
          segments: updatedSegments
        },
        timeline: updatedTimeline
      });

      playHudSuccess();
      addToast(
        'Segment Voiced Successfully',
        `Segment ${idx + 1} synchronized. Real duration: ${result.durationSec}s recorded to timeline & subtitles.`,
        'success'
      );
    } catch (err: any) {
      playHudWarning();
      addToast('Segment Generation Failed', err.message, 'error');
    }
  };

  // Batch Synthesize All Segments (Cost-Protected)
  const handleBatchSynthesizeAll = async () => {
    playHudClick();
    if (!window.confirm(`Synthesize all ${segments.length} script segments using Master Voice (${masterVoiceId})? Unchanged segments will be served from zero-cost cache.`)) {
      return;
    }

    addToast('Batch Synthesis Started', `Queueing ${segments.length} segments with Master Voice...`, 'info');

    for (let i = 0; i < segments.length; i++) {
      await handleSynthesizeSegment(segments[i], i);
      await new Promise(r => setTimeout(r, 400));
    }

    playHudSuccess();
    addToast('Batch Complete', 'All narration segments synthesized and synchronized to the timeline!', 'success');
  };

  // Run A/B Comparison Takes
  const handleRunABComparison = async (take: 'A' | 'B') => {
    playHudClick();
    const mode = take === 'A' ? takeAMode : takeBMode;
    const intensity = take === 'A' ? takeAIntensity : takeBIntensity;

    addToast(`Generating Take ${take}`, `Performing in ${mode.toUpperCase()} @ ${intensity}% with Master Voice...`, 'info');

    const res = await synthesizeVoiceSpeech(
      previewText,
      {
        ...voiceSettings,
        selectedVoiceId: masterVoiceId,
        masterProfile
      },
      undefined,
      mode,
      intensity
    );

    if (take === 'A') setTakeAResult(res);
    else setTakeBResult(res);

    setActiveABPlayback(take);
    if (res.audioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.src = res.audioUrl;
      audioPlayerRef.current.play();
    }
  };

  // Custom Direction Quick Presets
  const applyDirectionPreset = (presetName: string, promptText: string, suggestedMode: string, intensity: number) => {
    playHudClick();
    setCustomDirectionInput(promptText);
    handleSelectActingMode(suggestedMode);
    updateMasterNarratorProfile({
      intensity,
      styleInstructions: promptText
    });
    addToast('Direction Preset Applied', `Loaded "${presetName}". Updated performance instructions.`, 'info');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 font-sans text-slate-100">
      <audio ref={audioPlayerRef} className="hidden" />

      {/* TOP BANNER: MASTER VOICE STATUS & CONSISTENCY CHECK */}
      <div className="hud-panel p-4 rounded-lg border border-cyan-500/40 hud-corners bg-gradient-to-r from-[#02050f] via-[#040c1d] to-[#02050f] shadow-[0_0_20px_rgba(0,240,255,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-[10px] font-bold tracking-widest uppercase">
                PART 3 AI NARRATION SYSTEM
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono text-[10px] flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5" />
                <span>PERMANENT MASTER VOICE LOCKED</span>
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-tech font-bold tracking-wide text-cyan-100 flex items-center space-x-2">
              <Mic className="w-6 h-6 text-cyan-400 animate-pulse" />
              <span>GOOGLE TTS MASTER VOICE & ADVANCED VOICE ACTING STUDIO</span>
            </h1>
            <p className="text-xs text-slate-300 font-sans">
              One permanent narrator voice identity across 60 professional acting, emotion, and delivery modes.
            </p>
          </div>

          {/* Master Voice Identity Quick Card */}
          <div className="flex items-center space-x-3 bg-[#01030a] p-2.5 rounded-lg border border-cyan-500/30">
            <div className="w-10 h-10 rounded bg-cyan-900/40 border border-cyan-400 flex items-center justify-center text-cyan-300 font-mono font-bold text-lg shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              {masterProfile.gender === 'female' ? '♀' : '♂'}
            </div>
            <div className="text-left space-y-0.5">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                CURRENT MASTER IDENTITY:
              </div>
              <div className="text-xs font-tech font-bold text-white flex items-center space-x-1">
                <span>{masterVoiceId}</span>
                <span className="text-amber-400 text-[10px]">({masterProfile.gender.toUpperCase()})</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Mode: <span className="text-cyan-300 font-bold">{masterProfile.mode.toUpperCase()}</span> • {masterProfile.intensity}% Intensity
              </div>
            </div>

            <button
              onClick={() => setShowConfigModal(true)}
              className="ml-2 p-2 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-1 cursor-pointer"
              title="Configure Google Cloud TTS Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">GCP KEY</span>
            </button>
          </div>
        </div>

        {/* VOICE CONSISTENCY VALIDATOR BANNER */}
        <div className="mt-3 pt-3 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-2">
            {consistencyReport.isConsistent ? (
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold">VOICE CONSISTENCY AUDIT: 100% OK</span>
                <span className="text-slate-400 text-[11px]">
                  (All {consistencyReport.totalSegmentsChecked} segments strictly match Master Voice '{masterVoiceId}')
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-rose-400 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-bold">
                  VOICE CONSISTENCY WARNING: {consistencyReport.mismatchedSegments.length} Segment(s) Mismatched
                </span>
              </div>
            )}
          </div>

          {!consistencyReport.isConsistent && (
            <button
              onClick={repairVoiceConsistency}
              className="px-3 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-500 text-rose-200 text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.3)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>1-CLICK REPAIR (Sync All to Master Voice)</span>
            </button>
          )}
        </div>
      </div>

      {/* MASTER VOICE CASTING SELECTOR */}
      <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners bg-[#020612] space-y-3">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
          <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300 uppercase">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Select Master Narrator Identity (Permanent Narrator for The Devil's Eye)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Rule: Changing Mode never changes this Voice Identity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* MALE MASTER OPTIONS */}
          <div className={`p-3 rounded-lg border transition-all ${
            masterProfile.gender === 'male' 
              ? 'bg-cyan-950/30 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
              : 'bg-[#030816] border-slate-800 opacity-70 hover:opacity-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-cyan-300">♂ MALE MASTER NARRATOR</span>
                {masterProfile.gender === 'male' && (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-200 font-mono text-[9px] font-bold">
                    ACTIVE MASTER
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSelectMasterVoice('male', 'hindi')}
                className={`w-full text-left p-2 rounded border text-xs cursor-pointer flex items-center justify-between ${
                  masterVoiceId === 'hi-IN-Neural2-B'
                    ? 'bg-cyan-900/40 border-cyan-400 text-white'
                    : 'bg-[#01040e] border-slate-700/60 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold font-tech">Aarav — Hindi Deep Baritone (hi-IN-Neural2-B)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Rich low-end authority, ideal for suspense, twists, and dramatic cinema.</div>
                </div>
                {masterVoiceId === 'hi-IN-Neural2-B' && <Check className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                onClick={() => handleSelectMasterVoice('male', 'englishIndia')}
                className={`w-full text-left p-2 rounded border text-xs cursor-pointer flex items-center justify-between ${
                  masterVoiceId === 'en-IN-Neural2-B'
                    ? 'bg-cyan-900/40 border-cyan-400 text-white'
                    : 'bg-[#01040e] border-slate-700/60 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold font-tech">Rohan — Indian English & Hinglish (en-IN-Neural2-B)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Natural bilingual pacing, crisp YouTube explainer cadence.</div>
                </div>
                {masterVoiceId === 'en-IN-Neural2-B' && <Check className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                onClick={() => handleSelectMasterVoice('male', 'usGlobal')}
                className={`w-full text-left p-2 rounded border text-xs cursor-pointer flex items-center justify-between ${
                  masterVoiceId === 'en-US-Journey-D'
                    ? 'bg-cyan-900/40 border-cyan-400 text-white'
                    : 'bg-[#01040e] border-slate-700/60 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold font-tech">Marcus — US Journey Deep Noir (en-US-Journey-D)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Hollywood theatrical trailer voiceover with intense low-end presence.</div>
                </div>
                {masterVoiceId === 'en-US-Journey-D' && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>
          </div>

          {/* FEMALE MASTER OPTIONS */}
          <div className={`p-3 rounded-lg border transition-all ${
            masterProfile.gender === 'female' 
              ? 'bg-fuchsia-950/30 border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.2)]' 
              : 'bg-[#030816] border-slate-800 opacity-70 hover:opacity-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-fuchsia-300">♀ FEMALE MASTER NARRATOR</span>
                {masterProfile.gender === 'female' && (
                  <span className="px-1.5 py-0.5 rounded bg-fuchsia-900 text-fuchsia-200 font-mono text-[9px] font-bold">
                    ACTIVE MASTER
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSelectMasterVoice('female', 'hindi')}
                className={`w-full text-left p-2 rounded border text-xs cursor-pointer flex items-center justify-between ${
                  masterVoiceId === 'hi-IN-Neural2-A'
                    ? 'bg-fuchsia-900/40 border-fuchsia-400 text-white'
                    : 'bg-[#01040e] border-slate-700/60 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold font-tech">Pooja — Hindi Cinema Narrative (hi-IN-Neural2-A)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Expressive, emotional Hindi delivery for high drama and mystery.</div>
                </div>
                {masterVoiceId === 'hi-IN-Neural2-A' && <Check className="w-4 h-4 text-fuchsia-400" />}
              </button>

              <button
                onClick={() => handleSelectMasterVoice('female', 'englishIndia')}
                className={`w-full text-left p-2 rounded border text-xs cursor-pointer flex items-center justify-between ${
                  masterVoiceId === 'en-IN-Neural2-A'
                    ? 'bg-fuchsia-900/40 border-fuchsia-400 text-white'
                    : 'bg-[#01040e] border-slate-700/60 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold font-tech">Tara — Indian English Documentary (en-IN-Neural2-A)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Authoritative, clear articulation, investigative documentary prestige.</div>
                </div>
                {masterVoiceId === 'en-IN-Neural2-A' && <Check className="w-4 h-4 text-fuchsia-400" />}
              </button>

              <button
                onClick={() => handleSelectMasterVoice('female', 'usGlobal')}
                className={`w-full text-left p-2 rounded border text-xs cursor-pointer flex items-center justify-between ${
                  masterVoiceId === 'en-US-Journey-F'
                    ? 'bg-fuchsia-900/40 border-fuchsia-400 text-white'
                    : 'bg-[#01040e] border-slate-700/60 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold font-tech">Evelyn — US Journey Cinema Epic (en-US-Journey-F)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Wide dynamic range, breathy intimacy, and commanding dramatic scale.</div>
                </div>
                {masterVoiceId === 'en-US-Journey-F' && <Check className="w-4 h-4 text-fuchsia-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE WAVEFORM & SAMPLE PREVIEW PLAYER */}
      <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners bg-[#020612] space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-tech font-bold text-cyan-200 uppercase">
              Live Voice Acting Waveform & Sound Stage
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-mono">
            <span className="text-slate-400">CURRENT MODE:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
              {masterProfile.mode.toUpperCase()} ({masterProfile.intensity}%)
            </span>
            <span className="text-slate-400">EMOTION:</span>
            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300 font-bold">
              {masterProfile.emotion.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Waveform Canvas */}
        <div className="relative w-full h-16 bg-[#01040d] rounded border border-cyan-500/20 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} width={900} height={64} className="w-full h-full" />
          {isPlaying && (
            <div className="absolute top-2 right-3 flex items-center space-x-1.5 text-xs font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>LIVE AUDIO PLAYBACK</span>
            </div>
          )}
          {currentSpokenWord && (
            <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400 text-xs font-mono text-cyan-200">
              Word: <span className="font-bold text-amber-300">"{currentSpokenWord}"</span>
            </div>
          )}
        </div>

        {/* Interactive Preview Text Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-tech text-slate-300 uppercase flex items-center justify-between">
            <span>Audition Script Line (Uses Master Voice: {masterVoiceId})</span>
            <span className="text-[10px] font-mono text-slate-400">
              {previewText.split(/\s+/).filter(Boolean).length} words
            </span>
          </label>
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            rows={2}
            className="w-full bg-[#010309] border border-cyan-500/30 rounded p-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-400 leading-relaxed"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <span>Rate: <strong className="text-cyan-300">{masterProfile.speakingRate}x</strong></span>
            <span>•</span>
            <span>Pitch: <strong className="text-cyan-300">{masterProfile.pitch > 0 ? `+${masterProfile.pitch}` : masterProfile.pitch}st</strong></span>
            <span>•</span>
            <span>Pause: <strong className="text-cyan-300">{masterProfile.sentencePauseMs}ms</strong></span>
            <span>•</span>
            <span>Language Mode: <strong className="text-amber-300">{masterProfile.safeLanguageMode}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSynthesizePreview()}
              disabled={isSynthesizing}
              className="px-4 py-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 font-tech font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>SYNTHESIZING...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>AUDITION MASTER VOICE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center space-x-1 border-b border-cyan-500/30 overflow-x-auto pb-1 text-xs font-tech font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('scriptmap')}
          className={`px-3 py-2 rounded-t flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'scriptmap'
              ? 'bg-cyan-950 border-t-2 border-cyan-400 text-cyan-200'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Script Voice Map ({segments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('modes')}
          className={`px-3 py-2 rounded-t flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'modes'
              ? 'bg-cyan-950 border-t-2 border-cyan-400 text-cyan-200'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Acting Modes (60)</span>
        </button>

        <button
          onClick={() => setActiveTab('mixer')}
          className={`px-3 py-2 rounded-t flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'mixer'
              ? 'bg-cyan-950 border-t-2 border-cyan-400 text-cyan-200'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Emotion & Delivery Mixer</span>
        </button>

        <button
          onClick={() => setActiveTab('direction')}
          className={`px-3 py-2 rounded-t flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'direction'
              ? 'bg-cyan-950 border-t-2 border-cyan-400 text-cyan-200'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Custom Voice Direction</span>
        </button>

        <button
          onClick={() => setActiveTab('abcompare')}
          className={`px-3 py-2 rounded-t flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'abcompare'
              ? 'bg-cyan-950 border-t-2 border-cyan-400 text-cyan-200'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span>A/B Take Comparator</span>
        </button>

        <button
          onClick={() => setActiveTab('cache')}
          className={`px-3 py-2 rounded-t flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'cache'
              ? 'bg-cyan-950 border-t-2 border-cyan-400 text-cyan-200'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Audio Cache & Costs</span>
        </button>

        <button
          onClick={() => setActiveTab('ssml')}
          className={`px-3 py-2 rounded-t flex items-center space-x-1.5 cursor-pointer transition-all ${
            activeTab === 'ssml'
              ? 'bg-cyan-950 border-t-2 border-cyan-400 text-cyan-200'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>SSML Markup Preview</span>
        </button>
      </div>

      {/* TAB 1: SCRIPT VOICE MAP */}
      {activeTab === 'scriptmap' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#020612] p-3 rounded-lg border border-cyan-500/20 text-xs">
            <div className="space-y-0.5">
              <span className="font-tech font-bold text-cyan-300 uppercase">
                Per-Segment Acting Mode Map & Narration Timeline
              </span>
              <p className="text-slate-400 text-[11px] font-sans">
                Every segment uses Master Voice <strong className="text-cyan-200">{masterVoiceId}</strong>. Each scene has its own calibrated acting mode and real measured audio duration.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBatchSynthesizeAll}
                className="px-3 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 text-emerald-200 font-tech font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>SYNTHESIZE ALL SEGMENTS</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {segments.map((seg, idx) => {
              const currentModeId = seg.voiceMode || masterProfile.mode;
              const currentIntensity = seg.voiceIntensity ?? masterProfile.intensity;
              const modeObj = getVoiceActingModeById(currentModeId);
              
              // Calculate or get AI recommendation
              const aiRec = getRecommendedModeForScene(seg.stage, seg.emotion, seg.stage === 'TWIST');
              const isAiAccepted = seg.voiceMode === aiRec.modeId;

              const wordsCount = seg.narration?.[0]?.text?.split(/\s+/).filter(Boolean).length || 0;
              const measuredDuration = seg.audioDurationSec || Math.round((wordsCount / 150) * 60);

              return (
                <div
                  key={seg.id || `seg-${idx}`}
                  className="bg-[#030816] border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg p-3.5 space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono border-b border-cyan-500/10 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">
                        STAGE {idx + 1}
                      </span>
                      <span className="text-white font-tech font-bold uppercase text-sm">
                        {seg.title}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        [{seg.stage || 'NARRATIVE'}]
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-cyan-400 flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>VOICE: {masterVoiceId}</span>
                      </span>

                      {seg.audioDurationSec ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                          ✓ REAL AUDIO: {seg.audioDurationSec}s
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          EST: {measuredDuration}s
                        </span>
                      )}

                      <button
                        onClick={() => handleSynthesizeSegment(seg, idx)}
                        className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-tech font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>SYNTHESIZE / LISTEN</span>
                      </button>
                    </div>
                  </div>

                  {/* Script Text */}
                  <div className="bg-[#01040f] p-2.5 rounded border border-cyan-500/10 text-xs font-sans text-slate-200 leading-relaxed">
                    <p className="line-clamp-2">{seg.narration?.[0]?.text || seg.visualNotes}</p>
                  </div>

                  {/* Mode Assignment & AI Recommendation Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                    {/* Acting Mode Selector */}
                    <div className="md:col-span-4 flex items-center space-x-2">
                      <span className="text-[10px] font-tech text-slate-400 uppercase">MODE:</span>
                      <select
                        value={currentModeId}
                        onChange={(e) => {
                          const updated = [...segments];
                          updated[idx] = { ...updated[idx], voiceMode: e.target.value };
                          updateCurrentProject({ script: { ...currentProject.script, segments: updated } });
                        }}
                        className="bg-[#02050e] border border-cyan-500/30 rounded p-1.5 text-xs text-cyan-200 font-tech font-bold focus:outline-none focus:border-cyan-400 w-full cursor-pointer"
                      >
                        {VOICE_ACTING_MODES.map(m => (
                          <option key={m.id} value={m.id}>
                            #{String(m.number).padStart(2, '0')} {m.name} ({m.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Intensity Slider */}
                    <div className="md:col-span-3 flex items-center space-x-2">
                      <span className="text-[10px] font-tech text-slate-400 uppercase">INTENSITY:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentIntensity}
                        onChange={(e) => {
                          const updated = [...segments];
                          updated[idx] = { ...updated[idx], voiceIntensity: Number(e.target.value) };
                          updateCurrentProject({ script: { ...currentProject.script, segments: updated } });
                        }}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-cyan-300 w-8 text-right">
                        {currentIntensity}%
                      </span>
                    </div>

                    {/* AI Recommendation Box */}
                    <div className="md:col-span-5 bg-[#02050f] p-1.5 rounded border border-amber-500/20 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="text-amber-200 font-tech font-bold uppercase truncate">
                          AI SUGGESTS: {aiRec.modeId.toUpperCase()} ({aiRec.intensity}%)
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {!isAiAccepted ? (
                          <button
                            onClick={() => {
                              const updated = [...segments];
                              updated[idx] = {
                                ...updated[idx],
                                voiceMode: aiRec.modeId,
                                voiceIntensity: aiRec.intensity
                              };
                              updateCurrentProject({ script: { ...currentProject.script, segments: updated } });
                              addToast('AI Mode Accepted', `Applied ${aiRec.modeId.toUpperCase()} to Segment ${idx + 1}.`, 'info');
                            }}
                            className="px-2 py-0.5 rounded bg-amber-950 border border-amber-400 text-amber-200 text-[10px] font-bold cursor-pointer"
                          >
                            ACCEPT
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-[10px] font-bold flex items-center space-x-0.5">
                            <Check className="w-3 h-3" />
                            <span>ACCEPTED</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ACTING MODES (60) */}
      {activeTab === 'modes' && (
        <div className="space-y-3">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#020612] p-3 rounded-lg border border-cyan-500/20">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={modeSearch}
                onChange={(e) => setModeSearch(e.target.value)}
                placeholder="Search 60 acting modes (e.g., Cinematic, Horror, Twist Reveal, 18+)..."
                className="w-full bg-[#01040f] border border-cyan-500/30 rounded pl-9 pr-3 py-1.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto text-[10px] font-tech font-bold uppercase">
              {['ALL', 'Cinematic & Trailer', 'Atmospheric & Thriller', 'Emotional & Human', 'Fast & High-Energy', 'Documentary & News', 'Climax & Twist', 'Mature & Adult'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-950 border border-cyan-400 text-cyan-200'
                      : 'bg-[#01040f] text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 60 Modes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[calc(100vh-23rem)] overflow-y-auto pr-1">
            {filteredActingModes.map(m => {
              const isCurrent = masterProfile.mode === m.id;

              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-lg border transition-all space-y-2 flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'bg-[#030816] border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-400 font-bold text-xs">
                        #{String(m.number).padStart(2, '0')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#01040f] border border-cyan-500/20 text-slate-400 font-tech text-[9px] uppercase">
                        {m.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-tech font-bold text-white tracking-wide flex items-center space-x-1.5">
                      <span>{m.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </h3>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-2">
                      {m.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-cyan-500/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Rate: {m.defaultRate}x</span>
                      <span>Intensity: {m.defaultIntensity}%</span>
                      <span>Pause: {m.pauseSentenceMs}ms</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSelectActingMode(m.id)}
                        className={`flex-1 py-1 rounded text-xs font-tech font-bold uppercase cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-cyan-900 border border-cyan-400 text-cyan-100'
                            : 'bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300'
                        }`}
                      >
                        {isCurrent ? 'ACTIVE MODE' : 'SELECT MODE'}
                      </button>

                      <button
                        onClick={() => handleSynthesizePreview(m.id, m.defaultIntensity)}
                        className="px-2.5 py-1 rounded bg-[#01040f] hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-1 cursor-pointer"
                        title="Audition this mode with Master Voice"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>AUDITION</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: EMOTION & DELIVERY MIXER */}
      {activeTab === 'mixer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* EMOTION MIXER PANEL */}
          <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners bg-[#020612] space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300 uppercase">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Emotion Mixer & Dynamics</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Voice: {masterVoiceId}</span>
            </div>

            {/* Primary Emotion Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-tech text-slate-300 uppercase">
                Primary Emotion Profile
              </label>
              <select
                value={masterProfile.emotion}
                onChange={(e) => updateMasterNarratorProfile({ emotion: e.target.value as any })}
                className="w-full bg-[#01040f] border border-cyan-500/30 rounded p-2 text-xs text-cyan-200 font-tech font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {[
                  'Neutral', 'Dramatic', 'Suspense', 'Mysterious', 'Fear', 'Angry', 
                  'Happy', 'Sad', 'Romantic', 'Confidence', 'Serious', 'Excitement', 
                  'Surprise', 'Humorous'
                ].map(em => (
                  <option key={em} value={em}>{em.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* 4 Dynamic Sliders */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Overall Intensity:</span>
                  <span className="text-cyan-300 font-bold">{masterProfile.intensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterProfile.intensity}
                  onChange={(e) => updateMasterNarratorProfile({ intensity: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Energy Level:</span>
                  <span className="text-cyan-300 font-bold">{masterProfile.energy}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterProfile.energy}
                  onChange={(e) => updateMasterNarratorProfile({ energy: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Dramatic Level:</span>
                  <span className="text-cyan-300 font-bold">{masterProfile.dramaticLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterProfile.dramaticLevel}
                  onChange={(e) => updateMasterNarratorProfile({ dramaticLevel: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Suspense Level:</span>
                  <span className="text-cyan-300 font-bold">{masterProfile.suspenseLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterProfile.suspenseLevel}
                  onChange={(e) => updateMasterNarratorProfile({ suspenseLevel: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* DELIVERY CONTROLS PANEL */}
          <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners bg-[#020612] space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300 uppercase">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Pacing, Prosody & Pauses</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SSML Compliant</span>
            </div>

            <div className="space-y-3">
              {/* Speaking Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Speaking Rate:</span>
                  <span className="text-cyan-300 font-bold">{masterProfile.speakingRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={masterProfile.speakingRate}
                  onChange={(e) => updateMasterNarratorProfile({ speakingRate: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Pitch */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Pitch (Semitones):</span>
                  <span className="text-cyan-300 font-bold">
                    {masterProfile.pitch > 0 ? `+${masterProfile.pitch}` : masterProfile.pitch} st
                  </span>
                </div>
                <input
                  type="range"
                  min="-10.0"
                  max="10.0"
                  step="0.5"
                  value={masterProfile.pitch}
                  onChange={(e) => updateMasterNarratorProfile({ pitch: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Sentence Pause */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Sentence Break Pause:</span>
                  <span className="text-cyan-300 font-bold">{masterProfile.sentencePauseMs} ms</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1000"
                  step="25"
                  value={masterProfile.sentencePauseMs}
                  onChange={(e) => updateMasterNarratorProfile({ sentencePauseMs: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Safe Language / Profanity / 18+ Mode */}
              <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                <label className="text-xs font-tech text-amber-300 uppercase flex items-center justify-between">
                  <span>Language Policy & Adult Delivery</span>
                  <span className="text-[10px] font-mono text-slate-400">Controls Style Only</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                  {(['SAFE LANGUAGE', 'NORMAL', 'STRONG LANGUAGE', 'MATURE'] as const).map(modeVal => (
                    <button
                      key={modeVal}
                      onClick={() => updateMasterNarratorProfile({ safeLanguageMode: modeVal })}
                      className={`p-2 rounded text-[10px] font-tech font-bold uppercase cursor-pointer border transition-all ${
                        masterProfile.safeLanguageMode === modeVal
                          ? 'bg-amber-950 border-amber-400 text-amber-200'
                          : 'bg-[#01040f] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {modeVal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOM VOICE DIRECTION */}
      {activeTab === 'direction' && (
        <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners bg-[#020612] space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300 uppercase">
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <span>Natural Language Custom Voice Direction</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Gemini & Google Cloud TTS</span>
          </div>

          <p className="text-xs text-slate-300 font-sans">
            Give free-form acting instructions to shape pacing, emotional arcs, and tone shifts across the narration performance:
          </p>

          <div className="space-y-2">
            <textarea
              value={customDirectionInput}
              onChange={(e) => setCustomDirectionInput(e.target.value)}
              placeholder="e.g. Deliver the first sentence quietly, build suspense in the middle, and make the ending shocking."
              rows={3}
              className="w-full bg-[#01040f] border border-cyan-500/30 rounded p-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-400 leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!customDirectionInput.trim()) return;
                  updateMasterNarratorProfile({ styleInstructions: customDirectionInput.trim() });
                  playHudSuccess();
                  addToast('Voice Direction Stored', 'Custom acting instructions attached to Master Voice profile.', 'success');
                }}
                className="px-4 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 font-tech font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>APPLY DIRECTION TO MASTER VOICE</span>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-cyan-500/20 space-y-2">
            <div className="text-xs font-tech text-cyan-300 uppercase">
              Cinema Acting Direction Presets
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={() => applyDirectionPreset(
                  'Whisper to Scream',
                  'Start in an intimate forensic whisper, gradually build vocal pressure, and peak with urgent intensity on the final reveal.',
                  'whisper',
                  80
                )}
                className="text-left p-2.5 rounded bg-[#01040f] border border-cyan-500/20 hover:border-cyan-400 text-xs space-y-1 cursor-pointer"
              >
                <div className="font-bold font-tech text-cyan-300">1. Whisper to Scream</div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Gradual crescendo from quiet intimacy to thunderous climax.</p>
              </button>

              <button
                onClick={() => applyDirectionPreset(
                  'Sarcastic Buildup',
                  'Deliver with dry ironic smirk, long deadpan pauses before keywords, and sharp comedic punch.',
                  'sarcastic',
                  70
                )}
                className="text-left p-2.5 rounded bg-[#01040f] border border-cyan-500/20 hover:border-cyan-400 text-xs space-y-1 cursor-pointer"
              >
                <div className="font-bold font-tech text-cyan-300">2. Sarcastic Buildup</div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Deadpan cadence with razor-sharp satirical timing.</p>
              </button>

              <button
                onClick={() => applyDirectionPreset(
                  'Ticking Clock Tension',
                  'Accelerating speech tempo, taut breath pauses, high stakes adrenaline urgency.',
                  'thriller',
                  90
                )}
                className="text-left p-2.5 rounded bg-[#01040f] border border-cyan-500/20 hover:border-cyan-400 text-xs space-y-1 cursor-pointer"
              >
                <div className="font-bold font-tech text-cyan-300">3. Ticking Clock Tension</div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Urgent forward momentum where every second feels fatal.</p>
              </button>

              <button
                onClick={() => applyDirectionPreset(
                  'Tragic Break',
                  'Slower cadence, heavy emotional weight on character names, sorrowful lingering pauses.',
                  'sad',
                  75
                )}
                className="text-left p-2.5 rounded bg-[#01040f] border border-cyan-500/20 hover:border-cyan-400 text-xs space-y-1 cursor-pointer"
              >
                <div className="font-bold font-tech text-cyan-300">4. Tragic Break</div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Heartbreaking melancholy and tragic human resonance.</p>
              </button>

              <button
                onClick={() => applyDirectionPreset(
                  'Noir Confession',
                  'Low raspy baritone, world-weary cynicism, rhythmic pauses like rain hitting venetian blinds.',
                  'crime',
                  80
                )}
                className="text-left p-2.5 rounded bg-[#01040f] border border-cyan-500/20 hover:border-cyan-400 text-xs space-y-1 cursor-pointer"
              >
                <div className="font-bold font-tech text-cyan-300">5. Noir Confession</div>
                <p className="text-[10px] text-slate-400 line-clamp-2">Hardboiled criminal realism and smoky underworld atmosphere.</p>
              </button>

              <button
                onClick={() => applyDirectionPreset(
                  'Mind-Bending Reality Inversion',
                  'Agonizing silence before the twist, breathless delivery of the paradox, monumental final revelation.',
                  'twist_reveal',
                  95
                )}
                className="text-left p-2.5 rounded bg-[#01040f] border border-cyan-500/20 hover:border-cyan-400 text-xs space-y-1 cursor-pointer"
              >
                <div className="font-bold font-tech text-cyan-300">6. Twist Inversion</div>
                <p className="text-[10px] text-slate-400 line-clamp-2">The ultimate cinematic plot twist execution.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: A/B TAKE COMPARATOR */}
      {activeTab === 'abcompare' && (
        <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners bg-[#020612] space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300 uppercase">
              <SplitSquareVertical className="w-4 h-4 text-cyan-400" />
              <span>A/B Take Comparator (Same Master Voice, Different Acting Modes)</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Master Voice: {masterVoiceId}</span>
          </div>

          <p className="text-xs text-slate-300 font-sans">
            Verify performance variance side-by-side. Both takes strictly utilize the same narrator voice identity to guarantee sonic consistency across your movie.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TAKE A */}
            <div className="bg-[#01040f] p-3.5 rounded-lg border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-tech font-bold text-cyan-300 uppercase">TAKE A</span>
                <span className="text-[10px] font-mono text-slate-400">{masterVoiceId}</span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-tech text-slate-400 uppercase">Mode:</label>
                  <select
                    value={takeAMode}
                    onChange={(e) => setTakeAMode(e.target.value)}
                    className="w-full bg-[#020612] border border-cyan-500/30 rounded p-1.5 text-xs text-cyan-200 font-tech font-bold cursor-pointer"
                  >
                    {VOICE_ACTING_MODES.map(m => (
                      <option key={m.id} value={m.id}>#{m.number} {m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Intensity:</span>
                    <span className="text-cyan-300">{takeAIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={takeAIntensity}
                    onChange={(e) => setTakeAIntensity(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => handleRunABComparison('A')}
                  className="w-full py-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 font-tech font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>AUDITION TAKE A</span>
                </button>

                {takeAResult && (
                  <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20 text-[10px] font-mono text-slate-300">
                    Duration: {takeAResult.durationSec}s • {takeAResult.source}
                  </div>
                )}
              </div>
            </div>

            {/* TAKE B */}
            <div className="bg-[#01040f] p-3.5 rounded-lg border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-tech font-bold text-fuchsia-300 uppercase">TAKE B</span>
                <span className="text-[10px] font-mono text-slate-400">{masterVoiceId}</span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-tech text-slate-400 uppercase">Mode:</label>
                  <select
                    value={takeBMode}
                    onChange={(e) => setTakeBMode(e.target.value)}
                    className="w-full bg-[#020612] border border-fuchsia-500/30 rounded p-1.5 text-xs text-fuchsia-200 font-tech font-bold cursor-pointer"
                  >
                    {VOICE_ACTING_MODES.map(m => (
                      <option key={m.id} value={m.id}>#{m.number} {m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Intensity:</span>
                    <span className="text-fuchsia-300">{takeBIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={takeBIntensity}
                    onChange={(e) => setTakeBIntensity(Number(e.target.value))}
                    className="w-full accent-fuchsia-400 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => handleRunABComparison('B')}
                  className="w-full py-2 rounded bg-fuchsia-950 hover:bg-fuchsia-900 border border-fuchsia-400 text-fuchsia-200 font-tech font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>AUDITION TAKE B</span>
                </button>

                {takeBResult && (
                  <div className="p-2 rounded bg-fuchsia-950/40 border border-fuchsia-500/20 text-[10px] font-mono text-slate-300">
                    Duration: {takeBResult.durationSec}s • {takeBResult.source}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIO CACHE & COST PROTECTION */}
      {activeTab === 'cache' && (
        <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners bg-[#020612] space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300 uppercase">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>In-Memory Audio Cache & Cost Protection</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">ZERO DUPLICATE BILLING</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#01040f] p-3 rounded border border-cyan-500/20 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Cached Takes in Memory</div>
              <div className="text-xl font-tech font-bold text-cyan-300">{getCachedAudioTakes().length}</div>
            </div>
            <div className="bg-[#01040f] p-3 rounded border border-cyan-500/20 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated API Cost Saved</div>
              <div className="text-xl font-tech font-bold text-emerald-300">
                ${(getCachedAudioTakes().length * 0.016).toFixed(3)} USD
              </div>
            </div>
            <div className="bg-[#01040f] p-3 rounded border border-cyan-500/20 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Auto-Run Protection</div>
              <div className="text-sm font-tech font-bold text-amber-300">ENFORCED (Manual Click Only)</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-tech text-cyan-300 uppercase">Cached Performances</div>
            {getCachedAudioTakes().length === 0 ? (
              <p className="text-xs text-slate-400 italic">No audio takes cached yet. Generate or audition lines to populate cache.</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {getCachedAudioTakes().map((c, i) => (
                  <div key={i} className="p-2 rounded bg-[#01040f] border border-cyan-500/10 text-xs font-mono flex items-center justify-between">
                    <span className="text-slate-200 truncate max-w-md">"{c.text.slice(0, 50)}..."</span>
                    <span className="text-cyan-300 font-bold">{c.mode.toUpperCase()} ({c.durationSec}s)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: SSML PREVIEW */}
      {activeTab === 'ssml' && (
        <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners bg-[#020612] space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center space-x-2 text-xs font-tech font-bold text-cyan-300 uppercase">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>Compiled W3C SSML 1.1 Prosody Preview</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Google Cloud TTS Standard</span>
          </div>

          <div className="bg-[#01040d] p-3 rounded border border-cyan-500/20 text-xs font-mono text-cyan-200 whitespace-pre overflow-x-auto">
            {compileActingModeSsml(
              previewText,
              masterProfile.mode,
              masterProfile.intensity,
              masterProfile.speakingRate,
              masterProfile.pitch,
              masterProfile.sentencePauseMs,
              masterProfile.paragraphPauseMs,
              masterProfile.safeLanguageMode
            ).ssml}
          </div>
        </div>
      )}

      {/* GCP CONFIG MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="hud-panel w-full max-w-lg rounded-lg border border-cyan-500/50 p-5 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.3)] bg-[#020612]">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-tech font-bold text-cyan-100 uppercase">
                  Google Cloud Text-to-Speech API Key
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Google Cloud Text-to-Speech API key enables generation of high-definition MP3 files with Neural2 and Journey voice models.
            </p>

            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded p-3 text-xs text-emerald-200 space-y-1">
              <div className="font-bold font-tech flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Configuration Web Speech Guarantee:</span>
              </div>
              <p className="text-[11px] font-sans text-emerald-100/90 leading-relaxed">
                If no API key is provided, the system seamlessly plays genuine real-time audio through your browser's Web Speech engine. It never outputs fake success or silence.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-tech text-cyan-300 uppercase">
                GCP Text-to-Speech API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#01040f] border border-cyan-500/30 rounded p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-3 py-1.5 rounded border border-slate-700 text-xs font-tech text-slate-400 hover:text-white cursor-pointer"
              >
                CANCEL
              </button>

              <button
                onClick={() => {
                  updateCurrentProject({
                    voiceSettings: {
                      ...voiceSettings,
                      gcpApiKey: apiKeyInput.trim(),
                      gcpConfigured: Boolean(apiKeyInput.trim())
                    }
                  });
                  setShowConfigModal(false);
                  playHudSuccess();
                  addToast('Configuration Saved', 'Google Cloud Text-to-Speech settings updated.', 'success');
                }}
                className="px-4 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-xs font-tech text-cyan-200 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              >
                SAVE KEY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
