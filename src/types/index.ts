/**
 * THE DEVIL'S EYE - Core Type Definitions
 * Scalable Cinema AI and Video Editor Data Models
 */

export type ProjectType = 'movie' | 'web_series';
export type ProcessingStatus = 'idle' | 'ingesting' | 'ingested' | 'analyzing' | 'analyzed' | 'scripting' | 'cutting' | 'ready' | 'error';
export type AnalysisStatus = 'NOT ANALYZED' | 'ANALYZING' | 'ANALYSIS COMPLETE';

export type AnalysisPass = 
  | 'PASS A: MEDIA METADATA'
  | 'PASS B: FRAME / VISUAL ANALYSIS'
  | 'PASS C: AUDIO / SPEECH / TRANSCRIPT'
  | 'PASS D: SCENE DETECTION'
  | 'PASS E: CHARACTER DETECTION'
  | 'PASS F: EVENT EXTRACTION'
  | 'PASS G: STORY UNDERSTANDING'
  | 'PASS H: RELATIONSHIP / KNOWLEDGE GRAPH';

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'subtitle' | 'image' | 'transcript';
  size: string;
  duration: number; // in seconds
  url: string;
  resolution?: string;
  fps?: number;
  mimeType?: string;
  waveform?: number[];
  uploadedAt: string;
}

export interface MediaFileRecord {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'subtitle' | 'transcript';
  size: number;
  fileSizeFormatted: string;
  duration: number; // seconds
  durationFormatted: string;
  resolution: string;
  fps: number;
  audioTracksCount: number;
  audioCodec: string;
  subtitleTracksCount: number;
  subtitleTracks: string[];
  status: 'ready' | 'processing' | 'error';
  url: string;
  uploadedAt: string;
  episodeIndex?: number;
}

export interface CharacterRelationship {
  targetCharacterId: string;
  targetName: string;
  relationType: 'ally' | 'rival' | 'romantic' | 'mentor' | 'subconscious projection' | 'deceiver' | 'subordinate';
  description: string;
}

export interface Character {
  id: string;
  name: string;
  actor: string;
  aliases?: string[];
  role: 'protagonist' | 'antagonist' | 'supporting' | 'victim' | 'target';
  archetype: string;
  confidence: number; // 0 - 100
  avatar: string;
  screenTimeMinutes: number;
  description: string;
  keyQuote?: string;
  relationships?: CharacterRelationship[];
}

export interface Scene {
  id: string;
  sceneId?: string; // alias
  title?: string;
  description?: string;
  sceneNumber: number;
  timestampStart: string; // "01:14:32"
  timestampEnd: string;
  timeRange?: string;
  startTime?: string; // alias
  endTime?: string; // alias
  startSec: number;
  endSec: number;
  durationSec?: number;
  location: string;
  timeOfDay: 'day' | 'night' | 'twilight' | 'interior';
  characters: string[];
  charactersInScene?: string[];
  characterIds?: string[];
  keyEvent: string;
  twistScore: number; // 0 - 100
  suspenseScore: number; // 0 - 100
  emotionalScore: number; // 0 - 100
  cinematographyScore?: number; // 0 - 100
  emotionalTone?: string;
  actionScore?: number; // 0 - 100
  importanceScore?: number; // 0 - 100
  confidence: number;
  thumbnail: string;
  thumbnailUrl?: string;
  dialogueCount: number;
  dialogue?: string[];
  keyDialogue?: string;
  importantDialogue?: string[];
  visualSummary?: string;
  storyPurpose?: string;
  emotion?: string;
  candidateForExplainer?: boolean;
  isLocked?: boolean;
  isExcluded?: boolean;
  clues?: string[];
  foreshadowing?: string[];
  music?: string;
  ambientAudio?: string;
  sfx?: string[];
  tags: string[];
}

export interface ExcludedRange {
  id: string;
  label: string;
  start: string; // "00:00:00"
  end: string;   // "00:02:15"
  startSec: number;
  endSec: number;
}

