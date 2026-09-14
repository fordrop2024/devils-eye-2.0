import { Project, AnalysisResult } from '../types';

export function generateAnalyzedProjectData(project: Project): Partial<Project> {
  // If project has real movieIntelligence or completed analysis, preserve it
  if (project.movieIntelligence || (project.scenes && project.scenes.length > 0)) {
    return {
      scenes: project.scenes,
      characters: project.characters,
      events: project.events,
      twists: project.twists,
      suspensePoints: project.suspensePoints,
      emotionalMoments: project.emotionalMoments,
      analysis: project.analysis
    };
  }

  // If no analysis has been run on a real movie, return empty state
  return {
    scenes: [],
    characters: [],
    events: [],
    twists: [],
    suspensePoints: [],
    emotionalMoments: [],
    actionSequences: [],
    locations: [],
    objects: [],
    analysisStatus: project.analysisStatus || 'NOT ANALYZED',
    analysis: project.analysis || {
      overallScore: 0,
      charactersCount: 0,
      keyEventsCount: 0,
      twistsCount: 0,
      suspensePointsCount: 0,
      emotionalMomentsCount: 0,
      narrationSyncScore: 0,
      sceneMatchingScore: 0,
      audioScore: 0,
      subtitlesScore: 0,
      pacingScore: 0,
      continuityScore: 0
    }
  };
}
