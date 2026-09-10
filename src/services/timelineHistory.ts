/**
 * THE DEVIL'S EYE - Timeline History Engine
 * Provides persistent multi-level undo/redo operations for the Cinema Pro Editor.
 */

import { Timeline } from '../types';

export interface TimelineHistoryListItem {
  id: string;
  description: string;
  timestamp: string;
}

interface TimelineHistorySnapshot {
  id: string;
  description: string;
  timestamp: string;
  timeline: Timeline;
}

export class TimelineHistory {
  private past: TimelineHistorySnapshot[] = [];
  private future: TimelineHistorySnapshot[] = [];
  private maxHistory: number;

  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
  }

  /**
   * Record a snapshot before applying an operation
   */
  record(description: string, currentTimeline: Timeline): void {
    if (!currentTimeline) return;
    const snapshot: TimelineHistorySnapshot = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      description,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timeline: JSON.parse(JSON.stringify(currentTimeline)),
    };

    this.past.push(snapshot);
    if (this.past.length > this.maxHistory) {
      this.past.shift();
    }
    // Any new action invalidates future redo branch
    this.future = [];
  }

  /**
   * Undo to the most recent previous snapshot
   */
  undo(currentTimeline: Timeline): { previousTimeline: Timeline; description: string } | null {
    if (this.past.length === 0) return null;

    const previousSnapshot = this.past.pop()!;
    
    // Push current state into redo branch
    if (currentTimeline) {
      this.future.push({
        id: `hist-future-${Date.now()}`,
        description: previousSnapshot.description,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timeline: JSON.parse(JSON.stringify(currentTimeline)),
      });
    }

    return {
      previousTimeline: previousSnapshot.timeline,
      description: previousSnapshot.description,
    };
  }

  /**
   * Redo forward to the next snapshot
   */
  redo(currentTimeline: Timeline): { nextTimeline: Timeline; description: string } | null {
    if (this.future.length === 0) return null;

    const nextSnapshot = this.future.pop()!;

    // Push current state into past undo branch
    if (currentTimeline) {
      this.past.push({
        id: `hist-past-${Date.now()}`,
        description: nextSnapshot.description,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timeline: JSON.parse(JSON.stringify(currentTimeline)),
      });
    }

    return {
      nextTimeline: nextSnapshot.timeline,
      description: nextSnapshot.description,
    };
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  getHistoryList(): TimelineHistoryListItem[] {
    return [...this.past].reverse().map(item => ({
      id: item.id,
      description: item.description,
      timestamp: item.timestamp,
    }));
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }
}