export interface SourceRangeConfig {
  mode: 'AI AUTO' | 'AI + USER RANGE' | 'MANUAL' | 'LOCK RANGE' | 'EXCLUDE RANGE';
  startTime: string; // "00:00:00"
  endTime: string;   // "02:28:00"
  startSec: number;
  endSec: number;
  isLocked: boolean;
  excludedRanges: ExcludedRange[];
}

export interface KeyEvent {
  id: string;
  timestamp: string;
  timeSec: number;
  title: string;
  description: string;
  importance: number; // 0 - 100
  sceneId: string;
  impact: string;
  act: 'Beginning' | 'Middle' | 'Climax' | 'Ending';
}

export interface TwistPoint {
  id: string;
  timestamp: string;
  timeSec: number;
  title: string;
  reveal: string;
  foreshadowingClues: string[];
  twistScore: number; // 0 - 100
  sceneId: string;
  explanationHook: string;
}

export interface SuspensePoint {
  id: string;
  timestamp: string;
  timeSec: number;
  sceneTitle: string;
  tensionLevel: number; // 0 - 100
  trigger: string;
  resolution: string;
  sceneId: string;
}

export interface EmotionalMoment {
  id: string;
  timestamp: string;
  timeSec: number;
  character: string;
  emotionType: 'Grief' | 'Obsession' | 'Betrayal' | 'Catharsis' | 'Fear' | 'Love' | 'Awe';
  intensity: number; // 0 - 100
  description: string;
  sceneId: string;
}

export interface ActionSequence {
  id: string;
  timestamp: string;
  timeSec: number;
  title: string;
  intensity: number; // 0 - 100
  choreographyPacing: 'Hyper-Accelerated' | 'Zero-Gravity Ballet' | 'Tactical Heist' | 'High-Speed Pursuit';
  vehiclesOrWeapons: string[];
  sceneId: string;
}

export interface CinemaLocation {
  id: string;
  name: string;
  sceneCount: number;
  atmosphere: string;
  firstSeen: string;
  significance: string;
  thumbnail: string;
}

export interface CinemaObject {
  id: string;
  name: string;
  ownerCharacter: string;
  significance: string;
  firstSeen: string;
  isTotemOrMacGuffin: boolean;
  thumbnail: string;
}

export interface ScannedFrame {
  id: string;
  timestamp: string;
  timeSec: number;
  sceneNumber: number;
  imageUrl: string;
  detectedPeople: { name: string; confidence: number; box: { x: number; y: number; w: number; h: number } }[];
  detectedObjects: { name: string; confidence: number; box: { x: number; y: number; w: number; h: number } }[];
  visualTags: string[];
  dominantColor: string;
  lighting: string;
  shotType: 'Extreme Close-Up' | 'Close-Up' | 'Medium Shot' | 'Wide Shot' | 'Dutch Angle' | 'Bird Eye';
}

export interface GraphNode {
  id: string;
  label: string;
  category: 'character' | 'scene' | 'location' | 'object' | 'event' | 'dialogue' | 'music';
  color: string;
  x: number;
  y: number;
  data?: any;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: 'appears in' | 'interacts with' | 'contains' | 'causes' | 'located at' | 'owns/uses' | 'occurs at' | 'plays in';
  details?: string;
}

export interface StoryGraphNode {
  id: string;
  label: string;
  type: 'character' | 'concept' | 'location' | 'faction';
  role?: string;
  x: number;
  y: number;
  connections: string[];
}

export type NarrativeStage = 
  | 'HOOK'
  | 'MYSTERY / QUESTION'
  | 'CHARACTER INTRODUCTION'
  | 'IMPORTANT EVENT'
  | 'CLUE'
  | 'TENSION'
  | 'ESCALATION'
  | 'ACTION / EMOTION'
  | 'NEW QUESTION'
  | 'TWIST'
  | 'CLIMAX'
  | 'REVEAL'
  | 'ENDING';

