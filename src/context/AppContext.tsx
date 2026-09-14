/**
 * THE DEVIL'S EYE - Central Application State Context
 * Orchestrates authentic cinema AI pipeline state, navigation, projects, and logs.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode, useMemo } from 'react';
import { Project, PageId, SystemLog, AICommandLog, StoryVersion, ScriptVersion, Timeline, TimelineVersion, Subtitle, MasterNarratorProfile, MovieRecord, AnalysisJob, MediaFileRecord, EyeConfig, EyeColorPreset, EyeResponseMode } from '../types';
import { DevilEyeState } from '../components/common/DevilEye';
import { DEFAULT_EYE_CONFIG, COLOR_PRESETS } from '../services/eyeConfigDefaults';
import { DEMO_PROJECTS } from '../services/demoData';
import { generateAnalyzedProjectData } from '../services/aiIntelligenceEngine';
import { generateStoryBeats, generateExplainerScript } from '../services/storyEngineService';
import { generateAiFirstCut, FIRST_CUT_STAGES, FirstCutResult } from '../services/aiFirstCutService';
import { executeAiEditorCommand } from '../services/aiEditorService';
import { executeGlobalAiDirector, executeDirectorCommand } from '../services/aiDirectorService';
import { storageService } from '../services/storageService';
import { TimelineHistory } from '../services/timelineHistory';
import { repairProjectVoiceConsistency } from '../services/voiceConsistencyService';
import { playHudClick, playHudSuccess, playHudWarning, playHudScan, setSoundMuted, getSoundMuted } from '../services/soundFx';
import { uploadMovieFile, fetchMovieStatus, triggerAiAnalysis, fetchAnalysisJob, fetchLatestJobForMovie, fetchAllMovies, deleteMovieRecord } from '../services/moviePipelineApi';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

interface AppContextType {
  isAuthenticated: boolean;
  user: { name: string; role: string; email: string } | null;
  activePage: PageId;
  navigateTo: (page: PageId) => void;
  loginWithGoogle: () => void;
  loginAsGuest: () => void;
  logout: () => void;
  
  // Projects
  projects: Project[];
  currentProject: Project;
  setCurrentProjectId: (id: string) => void;
  createProject: (newProj: Partial<Project>) => void;
  updateCurrentProject: (updates: Partial<Project>) => void;

  // Movie Upload & Gemini Pipeline
  activeMovieRecord?: MovieRecord;
  activeAnalysisJob?: AnalysisJob | null;
  isMovieUploading: boolean;
  movieUploadProgress: number;
  uploadMovie: (file: File, metadata?: { duration?: number; resolution?: string; fps?: number }) => Promise<MovieRecord>;
  startAnalysisJob: () => Promise<void>;
  checkMovieGeminiStatus: () => Promise<MovieRecord | null>;
  isIngestionCenterOpen: boolean;
  setIsIngestionCenterOpen: (open: boolean) => void;
  movieLibraryList: MovieRecord[];
  refreshMovieLibrary: () => Promise<MovieRecord[]>;
  selectMovieFromLibrary: (movie: MovieRecord) => Promise<void>;
  deleteMovie: (movieId: string) => Promise<void>;

  // Two-way Script <-> Scene Linking
  selectedSegmentId: string;
  setSelectedSegmentId: (id: string) => void;
  selectedSceneId: string | null;
  setSelectedSceneId: (id: string | null) => void;

  // Story & Script Versioning
  saveStoryVersion: (name?: string) => void;
  restoreStoryVersion: (versionId: string) => void;
  saveScriptVersion: (name?: string) => void;
  restoreScriptVersion: (versionId: string) => void;
  runStoryDirectorCommand: (command: string) => Promise<string>;

  // Master Voice System
  updateMasterVoiceIdentity: (gender: 'male' | 'female', voiceId: string, language?: string) => void;
  updateMasterNarratorProfile: (partial: Partial<MasterNarratorProfile>) => void;
  repairVoiceConsistency: () => { repairedCount: number };

  // Timeline, Versions & AI Editor
  saveTimelineVersion: (name?: string, description?: string) => void;
  restoreTimelineVersion: (versionId: string) => void;
  runAiFirstCut: () => Promise<FirstCutResult>;
  isFirstCutRunning: boolean;
  firstCutStage: string;
  firstCutProgress: number;
  runAiEditorCommand: (command: string, selectedClipId?: string | null) => Promise<string>;
  recordTimelineAction: (description: string, newTimeline: Timeline) => void;
  undoTimeline: () => boolean;
  redoTimeline: () => boolean;
  canUndoTimeline: boolean;
  canRedoTimeline: boolean;
  timelineHistoryList: { id: string; description: string; timestamp: string }[];
  
  // AI Command
  isAiThinking: boolean;
  aiOperationStatus: string;
  executeAiCommand: (prompt: string) => Promise<string>;
  aiLogs: AICommandLog[];
  
  // System Health
  systemStatus: 'ONLINE' | 'STANDBY' | 'ANALYZING' | 'RENDERING';
  aiCoreVersion: string;
  gpuUsage: number;
  memUsage: number;
  tokensUsed: number;
  systemLogs: SystemLog[];
  addLog: (message: string, level?: 'info' | 'warn' | 'error' | 'success' | 'ai') => void;
  
  // Sound & HUD
  soundMuted: boolean;
  toggleSound: () => void;
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
  removeToast: (id: string) => void;
  
  // Export flow
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isExporting: boolean;
  exportProgress: number;
  exportFormat: string;
  startExport: (format: string) => void;

  // Mobile Navigation
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Devil's Eye Global AI Identity & Control
  eyeConfig: EyeConfig;
  updateEyeConfig: (updates: Partial<EyeConfig>) => void;
  resetEyeConfig: () => void;
  saveEyeConfig: () => void;
  importEyeConfig: (jsonString: string) => boolean;
  exportEyeConfig: () => string;
  devilEyeState: DevilEyeState;
  setDevilEyeStateOverride: (state: DevilEyeState | null) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'devils_eye_projects_v1';
const AUTH_KEY = 'devils_eye_auth_v1';
const EYE_STORAGE_KEY = 'devils_eye_config_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved).isAuthenticated : false;
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved).user : null;
    } catch {
      return null;
    }
  });

  // Navigation
  const [activePage, setActivePage] = useState<PageId>('command-center');

  // Projects - pure persistent state, without fake data injection
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEMO_PROJECTS;
  });

  const [currentProjectId, setCurrentProjectIdState] = useState<string>(DEMO_PROJECTS[0].id);

  // Two-way Script <-> Scene Selection Synchronization
  const [selectedSegmentId, setSelectedSegmentIdState] = useState<string>('seg-1');
  const [selectedSceneId, setSelectedSceneIdState] = useState<string | null>(null);

  // Timeline History & AI First Cut Engine States
  const timelineHistoryRef = useRef<TimelineHistory>(new TimelineHistory(50));
  const [historyCounter, setHistoryCounter] = useState<number>(0);
  const [isFirstCutRunning, setIsFirstCutRunning] = useState<boolean>(false);
  const [firstCutStage, setFirstCutStage] = useState<string>('ANALYZING');
  const [firstCutProgress, setFirstCutProgress] = useState<number>(0);

  // Movie Pipeline & Gemini States
  const [isMovieUploading, setIsMovieUploading] = useState<boolean>(false);
  const [movieUploadProgress, setMovieUploadProgress] = useState<number>(0);
  const [activeAnalysisJob, setActiveAnalysisJob] = useState<AnalysisJob | null>(null);
  const [isIngestionCenterOpen, setIsIngestionCenterOpen] = useState<boolean>(false);
  const [movieLibraryList, setMovieLibraryList] = useState<MovieRecord[]>([]);

  // System status
  const [systemStatus, setSystemStatus] = useState<'ONLINE' | 'STANDBY' | 'ANALYZING' | 'RENDERING'>('ONLINE');
  const aiCoreVersion = 'v2.8.1 - MULTIMODAL CINEMA CORE';
  const [gpuUsage, setGpuUsage] = useState<number>(78);
  const [memUsage, setMemUsage] = useState<number>(62);
  const [tokensUsed, setTokensUsed] = useState<number>(14280);

  // Audio feedback
  const [soundMuted, setSoundMutedState] = useState<boolean>(getSoundMuted());

  // Mobile sidebar navigation state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // AI Command state
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [aiOperationStatus, setAiOperationStatus] = useState<string>('Ready for next command');
  const [aiLogs, setAiLogs] = useState<AICommandLog[]>([]);

  // Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<string>('YouTube (16:9 4K)');

  // Devil's Eye Global Configuration & AI Identity State
  const [eyeConfig, setEyeConfig] = useState<EyeConfig>(() => {
    try {
      const saved = localStorage.getItem(EYE_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_EYE_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_EYE_CONFIG;
  });

  const [eyeStateOverride, setEyeStateOverride] = useState<DevilEyeState | null>(null);

  // Compute real Devil's Eye state based on live system events
  const devilEyeState = useMemo<DevilEyeState>(() => {
    if (eyeStateOverride) return eyeStateOverride;
    if (isMovieUploading) return 'PROCESSING';
    if (activeAnalysisJob?.status === 'RUNNING') return 'ANALYZING';
    if (isAiThinking) return 'THINKING';
    if (isExporting) return 'PROCESSING';
    if (activeAnalysisJob?.status === 'FAILED') return 'ERROR';
    if (activeAnalysisJob?.status === 'COMPLETED') return 'SUCCESS';
    if (activePage === 'movie-intelligence') return 'FOCUS';
    if (activePage === 'eye-control') return 'WATCHING';
    return 'IDLE';
  }, [
    eyeStateOverride,
    isMovieUploading,
    activeAnalysisJob?.status,
    isAiThinking,
    isExporting,
    activePage
  ]);

  const updateEyeConfig = useCallback((updates: Partial<EyeConfig>) => {
    setEyeConfig(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(EYE_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const resetEyeConfig = useCallback(() => {
    setEyeConfig(DEFAULT_EYE_CONFIG);
    try {
      localStorage.setItem(EYE_STORAGE_KEY, JSON.stringify(DEFAULT_EYE_CONFIG));
    } catch {}
    playHudSuccess();
  }, []);

  const saveEyeConfig = useCallback(() => {
    try {
      localStorage.setItem(EYE_STORAGE_KEY, JSON.stringify(eyeConfig));
      playHudSuccess();
    } catch {}
  }, [eyeConfig]);

  const importEyeConfig = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        const validated: EyeConfig = { ...DEFAULT_EYE_CONFIG, ...parsed };
        setEyeConfig(validated);
        localStorage.setItem(EYE_STORAGE_KEY, JSON.stringify(validated));
        playHudSuccess();
        return true;
      }
    } catch {}
    playHudWarning();
    return false;
  }, []);

  const exportEyeConfig = useCallback((): string => {
    return JSON.stringify(eyeConfig, null, 2);
  }, [eyeConfig]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // System Logs
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    { id: '1', timestamp: '12:42:17', level: 'ai', message: 'Initializing Cinema AI Multimodal Engine...' },
    { id: '2', timestamp: '12:42:19', level: 'info', message: 'Loading video stream Inception.mp4 (1080p, 24fps)...' },
    { id: '3', timestamp: '12:42:20', level: 'info', message: 'Extracting 8,880 keyframes & color histograms...' },
    { id: '4', timestamp: '12:43:05', level: 'info', message: 'Analyzing audio spectrum & dialogue channel separation...' },
    { id: '5', timestamp: '12:43:42', level: 'ai', message: 'Facial detection: Leonardo DiCaprio (98%), Elliot Page (94%)...' },
    { id: '6', timestamp: '12:44:33', level: 'info', message: 'Mapping 3D nonlinear story graph: 9 core narrative nodes...' },
    { id: '7', timestamp: '12:45:21', level: 'ai', message: 'Drafting 8-act explainer script: 24:32 target duration...' },
    { id: '8', timestamp: '12:46:02', level: 'success', message: 'Analysis complete. Devil\'s Eye Core Ready.' },
  ]);

  const addLog = useCallback((message: string, level: 'info' | 'warn' | 'error' | 'success' | 'ai' = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newLog: SystemLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: timeStr,
      level,
      message,
    };
    setSystemLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, []);

  const addToast = useCallback((title: string, message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, title, message, type }]);
    if (type === 'error' || type === 'warn') {
      playHudWarning();
    } else {
      playHudSuccess();
    }
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundMuted;
    setSoundMutedState(next);
    setSoundMuted(next);
    if (!next) {
      playHudSuccess();
      addToast('Audio System', 'Futuristic HUD feedback audio enabled', 'info');
    } else {
      addToast('Audio System', 'HUD audio muted', 'info');
    }
  }, [soundMuted, addToast]);

  const navigateTo = useCallback((page: PageId) => {
    playHudClick();
    setActivePage(page);
    setIsMobileSidebarOpen(false);
    addLog(`Navigated to module [${page.toUpperCase().replace('-', ' ')}]`, 'info');
  }, [addLog]);

  // Persist projects
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
      const curr = projects.find(p => p.id === currentProjectId);
      if (curr) {
        storageService.saveProject(curr);
      }
    } catch {
      // storage limit safe fallback
    }
  }, [projects, currentProjectId]);

  // Dynamic GPU/MEM simulated jitter for authentic futuristic telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setGpuUsage(prev => {
        const delta = (Math.random() - 0.48) * 4;
        return Math.min(96, Math.max(65, Math.round(prev + delta)));
      });
      setMemUsage(prev => {
        const delta = (Math.random() - 0.49) * 3;
        return Math.min(88, Math.max(54, Math.round(prev + delta)));
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0] || DEMO_PROJECTS[0];

  const setCurrentProjectId = useCallback((id: string) => {
    playHudClick();
    setCurrentProjectIdState(id);
    const target = projects.find(p => p.id === id);
    if (target) {
      addLog(`Activated project: ${target.title}`, 'info');
      addToast('Project Switched', target.title, 'info');
    }
  }, [projects, addLog, addToast]);

  const createProject = useCallback((newProj: Partial<Project>) => {
    playHudSuccess();
    const id = `proj-${Date.now()}`;
    const project: Project = {
      ...DEMO_PROJECTS[0],
      id,
      title: newProj.title || 'Untitled Cinema Explainer',
      type: newProj.type || 'movie',
      director: newProj.director || 'Unknown Director',
      year: newProj.year || new Date().getFullYear(),
      genre: newProj.genre || ['Drama', 'Mystery'],
      synopsis: newProj.synopsis || 'Pending AI cinema ingestion...',
      duration: newProj.duration || '02:00:00',
      durationSec: 7200,
      resolution: newProj.resolution || '1080p (1920x1080)',
      fps: 24,
      posterUrl: newProj.posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
      status: 'ingested',
      lastEdited: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
      ...newProj,
    };

    setProjects(prev => [project, ...prev]);
    setCurrentProjectIdState(id);
    addLog(`Initialized new project [${project.title}]`, 'success');
    addToast('Project Created', `${project.title} added to Devil's Eye Core`, 'success');
  }, [addLog, addToast]);

  const updateCurrentProject = useCallback((updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === currentProject.id) {
        return { ...p, ...updates, lastEdited: 'Just now' };
      }
      return p;
    }));
  }, [currentProject.id]);

  // Real Movie Upload & Gemini Pipeline Operations
  const refreshMovieLibrary = useCallback(async (): Promise<MovieRecord[]> => {
    try {
      const list = await fetchAllMovies();
      setMovieLibraryList(list);
      return list;
    } catch (e) {
      console.warn('Could not load movie library:', e);
      return [];
    }
  }, []);

  const selectMovieFromLibrary = useCallback(async (movie: MovieRecord) => {
    playHudClick();
    localStorage.setItem('devil_eye_active_movie_id', movie.id);

    const mediaEntry: MediaFileRecord = {
      id: movie.id,
      name: movie.originalName,
      type: 'video',
      size: movie.fileSize,
      fileSizeFormatted: movie.fileSizeFormatted,
      duration: movie.duration || 7200,
      durationFormatted: movie.durationFormatted || '02:00:00',
      resolution: movie.resolution || '1080p',
      fps: movie.fps || 24,
      audioTracksCount: 2,
      audioCodec: 'AAC / 48kHz Stereo',
      subtitleTracksCount: 0,
      subtitleTracks: [],
      status: movie.status === 'ACTIVE' ? 'ready' : movie.status === 'FAILED' ? 'error' : 'processing',
      url: movie.url || '',
      uploadedAt: movie.uploadTimestamp,
    };

    // Check if an analysis job already exists for this movie
    const latestJob = await fetchLatestJobForMovie(movie.id).catch(() => null);
    const isJobCompleted = latestJob?.status === 'COMPLETED';

    updateCurrentProject({
      title: movie.originalName.replace(/\.[^/.]+$/, '').toUpperCase(),
      activeMovieRecord: movie,
      videoSourceUrl: movie.url,
      mediaFiles: [mediaEntry],
      duration: movie.durationFormatted || '02:00:00',
      durationSec: movie.duration || 7200,
      resolution: movie.resolution || '1080p',
      fps: movie.fps || 24,
      status: movie.status === 'ACTIVE' ? 'ingested' : 'uploading',
      analysisStatus: isJobCompleted ? 'ANALYSIS COMPLETE' : 'NOT ANALYZED',
      activeJobId: latestJob ? latestJob.id : undefined,
      scenes: isJobCompleted && latestJob?.result?.scenes ? latestJob.result.scenes.map((s: any, idx: number) => ({
        id: `scene-${String(idx + 1).padStart(3, '0')}`,
        sceneNumber: s.sceneNumber || idx + 1,
        title: s.title || `Scene ${idx + 1}`,
        timestampStart: s.timestampStart || '00:00:00',
        timestampEnd: s.timestampEnd || '00:02:00',
        startSec: s.startSec || 0,
        endSec: s.endSec || 120,
        durationSec: (s.endSec || 120) - (s.startSec || 0),
        location: s.location || 'Location',
        timeOfDay: s.timeOfDay || 'day',
        characters: s.characters || [],
        dialogueLines: [],
        audioTranscript: '',
        keyEvent: s.keyEvent || '',
        twistScore: s.twistScore || 50,
        suspenseScore: s.suspenseScore || 50,
        emotionalScore: s.emotionalScore || 50,
        visualSummary: s.visualSummary || '',
        tags: s.tags || [],
        importanceScore: s.importanceScore || 75,
        isCandidateForCut: true,
        isLocked: false,
        isExcluded: false,
      })) : [],
      characters: isJobCompleted && latestJob?.result?.characters ? latestJob.result.characters.map((c: any, idx: number) => ({
        id: c.id || `char-${idx + 1}`,
        name: c.name || `Character ${idx + 1}`,
        actor: c.actor || 'Actor',
        role: c.role || 'supporting',
        archetype: c.archetype || 'Key Figure',
        confidence: c.confidence || 95,
        screenTimeMinutes: c.screenTimeMinutes || 15,
        description: c.description || '',
        relationships: [],
      })) : [],
    });

    setActiveAnalysisJob(latestJob || null);
    addToast('Movie Loaded', `Selected "${movie.originalName}" from Movie Library`, 'success');
    addLog(`[MOVIE PIPELINE] Active movie set to "${movie.originalName}" (${movie.id})`, 'info');
  }, [updateCurrentProject, addToast, addLog]);

  const deleteMovie = useCallback(async (movieId: string) => {
    playHudClick();
    try {
      await deleteMovieRecord(movieId);
      await refreshMovieLibrary();
      if (currentProject.activeMovieRecord?.id === movieId) {
        updateCurrentProject({
          activeMovieRecord: undefined,
          videoSourceUrl: '',
          mediaFiles: [],
          analysisStatus: 'NOT ANALYZED',
          scenes: [],
          characters: [],
        });
        localStorage.removeItem('devil_eye_active_movie_id');
      }
      addToast('Movie Deleted', 'Movie record removed from system', 'info');
      addLog(`[MOVIE PIPELINE] Movie ${movieId} deleted from storage`, 'info');
    } catch (err: any) {
      addToast('Delete Failed', err.message || 'Could not delete movie', 'error');
    }
  }, [currentProject.activeMovieRecord, refreshMovieLibrary, updateCurrentProject, addToast, addLog]);

  // Initial load of movie library and active movie preservation
  useEffect(() => {
    refreshMovieLibrary().then(async (movies) => {
      if (!movies || movies.length === 0) return;
      const savedActiveMovieId = localStorage.getItem('devil_eye_active_movie_id');
      const movieToSelect = (savedActiveMovieId && movies.find(m => m.id === savedActiveMovieId)) || movies[0];
      if (movieToSelect) {
        selectMovieFromLibrary(movieToSelect);
      }
    });
  }, []);

  const uploadMovie = useCallback(async (
    file: File,
    metadata?: { duration?: number; resolution?: string; fps?: number }
  ): Promise<MovieRecord> => {
    setIsMovieUploading(true);
    setMovieUploadProgress(0);
    addLog(`[MOVIE PIPELINE] Initiating upload for "${file.name}"...`, 'info');
    addToast('Movie Upload Initialized', `Uploading ${file.name} to server & Gemini Files API`, 'info');

    try {
      const record = await uploadMovieFile(
        file,
        {
          ...metadata,
          projectId: currentProject.id,
        },
        (pct) => {
          setMovieUploadProgress(pct);
        }
      );

      setIsMovieUploading(false);
      setMovieUploadProgress(100);

      localStorage.setItem('devil_eye_active_movie_id', record.id);
      await refreshMovieLibrary();

      const mediaEntry: MediaFileRecord = {
        id: record.id,
        name: record.originalName,
        type: 'video',
        size: record.fileSize,
        fileSizeFormatted: record.fileSizeFormatted,
        duration: record.duration || 7200,
        durationFormatted: record.durationFormatted || '02:00:00',
        resolution: record.resolution || '1080p',
        fps: record.fps || 24,
        audioTracksCount: 2,
        audioCodec: 'AAC / 48kHz Stereo',
        subtitleTracksCount: 0,
        subtitleTracks: [],
        status: record.status === 'FAILED' ? 'error' : record.status === 'ACTIVE' ? 'ready' : 'processing',
        url: record.url || '',
        uploadedAt: record.uploadTimestamp,
      };

      const updatedMedia = [mediaEntry, ...(currentProject.mediaFiles || []).filter(m => m.id !== record.id)];

      updateCurrentProject({
        title: record.originalName.replace(/\.[^/.]+$/, '').toUpperCase(),
        activeMovieRecord: record,
        videoSourceUrl: record.url,
        mediaFiles: updatedMedia,
        duration: record.durationFormatted || currentProject.duration,
        durationSec: record.duration || currentProject.durationSec,
        resolution: record.resolution || currentProject.resolution,
        status: record.status === 'ACTIVE' ? 'ingested' : 'uploading',
        analysisStatus: 'NOT ANALYZED',
        scenes: [],
        characters: [],
      });

      if (record.status === 'ACTIVE') {
        playHudSuccess();
        addToast('Movie Ready', 'File processed by Gemini Files API and ACTIVE for analysis', 'success');
        addLog(`[GEMINI API] Video ACTIVE: ${record.geminiFileId}. MOVIE READY.`, 'success');
      } else if (record.status === 'FAILED') {
        playHudWarning();
        addToast('Processing Error', record.errorMessage || 'Failed to process file in Gemini', 'error');
        addLog(`[GEMINI API] File processing failed: ${record.errorMessage}`, 'error');
      } else {
        addToast('Gemini Processing', 'Video uploaded; Gemini is processing video stream...', 'info');
        addLog(`[GEMINI API] File uploaded. State: ${record.status}. Polling for ACTIVE...`, 'info');
      }

      return record;
    } catch (err: any) {
      setIsMovieUploading(false);
      playHudWarning();
      addToast('Upload Error', err.message || 'File upload failed', 'error');
      addLog(`[MOVIE PIPELINE] Upload error: ${err.message}`, 'error');
      throw err;
    }
  }, [currentProject, updateCurrentProject, refreshMovieLibrary, addToast, addLog]);

  const checkMovieGeminiStatus = useCallback(async (): Promise<MovieRecord | null> => {
    const movie = currentProject.activeMovieRecord;
    if (!movie) return null;
    try {
      const updated = await fetchMovieStatus(movie.id);
      updateCurrentProject({
        activeMovieRecord: updated,
        status: updated.status === 'ACTIVE' ? 'ingested' : currentProject.status,
      });
      return updated;
    } catch (err) {
      console.warn('Error checking Gemini status:', err);
      return null;
    }
  }, [currentProject.activeMovieRecord, currentProject.status, updateCurrentProject]);

  const startAnalysisJob = useCallback(async () => {
    const movie = currentProject.activeMovieRecord;
    if (!movie) {
      addToast('No Movie Found', 'Please upload a movie before starting AI analysis', 'warn');
      return;
    }
    if (movie.status !== 'ACTIVE') {
      addToast('Movie Not Ready', `Gemini is still processing video (${movie.statusMessage}). Please wait until ACTIVE.`, 'warn');
      return;
    }

    playHudScan();
    addToast('Starting AI Analysis', 'Triggering Gemini multimodal analysis job...', 'info');
    addLog(`[AI CORE] Starting multimodal narrative analysis on Gemini file: ${movie.geminiFileId}`, 'ai');

    try {
      const response = await triggerAiAnalysis(movie.id, currentProject.id);
      setActiveAnalysisJob(response.job);
      updateCurrentProject({
        activeJobId: response.job.id,
        analysisStatus: 'ANALYZING...',
        status: 'processing',
      });
      addToast('Analysis Job Queued', 'Gemini multimodal engine is analyzing scenes, characters, and dramatic twists', 'info');
    } catch (err: any) {
      playHudWarning();
      addToast('Analysis Trigger Failed', err.message || 'Could not start analysis', 'error');
      addLog(`[AI CORE] Error triggering analysis: ${err.message}`, 'error');
    }
  }, [currentProject, updateCurrentProject, addToast, addLog]);

  // Polling for movie Gemini status
  useEffect(() => {
    const movie = currentProject.activeMovieRecord;
    if (!movie || (movie.status !== 'PROCESSING' && movie.status !== 'GEMINI_PROCESSING' && movie.status !== 'UPLOADING')) {
      return;
    }

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const updated = await fetchMovieStatus(movie.id);
        if (!isMounted) return;

        if (updated.status !== movie.status || updated.statusMessage !== movie.statusMessage || updated.errorMessage !== movie.errorMessage) {
          updateCurrentProject({
            activeMovieRecord: updated,
            status: updated.status === 'ACTIVE' ? 'ingested' : currentProject.status,
          });

          refreshMovieLibrary();

          if (updated.status === 'ACTIVE') {
            playHudSuccess();
            addToast('Movie Ready', 'File is now ACTIVE in Gemini Files API and ready for AI analysis', 'success');
            addLog(`[GEMINI API] Video ${updated.originalName} transitioned to ACTIVE. MOVIE READY.`, 'success');
          } else if (updated.status === 'FAILED') {
            playHudWarning();
            addToast('Gemini Processing Failed', updated.errorMessage || 'Video processing failed', 'error');
            addLog(`[GEMINI API] Video processing failed: ${updated.errorMessage}`, 'error');
          }
        }
      } catch (err) {
        console.warn('Polling movie error:', err);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentProject.activeMovieRecord, currentProject.status, updateCurrentProject, refreshMovieLibrary, addToast, addLog]);

  // Polling for background analysis job
  useEffect(() => {
    const jobId = currentProject.activeJobId || activeAnalysisJob?.id;
    if (!jobId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const job = await fetchAnalysisJob(jobId);
        if (!isMounted) return;

        setActiveAnalysisJob(job);

        if (job.status === 'COMPLETED' && job.result) {
          clearInterval(interval);
          playHudSuccess();
          addToast('Analysis Complete', 'Gemini successfully extracted cinema intelligence and story structure', 'success');
          addLog('[AI CORE] Multimodal cinema intelligence compiled and synchronized', 'success');

          const overview = job.result.overview || {};
          const scenes = (job.result.scenes && job.result.scenes.length > 0)
            ? job.result.scenes.map((s: any, idx: number) => ({
                id: `scene-${String(idx + 1).padStart(3, '0')}`,
                sceneNumber: s.sceneNumber || idx + 1,
                title: s.title || `Scene ${idx + 1}`,
                timestampStart: s.timestampStart || '00:00:00',
                timestampEnd: s.timestampEnd || '00:02:00',
                startSec: s.startSec || 0,
                endSec: s.endSec || 120,
                durationSec: (s.endSec || 120) - (s.startSec || 0),
                location: s.location || 'Location',
                timeOfDay: s.timeOfDay || 'day',
                characters: s.characters || [],
                dialogueLines: [],
                audioTranscript: '',
                keyEvent: s.keyEvent || '',
                twistScore: s.twistScore || 50,
                suspenseScore: s.suspenseScore || 50,
                emotionalScore: s.emotionalScore || 50,
                visualSummary: s.visualSummary || '',
                tags: s.tags || [],
                importanceScore: s.importanceScore || 75,
                isCandidateForCut: true,
                isLocked: false,
                isExcluded: false,
              }))
            : currentProject.scenes;

          const characters = (job.result.characters && job.result.characters.length > 0)
            ? job.result.characters.map((c: any, idx: number) => ({
                id: c.id || `char-${idx + 1}`,
                name: c.name || `Character ${idx + 1}`,
                actor: c.actor || 'Actor',
                role: c.role || 'supporting',
                archetype: c.archetype || 'Key Figure',
                confidence: c.confidence || 95,
                screenTimeMinutes: c.screenTimeMinutes || 15,
                description: c.description || '',
                relationships: [],
              }))
            : currentProject.characters;

          const events = job.result.events || currentProject.events || [];
          const twists = job.result.twists || currentProject.twists || [];
          const suspensePoints = job.result.suspensePoints || currentProject.suspensePoints || [];
          const emotionalMoments = job.result.emotionalMoments || currentProject.emotionalMoments || [];
          const score = job.result.analysisScore || {};

          updateCurrentProject({
            title: overview.title || currentProject.title,
            synopsis: overview.synopsis || currentProject.synopsis,
            director: overview.director || currentProject.director,
            year: overview.year || currentProject.year,
            genre: overview.genre || currentProject.genre,
            storyPotentialScore: overview.storyPotentialScore || 92,
            analysisStatus: 'ANALYSIS COMPLETE',
            status: 'analyzed',
            scenes,
            characters,
            events,
            twists,
            suspensePoints,
            emotionalMoments,
            analysis: {
              ...currentProject.analysis,
              overallScore: score.overallScore || 92,
              charactersCount: characters.length,
              keyEventsCount: events.length,
              twistsCount: twists.length,
              suspensePointsCount: suspensePoints.length,
              emotionalMomentsCount: emotionalMoments.length,
              pacingScore: score.pacingScore || 88,
              continuityScore: score.continuityScore || 92,
            },
            activeJobId: undefined,
          });
        } else if (job.status === 'FAILED') {
          clearInterval(interval);
          playHudWarning();
          addToast('Analysis Job Failed', job.error || 'Gemini analysis failed', 'error');
          addLog(`[AI CORE] Analysis job failed: ${job.error}`, 'error');
          updateCurrentProject({
            analysisStatus: 'NOT ANALYZED',
            activeJobId: undefined,
          });
        }
      } catch (err) {
        console.warn('Polling analysis job error:', err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentProject.activeJobId, activeAnalysisJob?.id, currentProject.scenes, currentProject.characters, currentProject.events, currentProject.twists, currentProject.suspensePoints, currentProject.emotionalMoments, currentProject.analysis, currentProject.title, currentProject.synopsis, currentProject.director, currentProject.year, currentProject.genre, updateCurrentProject, addToast, addLog]);

  // Auth methods
  const loginWithGoogle = useCallback(() => {
    playHudSuccess();
    const mockUser = {
      name: 'Cinema Director',
      role: 'Master Creator',
      email: 'creator@thedevilseye.ai',
    };
    setIsAuthenticated(true);
    setUser(mockUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: true, user: mockUser }));
    addLog('Google authentication verified. Neural clearance level: ALPHA', 'success');
    addToast('Access Granted', 'Welcome to THE DEVIL\'S EYE Cinema Command System', 'success');
  }, [addLog, addToast]);

  const loginAsGuest = useCallback(() => {
    playHudSuccess();
    const guestUser = {
      name: 'Guest Operator',
      role: 'Guest Clearance',
      email: 'guest.terminal@thedevilseye.ai',
    };
    setIsAuthenticated(true);
    setUser(guestUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: true, user: guestUser }));
    addLog('Guest clearance initialized. Full UI workstation unlocked.', 'info');
    addToast('Guest Mode Active', 'Workstation unlocked with local persistence.', 'info');
  }, [addLog, addToast]);

  const logout = useCallback(() => {
    playHudClick();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    addLog('Operator session terminated. Core returned to standby.', 'warn');
  }, [addLog]);

  // Two-way Selection Handler: Script Segment <-> Source Scene
  const setSelectedSegmentId = useCallback((id: string) => {
    setSelectedSegmentIdState(id);
    const seg = currentProject.script?.segments?.find(s => s.id === id || s.segmentId === id);
    if (seg && seg.sourceSceneIds && seg.sourceSceneIds.length > 0) {
      setSelectedSceneIdState(seg.sourceSceneIds[0]);
    }
  }, [currentProject.script]);

  const setSelectedSceneId = useCallback((sceneId: string | null) => {
    setSelectedSceneIdState(sceneId);
    if (sceneId) {
      const matchingSeg = currentProject.script?.segments?.find(s => s.sourceSceneIds?.includes(sceneId));
      if (matchingSeg) {
        setSelectedSegmentIdState(matchingSeg.id);
      }
    }
  }, [currentProject.script]);

  // Story & Script Versioning
  const saveStoryVersion = useCallback((name?: string) => {
    const vNum = (currentProject.storyVersions?.length || 0) + 1;
    const newV: StoryVersion = {
      id: `story-v${vNum}-${Date.now()}`,
      versionName: name || `Story V${vNum}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      genre: currentProject.storyConfig?.selectedGenre || 'Psychological',
      durationLabel: currentProject.storyConfig?.targetDuration || '20 min',
      beats: currentProject.storyBeats || [],
      strategy: currentProject.storyConfig?.storytellingStrategy || '3-Act Psychological Mystery',
      summary: `Snapshot with ${currentProject.storyBeats?.length || 0} narrative beats.`
    };
    updateCurrentProject({
      storyVersions: [...(currentProject.storyVersions || []), newV]
    });
    playHudSuccess();
    addToast('Story Version Saved', `Saved as ${newV.versionName}`, 'success');
    addLog(`Created Story Version snapshot: ${newV.versionName}`, 'success');
  }, [currentProject, updateCurrentProject, addToast, addLog]);

  const restoreStoryVersion = useCallback((versionId: string) => {
    const target = currentProject.storyVersions?.find(v => v.id === versionId);
    if (target) {
      updateCurrentProject({
        storyBeats: target.beats
      });
      playHudSuccess();
      addToast('Story Version Restored', `Restored ${target.versionName}`, 'success');
      addLog(`Restored Story Version: ${target.versionName}`, 'info');
    }
  }, [currentProject, updateCurrentProject, addToast, addLog]);

  const saveScriptVersion = useCallback((name?: string) => {
    const vNum = (currentProject.scriptVersions?.length || 0) + 1;
    const newV: ScriptVersion = {
      id: `script-v${vNum}-${Date.now()}`,
      versionName: name || `Script V${vNum}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: currentProject.script?.language || 'English',
      wordsCount: currentProject.script?.wordsCount || 0,
      targetDuration: currentProject.script?.targetDuration || '20 min',
      estimatedNarrationDuration: currentProject.script?.estimatedNarrationDuration || '20:00',
      segments: currentProject.script?.segments || []
    };
    updateCurrentProject({
      scriptVersions: [...(currentProject.scriptVersions || []), newV]
    });
    playHudSuccess();
    addToast('Script Version Saved', `Saved as ${newV.versionName}`, 'success');
    addLog(`Created Script Version snapshot: ${newV.versionName}`, 'success');
  }, [currentProject, updateCurrentProject, addToast, addLog]);

  const restoreScriptVersion = useCallback((versionId: string) => {
    const target = currentProject.scriptVersions?.find(v => v.id === versionId);
    if (target) {
      updateCurrentProject({
        script: {
          ...currentProject.script,
          segments: target.segments,
          wordsCount: target.wordsCount,
          language: target.language,
          targetDuration: target.targetDuration,
          estimatedNarrationDuration: target.estimatedNarrationDuration
        }
      });
      playHudSuccess();
      addToast('Script Version Restored', `Restored ${target.versionName}`, 'success');
      addLog(`Restored Script Version: ${target.versionName}`, 'info');
    }
  }, [currentProject, updateCurrentProject, addToast, addLog]);

  // Story Director Command Runner (Modifies real project data)
  const runStoryDirectorCommand = useCallback(async (command: string): Promise<string> => {
    setIsAiThinking(true);
    playHudScan();
    setSystemStatus('ANALYZING');
    setAiOperationStatus(`AI Director executing: "${command}"...`);
    addLog(`AI Director command: "${command}"`, 'ai');

    await new Promise(r => setTimeout(r, 800));
    const result = executeDirectorCommand(currentProject, command);
    updateCurrentProject(result.updatedProject);

    setIsAiThinking(false);
    setSystemStatus('ONLINE');
    playHudSuccess();
    addLog(`AI Director executed: ${result.message}`, 'success');
    addToast('Director Command Executed', result.message, 'success');
    return result.message;
  }, [currentProject, updateCurrentProject, addLog, addToast]);

  // Master Voice System
  const updateMasterVoiceIdentity = useCallback((gender: 'male' | 'female', voiceId: string, language?: string) => {
    const lang = language || (voiceId.startsWith('hi-') ? 'hi-IN' : 'en-IN');
    const existingProfile = currentProject.masterNarratorProfile;
    const updatedProfile: MasterNarratorProfile = {
      ...(existingProfile || {
        provider: 'google',
        voiceName: voiceId,
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
      }),
      gender,
      voiceId,
      voiceName: voiceId,
      language: lang
    };

    // Repair all segments to use the new master voice ID
    const repairedSegments = (currentProject.script?.segments || []).map(seg => ({
      ...seg,
      narration: (seg.narration || []).map(n => ({ ...n, voiceActorId: voiceId }))
    }));

    updateCurrentProject({
      masterNarratorVoiceId: voiceId,
      masterNarratorProfile: updatedProfile,
      voiceSettings: {
        ...(currentProject.voiceSettings || {
          gcpConfigured: false,
          speakingRate: 1.0,
          pitch: 0,
          volumeGainDb: 0,
          deliveryPreset: 'Cinematic',
          ssmlMode: false,
          ssmlText: '',
          pauseMs: 450,
          customPronunciations: []
        }),
        selectedVoiceId: voiceId,
        gender: gender,
        selectedLanguage: lang
      },
      script: currentProject.script ? {
        ...currentProject.script,
        segments: repairedSegments
      } : currentProject.script
    });

    playHudSuccess();
    addToast('Master Narrator Identity Set', `Permanent Voice Identity locked to ${voiceId} (${gender.toUpperCase()}). All 60 acting modes will use this voice.`, 'success');
    addLog(`Master Voice locked: ${voiceId} (${gender})`, 'info');
  }, [currentProject, updateCurrentProject, addToast, addLog]);

  const updateMasterNarratorProfile = useCallback((partial: Partial<MasterNarratorProfile>) => {
    const currentVoiceId = currentProject.masterNarratorVoiceId || 'hi-IN-Neural2-B';
    const merged: MasterNarratorProfile = {
      ...(currentProject.masterNarratorProfile || {
        provider: 'google',
        voiceId: currentVoiceId,
        voiceName: currentVoiceId,
        gender: 'male',
        language: 'hi-IN',
        mode: 'cinematic',
        speakingRate: 1.0,
        pitch: 0,
        volumeGainDb: 0,
        intensity: 75,
        emotion: 'Dramatic',
        styleInstructions: 'Cinematic narrator',
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
      }),
      ...partial,
      voiceId: currentVoiceId // Prevent accidental voiceId override
    };

    updateCurrentProject({
      masterNarratorProfile: merged,
      voiceSettings: {
        ...(currentProject.voiceSettings || {
          gcpConfigured: false,
          selectedLanguage: 'hi-IN',
          selectedVoiceId: currentVoiceId,
          gender: merged.gender,
          speakingRate: 1.0,
          pitch: 0,
          volumeGainDb: 0,
          deliveryPreset: 'Cinematic',
          ssmlMode: false,
          ssmlText: '',
          pauseMs: 450,
          customPronunciations: []
        }),
        speakingRate: merged.speakingRate,
        pitch: merged.pitch,
        volumeGainDb: merged.volumeGainDb,
        deliveryPreset: merged.mode
      }
    });
  }, [currentProject, updateCurrentProject]);

  const repairVoiceConsistency = useCallback(() => {
    const { updatedProject, repairedCount } = repairProjectVoiceConsistency(currentProject);
    updateCurrentProject(updatedProject);
    playHudSuccess();
    addToast(
      'Voice Consistency Repaired',
      repairedCount > 0 
        ? `Repaired ${repairedCount} segment(s) to match Master Voice (${currentProject.masterNarratorVoiceId}).`
        : 'All segments already strictly match the Master Voice identity.',
      'success'
    );
    addLog(`Voice consistency audit passed: ${repairedCount} segments synced to ${currentProject.masterNarratorVoiceId}`, 'info');
    return { repairedCount };
  }, [currentProject, updateCurrentProject, addToast, addLog]);

  // Timeline History Actions & Autosave
  const recordTimelineAction = useCallback((description: string, newTimeline: Timeline) => {
    timelineHistoryRef.current.record(description, currentProject.timeline);
    updateCurrentProject({ timeline: newTimeline });
    setHistoryCounter(c => c + 1);
  }, [currentProject.timeline, updateCurrentProject]);

  const undoTimeline = useCallback((): boolean => {
    const res = timelineHistoryRef.current.undo(currentProject.timeline);
    if (res) {
      updateCurrentProject({ timeline: res.previousTimeline });
      setHistoryCounter(c => c + 1);
      playHudClick();
      addToast('Undo Edit', `Undid: ${res.description}`, 'info');
      addLog(`Timeline Undo: ${res.description}`, 'info');
      return true;
    }
    return false;
  }, [currentProject.timeline, updateCurrentProject, addToast, addLog]);

  const redoTimeline = useCallback((): boolean => {
    const res = timelineHistoryRef.current.redo(currentProject.timeline);
    if (res) {
      updateCurrentProject({ timeline: res.nextTimeline });
      setHistoryCounter(c => c + 1);
      playHudClick();
      addToast('Redo Edit', `Redid: ${res.description}`, 'info');
      addLog(`Timeline Redo: ${res.description}`, 'info');
      return true;
    }
    return false;
  }, [currentProject.timeline, updateCurrentProject, addToast, addLog]);

  const canUndoTimeline = timelineHistoryRef.current.canUndo();
  const canRedoTimeline = timelineHistoryRef.current.canRedo();
  const timelineHistoryList = timelineHistoryRef.current.getHistoryList();

  // Timeline Versioning: V1 AI First Cut, V2 Human Edit, V3 Revised, V4 Final
  const saveTimelineVersion = useCallback((name?: string, description?: string) => {
    const count = (currentProject.timelineVersions?.length || 0) + 1;
    const defaultLabels = ['V1 — AI First Cut', 'V2 — Human Edit', 'V3 — Revised', 'V4 — Final'];
    const defaultName = count <= 4 ? defaultLabels[count - 1] : `V${count} — Custom Revision`;

    const totalClips = currentProject.timeline.tracks.reduce((acc, t) => acc + t.clips.length, 0);
    const newVer: TimelineVersion = {
      id: `v${count}-${Date.now().toString(36)}`,
      name: name || defaultName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalDuration: currentProject.timeline.totalDuration,
      clipCount: totalClips,
      description: description || `Snapshot containing ${totalClips} multi-track clips across ${currentProject.timeline.tracks.length} stems.`,
      tracks: JSON.parse(JSON.stringify(currentProject.timeline.tracks))
    };

    updateCurrentProject({
      timelineVersions: [...(currentProject.timelineVersions || []), newVer],
      activeTimelineVersionId: newVer.id
    });
    playHudSuccess();
    addToast('Timeline Version Saved', `Created ${newVer.name}`, 'success');
    addLog(`Saved Timeline Version: ${newVer.name}`, 'success');
  }, [currentProject, updateCurrentProject, addToast, addLog]);

  const restoreTimelineVersion = useCallback((versionId: string) => {
    const target = currentProject.timelineVersions?.find(v => v.id === versionId);
    if (target) {
      recordTimelineAction(`Restore ${target.name}`, {
        ...currentProject.timeline,
        tracks: JSON.parse(JSON.stringify(target.tracks)),
        totalDuration: target.totalDuration
      });
      updateCurrentProject({
        activeTimelineVersionId: versionId
      });
      playHudSuccess();
      addToast('Version Restored', `Restored ${target.name}`, 'success');
      addLog(`Restored Timeline Version: ${target.name}`, 'info');
    }
  }, [currentProject, recordTimelineAction, updateCurrentProject, addToast, addLog]);

  // AI First Cut Pipeline Execution
  const runAiFirstCut = useCallback(async (): Promise<FirstCutResult> => {
    setIsFirstCutRunning(true);
    setSystemStatus('ANALYZING');
    playHudScan();
    addLog('Initiating AI First Cut Multimodal Assembly Pipeline...', 'ai');

    // Cycle through real first cut stages
    for (let i = 0; i < FIRST_CUT_STAGES.length; i++) {
      const stage = FIRST_CUT_STAGES[i];
      setFirstCutStage(stage.id);
      setFirstCutProgress(Math.round(((i + 1) / FIRST_CUT_STAGES.length) * 100));
      setAiOperationStatus(`[AI FIRST CUT] ${stage.name}: ${stage.description}`);
      await new Promise(r => setTimeout(r, 260));
    }

    const result = generateAiFirstCut(currentProject);

    // Record in history and update project
    timelineHistoryRef.current.record('AI First Cut Generated', currentProject.timeline);

    const updatedVersions = [
      result.timelineVersion,
      ...(currentProject.timelineVersions || []).filter(v => v.id !== result.timelineVersion.id)
    ];

    updateCurrentProject({
      timeline: result.timeline,
      subtitles: result.subtitles,
      timelineVersions: updatedVersions,
      activeTimelineVersionId: result.timelineVersion.id
    });

    setIsFirstCutRunning(false);
    setSystemStatus('ONLINE');
    setAiOperationStatus('AI First Cut ready');
    playHudSuccess();
    addToast('First Cut Generated!', `Multi-track reel assembled (${result.stats.explainerRuntime})`, 'success');
    addLog(`AI First Cut compiled: ${result.stats.totalClips} clips across ${result.stats.videoTracks} video and ${result.stats.audioTracks} audio stems.`, 'success');

    return result;
  }, [currentProject, updateCurrentProject, addLog, addToast]);

  // AI Editor Assistant Command Execution (Directly modifies timeline)
  const runAiEditorCommand = useCallback(async (command: string, selectedClipId?: string | null): Promise<string> => {
    setIsAiThinking(true);
    playHudScan();
    setSystemStatus('ANALYZING');
    setAiOperationStatus(`AI Editor executing: "${command}"...`);
    addLog(`AI Editor Command: "${command}"`, 'ai');

    await new Promise(r => setTimeout(r, 700));

    const result = executeAiEditorCommand(currentProject.timeline, command, currentProject, selectedClipId);
    
    // Save to undo history before applying
    recordTimelineAction(`AI: ${result.actionTaken}`, result.updatedTimeline);

    setIsAiThinking(false);
    setSystemStatus('ONLINE');
    setAiOperationStatus('Command executed');
    playHudSuccess();
    addLog(`AI Editor: ${result.message}`, 'success');
    addToast('AI Editor Applied', result.message, 'success');

    return result.message;
  }, [currentProject, recordTimelineAction, addLog, addToast]);

  // Execute AI Commands
  const executeAiCommand = useCallback(async (prompt: string): Promise<string> => {
    if (!prompt.trim()) return '';
    
    setIsAiThinking(true);
    playHudScan();
    setSystemStatus('ANALYZING');
    setAiOperationStatus(`Processing command: "${prompt}"...`);
    addLog(`AI Command input: "${prompt}"`, 'ai');

    try {
      // Execute Global AI Director cross-module engine
      const directorResult = await executeGlobalAiDirector(currentProject, prompt);
      
      if (Object.keys(directorResult.updatedProject).length > 0) {
        updateCurrentProject(directorResult.updatedProject);
      }

      if (directorResult.targetPage) {
        navigateTo(directorResult.targetPage);
      }

      const newAiLog: AICommandLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toTimeString().split(' ')[0],
        prompt,
        status: 'completed',
        response: directorResult.actionSummary,
      };

      setAiLogs(prev => [newAiLog, ...prev]);
      setTokensUsed(prev => prev + 260);
      setIsAiThinking(false);
      setSystemStatus('ONLINE');
      setAiOperationStatus('Director command executed');
      playHudSuccess();
      addLog(`AI Director: ${directorResult.actionSummary}`, 'success');
      addToast('AI Global Director', directorResult.actionSummary, 'success');
      return directorResult.actionSummary;
    } catch (err: unknown) {
      console.error('AI Director error:', err);
      setIsAiThinking(false);
      setSystemStatus('ONLINE');
      setAiOperationStatus('Command failed');
      playHudWarning();
      const errMsg = 'Failed to execute director command';
      addToast('AI Error', errMsg, 'error');
      return errMsg;
    }
  }, [currentProject, updateCurrentProject, addLog, addToast, navigateTo]);

  // Export pipeline
  const startExport = useCallback((format: string) => {
    setIsExporting(true);
    setExportProgress(0);
    setExportFormat(format);
    setSystemStatus('RENDERING');
    playHudScan();
    addLog(`Starting export pipeline for [${format}]...`, 'ai');
    addToast('Export Started', `Rendering ${format} with Cinema AI...`, 'info');

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setExportProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsExporting(false);
        setSystemStatus('ONLINE');
        playHudSuccess();
        addLog(`Export completed: ${format} rendered successfully. Ready for download.`, 'success');
        addToast('Export Complete!', `${format} generated and ready for publishing.`, 'success');
      }
    }, 350);
  }, [addLog, addToast]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        activePage,
        navigateTo,
        loginWithGoogle,
        loginAsGuest,
        logout,
        projects,
        currentProject,
        setCurrentProjectId,
        createProject,
        updateCurrentProject,
        activeMovieRecord: currentProject.activeMovieRecord,
        activeAnalysisJob,
        isMovieUploading,
        movieUploadProgress,
        uploadMovie,
        startAnalysisJob,
        checkMovieGeminiStatus,
        isIngestionCenterOpen,
        setIsIngestionCenterOpen,
        movieLibraryList,
        refreshMovieLibrary,
        selectMovieFromLibrary,
        deleteMovie,
        selectedSegmentId,
        setSelectedSegmentId,
        selectedSceneId,
        setSelectedSceneId,
        saveStoryVersion,
        restoreStoryVersion,
        saveScriptVersion,
        restoreScriptVersion,
        runStoryDirectorCommand,
        updateMasterVoiceIdentity,
        updateMasterNarratorProfile,
        repairVoiceConsistency,
        saveTimelineVersion,
        restoreTimelineVersion,
        runAiFirstCut,
        isFirstCutRunning,
        firstCutStage,
        firstCutProgress,
        runAiEditorCommand,
        recordTimelineAction,
        undoTimeline,
        redoTimeline,
        canUndoTimeline,
        canRedoTimeline,
        timelineHistoryList,
        isAiThinking,
        aiOperationStatus,
        executeAiCommand,
        aiLogs,
        systemStatus,
        aiCoreVersion,
        gpuUsage,
        memUsage,
        tokensUsed,
        systemLogs,
        addLog,
        soundMuted,
        toggleSound,
        toasts,
        addToast,
        removeToast,
        isExportModalOpen,
        setIsExportModalOpen,
        isExporting,
        exportProgress,
        exportFormat,
        startExport,
        isMobileSidebarOpen,
        toggleMobileSidebar,
        setIsMobileSidebarOpen,
        eyeConfig,
        updateEyeConfig,
        resetEyeConfig,
        saveEyeConfig,
        importEyeConfig,
        exportEyeConfig,
        devilEyeState,
        setDevilEyeStateOverride: setEyeStateOverride,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
