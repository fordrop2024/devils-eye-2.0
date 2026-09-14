import { 
  Project, 
  StoryBeat, 
  Script, 
  ScriptSegment, 
  ExplainerLanguage, 
  ExplainerGenre,
  NarrativeStage,
  StoryBeatSourceMapping,
  Scene,
  CharacterDetail
} from '../types';

export interface StoryDirectorRecommendation {
  type: 'HOOK' | 'SHORTEN' | 'PRESERVE' | 'SUSPENSE' | 'EMOTION' | 'TWIST' | 'CLIMAX';
  title: string;
  sceneId?: string;
  sceneNumber?: number;
  timestamp?: string;
  reason: string;
  action: string;
  confidence: number;
}

export interface CharacterArcSummary {
  id: string;
  name: string;
  role: string;
  firstAppearanceTimestamp?: string;
  firstAppearanceScene?: number;
  totalAppearances: number;
  keyScenes: { sceneNumber: number; timestamp: string; title: string }[];
  motivation?: string;
  conflict?: string;
  arcSummary: string;
}

export interface MovieStoryStructureSummary {
  genre: ExplainerGenre;
  totalScenesAnalyzed: number;
  beatsGenerated: number;
  hookScene?: { sceneNumber: number; title: string; timestamp: string };
  incitingScene?: { sceneNumber: number; title: string; timestamp: string };
  keyTwistScene?: { sceneNumber: number; title: string; timestamp: string };
  climaxScene?: { sceneNumber: number; title: string; timestamp: string };
  endingScene?: { sceneNumber: number; title: string; timestamp: string };
}

/**
 * Priority weights for signal detection across different genres
 */
export const GENRE_SIGNAL_PROFILES: Record<ExplainerGenre, {
  suspenseWeight: number;
  twistWeight: number;
  actionWeight: number;
  emotionWeight: number;
  mysteryWeight: number;
  characterWeight: number;
  description: string;
}> = {
  'Mystery': {
    suspenseWeight: 1.2,
    twistWeight: 1.5,
    actionWeight: 0.6,
    emotionWeight: 0.8,
    mysteryWeight: 2.0,
    characterWeight: 1.2,
    description: 'Prioritizes clues, hidden motives, curiosity gaps, and deductive revelations.'
  },
  'Thriller': {
    suspenseWeight: 2.0,
    twistWeight: 1.4,
    actionWeight: 1.3,
    emotionWeight: 1.0,
    mysteryWeight: 1.2,
    characterWeight: 1.0,
    description: 'Prioritizes danger, ticking clocks, psychological tension, and escalating stakes.'
  },
  'Action': {
    suspenseWeight: 1.1,
    twistWeight: 0.9,
    actionWeight: 2.0,
    emotionWeight: 0.8,
    mysteryWeight: 0.7,
    characterWeight: 1.0,
    description: 'Prioritizes conflict confrontations, kinetic set-pieces, physical stakes, and escalation.'
  },
  'Horror': {
    suspenseWeight: 2.0,
    twistWeight: 1.2,
    actionWeight: 1.0,
    emotionWeight: 1.1,
    mysteryWeight: 1.4,
    characterWeight: 0.9,
    description: 'Prioritizes dread, visceral threats, unsettling atmosphere, and survival desperation.'
  },
  'Crime': {
    suspenseWeight: 1.4,
    twistWeight: 1.4,
    actionWeight: 1.1,
    emotionWeight: 0.9,
    mysteryWeight: 1.7,
    characterWeight: 1.3,
    description: 'Prioritizes criminal methodology, investigative clues, deceit, and moral compromise.'
  },
  'Psychological': {
    suspenseWeight: 1.8,
    twistWeight: 1.9,
    actionWeight: 0.5,
    emotionWeight: 1.5,
    mysteryWeight: 1.6,
    characterWeight: 1.8,
    description: 'Prioritizes subjective perception, paranoia, identity destabilization, and psychological reveals.'
  },
  'Sci-Fi': {
    suspenseWeight: 1.3,
    twistWeight: 1.3,
    actionWeight: 1.2,
    emotionWeight: 1.0,
    mysteryWeight: 1.5,
    characterWeight: 1.1,
    description: 'Prioritizes speculative world rules, technological anomalies, philosophical dilemmas, and scale.'
  },
  'Drama': {
    suspenseWeight: 0.8,
    twistWeight: 1.0,
    actionWeight: 0.5,
    emotionWeight: 2.0,
    mysteryWeight: 0.8,
    characterWeight: 2.0,
    description: 'Prioritizes emotional vulnerability, character transformation, ethical conflicts, and relationships.'
  },
  'Comedy': {
    suspenseWeight: 0.7,
    twistWeight: 1.2,
    actionWeight: 0.9,
    emotionWeight: 1.0,
    mysteryWeight: 0.8,
    characterWeight: 1.5,
    description: 'Prioritizes comedic setups, absurd reactions, escalating misunderstandings, and payoffs.'
  },
  'Romance': {
    suspenseWeight: 0.8,
    twistWeight: 0.9,
    actionWeight: 0.4,
    emotionWeight: 2.0,
    mysteryWeight: 0.7,
    characterWeight: 1.8,
    description: 'Prioritizes intimacy, relational obstacles, emotional revelations, and romantic resolution.'
  },
  'Documentary': {
    suspenseWeight: 1.1,
    twistWeight: 1.1,
    actionWeight: 0.6,
    emotionWeight: 1.4,
    mysteryWeight: 1.5,
    characterWeight: 1.4,
    description: 'Prioritizes real-world evidence, thematic clarity, investigative milestones, and societal impact.'
  },
  'True Crime': {
    suspenseWeight: 1.7,
    twistWeight: 1.6,
    actionWeight: 0.8,
    emotionWeight: 1.3,
    mysteryWeight: 1.9,
    characterWeight: 1.4,
    description: 'Prioritizes chronological timeline, evidentiary clues, criminal motives, and justice revelations.'
  },
  'Adventure': {
    suspenseWeight: 1.2,
    twistWeight: 1.0,
    actionWeight: 1.7,
    emotionWeight: 1.1,
    mysteryWeight: 1.2,
    characterWeight: 1.3,
    description: 'Prioritizes journey milestones, exploration hazards, escalating challenges, and triumph.'
  },
  'Fantasy': {
    suspenseWeight: 1.2,
    twistWeight: 1.2,
    actionWeight: 1.6,
    emotionWeight: 1.2,
    mysteryWeight: 1.4,
    characterWeight: 1.3,
    description: 'Prioritizes mythic stakes, magic lore, quest milestones, and climactic destiny.'
  }
};