export const NARRATIVE_STAGES_SEQUENCE: NarrativeStage[] = [
  'HOOK',
  'MYSTERY / QUESTION',
  'CHARACTER INTRODUCTION',
  'IMPORTANT EVENT',
  'CLUE',
  'TENSION',
  'ESCALATION',
  'ACTION / EMOTION',
  'NEW QUESTION',
  'TWIST',
  'CLIMAX',
  'REVEAL',
  'ENDING'
];

export type ExplainerGenre = 
  | 'Thriller'
  | 'Mystery'
  | 'Horror'
  | 'Crime'
  | 'Action'
  | 'Romance'
  | 'Psychological'
  | 'Sci-Fi'
  | 'Drama'
  | 'Comedy'
  | 'Adventure';

export type ExplainerLanguage = 'Hindi' | 'Hinglish' | 'English';

export interface WordTiming {
  word: string;
  startSec: number;
  endSec: number;
}

export interface StoryBeat {
  id: string;
  stage: NarrativeStage;
  beatType: 'hook' | 'intro' | 'catalyst' | 'mission' | 'team' | 'twist' | 'climax' | 'reveal' | 'ending' | string;
  title: string;
  description: string;
  targetDurationSec: number;
  actualTimestamp: string;
  status: 'pending' | 'drafted' | 'approved';
  tensionLevel: number; // 0 - 100
  tensionScore?: number; // alias for tensionLevel
  mysteryHook: string;
  curiosityGap?: string;
  withholdingReason?: string; // Reason for intentionally delaying information
  sourceSceneIds?: string[];
  scriptSegmentId?: string;
  timestampTarget?: string;
  headline?: string;
  explainerNarrationGoal?: string;
  sourceSceneTitle?: string;
  sourceSceneId?: string;
  targetWords?: number;
  informationWithheld?: string;
  visualCues?: string;
}

export interface StoryVersion {
  id: string;
  versionName: string; // e.g. "Story V1", "Story V2"
  timestamp: string;
  genre: ExplainerGenre;
  durationLabel: string;
  beats: StoryBeat[];
  strategy: string;
  summary: string;
}

export interface ScriptVersion {
  id: string;
  versionName: string; // e.g. "Script V1", "Script V2"
  timestamp: string;
  language: ExplainerLanguage;
  wordsCount: number;
  targetDuration: string;
  estimatedNarrationDuration: string;
  segments: ScriptSegment[];
}

export interface StoryEngineConfig {
  selectedGenre: ExplainerGenre;
  targetDuration: string;
  customMinutes?: number;
  targetDurationSec: number;
  targetWords: number;
  estimatedNarrationDuration: string;
  estimatedNarrationSec: number;
  language: ExplainerLanguage;
  delayInformationStrategy: boolean;
  storytellingStrategy: any;
}

export interface MasterNarratorProfile {
  provider: 'google' | 'gemini' | 'browser';
  voiceId: string;
  voiceName: string;
  gender: 'male' | 'female';
  language: 'hi-IN' | 'en-IN' | 'en-US' | string;
  mode: string; // e.g. 'cinematic', 'mystery', etc.
  speakingRate: number; // 0.5 - 2.0 (default 1.0)
  pitch: number; // -20.0 - +20.0 semitones (default 0)
  volumeGainDb: number; // -16 to +16 dB
  intensity: number; // 0 - 100 (0 Subtle, 25 Low, 50 Normal, 75 High, 100 Maximum)
  emotion: 'Neutral' | 'Happy' | 'Sad' | 'Angry' | 'Fear' | 'Surprise' | 'Excitement' | 'Suspense' | 'Confidence' | 'Serious' | 'Romantic' | 'Dramatic' | 'Mysterious' | 'Humorous';
  styleInstructions: string;
  ssml?: string;
  enabled: boolean;
  energy: number; // 0 - 100
  dramaticLevel: number; // 0 - 100
  suspenseLevel: number; // 0 - 100
  pauseStrength: number; // 0 - 100
  sentencePauseMs: number; // e.g. 400
  paragraphPauseMs: number; // e.g. 800
  emphasisStrength: number; // 0 - 100
  emotionLevel: number; // 0 - 100
  safeLanguageMode: 'SAFE LANGUAGE' | 'NORMAL' | 'STRONG LANGUAGE' | 'MATURE';
}

