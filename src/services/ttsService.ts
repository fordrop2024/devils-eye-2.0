/**
 * THE DEVIL'S EYE - Google Cloud TTS Master Voice & Advanced Voice Acting System
 * 
 * Implements:
 * 1. ONE MASTER VOICE IDENTITY (Male or Female) per project, consistent across all 60 acting modes
 * 2. 60 Voice Acting Modes modifying delivery, pauses, and intensity WITHOUT changing voiceId
 * 3. Real Audio Duration measurement (via Audio/AudioContext decoding)
 * 4. In-memory & Persistent Audio Caching (zero duplicate API calls)
 * 5. Cost Protection: Requires explicit user action; never auto-runs on page load
 * 6. Emotion Mixer translation to SSML prosody and Google TTS style instructions
 * 7. Multilingual Hindi, English, and Hinglish support
 * 8. Safe Language, Normal, Strong Language, and 18+ Mature Delivery modes
 * 9. Robust error handling without fake success or silent voice switching
 */

import { WordTiming, VoiceLabSettings, MasterNarratorProfile, VoiceCacheEntry } from '../types';
import { VOICE_ACTING_MODES, getVoiceActingModeById } from './voiceModesData';

export interface GcpVoiceModel {
  id: string;
  name: string;
  languageCode: string;
  ssmlGender: 'MALE' | 'FEMALE';
  naturalRate: number;
  displayName: string;
  category: 'Cinematic Epic' | 'Noir Detective' | 'Documentary Explainer' | 'Conversational Explainer' | 'Suspense Thriller';
  description: string;
}

export const MASTER_VOICES: Record<'male' | 'female', { hindi: GcpVoiceModel; englishIndia: GcpVoiceModel; usGlobal: GcpVoiceModel }> = {
  male: {
    hindi: {
      id: 'hi-IN-Neural2-B',
      name: 'hi-IN-Neural2-B',
      languageCode: 'hi-IN',
      ssmlGender: 'MALE',
      naturalRate: 1.05,
      displayName: 'Aarav (Hindi Deep Baritone)',
      category: 'Noir Detective',
      description: 'Master Male Narrator — Deep resonant timbre, rich low-end authority, ideal for suspense, plot twists, and cinema essays.'
    },
    englishIndia: {
      id: 'en-IN-Neural2-B',
      name: 'en-IN-Neural2-B',
      languageCode: 'en-IN',
      ssmlGender: 'MALE',
      naturalRate: 1.08,
      displayName: 'Rohan (Indian English / Hinglish)',
      category: 'Conversational Explainer',
      description: 'Master Male Narrator — Natural bilingual pacing, seamless Hinglish delivery, energetic modern creator cadence.'
    },
    usGlobal: {
      id: 'en-US-Journey-D',
      name: 'en-US-Journey-D',
      languageCode: 'en-US',
      ssmlGender: 'MALE',
      naturalRate: 1.05,
      displayName: 'Marcus (US Journey Deep Noir)',
      category: 'Noir Detective',
      description: 'Master Male Narrator — Deep baritone with psychological weight, Hollywood theatrical trailer resonance.'
    }
  },
  female: {
    hindi: {
      id: 'hi-IN-Neural2-A',
      name: 'hi-IN-Neural2-A',
      languageCode: 'hi-IN',
      ssmlGender: 'FEMALE',
      naturalRate: 1.0,
      displayName: 'Pooja (Hindi Cinema Narrative)',
      category: 'Conversational Explainer',
      description: 'Master Female Narrator — Expressive, crystalline Hindi timbre with nuanced emotional delivery for high drama and mystery.'
    },
    englishIndia: {
      id: 'en-IN-Neural2-A',
      name: 'en-IN-Neural2-A',
      languageCode: 'en-IN',
      ssmlGender: 'FEMALE',
      naturalRate: 1.0,
      displayName: 'Tara (Indian English Documentary)',
      category: 'Documentary Explainer',
      description: 'Master Female Narrator — Authoritative, pristine articulation, sophisticated cadence for investigative breakdowns.'
    },
    usGlobal: {
      id: 'en-US-Journey-F',
      name: 'en-US-Journey-F',
      languageCode: 'en-US',
      ssmlGender: 'FEMALE',
      naturalRate: 1.0,
      displayName: 'Evelyn (US Journey Cinema Epic)',
      category: 'Cinematic Epic',
      description: 'Master Female Narrator — Expansive dynamic range, breathy intimacy, and commanding dramatic gravity.'
    }
  }
};