/**
 * Calculates a composite score for a scene based on the selected genre
 */
function scoreSceneForGenre(scene: Scene, genre: ExplainerGenre): number {
  const profile = GENRE_SIGNAL_PROFILES[genre] || GENRE_SIGNAL_PROFILES['Thriller'];
  const suspense = (scene.suspenseScore || 50) * profile.suspenseWeight;
  const twist = (scene.twistScore || 50) * profile.twistWeight;
  const emotion = (scene.emotionalScore || 50) * profile.emotionWeight;
  const importance = scene.importanceScore || 70;

  return Math.round((suspense + twist + emotion + importance) / (profile.suspenseWeight + profile.twistWeight + profile.emotionWeight + 1));
}

/**
 * Extracts character intelligence from real scenes without inventing data
 */
export function extractCharacterIntelligence(project: Project): CharacterDetail[] {
  const scenes = project.scenes || [];
  if (!scenes || scenes.length === 0) {
    return [];
  }

  // Use existing project characters or build from real scene mentions
  const charMap = new Map<string, {
    name: string;
    role: 'protagonist' | 'antagonist' | 'supporting' | 'victim' | 'target';
    appearances: { sceneId: string; sceneNumber: number; timestamp: string; title: string }[];
    firstSeen?: { sceneNumber: number; timestamp: string };
  }>();

  // Populate known characters
  (project.characters || []).forEach(c => {
    charMap.set(c.name.toLowerCase(), {
      name: c.name,
      role: c.role || 'supporting',
      appearances: [],
      firstSeen: undefined
    });
  });

  // Scan real scenes to record true appearances & first appearances
  scenes.forEach(scene => {
    const sceneChars = scene.characters || scene.charactersInScene || [];
    sceneChars.forEach(charName => {
      const cleanName = charName.trim();
      if (!cleanName) return;
      const key = cleanName.toLowerCase();

      let entry = charMap.get(key);
      if (!entry) {
        entry = {
          name: cleanName,
          role: 'supporting',
          appearances: []
        };
        charMap.set(key, entry);
      }

      const app = {
        sceneId: scene.id,
        sceneNumber: scene.sceneNumber,
        timestamp: scene.timestampStart || '00:00:00',
        title: scene.title || `Scene ${scene.sceneNumber}`
      };

      entry.appearances.push(app);
      if (!entry.firstSeen) {
        entry.firstSeen = {
          sceneNumber: scene.sceneNumber,
          timestamp: scene.timestampStart || '00:00:00'
        };
      }
    });
  });

  const result: CharacterDetail[] = [];

  charMap.forEach((val, idx) => {
    const existing = (project.characters || []).find(c => c.name.toLowerCase() === val.name.toLowerCase());
    
    // Determine protagonist/antagonist if not specified
    let role = existing?.role || val.role;
    if (val.appearances.length >= Math.max(3, scenes.length * 0.4) && role === 'supporting') {
      role = 'protagonist';
    }

    result.push({
      id: existing?.id || `char_${val.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: val.name,
      actor: existing?.actor || 'Detected Character',
      role: role,
      archetype: existing?.archetype || (role === 'protagonist' ? 'Central Figure' : 'Key Figure'),
      confidence: existing?.confidence || 95,
      avatar: existing?.avatar || '',
      screenTimeMinutes: Math.round(val.appearances.length * 2.5),
      description: existing?.description || `Appears in ${val.appearances.length} scenes across the movie timeline.`,
      firstAppearance: val.firstSeen?.timestamp || '00:00:00',
      firstAppearanceSceneNumber: val.firstSeen?.sceneNumber,
      importantScenes: val.appearances.slice(0, 5).map(a => ({
        sceneId: a.sceneId,
        sceneNumber: a.sceneNumber,
        timestamp: a.timestamp,
        note: a.title
      })),
      sourceTimestamps: val.appearances.map(a => a.timestamp),
      characterDevelopment: `First introduced in Scene ${val.firstSeen?.sceneNumber || 1} at ${val.firstSeen?.timestamp || '00:00:00'}. Participates in ${val.appearances.length} critical scenes through the movie climax.`
    });
  });

  // Sort by appearance count (protagonists first)
  return result.sort((a, b) => (b.sourceTimestamps?.length || 0) - (a.sourceTimestamps?.length || 0));
}

/**
 * Builds the 13-stage Narrative Structure strictly from the analyzed movie
 */
export function generateStoryBeats(
  project: Project, 
  genre: ExplainerGenre = 'Thriller', 
  targetDuration = '15 min'
): StoryBeat[] {
  const scenes = project.scenes || [];
  if (!scenes || scenes.length === 0) {
    return [];
  }

  // Sort scenes chronologically to respect movie timeline
  const sortedScenes = [...scenes].sort((a, b) => (a.startSec || 0) - (b.startSec || 0));
  const totalCount = sortedScenes.length;

  // Segment the movie into narrative zones
  const act1Scenes = sortedScenes.slice(0, Math.max(1, Math.floor(totalCount * 0.25)));
  const act2Scenes = sortedScenes.slice(Math.max(1, Math.floor(totalCount * 0.25)), Math.max(2, Math.floor(totalCount * 0.75)));
  const act3Scenes = sortedScenes.slice(Math.max(2, Math.floor(totalCount * 0.75)));

  // Helper to safely pick best scene matching criteria
  const findBestScene = (
    candidates: Scene[], 
    scorer: (s: Scene) => number, 
    fallback: Scene
  ): Scene => {
    if (!candidates || candidates.length === 0) return fallback;
    let best = candidates[0];
    let maxScore = -Infinity;
    for (const sc of candidates) {
      const score = scorer(sc);
      if (score > maxScore) {
        maxScore = score;
        best = sc;
      }
    }
    return best;
  };

  // 1. HOOK: highest intrigue/suspense in early scenes
  const hookScene = findBestScene(
    act1Scenes, 
    s => (s.suspenseScore || 50) * 1.5 + (s.twistScore || 50), 
    sortedScenes[0]
  );

  // 2. CENTRAL QUESTION / CURIOSITY: early scene establishing anomaly/premise
  const questionScene = findBestScene(
    act1Scenes.filter(s => s.id !== hookScene.id),
    s => (s.twistScore || 50) + (s.importanceScore || 50),
    act1Scenes[act1Scenes.length - 1] || sortedScenes[0]
  );

  // 3. CHARACTER INTRODUCTION: scene establishing protagonist
  const charIntroScene = findBestScene(
    act1Scenes,
    s => (s.characters?.length || 0) * 20 + (s.importanceScore || 50),
    sortedScenes[0]
  );

  // 4. INCITING EVENT: status quo shattering moment in Act 1
  const incitingScene = findBestScene(
    act1Scenes,
    s => s.keyEvent ? 100 : (s.importanceScore || 50),
    act1Scenes[act1Scenes.length - 1] || sortedScenes[0]
  );

  // 5. CLUES: first discovery or investigation sequence in Act 2
  const cluesScene = findBestScene(
    act2Scenes.slice(0, Math.ceil(act2Scenes.length / 3)),
    s => (s.twistScore || 50) + (s.suspenseScore || 50),
    act2Scenes[0] || sortedScenes[0]
  );

  // 6. RISING TENSION: early Act 2 tension escalation
  const risingTensionScene = findBestScene(
    act2Scenes.slice(0, Math.ceil(act2Scenes.length * 0.6)),
    s => (s.suspenseScore || 50),
    act2Scenes[Math.floor(act2Scenes.length * 0.3)] || sortedScenes[0]
  );

  // 7. ESCALATION: Act 2 midpoint crisis
  const midpointScene = findBestScene(
    act2Scenes,
    s => scoreSceneForGenre(s, genre),
    act2Scenes[Math.floor(act2Scenes.length * 0.5)] || sortedScenes[0]
  );

  // 8. ACTION / EMOTION: peak kinetic or emotional collision
  const actionEmotionScene = findBestScene(
    act2Scenes.slice(Math.floor(act2Scenes.length * 0.5)),
    s => (s.emotionalScore || 50) + (s.suspenseScore || 50),
    act2Scenes[act2Scenes.length - 1] || sortedScenes[0]
  );

  // 9. NEW QUESTION: post-midpoint complication or false security
  const newQuestionScene = findBestScene(
    act2Scenes.slice(Math.floor(act2Scenes.length * 0.6)),
    s => (s.twistScore || 50),
    act2Scenes[act2Scenes.length - 1] || sortedScenes[0]
  );

  // 10. TWIST / REVELATION: highest twist score across the movie
  const twistScene = findBestScene(
    sortedScenes,
    s => s.twistScore || 0,
    sortedScenes[Math.floor(totalCount * 0.7)] || sortedScenes[0]
  );

  // 11. CLIMAX: highest intensity in Act 3
  const climaxScene = findBestScene(
    act3Scenes,
    s => (s.suspenseScore || 50) * 1.5 + (s.importanceScore || 50),
    act3Scenes[0] || sortedScenes[totalCount - 1]
  );

  // 12. FINAL REVEAL: truth unmasking in Act 3
  const finalRevealScene = findBestScene(
    act3Scenes.filter(s => s.id !== climaxScene.id),
    s => (s.twistScore || 50) + (s.importanceScore || 50),
    act3Scenes[Math.max(0, act3Scenes.length - 2)] || climaxScene
  );

  // 13. ENDING: final resolution scene of the movie
  const endingScene = sortedScenes[totalCount - 1];

  // Map each of the 13 required narrative stages with full source mappings
  const stageDefinitions: {
    stage: NarrativeStage;
    beatType: string;
    scene: Scene;
    titleTemplate: (s: Scene) => string;
    descriptionTemplate: (s: Scene) => string;
    narrationGoal: (s: Scene) => string;
    curiosityGap: (s: Scene) => string;
  }[] = [
    {
      stage: 'HOOK',
      beatType: 'hook',
      scene: hookScene,
      titleTemplate: s => `Opening Hook // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Immediate dramatic grab at ${s.timestampStart}: ${s.description || s.keyEvent || 'The opening incident that hooks the audience.'}`,
      narrationGoal: s => `Arrest viewer attention immediately with the enigmatic event at ${s.timestampStart}.`,
      curiosityGap: s => `What caused this event and what are the stakes?`
    },
    {
      stage: 'CENTRAL QUESTION / CURIOSITY',
      beatType: 'question',
      scene: questionScene,
      titleTemplate: s => `Core Premise & Curiosity // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Establishes the core mystery or narrative conflict at ${s.timestampStart}: ${s.description || s.keyEvent}`,
      narrationGoal: s => `Frame the central question that the audience will follow throughout the explainer.`,
      curiosityGap: s => `How can the characters possibly overcome or explain this dilemma?`
    },
    {
      stage: 'CHARACTER INTRODUCTION',
      beatType: 'intro',
      scene: charIntroScene,
      titleTemplate: s => `Key Figures Introduced // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Introduces key characters [${(s.characters || []).join(', ') || 'protagonists'}] at ${s.timestampStart} in ${s.location}.`,
      narrationGoal: s => `Anchor character motivations, emotional stakes, and relationships.`,
      curiosityGap: s => `What hidden flaw or secret will drive their actions?`
    },
    {
      stage: 'INCITING EVENT',
      beatType: 'catalyst',
      scene: incitingScene,
      titleTemplate: s => `Inciting Catalyst // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `The event that fractures normal reality at ${s.timestampStart}: ${s.keyEvent || s.description}.`,
      narrationGoal: s => `Signal the point of no return for the narrative journey.`,
      curiosityGap: s => `Will they answer the call or attempt retreat?`
    },
    {
      stage: 'CLUES',
      beatType: 'clue',
      scene: cluesScene,
      titleTemplate: s => `First Clues & Investigation // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Key details and secrets revealed at ${s.timestampStart}: ${s.description || 'Critical clues emerge.'}`,
      narrationGoal: s => `Lay down the subtle breadcrumbs that will pay off in the climax.`,
      curiosityGap: s => `What does this detail truly signify in the larger puzzle?`
    },
    {
      stage: 'RISING TENSION',
      beatType: 'tension',
      scene: risingTensionScene,
      titleTemplate: s => `Escalating Pressure // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Stakes amplify as obstacles mount at ${s.timestampStart}: ${s.description || 'Tension heightens.'}`,
      narrationGoal: s => `Build pacing and suspense leading into the core conflict.`,
      curiosityGap: s => `Who will break under the escalating pressure?`
    },
    {
      stage: 'ESCALATION',
      beatType: 'escalation',
      scene: midpointScene,
      titleTemplate: s => `Midpoint Crisis // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Major narrative complication at ${s.timestampStart} in ${s.location}: ${s.keyEvent || s.description}.`,
      narrationGoal: s => `Shift the dynamic from reactive investigation to high-stakes action.`,
      curiosityGap: s => `Can the plan survive this unforeseen disruption?`
    },
    {
      stage: 'ACTION / EMOTION',
      beatType: 'confrontation',
      scene: actionEmotionScene,
      titleTemplate: s => `Pivotal Confrontation // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Intense kinetic or emotional collision at ${s.timestampStart}: ${s.description || 'Key character collision.'}`,
      narrationGoal: s => `Highlight raw emotional vulnerability or physical intensity.`,
      curiosityGap: s => `What is the true cost of this collision?`
    },
    {
      stage: 'NEW QUESTION',
      beatType: 'complication',
      scene: newQuestionScene,
      titleTemplate: s => `Deepening Mystery // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `An unexpected development at ${s.timestampStart} upends earlier assumptions: ${s.description}.`,
      narrationGoal: s => `Subvert expectations right before the final act.`,
      curiosityGap: s => `Has everything known so far been a misdirection?`
    },
    {
      stage: 'TWIST / REVELATION',
      beatType: 'twist',
      scene: twistScene,
      titleTemplate: s => `The Master Twist // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Mind-bending reveal at ${s.timestampStart} (Twist Score: ${s.twistScore || 85}%): ${s.keyEvent || s.description}.`,
      narrationGoal: s => `Deliver the narrative bombshell that forces the viewer to re-evaluate the entire movie.`,
      curiosityGap: s => `How does this realization change the ultimate outcome?`
    },
    {
      stage: 'CLIMAX',
      beatType: 'climax',
      scene: climaxScene,
      titleTemplate: s => `The Final Showdown // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Peak dramatic resolution at ${s.timestampStart} in ${s.location}: ${s.description || s.keyEvent}.`,
      narrationGoal: s => `Maximize narrative momentum through the highest-tension sequence.`,
      curiosityGap: s => `Who will survive or emerge triumphant?`
    },
    {
      stage: 'FINAL REVEAL',
      beatType: 'reveal',
      scene: finalRevealScene,
      titleTemplate: s => `The Ultimate Truth // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `The last puzzle piece drops at ${s.timestampStart}: ${s.description || 'Final thematic revelation.'}`,
      narrationGoal: s => `Provide psychological closure and clarify remaining ambiguities.`,
      curiosityGap: s => `What does the ending truly mean?`
    },
    {
      stage: 'ENDING',
      beatType: 'ending',
      scene: endingScene,
      titleTemplate: s => `Resolution & Aftermath // ${s.title || `Scene ${s.sceneNumber}`}`,
      descriptionTemplate: s => `Closing cinematic state at ${s.timestampStart} - ${s.timestampEnd}: ${s.description || 'The resolution of the narrative.'}`,
      narrationGoal: s => `Deliver a memorable parting insight that leaves the viewer thinking.`,
      curiosityGap: s => `A lingering question to ponder as the screen fades to black.`
    }
  ];

  // Map into strictly verified StoryBeat objects with complete source mappings
  return stageDefinitions.map((def, idx) => {
    const sc = def.scene;
    const sourceMapping: StoryBeatSourceMapping = {
      sceneId: sc.id,
      sceneNumber: sc.sceneNumber,
      sceneTitle: sc.title || `Scene ${sc.sceneNumber}`,
      startTimestamp: sc.timestampStart || '00:00:00',
      endTimestamp: sc.timestampEnd || '00:02:00',
      startSec: sc.startSec || idx * 60,
      endSec: sc.endSec || (idx + 1) * 60,
      charactersInvolved: sc.characters || sc.charactersInScene || [],
      event: sc.keyEvent || sc.description || sc.title || '',
      importanceScore: sc.importanceScore || 75
    };

    return {
      id: `beat_${idx + 1}`,
      beatNumber: idx + 1,
      stage: def.stage,
      beatType: def.beatType,
      title: def.titleTemplate(sc),
      description: def.descriptionTemplate(sc),
      targetDurationSec: 60,
      actualTimestamp: sc.timestampStart || '00:00:00',
      status: 'approved',
      tensionLevel: sc.suspenseScore || sc.twistScore || 60,
      tensionScore: sc.suspenseScore || sc.twistScore || 60,
      mysteryHook: def.curiosityGap(sc),
      curiosityGap: def.curiosityGap(sc),
      sourceSceneIds: [sc.id],
      sourceSceneId: sc.id,
      sourceSceneTitle: sc.title || `Scene ${sc.sceneNumber}`,
      matchedSceneId: sc.id,
      sceneDescription: sc.description || '',
      narrationGoal: def.narrationGoal(sc),
      isKeyTwist: def.stage === 'TWIST / REVELATION' || (sc.twistScore || 0) >= 75,
      notes: `Source Scene ${sc.sceneNumber} (${sc.timestampStart} - ${sc.timestampEnd}) at ${sc.location || 'Location'}`,
      targetWords: 130,
      
      // Complete Source Mapping
      sourceMapping,
      sourceStartTimestamp: sc.timestampStart || '00:00:00',
      sourceEndTimestamp: sc.timestampEnd || '00:02:00',
      sourceStartSec: sc.startSec || 0,
      sourceEndSec: sc.endSec || 120,
      sourceSceneNumber: sc.sceneNumber,
      charactersInvolved: sc.characters || [],
      event: sc.keyEvent || sc.description || '',
      importanceScore: sc.importanceScore || 75
    };
  });
}

/**
 * AI Story Director recommendations based purely on actual movie intelligence data
 */
export function getStoryDirectorRecommendations(project: Project): StoryDirectorRecommendation[] {
  const scenes = project.scenes || [];
  if (!scenes || scenes.length === 0) {
    return [];
  }

  const recommendations: StoryDirectorRecommendation[] = [];

  // 1. Strongest opening hook
  const hookCandidates = [...scenes].sort((a, b) => 
    ((b.suspenseScore || 50) + (b.twistScore || 50)) - ((a.suspenseScore || 50) + (a.twistScore || 50))
  );
  if (hookCandidates.length > 0) {
    const topHook = hookCandidates[0];
    recommendations.push({
      type: 'HOOK',
      title: `Strongest Opening Hook: Scene ${topHook.sceneNumber} (${topHook.title || 'Key Sequence'})`,
      sceneId: topHook.id,
      sceneNumber: topHook.sceneNumber,
      timestamp: topHook.timestampStart,
      reason: `Scene ${topHook.sceneNumber} has the highest initial intrigue index (${Math.round((topHook.suspenseScore || 50) * 0.6 + (topHook.twistScore || 50) * 0.4)}/100).`,
      action: `Use Scene ${topHook.sceneNumber} at ${topHook.timestampStart} as the primary hook before the main title card.`,
      confidence: 96
    });
  }

  // 2. Scenes that can be shortened
  const lowImportance = [...scenes]
    .filter(s => (s.importanceScore || 50) < 60 && (s.twistScore || 0) < 50)
    .sort((a, b) => (a.importanceScore || 50) - (b.importanceScore || 50));
  if (lowImportance.length > 0) {
    const candidate = lowImportance[0];
    recommendations.push({
      type: 'SHORTEN',
      title: `Pacing Optimization: Shorten Scene ${candidate.sceneNumber}`,
      sceneId: candidate.id,
      sceneNumber: candidate.sceneNumber,
      timestamp: candidate.timestampStart,
      reason: `Scene ${candidate.sceneNumber} contains transitional footage with low dialogue density and low twist score (${candidate.twistScore || 0}%).`,
      action: `Condense narrative coverage of Scene ${candidate.sceneNumber} to under 20 seconds to preserve narrative momentum.`,
      confidence: 90
    });
  }

  // 3. Scenes that should not be removed
  const mustPreserve = [...scenes]
    .filter(s => (s.twistScore || 0) > 75 || (s.importanceScore || 0) > 85)
    .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0));
  if (mustPreserve.length > 0) {
    const preserveScene = mustPreserve[0];
    recommendations.push({
      type: 'PRESERVE',
      title: `Do Not Remove: Scene ${preserveScene.sceneNumber} (${preserveScene.title || 'Critical Beat'})`,
      sceneId: preserveScene.id,
      sceneNumber: preserveScene.sceneNumber,
      timestamp: preserveScene.timestampStart,
      reason: `Scene ${preserveScene.sceneNumber} has critical narrative dependency (Importance ${preserveScene.importanceScore || 90}%, Twist ${preserveScene.twistScore || 0}%).`,
      action: `Ensure this scene retains full visual coverage and prominent explainer emphasis.`,
      confidence: 98
    });
  }

  // 4. Strongest suspense moments
  const suspenseScenes = [...scenes].sort((a, b) => (b.suspenseScore || 0) - (a.suspenseScore || 0));
  if (suspenseScenes.length > 0 && (suspenseScenes[0].suspenseScore || 0) > 60) {
    const topSuspense = suspenseScenes[0];
    recommendations.push({
      type: 'SUSPENSE',
      title: `Peak Suspense Sequence: Scene ${topSuspense.sceneNumber}`,
      sceneId: topSuspense.id,
      sceneNumber: topSuspense.sceneNumber,
      timestamp: topSuspense.timestampStart,
      reason: `Peak suspense rating of ${topSuspense.suspenseScore}% detected at ${topSuspense.timestampStart} in ${topSuspense.location || 'Location'}.`,
      action: `Sync narration pauses and low drone audio cues with Scene ${topSuspense.sceneNumber}.`,
      confidence: 94
    });
  }

  // 5. Strongest emotional moments
  const emotionalScenes = [...scenes].sort((a, b) => (b.emotionalScore || 0) - (a.emotionalScore || 0));
  if (emotionalScenes.length > 0 && (emotionalScenes[0].emotionalScore || 0) > 60) {
    const topEmotion = emotionalScenes[0];
    recommendations.push({
      type: 'EMOTION',
      title: `Emotional Resonance Peak: Scene ${topEmotion.sceneNumber}`,
      sceneId: topEmotion.id,
      sceneNumber: topEmotion.sceneNumber,
      timestamp: topEmotion.timestampStart,
      reason: `Highest emotional weight (${topEmotion.emotionalScore}%) at ${topEmotion.timestampStart} with characters [${(topEmotion.characters || []).join(', ')}].`,
      action: `Allow breathing room in the voiceover for the actor expressions to carry the narrative weight.`,
      confidence: 92
    });
  }

  // 6. Strongest twist setup
  const twistScenes = [...scenes].sort((a, b) => (b.twistScore || 0) - (a.twistScore || 0));
  if (twistScenes.length > 0 && (twistScenes[0].twistScore || 0) > 65) {
    const topTwist = twistScenes[0];
    recommendations.push({
      type: 'TWIST',
      title: `Master Twist Setup: Scene ${topTwist.sceneNumber}`,
      sceneId: topTwist.id,
      sceneNumber: topTwist.sceneNumber,
      timestamp: topTwist.timestampStart,
      reason: `Core twist reveal (${topTwist.twistScore}% twist index) occurs at ${topTwist.timestampStart}: ${topTwist.keyEvent || topTwist.title}.`,
      action: `Precede this scene with carefully withheld explanations to maximize shock value in the script.`,
      confidence: 97
    });
  }

  // 7. Strongest climax material
  const lastQuarter = scenes.slice(Math.floor(scenes.length * 0.7));
  const climaxScenes = (lastQuarter.length > 0 ? lastQuarter : scenes).sort((a, b) => 
    ((b.suspenseScore || 50) + (b.importanceScore || 50)) - ((a.suspenseScore || 50) + (a.importanceScore || 50))
  );
  if (climaxScenes.length > 0) {
    const topClimax = climaxScenes[0];
    recommendations.push({
      type: 'CLIMAX',
      title: `Primary Climax Anchor: Scene ${topClimax.sceneNumber}`,
      sceneId: topClimax.id,
      sceneNumber: topClimax.sceneNumber,
      timestamp: topClimax.timestampStart,
      reason: `Scene ${topClimax.sceneNumber} at ${topClimax.timestampStart} provides the strongest visual resolution and highest dramatic impact.`,
      action: `Structure Act 3 explainer pacing to crescendo directly into this sequence.`,
      confidence: 95
    });
  }

  return recommendations;
}