export interface VoiceActingMode {
  id: string;
  number: number;
  name: string;
  category: 'Cinematic & Trailer' | 'Atmospheric & Thriller' | 'Emotional & Human' | 'Fast & High-Energy' | 'Documentary & News' | 'Character & Narrative' | 'Climax & Twist' | 'Mature & Adult';
  description: string;
  defaultRate: number;
  defaultPitch: number;
  defaultIntensity: number;
  defaultEmotion: 'Neutral' | 'Happy' | 'Sad' | 'Angry' | 'Fear' | 'Surprise' | 'Excitement' | 'Suspense' | 'Confidence' | 'Serious' | 'Romantic' | 'Dramatic' | 'Mysterious' | 'Humorous';
  defaultEnergy: number;
  defaultDramatic: number;
  defaultSuspense: number;
  pauseSentenceMs: number;
  pauseParagraphMs: number;
  emphasisLevel: 'moderate' | 'strong' | 'sharp' | 'subtle' | 'none';
  actingDirections: string;
  ssmlProsodyTag?: string;
  stylePrompt: string;
}

export interface VoiceConsistencyIssue {
  segmentId: string;
  segmentTitle: string;
  expectedVoiceId: string;
  actualVoiceId: string;
  status: 'error' | 'repaired';
  detectedAt: string;
}

export interface VoiceCacheEntry {
  cacheKey: string;
  text: string;
  voiceId: string;
  mode: string;
  intensity: number;
  audioUrl: string;
  durationSec: number;
  wordTimings: WordTiming[];
  timestamp: string;
}

export interface VoiceLabSettings {
  gcpConfigured: boolean;
  gcpApiKey?: string;
  selectedLanguage: string; // 'hi-IN' | 'en-IN' | 'en-US' | 'en-GB'
  selectedVoiceId: string;
  gender: 'male' | 'female' | 'synthetic';
  speakingRate: number; // 0.25 - 4.0
  pitch: number;        // -20.0 - 20.0
  volumeGainDb: number; // -96.0 - 16.0
  deliveryPreset: 'Whispered Suspense' | 'Urgent Fast-Paced' | 'Noir Analytical' | 'Epic Cinematic' | 'Conversational Explainer' | string;
  ssmlMode: boolean;
  ssmlText: string;
  pauseMs: number;
  customPronunciations: { term: string; ipa: string }[];
  masterProfile?: MasterNarratorProfile;
}

export interface NarrationSegment {
  id: string;
  text: string;
  voiceActorId: string;
  audioUrl?: string;
  durationSec: number;
  emphasisWords?: string[];
  speed?: number;
}

export interface ScriptSegment {
  id: string;
  segmentId?: string;
  beatId?: string;
  title: string;
  text?: string;
  startTarget?: string;
  endTarget?: string;
  startSec?: number;
  endSec?: number;
  timestampTarget?: string;
  hookLine?: string;
  mysteryHook?: string;
  narration: NarrationSegment[];
  visualNotes: string;
  targetDurationSec: number;
  sourceSceneIds?: string[];
  sourceClipIds?: string[];
  emotion?: string;
  deliveryStyle?: string;
  importance?: number;
  confidence?: number;
  narrativeStage?: NarrativeStage;
  stage?: NarrativeStage;
  wordsTarget?: number;
  status?: 'draft' | 'reviewed' | 'final';
  isLocked?: boolean;
  audioUrl?: string | null;
  audioDurationSec?: number;
  audioTiming?: {
    startSec: number;
    endSec: number;
    durationSec: number;
    voiceActorId: string;
    audioUrl?: string | null;
  };
  wordTimings?: WordTiming[];
  sfxCue?: string;
  ambientCue?: string;
  voiceMode?: string;
  voiceIntensity?: number;
  voiceEmotion?: string;
  voiceStylePrompt?: string;
  recommendedMode?: string;
  recommendedIntensity?: number;
  recommendationReason?: string;
  isAiRecommendedAccepted?: boolean;
  generationStatus?: 'unconfigured' | 'pending' | 'generating' | 'ready' | 'error';
  generationError?: string;
}

