import { MovieRecord, AnalysisJob } from '../types';

/**
 * Client API service for THE DEVIL'S EYE Real Movie Upload & Gemini AI Pipeline
 */

export async function uploadMovieFile(
  file: File,
  metadata?: {
    duration?: number;
    resolution?: string;
    fps?: number;
    projectId?: string;
  },
  onUploadProgress?: (percent: number) => void
): Promise<MovieRecord> {
  // Pre-flight file size validation (2GB Gemini File API limit)
  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
  if (file.size > MAX_FILE_SIZE) {
    const sizeInGb = (file.size / (1024 * 1024 * 1024)).toFixed(2);
    throw new Error(
      `FILE_TOO_LARGE: Video file size (${sizeInGb} GB) exceeds the 2GB Gemini File API limit.`
    );
  }

  // Pre-flight video format validation
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  const validExts = ['.mp4', '.mov', '.avi', '.flv', '.mpg', '.mpeg', '.webm', '.wmv', '.3gp', '.mkv', '.m4v'];
  if (!file.type.startsWith('video/') && !validExts.includes(ext)) {
    throw new Error(
      `UNSUPPORTED_FORMAT: File format "${file.type || ext}" is not supported. Please upload a valid video file (MP4, MOV, MKV, WebM, AVI, FLV, MPG, WMV, 3GP).`
    );
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('video', file);
    if (metadata?.duration) formData.append('duration', metadata.duration.toString());
    if (metadata?.resolution) formData.append('resolution', metadata.resolution);
    if (metadata?.fps) formData.append('fps', metadata.fps.toString());
    if (metadata?.projectId) formData.append('projectId', metadata.projectId);

    xhr.open('POST', '/api/movies/upload');

    if (xhr.upload && onUploadProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onUploadProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: MovieRecord = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (e) {
          reject(new Error('Invalid JSON response from server'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during file upload'));
    };

    xhr.send(formData);
  });
}

export async function fetchMovieStatus(movieId: string): Promise<MovieRecord> {
  const res = await fetch(`/api/movies/${encodeURIComponent(movieId)}/gemini-status`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to poll movie status' }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export async function fetchAllMovies(): Promise<MovieRecord[]> {
  const res = await fetch('/api/movies');
  if (!res.ok) {
    throw new Error(`Failed to fetch movies: ${res.statusText}`);
  }
  return res.json();
}

export async function triggerAiAnalysis(movieId: string, projectId?: string): Promise<{ message: string; job: AnalysisJob }> {
  const res = await fetch(`/api/movies/${encodeURIComponent(movieId)}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to trigger AI analysis' }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export async function fetchAnalysisJob(jobId: string): Promise<AnalysisJob> {
  const res = await fetch(`/api/analysis-jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch job status' }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export async function fetchLatestJobForMovie(movieId: string): Promise<AnalysisJob | null> {
  const res = await fetch(`/api/movies/${encodeURIComponent(movieId)}/latest-job`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export async function deleteMovieRecord(movieId: string): Promise<void> {
  const res = await fetch(`/api/movies/${encodeURIComponent(movieId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete movie' }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }
}