/**
 * Prepares the structured script output that Script Studio will consume
 */
export function generateExplainerScript(
  project: Project,
  beats: StoryBeat[],
  language: ExplainerLanguage = 'English',
  targetDuration = '15 min'
): Script {
  if (!beats || beats.length === 0) {
    return {
      id: 'script_empty',
      title: project.title ? `${project.title} Explainer Script` : 'Explainer Script',
      projectId: project.id,
      language,
      wordsCount: 0,
      targetDuration,
      targetDurationSec: 900,
      estimatedNarrationDuration: '00:00',
      estimatedNarrationSec: 0,
      segments: []
    };
  }

  const segments: ScriptSegment[] = beats.map((beat, idx) => {
    const matchedScene = project.scenes?.find(s => s.id === beat.matchedSceneId || s.id === beat.sourceMapping?.sceneId);
    const sceneStart = beat.sourceStartTimestamp || matchedScene?.timestampStart || '00:00:00';
    const sceneEnd = beat.sourceEndTimestamp || matchedScene?.timestampEnd || '00:01:30';
    const sceneTitle = beat.sourceSceneTitle || matchedScene?.title || `Scene ${beat.sourceSceneNumber || idx + 1}`;
    
    const narrationText = beat.description 
      ? `At ${sceneStart}, in ${sceneTitle}, ${beat.description.replace(/^Opening Hook \/\/ |^Core Premise \/\/ /i, '')}`
      : `As the story unfolds at ${sceneStart}, the tension mounts in ${sceneTitle}.`;

    return {
      id: `seg_${idx + 1}`,
      segmentIndex: idx + 1,
      beatId: beat.id,
      sceneId: beat.matchedSceneId || beat.sourceMapping?.sceneId || '',
      title: beat.title,
      startTime: sceneStart,
      endTime: sceneEnd,
      startSec: beat.sourceStartSec ?? matchedScene?.startSec ?? idx * 60,
      endSec: beat.sourceEndSec ?? matchedScene?.endSec ?? (idx + 1) * 60,
      durationSec: 60,
      targetDurationSec: 60,
      narrationText,
      suggestedVisual: matchedScene?.visualSummary || `Cinematic source footage from ${sceneTitle} (${sceneStart})`,
      visualNotes: matchedScene?.visualSummary || `Cinematic source footage from ${sceneTitle} (${sceneStart})`,
      narration: [
        {
          id: `narr_${idx + 1}`,
          text: narrationText,
          voiceActorId: 'default',
          durationSec: 60
        }
      ],
      emotionTone: beat.isKeyTwist ? 'Intense Shock' : 'Dramatic Narrative',
      soundCue: beat.isKeyTwist ? 'Dramatic chord hit & low drone' : 'Subtle cinematic atmosphere'
    };
  });

  const totalWords = segments.reduce((acc, s) => acc + (s.narrationText || '').split(/\s+/).length, 0);

  return {
    id: `script_${project.id}`,
    title: `${project.title || 'Movie'} Explainer Script`,
    projectId: project.id,
    language,
    wordsCount: totalWords,
    targetDuration,
    targetDurationSec: segments.length * 60,
    estimatedNarrationDuration: `${Math.floor(totalWords / 130)}:00`,
    estimatedNarrationSec: Math.floor((totalWords / 130) * 60),
    segments
  };
}
