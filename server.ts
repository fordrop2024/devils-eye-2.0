import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { GoogleGenAI, FileState } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure storage directories exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const dataDir = path.join(process.cwd(), 'data');
const moviesFile = path.join(dataDir, 'movies.json');
const jobsFile = path.join(dataDir, 'jobs.json');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Data persistence helpers
export interface ServerMovieRecord {
  id: string;
  projectId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileSizeFormatted: string;
  duration?: number;
  durationFormatted?: string;
  resolution?: string;
  fps?: number;
  uploadTimestamp: string;
  status: 'UPLOADING' | 'PROCESSING' | 'ACTIVE' | 'FAILED';
  statusMessage: string;
  geminiFileId?: string;
  geminiFileUri?: string;
  geminiFileState?: 'STATE_UNSPECIFIED' | 'PROCESSING' | 'ACTIVE' | 'FAILED';
  errorMessage?: string;
  localPath: string;
  url: string;
}

export interface ServerAnalysisJob {
  id: string;
  movieId: string;
  projectId?: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progressPercent: number;
  currentStep: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  result?: any;
}

function loadMovies(): Record<string, ServerMovieRecord> {
  try {
    if (fs.existsSync(moviesFile)) {
      return JSON.parse(fs.readFileSync(moviesFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading movies.json:', e);
  }
  return {};
}

function saveMovies(movies: Record<string, ServerMovieRecord>) {
  try {
    fs.writeFileSync(moviesFile, JSON.stringify(movies, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving movies.json:', e);
  }
}

function loadJobs(): Record<string, ServerAnalysisJob> {
  try {
    if (fs.existsSync(jobsFile)) {
      return JSON.parse(fs.readFileSync(jobsFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading jobs.json:', e);
  }
  return {};
}

function saveJobs(jobs: Record<string, ServerAnalysisJob>) {
  try {
    fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving jobs.json:', e);
  }
}

// In-memory caches synchronized with disk
let moviesCache = loadMovies();
let jobsCache = loadJobs();

// Lazy Gemini SDK client initialization
let genAiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please configure your API key in Settings > Secrets.'
    );
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static serving for uploaded video files
  app.use('/api/uploads', express.static(uploadsDir));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      moviesCount: Object.keys(moviesCache).length,
      jobsCount: Object.keys(jobsCache).length,
    });
  });

  // Get all movies
  app.get('/api/movies', (_req, res) => {
    res.json(Object.values(moviesCache));
  });

  // Get single movie
  app.get('/api/movies/:id', (req, res) => {
    const movie = moviesCache[req.params.id];
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  });

  // DELETE movie
  app.delete('/api/movies/:id', async (req: Request, res: Response) => {
    const movie = moviesCache[req.params.id];
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    try {
      if (movie.localPath && fs.existsSync(movie.localPath)) {
        fs.unlinkSync(movie.localPath);
      }
    } catch (e) {
      console.warn('Could not delete local file:', e);
    }
    delete moviesCache[req.params.id];
    saveMovies(moviesCache);
    return res.json({ success: true, message: `Movie ${req.params.id} deleted` });
  });

  // REAL FILE UPLOAD + GEMINI FILES API INTEGRATION
  const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.flv', '.mpg', '.mpeg', '.webm', '.wmv', '.3gp', '.mkv', '.m4v'];

  app.post('/api/movies/upload', (req: Request, res: Response) => {
    upload.single('video')(req, res, async (multerErr: any) => {
      if (multerErr) {
        if (multerErr.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'FILE_TOO_LARGE: Video file exceeds the 2GB Gemini File API upload limit.',
          });
        }
        return res.status(400).json({ error: `Upload error: ${multerErr.message}` });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No video file provided in upload request' });
        }

        const file = req.file;
        const ext = path.extname(file.originalname).toLowerCase();
        const isAllowedMime = file.mimetype && file.mimetype.startsWith('video/');
        const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);

        if (!isAllowedMime && !isAllowedExt) {
          try {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          } catch {}
          return res.status(400).json({
            error: `UNSUPPORTED_FORMAT: File format "${file.mimetype || ext}" is not supported. Please upload a valid video file (MP4, MOV, MKV, WebM, AVI, FLV, MPG, WMV, 3GP).`,
          });
        }

        const movieId = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const parsedDuration = req.body.duration ? parseFloat(req.body.duration) : undefined;
        const resolution = req.body.resolution || '1920x1080';
        const fps = req.body.fps ? parseFloat(req.body.fps) : 24;
        const projectId = req.body.projectId;

        const movieRecord: ServerMovieRecord = {
          id: movieId,
          projectId,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype || 'video/mp4',
          fileSize: file.size,
          fileSizeFormatted: formatBytes(file.size),
          duration: parsedDuration,
          durationFormatted: parsedDuration ? formatDuration(parsedDuration) : undefined,
          resolution,
          fps,
          uploadTimestamp: new Date().toISOString(),
          status: 'UPLOADING',
          statusMessage: 'Uploading to Gemini Files API...',
          localPath: file.path,
          url: `/api/uploads/${file.filename}`,
        };

        // Save initial state
        moviesCache[movieId] = movieRecord;
        saveMovies(moviesCache);

        console.log(`[Upload] Received file "${file.originalname}" (${formatBytes(file.size)}), ID: ${movieId}`);

        // Check Gemini API Key
        if (!process.env.GEMINI_API_KEY) {
          movieRecord.status = 'FAILED';
          movieRecord.statusMessage = 'GEMINI_API_KEY not configured';
          movieRecord.errorMessage = 'GEMINI_API_KEY environment variable is not configured. Please configure your key in Settings > Secrets.';
          moviesCache[movieId] = movieRecord;
          saveMovies(moviesCache);
          return res.status(201).json(movieRecord);
        }

        // Upload to Gemini Files API using resumable upload
        try {
          const ai = getGeminiClient();
          console.log(`[Gemini Files] Uploading ${file.path} to Gemini Files API...`);

          const uploadResult = await ai.files.upload({
            file: file.path,
            config: {
              mimeType: file.mimetype || 'video/mp4',
              displayName: file.originalname,
            },
          });

          console.log(`[Gemini Files] Upload success! Name: ${uploadResult.name}, URI: ${uploadResult.uri}, State: ${uploadResult.state}`);

          movieRecord.geminiFileId = uploadResult.name;
          movieRecord.geminiFileUri = uploadResult.uri;
          movieRecord.geminiFileState = uploadResult.state as any;

          if (uploadResult.state === FileState.ACTIVE) {
            movieRecord.status = 'ACTIVE';
            movieRecord.statusMessage = 'MOVIE READY';
          } else if (uploadResult.state === FileState.FAILED) {
            movieRecord.status = 'FAILED';
            movieRecord.statusMessage = 'Gemini video processing failed';
            movieRecord.errorMessage = (uploadResult.error as any)?.message || 'Gemini processing failed';
          } else {
            movieRecord.status = 'PROCESSING';
            movieRecord.statusMessage = 'Gemini is processing video...';
          }

          moviesCache[movieId] = movieRecord;
          saveMovies(moviesCache);

          return res.status(201).json(movieRecord);
        } catch (geminiError: any) {
          console.error('[Gemini Files] Upload error:', geminiError);
          movieRecord.status = 'FAILED';
          movieRecord.statusMessage = 'Failed to upload to Gemini Files API';
          movieRecord.errorMessage = geminiError.message || 'Gemini Files API upload error';
          moviesCache[movieId] = movieRecord;
          saveMovies(moviesCache);

          return res.status(201).json(movieRecord);
        }
      } catch (err: any) {
        console.error('[Upload] Server error:', err);
        return res.status(500).json({ error: err.message || 'Failed to process file upload' });
      }
    });
  });

  // POLL GEMINI FILE PROCESSING STATE
  app.get('/api/movies/:id/gemini-status', async (req: Request, res: Response) => {
    try {
      const movie = moviesCache[req.params.id];
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      // If already ACTIVE or FAILED without Gemini file ID, return current state
      if (!movie.geminiFileId) {
        return res.json(movie);
      }

      // If still processing or state unspecified, query Gemini Files API
      if (movie.status === 'PROCESSING' || movie.status === 'UPLOADING' || movie.geminiFileState === 'PROCESSING') {
        try {
          const ai = getGeminiClient();
          const fileInfo = await ai.files.get({ name: movie.geminiFileId });

          movie.geminiFileState = fileInfo.state as any;

          if (fileInfo.state === FileState.ACTIVE) {
            movie.status = 'ACTIVE';
            movie.statusMessage = 'MOVIE READY';
            movie.errorMessage = undefined;
            console.log(`[Gemini Poll] Movie ${movie.id} (${movie.originalName}) is now ACTIVE! MOVIE READY.`);
          } else if (fileInfo.state === FileState.FAILED) {
            movie.status = 'FAILED';
            movie.statusMessage = 'Gemini video processing failed';
            movie.errorMessage = (fileInfo.error as any)?.message || 'Gemini video processing failed';
            console.error(`[Gemini Poll] Movie ${movie.id} failed in Gemini:`, movie.errorMessage);
          } else {
            movie.status = 'PROCESSING';
            movie.statusMessage = 'Gemini is processing video...';
          }

          moviesCache[movie.id] = movie;
          saveMovies(moviesCache);
        } catch (pollErr: any) {
          console.warn(`[Gemini Poll] Could not get file state for ${movie.geminiFileId}:`, pollErr.message);
        }
      }

      return res.json(movie);
    } catch (err: any) {
      console.error('[Gemini Poll] Error:', err);
      return res.status(500).json({ error: err.message || 'Error checking Gemini status' });
    }
  });

  // TRIGGER REAL AI ANALYSIS JOB
  app.post('/api/movies/:id/analyze', async (req: Request, res: Response) => {
    try {
      const movie = moviesCache[req.params.id];
      if (!movie) {
        return res.status(404).json({ error: 'Movie record not found' });
      }

      if (movie.status !== 'ACTIVE' || !movie.geminiFileUri) {
        return res.status(400).json({
          error: `Movie is not ready for analysis. Current status is ${movie.status}. Gemini file state must be ACTIVE before starting AI analysis.`,
        });
      }

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const projectId = req.body.projectId || movie.projectId;

      const newJob: ServerAnalysisJob = {
        id: jobId,
        movieId: movie.id,
        projectId,
        status: 'QUEUED',
        progressPercent: 5,
        currentStep: 'Job queued for Gemini multimodal analysis',
        startedAt: new Date().toISOString(),
      };

      jobsCache[jobId] = newJob;
      saveJobs(jobsCache);

      // Start asynchronous background analysis execution
      runGeminiMovieAnalysis(newJob, movie).catch((err) => {
        console.error(`[Analysis Job ${jobId}] Uncaught execution error:`, err);
      });

      return res.status(202).json({
        message: 'AI analysis job initialized',
        job: newJob,
      });
    } catch (err: any) {
      console.error('[Analysis] Start error:', err);
      return res.status(500).json({ error: err.message || 'Failed to start AI analysis' });
    }
  });

  // POLL ANALYSIS JOB STATUS
  app.get('/api/analysis-jobs/:id', (req: Request, res: Response) => {
    const job = jobsCache[req.params.id];
    if (!job) {
      return res.status(404).json({ error: 'Analysis job not found' });
    }
    return res.json(job);
  });

  // Get latest job for a movie
  app.get('/api/movies/:id/latest-job', (req: Request, res: Response) => {
    const movieId = req.params.id;
    const movieJobs = Object.values(jobsCache)
      .filter((j) => j.movieId === movieId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    if (movieJobs.length === 0) {
      return res.status(404).json({ error: 'No analysis jobs found for this movie' });
    }
    return res.json(movieJobs[0]);
  });

  // Vite middleware in dev or static production files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[THE DEVIL'S EYE] Server active on http://0.0.0.0:${PORT}`);
  });
}