export interface Script {
  id: string;
  projectId: string;
  language?: ExplainerLanguage;
  targetDuration?: string; // "20 min"
  targetDurationSec: number;
  targetWords?: number;
  estimatedNarrationDuration?: string;
  actualDurationSec: number;
  wordsCount: number;
  readingSpeedWpm: number;
  segments: ScriptSegment[];
}

export interface TimelineMarker {
  id: string;
  timeSec: number;
  label: string;
  color: string;
  comment?: string;
}

export interface ClipScoringBreakdown {
  semanticRelevance: number;
  characterMatch: number;
  sceneImportance: number;
  visualQuality: number;
  storyContinuity: number;
  emotion: number;
  suspense: number;
  dialogueRelevance: number;
  durationFit: number;
  duplicatePenalty: number;
  totalScore: number;
}

export interface Clip {
  id: string;
  trackId: string;
  title: string;
  startTime: number; // in seconds on the timeline
  duration: number; // in seconds
  sourceStart: number;
  sourceEnd: number;
  mediaType: 'video' | 'narration' | 'dialogue' | 'sfx' | 'music' | 'subtitles';
  color: string;
  waveform?: number[];
  thumbnail?: string;
  volume?: number;
  muted?: boolean;

  // AI Selection Provenance
  sourceSceneId?: string;
  sourceClipId?: string;
  sourceMediaId?: string;
  selectionReason?: string;
  selectionConfidence?: number;
  scoringBreakdown?: ClipScoringBreakdown;
  effects?: any[];

  // Video Transform & Compositing
  posX?: number;
  posY?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  blendMode?: 'normal' | 'screen' | 'multiply' | 'overlay';
  crop?: { top: number; bottom: number; left: number; right: number };
  speed?: number;
  isReversed?: boolean;
  isFreezeFrame?: boolean;
  lutFilter?: string;
  transitionIn?: { type: 'cross_dissolve' | 'dip_to_black' | 'dip_to_white' | 'whip_pan' | 'none'; durationSec: number };
  transitionOut?: { type: 'cross_dissolve' | 'dip_to_black' | 'dip_to_white' | 'whip_pan' | 'none'; durationSec: number };

  // Audio Properties
  volumeDb?: number;
  pan?: number;
  fadeInSec?: number;
  fadeOutSec?: number;
  audioGain?: number;

  // Text / Caption Properties
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textColor?: string;
  textBgColor?: string;
  textAlignment?: 'left' | 'center' | 'right';
  animationPreset?: 'fade' | 'pop' | 'typewriter' | 'karaoke';
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'narration' | 'dialogue' | 'sfx' | 'music' | 'subtitles';
  muted: boolean;
  solo: boolean;
  locked: boolean;
  visible?: boolean;
  color?: string;
  volume: number; // 0 - 100
  clips: Clip[];
}

export interface TimelineVersion {
  id: string;
  name: string; // e.g. 'V1 — AI First Cut', 'V2 — Human Edit', 'V3 — Revised', 'V4 — Final'
  timestamp: string;
  totalDuration: number;
  clipCount: number;
  description?: string;
  tracks: TimelineTrack[];
}