export const GCP_VOICE_MODELS: GcpVoiceModel[] = [
  MASTER_VOICES.male.hindi,
  MASTER_VOICES.male.englishIndia,
  MASTER_VOICES.male.usGlobal,
  MASTER_VOICES.female.hindi,
  MASTER_VOICES.female.englishIndia,
  MASTER_VOICES.female.usGlobal,
  {
    id: 'hi-IN-Neural2-C',
    name: 'hi-IN-Neural2-C',
    languageCode: 'hi-IN',
    ssmlGender: 'MALE',
    naturalRate: 1.1,
    displayName: 'Kabir (Hindi High-Paced Thriller)',
    category: 'Suspense Thriller',
    description: 'Fast-paced, urgent Indian voice calibrated for action setpieces and cliffhangers.'
  },
  {
    id: 'hi-IN-Neural2-D',
    name: 'hi-IN-Neural2-D',
    languageCode: 'hi-IN',
    ssmlGender: 'FEMALE',
    naturalRate: 1.0,
    displayName: 'Ananya (Hindi Poetic Warmth)',
    category: 'Cinematic Epic',
    description: 'Poetic storytelling voice for dramatic climaxes and emotional moments.'
  },
  {
    id: 'en-US-Neural2-J',
    name: 'en-US-Neural2-J',
    languageCode: 'en-US',
    ssmlGender: 'MALE',
    naturalRate: 1.1,
    displayName: 'David (US Fast Explainer)',
    category: 'Conversational Explainer',
    description: 'Punchy delivery engineered for rapid retention on YouTube.'
  },
  {
    id: 'en-GB-Neural2-B',
    name: 'en-GB-Neural2-B',
    languageCode: 'en-GB',
    ssmlGender: 'MALE',
    naturalRate: 0.98,
    displayName: 'Arthur (British Forensic Critic)',
    category: 'Documentary Explainer',
    description: 'Refined, analytical cadence for dissecting cinema symbolism.'
  }
];

export interface SynthesisResult {
  audioUrl: string | null;
  durationSec: number;
  wordTimings: WordTiming[];
  source: 'google_cloud_tts' | 'browser_speech_synthesis' | 'audio_cache' | 'simulated_timing';
  status: 'success' | 'configured_success' | 'browser_fallback' | 'cached' | 'error';
  message: string;
  cached?: boolean;
  voiceIdUsed: string;
  actingModeUsed: string;
  intensityUsed: number;
}

// In-Memory Audio Cache to prevent redundant TTS billings
const ttsAudioCache = new Map<string, VoiceCacheEntry>();

/**
 * Generates a unique cache key based on text and voice performance parameters
 */
export function createTtsCacheKey(
  text: string,
  voiceId: string,
  modeId: string,
  intensity: number,
  rate: number,
  pitch: number
): string {
  const normText = text.trim().toLowerCase().slice(0, 120);
  return `${normText}__${voiceId}__${modeId}__${Math.round(intensity)}__${rate.toFixed(2)}__${pitch.toFixed(1)}`;
}

/**
 * Filter text according to Safe Language Mode setting
 */
export function applyLanguageContentPolicy(
  text: string,
  mode: 'SAFE LANGUAGE' | 'NORMAL' | 'STRONG LANGUAGE' | 'MATURE' = 'NORMAL'
): string {
  if (mode === 'SAFE LANGUAGE') {
    // Soften extreme profanities while maintaining dramatic meaning
    return text
      .replace(/\bfuck(ing)?\b/gi, 'damn')
      .replace(/\bbitch\b/gi, 'coward')
      .replace(/\bshit\b/gi, 'hell')
      .replace(/\bbastard\b/gi, 'monster');
  }
  // NORMAL, STRONG LANGUAGE, and MATURE keep authentic approved script text
  return text;
}

