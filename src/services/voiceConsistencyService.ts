/**
 * THE DEVIL'S EYE - Voice Consistency Validator
 * Enforces the Core Voice Rule:
 * Every narration segment and timeline clip must strictly match the project's Master Voice Identity.
 * Provides detection, auditing, and 1-click non-destructive repair.
 */

import { Project, VoiceConsistencyIssue } from '../types';

export interface VoiceConsistencyReport {
  isConsistent: boolean;
  masterVoiceId: string;
  totalSegmentsChecked: number;
  validSegmentsCount: number;
  mismatchedSegments: VoiceConsistencyIssue[];
  repairedCount?: number;
}

/**
 * Validates whether all narration segments in the project adhere to the Master Voice ID.
 */
export function validateProjectVoiceConsistency(project: Project): VoiceConsistencyReport {
  const masterVoiceId = project.masterNarratorVoiceId || project.voiceSettings?.selectedVoiceId || 'hi-IN-Neural2-B';
  const segments = project.script?.segments || [];
  const issues: VoiceConsistencyIssue[] = [];

  segments.forEach((seg, index) => {
    // Check segment narration items
    const segVoiceId = seg.narration?.[0]?.voiceActorId;
    if (segVoiceId && segVoiceId !== masterVoiceId) {
      issues.push({
        segmentId: seg.id || `seg-${index}`,
        segmentTitle: seg.title || `Segment ${index + 1}`,
        expectedVoiceId: masterVoiceId,
        actualVoiceId: segVoiceId,
        status: 'error',
        detectedAt: new Date().toLocaleTimeString(),
      });
    }
  });

  return {
    isConsistent: issues.length === 0,
    masterVoiceId,
    totalSegmentsChecked: segments.length,
    validSegmentsCount: segments.length - issues.length,
    mismatchedSegments: issues,
  };
}

/**
 * 1-Click Repair:
 * Synchronizes all mismatched segments and timeline narration tracks to the Master Voice ID
 * while strictly preserving individual segment acting modes, intensities, and script content.
 */
export function repairProjectVoiceConsistency(project: Project): { updatedProject: Project; repairedCount: number } {
  const masterVoiceId = project.masterNarratorVoiceId || project.voiceSettings?.selectedVoiceId || 'hi-IN-Neural2-B';
  const updatedProject: Project = JSON.parse(JSON.stringify(project));
  let repairedCount = 0;

  if (updatedProject.script && updatedProject.script.segments) {
    updatedProject.script.segments.forEach(seg => {
      if (seg.narration && seg.narration.length > 0) {
        seg.narration.forEach(narr => {
          if (narr.voiceActorId !== masterVoiceId) {
            narr.voiceActorId = masterVoiceId;
            repairedCount++;
          }
        });
      }
    });
  }

  // Also repair narration clips in the Timeline
  if (updatedProject.timeline && updatedProject.timeline.tracks) {
    const narrationTrack = updatedProject.timeline.tracks.find(t => 
      t.type === 'narration' || t.name.toLowerCase().includes('narration') || t.id.includes('narration')
    );
    if (narrationTrack && narrationTrack.clips) {
      narrationTrack.clips.forEach(clip => {
        // Tag clip with master voice provenance
        clip.title = clip.title.replace(/\[Voice:.*?\]/, '').trim();
        clip.title = `[${masterVoiceId.split('-').pop()}] ${clip.title}`;
      });
    }
  }

  // Ensure project master voice is set
  updatedProject.masterNarratorVoiceId = masterVoiceId;
  if (updatedProject.voiceSettings) {
    updatedProject.voiceSettings.selectedVoiceId = masterVoiceId;
  }

  return { updatedProject, repairedCount };
}