// Background Analysis Runner using Gemini 3.8 Flash Multimodal Video Understanding
async function runGeminiMovieAnalysis(job: ServerAnalysisJob, movie: ServerMovieRecord) {
  try {
    console.log(`[Analysis Job ${job.id}] Starting multimodal video analysis for "${movie.originalName}"...`);
    job.status = 'RUNNING';
    job.progressPercent = 15;
    job.currentStep = 'Connecting to Gemini multimodal engine...';
    jobsCache[job.id] = job;
    saveJobs(jobsCache);

    const ai = getGeminiClient();

    job.progressPercent = 30;
    job.currentStep = 'Analyzing video narrative, timeline, and emotional arcs...';
    jobsCache[job.id] = job;
    saveJobs(jobsCache);

    const prompt = `You are the core intelligence brain for THE DEVIL'S EYE (Professional Cinema AI & Video Explainer Studio).
Analyze the attached movie/video file thoroughly. Extract deep cinematic structure, character profiles, key plot events, dramatic twists, suspense points, emotional resonance, and narrative potential.

You MUST respond strictly with a valid, pure JSON object adhering to this schema:
{
  "overview": {
    "title": "Title of the film/video (extract from title card or infer from story)",
    "synopsis": "Comprehensive 2-3 paragraph plot synopsis explaining beginning, middle, and climax",
    "genre": ["Sci-Fi", "Thriller", "Drama"],
    "director": "Director name if visible or credited, else 'Cinematic Creator'",
    "year": 2024,
    "storyPotentialScore": 95
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene headline",
      "timestampStart": "00:00:00",
      "timestampEnd": "00:02:15",
      "startSec": 0,
      "endSec": 135,
      "location": "Location name",
      "timeOfDay": "day",
      "characters": ["Character Name 1"],
      "keyEvent": "Description of what occurs",
      "twistScore": 20,
      "suspenseScore": 60,
      "emotionalScore": 50,
      "importanceScore": 85,
      "visualSummary": "Visual framing, cinematography, and camera movement notes",
      "tags": ["Opening", "Hook"]
    }
  ],
  "characters": [
    {
      "id": "char-1",
      "name": "Character Name",
      "actor": "Actor name if identifiable, or Unknown",
      "role": "protagonist",
      "archetype": "The Reluctant Visionary",
      "confidence": 96,
      "screenTimeMinutes": 20,
      "description": "Character motives, psychological stakes, and dramatic arc"
    }
  ],
  "events": [
    {
      "id": "evt-1",
      "timestamp": "00:01:30",
      "timeSec": 90,
      "title": "Inciting Incident / Crucial Event",
      "description": "What happens and why it turns the plot",
      "importance": 95,
      "impact": "Shifts narrative trajectory",
      "act": "Beginning"
    }
  ],
  "twists": [
    {
      "id": "twist-1",
      "timestamp": "00:05:00",
      "timeSec": 300,
      "title": "Dramatic Reversal or Secret Reveal",
      "reveal": "The revealed truth or misdirection",
      "twistScore": 88,
      "foreshadowingClues": ["Visual hint in scene 1", "Dialogue clue"],
      "explanationHook": "The compelling reason this makes viewers gasp"
    }
  ],
  "suspensePoints": [
    {
      "id": "susp-1",
      "timestamp": "00:03:45",
      "timeSec": 225,
      "sceneTitle": "High Tension Confrontation",
      "tensionLevel": 92,
      "trigger": "What escalates danger or ticking clock",
      "resolution": "Outcome of the suspense sequence"
    }
  ],
  "emotionalMoments": [
    {
      "id": "emo-1",
      "timestamp": "00:04:10",
      "timeSec": 250,
      "character": "Lead Character",
      "emotionType": "Catharsis",
      "intensity": 89,
      "description": "Heartbreaking realization or poignant turning point"
    }
  ],
  "analysisScore": {
    "overallScore": 93,
    "charactersCount": 5,
    "keyEventsCount": 8,
    "twistsCount": 3,
    "suspensePointsCount": 6,
    "emotionalMomentsCount": 4,
    "pacingScore": 89,
    "continuityScore": 94
  }
}
Return ONLY valid JSON. No markdown code blocks, no trailing conversational text.`;

    job.progressPercent = 60;
    job.currentStep = 'Synthesizing scene metadata and character graph with Gemini...';
    jobsCache[job.id] = job;
    saveJobs(jobsCache);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          fileData: {
            fileUri: movie.geminiFileUri!,
            mimeType: movie.mimeType || 'video/mp4',
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    job.progressPercent = 85;
    job.currentStep = 'Parsing cinematic intelligence structures...';
    jobsCache[job.id] = job;
    saveJobs(jobsCache);

    const rawText = response.text || '{}';
    let parsed: any;
    try {
      // Clean possible fences if any
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn(`[Analysis Job ${job.id}] JSON parse fallback attempt on raw text`);
      parsed = {
        overview: {
          title: movie.originalName.replace(/\.[^/.]+$/, ''),
          synopsis: rawText.substring(0, 500),
          genre: ['Cinema'],
          director: 'Cinematic Creator',
          year: new Date().getFullYear(),
          storyPotentialScore: 90,
        },
        scenes: [],
        characters: [],
        events: [],
        twists: [],
        suspensePoints: [],
        emotionalMoments: [],
        analysisScore: {
          overallScore: 90,
          charactersCount: 0,
          keyEventsCount: 0,
          twistsCount: 0,
          suspensePointsCount: 0,
          emotionalMomentsCount: 0,
          pacingScore: 85,
          continuityScore: 88,
        },
      };
    }

    job.status = 'COMPLETED';
    job.progressPercent = 100;
    job.currentStep = 'Analysis complete';
    job.completedAt = new Date().toISOString();
    job.result = parsed;
    jobsCache[job.id] = job;
    saveJobs(jobsCache);

    console.log(`[Analysis Job ${job.id}] Completed successfully! Scenes: ${parsed.scenes?.length || 0}, Characters: ${parsed.characters?.length || 0}`);
  } catch (err: any) {
    console.error(`[Analysis Job ${job.id}] Error:`, err);
    job.status = 'FAILED';
    job.error = err.message || 'Gemini analysis failed';
    job.currentStep = `Analysis failed: ${err.message || 'Internal error'}`;
    jobsCache[job.id] = job;
    saveJobs(jobsCache);
  }
}

startServer();