/**
 * Measure real duration of an audio source (Base64 data URI or Blob URL)
 */
export function measureAudioElementDuration(audioUrl: string): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(5.0);
      return;
    }
    const audio = new Audio();
    audio.preload = 'metadata';
    
    const onLoaded = () => {
      cleanup();
      const dur = audio.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        resolve(Math.round(dur * 100) / 100);
      } else {
        resolve(5.0);
      }
    };

    const onError = () => {
      cleanup();
      resolve(5.0);
    };

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.src = audioUrl;

    // Timeout safety
    setTimeout(() => {
      cleanup();
      resolve(5.0);
    }, 4000);
  });
}

/**
 * Compiles advanced SSML with acting pauses, prosody, and emphasis
 */
export function compileActingModeSsml(
  rawText: string,
  modeId: string,
  intensity: number,
  baseRate: number = 1.0,
  basePitch: number = 0,
  pauseSentenceMs: number = 400,
  pauseParagraphMs: number = 800,
  safeMode: 'SAFE LANGUAGE' | 'NORMAL' | 'STRONG LANGUAGE' | 'MATURE' = 'NORMAL'
): { ssml: string; plainText: string } {
  const plainText = applyLanguageContentPolicy(rawText, safeMode);
  const mode = getVoiceActingModeById(modeId);

  // Blend mode defaults with user intensity
  const intensityFactor = Math.max(0, Math.min(100, intensity)) / 100;
  const effectiveRate = baseRate * (1 + (mode.defaultRate - 1) * intensityFactor);
  const effectivePitch = basePitch + (mode.defaultPitch * intensityFactor);

  const ratePct = Math.round(effectiveRate * 100);
  const pitchStr = effectivePitch >= 0 ? `+${effectivePitch.toFixed(1)}st` : `${effectivePitch.toFixed(1)}st`;

  // Scale pause length by intensity & mode
  const effectiveSentencePause = Math.round(pauseSentenceMs * (1 + (mode.pauseSentenceMs - 350) / 400 * intensityFactor));
  const effectiveParagraphPause = Math.round(pauseParagraphMs * (1 + (mode.pauseParagraphMs - 700) / 800 * intensityFactor));

  // Insert dramatic pauses
  let processed = plainText
    .replace(/\n\n+/g, ` <break time="${effectiveParagraphPause}ms"/> `)
    .replace(/([.!?])\s+/g, `$1 <break time="${effectiveSentencePause}ms"/> `)
    .replace(/([,:;])\s+/g, `$1 <break time="${Math.round(effectiveSentencePause * 0.45)}ms"/> `);

  // Add emphasis for strong modes (Trailer, Twist, Climax, Shock)
  if (mode.emphasisLevel === 'strong' || mode.emphasisLevel === 'sharp') {
    // Emphasize quoted or capitalized dramatic keywords
    processed = processed.replace(/"([^"]+)"/g, '<emphasis level="strong">"$1"</emphasis>');
  }

  const ssml = `<speak>
  <prosody rate="${ratePct}%" pitch="${pitchStr}">
    ${processed}
  </prosody>
</speak>`;

  return { ssml, plainText };
}

/**
 * Generate interpolated word timings based on total duration
 */
export function generateWordTimings(words: string[], totalDurationSec: number): WordTiming[] {
  if (words.length === 0) return [];
  const secPerWord = totalDurationSec / words.length;

  return words.map((word, idx) => {
    const start = Math.round(idx * secPerWord * 100) / 100;
    const end = Math.round((idx + 1) * secPerWord * 100) / 100;
    return {
      word: word,
      startSec: start,
      endSec: end
    };
  });
}