export interface Timeline {
  id: string;
  projectId: string;
  totalDuration: number; // in seconds
  currentTime: number;
  isPlaying: boolean;
  zoomLevel: number; // 1 - 10
  snapEnabled?: boolean;
  inPoint?: number | null;
  outPoint?: number | null;
  markers?: TimelineMarker[];
  activeTool?: 'select' | 'razor' | 'ripple' | 'slip' | 'hand';
  selectedClipId?: string | null;
  tracks: TimelineTrack[];
}

export interface Subtitle {
  id: string;
  startTime: string; // "00:00:15.200" or "00:00:15,200"
  endTime: string;
  startSec: number;
  endSec: number;
  text: string;
  speaker?: string;
  confidence: number;
  language?: 'English' | 'Hindi' | 'Hinglish' | string;
  track?: 'narration' | 'dialogue' | 'both';
  locked?: boolean;
  stylePreset?: 'cyber_cyan' | 'cinema_yellow' | 'karaoke_glow' | 'bold_sans';
}

export interface VoiceActor {
  id: string;
  name: string;
  category: 'Cinematic Epic' | 'Noir Detective' | 'Documentary Historian' | 'Hyper Hype' | 'Suspense Thriller';
  gender: 'male' | 'female' | 'synthetic';
  accent: string;
  previewAudio: string;
  rating: number;
}

export interface ShortClipWordCaption {
  word: string;
  startSec: number;
  endSec: number;
  isKeyword?: boolean;
}

export interface ShortClip {
  id: string;
  title: string;
  targetDuration?: number; // 15, 30, 60
  category?: 'high_tension' | 'twist_explanation' | 'character_reveal' | 'climax';
  viralHook?: string;
  hook?: string;
  format?: '9:16';
  ratio?: string;
  coverUrl?: string;
  thumbnailUrl?: string;
  status?: 'ready' | 'rendering' | 'draft';
  timestampRange?: string;
  timestampStart?: string;
  timestampEnd?: string;
  durationSec?: number;
  viewsPredicted?: string;
  viralScore?: number;
  startSec?: number;
  endSec?: number;
  focalPoint?: string;
  zoomLevel?: number; // 1.0 - 1.5
  sfxPreset?: 'dramatic_riser' | 'cinematic_boom' | 'glitch_whoosh' | 'none';
  hookBanner?: string;
  animatedCaptions?: ShortClipWordCaption[];
  tags: string[];
}

export interface ThumbnailVariant {
  id: string;
  variant: 'A' | 'B' | 'C' | 'D';
  style?: 'Dark Mystery' | 'Cinematic' | 'High Contrast Shock' | 'Curiosity Gap';
  title: string;
  overlayText: string;
  badgeText: string;
  imageUrl: string;
  dominantSubject?: string;
  predictedCtr: number; // e.g. 18.4
  scores?: {
    contrast: number;
    faceClarity: number;
    curiosity: number;
    mobileReadability: number;
  };
  active: boolean;
}

export interface Chapter {
  timestamp: string;
  title: string;
}

export interface SEOTitleVariant {
  title: string;
  score: number;
  keywordStrength?: number;
  clickability?: number;
}

export interface SEOViralHook {
  platform: 'twitter' | 'youtube_community' | 'tiktok' | 'instagram';
  hook: string;
  score: number;
}

export interface SEOData {
  titleVariants: SEOTitleVariant[];
  descriptions: string[];
  tags: string[];
  hashtags?: string[];
  chapters: Chapter[];
  viralHooks: string[] | SEOViralHook[];
  overallSeoScore: number; // 0 - 100
  analysis?: {
    searchPotential: number;
    keywordStrength: number;
    algorithmMatch: number;
    mobileTitleLength: number;
  };
}

