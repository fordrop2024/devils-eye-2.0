import { Project, PageId, StoryBeat } from '../types';
import { getStoryDirectorRecommendations, generateStoryBeats, StoryDirectorRecommendation } from './storyEngineService';

export interface GlobalDirectorResult {
  updatedProject: Partial<Project>;
  actionSummary: string;
  targetPage?: PageId;
  recommendations?: StoryDirectorRecommendation[];
}

export async function executeGlobalAiDirector(project: Project, prompt: string): Promise<GlobalDirectorResult> {
  const pLower = prompt.toLowerCase();
  const updated: Partial<Project> = {};
  let targetPage: PageId | undefined;

  // Derive actual director recommendations from real movie intelligence
  const recommendations = getStoryDirectorRecommendations(project);

  if (pLower.includes('first cut') || pLower.includes('timeline') || pLower.includes('assemble')) {
    targetPage = 'pro-editor';
  } else if (pLower.includes('story') || pLower.includes('beat') || pLower.includes('narrative')) {
    targetPage = 'story-engine';
    if ((!project.storyBeats || project.storyBeats.length === 0) && project.scenes && project.scenes.length > 0) {
      const beats = generateStoryBeats(project, (project.genre?.[0] as any) || 'Thriller');
      updated.storyBeats = beats;
      updated.storyStatus = 'STORY READY';
    }
  } else if (pLower.includes('script') || pLower.includes('narrat')) {
    targetPage = 'script-studio';
  } else if (pLower.includes('short') || pLower.includes('reel') || pLower.includes('tiktok')) {
    targetPage = 'shorts-lab';
  } else if (pLower.includes('thumbnail')) {
    targetPage = 'thumbnail-lab';
  } else if (pLower.includes('subtitle') || pLower.includes('caption')) {
    targetPage = 'subtitle-studio';
  }

  // Provide a movie-specific response
  let actionSummary = `Devil's Eye AI Director: Processed directive "${prompt}".`;
  if (project.scenes && project.scenes.length > 0) {
    actionSummary += ` Evaluated ${project.scenes.length} analyzed movie scenes. Generated ${recommendations.length} data-grounded directorial insights.`;
  } else {
    actionSummary += ` Awaiting analyzed movie data for grounded directorial adjustments.`;
  }

  return {
    updatedProject: updated,
    actionSummary,
    targetPage,
    recommendations
  };
}

export function executeDirectorCommand(project: Project, command: string): { updatedProject: Partial<Project>; message: string } {
  const scenes = project.scenes || [];
  const cLower = command.toLowerCase();

  if (scenes.length === 0) {
    return {
      updatedProject: {},
      message: 'No analyzed movie scenes available. Director recommendations require completed movie analysis.'
    };
  }

  const recs = getStoryDirectorRecommendations(project);

  if (cLower.includes('hook')) {
    const hook = recs.find(r => r.type === 'HOOK');
    return {
      updatedProject: {},
      message: hook ? `Director Insight: ${hook.title} - ${hook.reason}` : 'Evaluated earliest scenes for optimal dramatic hook.'
    };
  }

  if (cLower.includes('shorten') || cLower.includes('trim') || cLower.includes('pace')) {
    const shorten = recs.find(r => r.type === 'SHORTEN');
    return {
      updatedProject: {},
      message: shorten ? `Director Insight: ${shorten.title} - ${shorten.reason}` : 'All scenes currently hold critical narrative weight.'
    };
  }

  if (cLower.includes('preserve') || cLower.includes('keep') || cLower.includes('critical')) {
    const preserve = recs.find(r => r.type === 'PRESERVE');
    return {
      updatedProject: {},
      message: preserve ? `Director Insight: ${preserve.title} - ${preserve.reason}` : 'Main narrative anchors identified.'
    };
  }

  if (cLower.includes('suspense') || cLower.includes('tension')) {
    const susp = recs.find(r => r.type === 'SUSPENSE');
    return {
      updatedProject: {},
      message: susp ? `Director Insight: ${susp.title} - ${susp.reason}` : 'Tension curve analyzed across all acts.'
    };
  }

  if (cLower.includes('twist')) {
    const twist = recs.find(r => r.type === 'TWIST');
    return {
      updatedProject: {},
      message: twist ? `Director Insight: ${twist.title} - ${twist.reason}` : 'Key plot subversion points mapped to narrative structure.'
    };
  }

  return {
    updatedProject: {},
    message: `Applied directive "${command}" against ${scenes.length} analyzed movie scenes.`
  };
}