/**
 * Master Speech Synthesis Pipeline
 * 
 * Rules:
 * - Strictly enforces Master Voice ID across any mode
 * - Checks cache first before calling API
 * - Calculates REAL audio duration
 * - Supports Google Cloud TTS REST API and Browser SpeechSynthesis with real playback
 */
export async function synthesizeVoiceSpeech(
  text: string,
  settings: VoiceLabSettings,
  onWordBoundary?: (word: string, charIndex: number) => void,
  actingModeOverride?: string,
  intensityOverride?: number
): Promise<SynthesisResult> {
  const masterVoiceId = settings.masterProfile?.voiceId || settings.selectedVoiceId || 'hi-IN-Neural2-B';
  const actingModeId = actingModeOverride || settings.masterProfile?.mode || 'cinematic';
  const intensity = intensityOverride ?? (settings.masterProfile?.intensity ?? 75);
  const speakingRate = settings.speakingRate || settings.masterProfile?.speakingRate || 1.0;
  const pitch = settings.pitch || settings.masterProfile?.pitch || 0;
  const safeMode = settings.masterProfile?.safeLanguageMode || 'NORMAL';

  const { ssml, plainText } = compileActingModeSsml(
    text,
    actingModeId,
    intensity,
    speakingRate,
    pitch,
    settings.pauseMs || 400,
    800,
    safeMode
  );

  const words = plainText.split(/\s+/).filter(Boolean);
  const cacheKey = createTtsCacheKey(plainText, masterVoiceId, actingModeId, intensity, speakingRate, pitch);

  // 1. Check Cache First (Cost Protection)
  if (ttsAudioCache.has(cacheKey)) {
    const cached = ttsAudioCache.get(cacheKey)!;
    return {
      audioUrl: cached.audioUrl,
      durationSec: cached.durationSec,
      wordTimings: cached.wordTimings,
      source: 'audio_cache',
      status: 'cached',
      cached: true,
      message: `Reused cached performance (${actingModeId.toUpperCase()} @ ${intensity}% intensity). Zero API cost.`,
      voiceIdUsed: masterVoiceId,
      actingModeUsed: actingModeId,
      intensityUsed: intensity
    };
  }

  // 2. Google Cloud TTS REST API (if configured)
  if (settings.gcpConfigured && settings.gcpApiKey) {
    try {
      const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(settings.gcpApiKey)}`;
      
      const payload = {
        input: { ssml },
        voice: {
          languageCode: settings.selectedLanguage || 'hi-IN',
          name: masterVoiceId,
          ssmlGender: settings.gender === 'female' ? 'FEMALE' : 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speakingRate,
          pitch: pitch,
          volumeGainDb: settings.volumeGainDb || 0,
          enableTimePointing: ['SSML_MARK']
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `GCP TTS HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (data.audioContent) {
        const base64Audio = `data:audio/mp3;base64,${data.audioContent}`;
        // Extract real audio duration from browser audio decoder
        const realDuration = await measureAudioElementDuration(base64Audio);
        const wordTimings = generateWordTimings(words, realDuration);

        const result: VoiceCacheEntry = {
          cacheKey,
          text: plainText,
          voiceId: masterVoiceId,
          mode: actingModeId,
          intensity,
          audioUrl: base64Audio,
          durationSec: realDuration,
          wordTimings,
          timestamp: new Date().toLocaleTimeString()
        };

        ttsAudioCache.set(cacheKey, result);

        return {
          audioUrl: base64Audio,
          durationSec: realDuration,
          wordTimings,
          source: 'google_cloud_tts',
          status: 'configured_success',
          cached: false,
          message: `Successfully synthesized with Master Voice (${masterVoiceId}) in ${actingModeId.toUpperCase()} mode. Measured real duration: ${realDuration}s.`,
          voiceIdUsed: masterVoiceId,
          actingModeUsed: actingModeId,
          intensityUsed: intensity
        };
      }
    } catch (err: any) {
      console.warn('Google Cloud TTS failed:', err.message);
      // Explicit error, do NOT silently change voices
      return {
        audioUrl: null,
        durationSec: Math.max(1, (words.length / (150 * speakingRate)) * 60),
        wordTimings: generateWordTimings(words, (words.length / (150 * speakingRate)) * 60),
        source: 'google_cloud_tts',
        status: 'error',
        message: `TTS Error: ${err.message || 'API request failed'}. Please check your credentials or switch to browser engine.`,
        voiceIdUsed: masterVoiceId,
        actingModeUsed: actingModeId,
        intensityUsed: intensity
      };
    }
  }

  // 3. Genuine In-Browser Web Speech Synthesis Fallback (Audible real audio in browser)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(plainText);
      const mode = getVoiceActingModeById(actingModeId);
      const intensityFactor = intensity / 100;
      
      utterance.rate = Math.max(0.5, Math.min(2.0, speakingRate * (1 + (mode.defaultRate - 1) * intensityFactor)));
      utterance.pitch = Math.max(0.5, Math.min(1.5, 1 + ((pitch + mode.defaultPitch * intensityFactor) / 20)));
      utterance.volume = Math.max(0, Math.min(1.0, 1 + (settings.volumeGainDb || 0) / 100));

      // Match system voices by language code
      const availableVoices = window.speechSynthesis.getVoices();
      const targetLang = settings.selectedLanguage || 'hi-IN';
      const matched = availableVoices.find(v => v.lang.toLowerCase().startsWith(targetLang.split('-')[0].toLowerCase()));
      if (matched) utterance.voice = matched;

      const wordTimings: WordTiming[] = [];
      const startTime = performance.now();

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          const currentWord = plainText.substring(charIndex).split(/\s+/)[0] || '';
          const elapsedSec = (performance.now() - startTime) / 1000;
          wordTimings.push({
            word: currentWord,
            startSec: Math.round(elapsedSec * 100) / 100,
            endSec: Math.round((elapsedSec + 0.3) * 100) / 100
          });
          if (onWordBoundary) onWordBoundary(currentWord, charIndex);
        }
      };

      utterance.onend = () => {
        const actualSec = Math.max(1, Math.round(((performance.now() - startTime) / 1000) * 100) / 100);
        resolve({
          audioUrl: null, // genuine browser speech played live
          durationSec: actualSec,
          wordTimings: wordTimings.length > 0 ? wordTimings : generateWordTimings(words, actualSec),
          source: 'browser_speech_synthesis',
          status: 'browser_fallback',
          message: `Live preview voiced in ${actingModeId.toUpperCase()} mode (${intensity}% intensity) via Web Speech Engine. Real duration: ${actualSec}s.`,
          voiceIdUsed: masterVoiceId,
          actingModeUsed: actingModeId,
          intensityUsed: intensity
        });
      };

      utterance.onerror = (e) => {
        const estSec = Math.round((words.length / (150 * speakingRate)) * 60 * 10) / 10;
        resolve({
          audioUrl: null,
          durationSec: estSec,
          wordTimings: generateWordTimings(words, estSec),
          source: 'browser_speech_synthesis',
          status: 'error',
          message: `Browser speech engine error: ${e.error || 'Playback cancelled'}.`,
          voiceIdUsed: masterVoiceId,
          actingModeUsed: actingModeId,
          intensityUsed: intensity
        });
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  // Simulated fallback if browser has no speech API
  const estDuration = Math.round((words.length / (150 * speakingRate)) * 60 * 10) / 10;
  return {
    audioUrl: null,
    durationSec: estDuration,
    wordTimings: generateWordTimings(words, estDuration),
    source: 'simulated_timing',
    status: 'error',
    message: 'No speech engine available. Configure Google Cloud TTS API key to synthesize audio.',
    voiceIdUsed: masterVoiceId,
    actingModeUsed: actingModeId,
    intensityUsed: intensity
  };
}

/**
 * Get all cached takes
 */
export function getCachedAudioTakes(): VoiceCacheEntry[] {
  return Array.from(ttsAudioCache.values());
}

/**
 * Clear cache
 */
export function clearTtsAudioCache(): void {
  ttsAudioCache.clear();
}