export interface BrowserExportCapability {
  mediaRecorderSupported: boolean;
  supportedMimeTypes: string[];
  preferredMimeType: string;
  hardwareAccelerationEstimated: boolean;
  webAudioSupported: boolean;
  canvasCaptureSupported: boolean;
  webCodecsSupported: boolean;
  maxRecommendedResolution: '1080p' | '4K';
  notes: string;
}

export interface ExportSettingsConfig {
  resolution: '720p (1280x720)' | '1080p (1920x1080)' | '1440p (2560x1440)' | '4K UHD (3840x2160)' | 'Shorts (1080x1920)';
  aspectRatio: '16:9' | '9:16';
  fps: 24 | 30 | 60;
  videoBitrateMbps: number;
  audioBitrateKbps: number;
  burnInSubtitles: boolean;
  subtitleStyle: 'cyber_cyan' | 'cinema_yellow' | 'karaoke_glow' | 'bold_sans';
  subtitleLanguage: 'English' | 'Hindi' | 'Hinglish';
  exportMetadata: boolean;
  includeAudioStems: boolean;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  duration: string;
  durationSec: number;
  status: ProcessingStatus;
  synopsis: string;
  thumbnail: string;
}

export interface AnalysisResult {
  overallScore: number;
  charactersCount: number;
  keyEventsCount: number;
  twistsCount: number;
  suspensePointsCount: number;
  emotionalMomentsCount: number;
  narrationSyncScore: number;
  sceneMatchingScore: number;
  audioScore: number;
  subtitlesScore: number;
  pacingScore: number;
  continuityScore: number;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  director: string;
  year: number;
  genre: string[];
  synopsis: string;
  duration: string;
  durationSec: number;
  resolution: string;
  fps: number;
  posterUrl: string;
  videoSourceUrl?: string;
  status: ProcessingStatus;
  analysisStatus?: AnalysisStatus;
  storyPotentialScore?: number; // e.g. 94
  analysis: AnalysisResult;
  sourceRange?: SourceRangeConfig;
  mediaFiles?: MediaFileRecord[];
  scenes: Scene[];
  characters: Character[];
  events?: KeyEvent[];
  twists?: TwistPoint[];
  suspensePoints?: SuspensePoint[];
  emotionalMoments?: EmotionalMoment[];
  actionSequences?: ActionSequence[];
  locations?: CinemaLocation[];
  objects?: CinemaObject[];
  scannedFrames?: ScannedFrame[];
  knowledgeGraphNodes?: GraphNode[];
  knowledgeGraphEdges?: GraphEdge[];
  storyGraph: StoryGraphNode[];
  storyConfig?: StoryEngineConfig;
  storyBeats?: StoryBeat[];
  storyVersions?: StoryVersion[];
  scriptVersions?: ScriptVersion[];
  voiceSettings?: VoiceLabSettings;
  masterNarratorVoiceId?: string;
  masterNarratorProfile?: MasterNarratorProfile;
  script: Script;
  timeline: Timeline;
  timelineVersions?: TimelineVersion[];
  activeTimelineVersionId?: string;
  subtitles: Subtitle[];
  shorts: ShortClip[];
  thumbnails: ThumbnailVariant[];
  seo: SEOData;
  episodes?: Episode[];
  activeEpisodeId?: string;
  lastEdited: string;
  createdAt: string;
}

export interface AICommandLog {
  id: string;
  timestamp: string;
  prompt: string;
  status: 'executing' | 'completed' | 'failed';
  response: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'ai';
  message: string;
}

export type PageId = 
  | 'command-center'
  | 'movie-library'
  | 'movie-intelligence'
  | 'story-engine'
  | 'script-studio'
  | 'voice-lab'
  | 'ai-first-cut'
  | 'pro-editor'
  | 'subtitle-studio'
  | 'subtitles'
  | 'shorts-lab'
  | 'thumbnail-lab'
  | 'seo-center'
  | 'seo-packaging'
  | 'youtube'
  | 'youtube-pipeline'
  | 'analytics'
  | 'content-planner'
  | 'web-series'
  | 'settings';
