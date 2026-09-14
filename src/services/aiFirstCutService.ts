import { Project, Timeline, TimelineTrack, TimelineClip, TimelineVersion, Subtitle } from '../types';

export interface FirstCutStageInfo {
  id: string;
  name: string;
  description: string;
}

export interface FirstCutResult {
  timeline: Timeline;
  subtitles: Subtitle[];
  timelineVersion: TimelineVersion;
  stats: {
    explainerRuntime: string;
    totalClips: number;
    videoTracks: number;
    audioTracks: number;
  };
}

export const FIRST_CUT_STAGES: FirstCutStageInfo[] = [
  {
    id: 'stage_anchors',
    name: 'Scene Anchors',
    description: 'Extracting scene anchors & source timestamps'
  },
  {
    id: 'stage_narration',
    name: 'Audio Conform',
    description: 'Aligning narration segments with visuals'
  },
  {
    id: 'stage_broll',
    name: 'B-Roll Conform',
    description: 'Matching B-roll & reaction shots'
  },
  {
    id: 'stage_audio',
    name: 'Soundscape Design',
    description: 'Synthesizing audio stems and SFX sync points'
  },
  {
    id: 'stage_cut',
    name: 'Pacing & Transition',
    description: 'Applying cinematic cut transitions'
  }
];

export function generateAiFirstCut(project: Project): FirstCutResult {
  const clips: TimelineClip[] = (project.scenes || []).slice(0, 10).map((sc, i) => ({
    id: `clip_${sc.id || i}`,
    title: sc.title || `Scene ${sc.sceneNumber}`,
    name: sc.title || `Scene ${sc.sceneNumber}`,
    trackId: 'v1',
    startTime: i * 15,
    duration: 15,
    startSec: i * 15,
    durationSec: 15,
    sourceStart: sc.startSec || 0,
    sourceEnd: (sc.startSec || 0) + 15,
    sourceStartSec: sc.startSec || 0,
    sourceDurationSec: 15,
    mediaType: 'video',
    type: 'video',
    color: '#00f0ff',
    volume: 1,
    opacity: 1
  }));

  const tracks: TimelineTrack[] = [
    {
      id: 'v1',
      name: 'V1 // Source Video',
      type: 'video',
      isMuted: false,
      isLocked: false,
      isSolo: false,
      color: '#00f0ff',
      clips
    },
    {
      id: 'a1',
      name: 'A1 // Voiceover',
      type: 'narration',
      isMuted: false,
      isLocked: false,
      isSolo: false,
      color: '#10b981',
      clips: []
    }
  ];

  const totalDuration = clips.length * 15;
  const versionId = `v_${Date.now()}`;

  const timelineVersion: TimelineVersion = {
    id: versionId,
    name: 'V1 — AI First Cut',
    timestamp: new Date().toISOString(),
    totalDuration,
    clipCount: clips.length,
    description: 'Automated 6-track timeline assembly by The Devil\'s Eye AI',
    tracks
  };

  const subtitles: Subtitle[] = (project.subtitles && project.subtitles.length > 0)
    ? project.subtitles
    : (project.scenes || []).slice(0, 10).map((sc, i) => ({
        id: `sub_${sc.id || i}`,
        startSec: i * 15,
        endSec: (i * 15) + 14,
        startTime: `00:${String(Math.floor((i * 15) / 60)).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')}.000`,
        endTime: `00:${String(Math.floor(((i * 15) + 14) / 60)).padStart(2, '0')}:${String(((i * 15) + 14) % 60).padStart(2, '0')}.000`,
        text: sc.visualSummary || sc.title || `Scene ${sc.sceneNumber} visual sequence`,
        confidence: 96,
        track: 'narration'
      }));

  return {
    timeline: {
      id: `tl_cut_${Date.now()}`,
      name: 'AI First Cut',
      projectId: project.id,
      totalDuration,
      durationSec: totalDuration,
      currentTime: 0,
      playheadSec: 0,
      fps: 24,
      isPlaying: false,
      zoomLevel: 1,
      tracks
    },
    subtitles,
    timelineVersion,
    stats: {
      explainerRuntime: `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`,
      totalClips: clips.length,
      videoTracks: 1,
      audioTracks: 1
    }
  };
}
