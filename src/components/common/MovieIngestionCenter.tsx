/**
 * THE DEVIL'S EYE - Movie Ingestion Center Modal
 * Handles real video uploads directly to the server & Gemini Files API.
 * Real state lifecycle: UPLOADING -> PROCESSING -> ACTIVE (or FAILED).
 * Enforces 2GB Gemini limit, video format validations, and real-time polling.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Film, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Trash2, 
  X, 
  FileVideo, 
  HardDrive, 
  RefreshCw, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { playHudClick, playHudScan, playHudSuccess, playHudWarning } from '../../services/soundFx';
import { MovieRecord } from '../../types';

export const MovieIngestionCenter: React.FC = () => {
  const { 
    isIngestionCenterOpen, 
    setIsIngestionCenterOpen, 
    activeMovieRecord,
    isMovieUploading,
    movieUploadProgress,
    uploadMovie,
    startAnalysisJob,
    movieLibraryList,
    refreshMovieLibrary,
    selectMovieFromLibrary,
    deleteMovie,
    activeAnalysisJob
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<{ duration: number; resolution: string; fps: number } | null>(null);
  const [isExtractingMeta, setIsExtractingMeta] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Maximum allowed file size for Gemini Files API is 2GB
  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

  // Clear selections when opened
  useEffect(() => {
    if (isIngestionCenterOpen) {
      refreshMovieLibrary();
    }
  }, [isIngestionCenterOpen, refreshMovieLibrary]);

  if (!isIngestionCenterOpen) {
    return null;
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndPrepareFile = (file: File) => {
    setValidationError(null);
    setVideoMeta(null);

    // 1. File size check (2GB Gemini limit)
    if (file.size > MAX_FILE_SIZE) {
      const sizeInGb = (file.size / (1024 * 1024 * 1024)).toFixed(2);
      setValidationError(
        `FILE TOO LARGE: Video file is ${sizeInGb} GB. The Gemini File API maximum limit is 2.00 GB. Please select a compressed file or a movie clip under 2GB.`
      );
      playHudWarning();
      return;
    }

    // 2. Video type check
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const validExts = ['.mp4', '.mov', '.avi', '.flv', '.mpg', '.mpeg', '.webm', '.wmv', '.3gp', '.mkv', '.m4v'];
    if (!file.type.startsWith('video/') && !validExts.includes(ext)) {
      setValidationError(
        `UNSUPPORTED FORMAT: "${file.type || ext}" is not recognized. Supported formats: MP4, MOV, MKV, WEBM, AVI, FLV, WMV, 3GP.`
      );
      playHudWarning();
      return;
    }

    setSelectedFile(file);
    playHudClick();

    // 3. Extract local video duration and resolution via HTML5 video element
    setIsExtractingMeta(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        setVideoMeta({
          duration: Math.round(video.duration) || 7200,
          resolution: `${video.videoWidth || 1920}x${video.videoHeight || 1080}`,
          fps: 24,
        });
        setIsExtractingMeta(false);
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fallback defaults if browser codec can't inspect container locally
        setVideoMeta({
          duration: 7200,
          resolution: '1080p',
          fps: 24,
        });
        setIsExtractingMeta(false);
      };
      video.src = objectUrl;
    } catch {
      setIsExtractingMeta(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPrepareFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndPrepareFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    try {
      await uploadMovie(selectedFile, {
        duration: videoMeta?.duration,
        resolution: videoMeta?.resolution,
        fps: videoMeta?.fps,
      });
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDuration = (secs?: number): string => {
    if (!secs) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#030816] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#061028]/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-display font-bold text-slate-100 tracking-wider">
                  REAL MOVIE INGESTION & GEMINI PIPELINE
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  GEMINI 2.5 FLASH MULTIMODAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Upload real MP4/video files up to 2GB directly into Google Gemini File Storage.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHudClick();
              setIsIngestionCenterOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/60 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-cyan-500/20 px-6 bg-[#040c20]/60">
          <button
            onClick={() => {
              playHudClick();
              setActiveTab('upload');
            }}
            className={`py-3 px-4 text-xs font-tech font-bold tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>UPLOAD NEW MOVIE</span>
          </button>

          <button
            onClick={() => {
              playHudClick();
              setActiveTab('library');
              refreshMovieLibrary();
            }}
            className={`py-3 px-4 text-xs font-tech font-bold tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>MOVIE LIBRARY ({movieLibraryList.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Active Movie Status Banner */}
          {activeMovieRecord && (
            <div className="p-4 rounded-lg bg-[#06122d] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded mt-0.5 ${
                  activeMovieRecord.status === 'ACTIVE'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : activeMovieRecord.status === 'FAILED'
                    ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40 animate-pulse'
                }`}>
                  {activeMovieRecord.status === 'ACTIVE' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : activeMovieRecord.status === 'FAILED' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5 animate-spin" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-400">ACTIVE MOVIE:</span>
                    <span className="text-sm font-bold text-slate-100 font-tech">
                      {activeMovieRecord.originalName}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                    <span>SIZE: {activeMovieRecord.fileSizeFormatted}</span>
                    <span>•</span>
                    <span>RES: {activeMovieRecord.resolution || '1080p'}</span>
                    <span>•</span>
                    <span>DUR: {activeMovieRecord.durationFormatted || formatDuration(activeMovieRecord.duration)}</span>
                    <span>•</span>
                    <span className="text-cyan-400">ID: {activeMovieRecord.geminiFileId || activeMovieRecord.id}</span>
                  </div>
                  <div className="mt-1.5 flex items-center space-x-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      activeMovieRecord.status === 'ACTIVE'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                        : activeMovieRecord.status === 'FAILED'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                        : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                    }`}>
                      STATE: {activeMovieRecord.status}
                    </span>
                    <span className="text-xs text-slate-300">
                      {activeMovieRecord.status === 'ACTIVE'
                        ? 'MOVIE READY // Gemini video stream ACTIVE for analysis'
                        : activeMovieRecord.statusMessage || 'Processing...'}
                    </span>
                  </div>
                  {activeMovieRecord.errorMessage && (
                    <div className="mt-1 text-xs text-rose-400 font-mono bg-rose-950/40 p-1.5 rounded border border-rose-500/30">
                      Error: {activeMovieRecord.errorMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Action for Active Movie */}
              <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
                {activeMovieRecord.status === 'ACTIVE' && (
                  <button
                    onClick={async () => {
                      playHudClick();
                      setIsIngestionCenterOpen(false);
                      await startAnalysisJob();
                    }}
                    disabled={activeAnalysisJob?.status === 'RUNNING' || activeAnalysisJob?.status === 'QUEUED'}
                    className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-tech font-bold text-xs rounded-lg border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>START AI ANALYSIS</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: UPLOAD FORM */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              {/* Drag and drop zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                    : 'border-cyan-500/30 hover:border-cyan-400/60 bg-[#040a1c]/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,.mp4,.mov,.mkv,.webm,.avi,.flv,.wmv,.3gp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <UploadCloud className="w-7 h-7 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-sm font-tech font-bold text-slate-100">
                      CHOOSE VIDEO FILE OR DRAG & DROP
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports MP4, MOV, MKV, WebM, AVI (Up to 2.00 GB Gemini API limit)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold tracking-wider hover:bg-cyan-500/30 transition-all pointer-events-none"
                  >
                    BROWSE LOCAL FILES
                  </button>
                </div>
              </div>

              {/* Validation error badge */}
              {validationError && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-lg flex items-center space-x-3 text-rose-300 text-xs font-mono">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Selected file preview & pre-flight details */}
              {selectedFile && !validationError && (
                <div className="p-4 rounded-lg bg-[#06122d] border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileVideo className="w-6 h-6 text-cyan-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-tech">
                          {selectedFile.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {formatFileSize(selectedFile.size)} • {selectedFile.type || 'video/mp4'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-slate-400 hover:text-rose-400 text-xs font-mono"
                    >
                      CLEAR
                    </button>
                  </div>

                  {/* Pre-flight info */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-black/40 rounded border border-cyan-500/20 text-center text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">FILE SIZE</span>
                      <span className="text-cyan-300 font-bold">{formatFileSize(selectedFile.size)}</span>
                      <span className="text-[9px] text-slate-500 block">(&lt; 2GB Limit)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">RESOLUTION</span>
                      <span className="text-cyan-300 font-bold">
                        {isExtractingMeta ? 'READING...' : videoMeta?.resolution || '1080p'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">EST. DURATION</span>
                      <span className="text-cyan-300 font-bold">
                        {isExtractingMeta ? 'READING...' : formatDuration(videoMeta?.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Upload button or progress */}
                  {isMovieUploading ? (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-cyan-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          UPLOADING TO SERVER & GEMINI FILES API...
                        </span>
                        <span className="text-cyan-300 font-bold">{movieUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-cyan-500/30">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-150"
                          style={{ width: `${movieUploadProgress}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 text-center">
                        Streaming real binary bytes to Gemini Cloud Storage endpoint.
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleUploadSubmit}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech font-bold text-xs rounded-lg border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.25)] flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>START REAL MOVIE UPLOAD</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MOVIE LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400">
                  REAL STORED MOVIES IN DATABASE ({movieLibraryList.length})
                </div>
                <button
                  onClick={() => refreshMovieLibrary()}
                  className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 text-[11px] font-mono flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>REFRESH LIST</span>
                </button>
              </div>

              {movieLibraryList.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#040a1c] border border-cyan-500/20 space-y-2">
                  <Film className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-sm font-tech text-slate-400">NO MOVIES STORED YET</div>
                  <p className="text-xs text-slate-500">
                    Upload an MP4 video file to ingest it into the Gemini Files API.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-3 px-3 py-1.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono"
                  >
                    GO TO UPLOAD
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {movieLibraryList.map((movie) => {
                    const isSelected = activeMovieRecord?.id === movie.id;
                    return (
                      <div
                        key={movie.id}
                        className={`p-4 rounded-lg border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#071536] border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'bg-[#040c20] border-cyan-500/20 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded mt-0.5 ${
                            movie.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : movie.status === 'FAILED'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                              : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                          }`}>
                            <Film className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-100 font-tech">
                                {movie.originalName}
                              </span>
                              {isSelected && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                                  ACTIVE IN WORKSPACE
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                              <span>{movie.fileSizeFormatted}</span>
                              <span>•</span>
                              <span>{movie.resolution || '1080p'}</span>
                              <span>•</span>
                              <span>{movie.durationFormatted || formatDuration(movie.duration)}</span>
                              <span>•</span>
                              <span className="text-cyan-400">ID: {movie.id}</span>
                            </div>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                movie.status === 'ACTIVE'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : movie.status === 'FAILED'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                              }`}>
                                {movie.status}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {movie.status === 'ACTIVE'
                                  ? 'MOVIE READY'
                                  : movie.statusMessage || movie.status}
                              </span>
                            </div>
                            {movie.errorMessage && (
                              <div className="mt-1 text-[11px] text-rose-400 font-mono">
                                Error: {movie.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full md:w-auto shrink-0 justify-end">
                          <button
                            onClick={() => selectMovieFromLibrary(movie)}
                            className={`px-3 py-1.5 rounded text-xs font-tech font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                                : 'bg-slate-800 hover:bg-cyan-950/60 border border-slate-700 text-slate-200'
                            }`}
                          >
                            {isSelected ? 'LOADED' : 'SELECT & LOAD'}
                          </button>

                          <button
                            onClick={() => deleteMovie(movie.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
                            title="Delete movie record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-[#040c20] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Gemini Files API: Real video processing required before AI multimodal analysis.</span>
          <button
            onClick={() => setIsIngestionCenterOpen(false)}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-tech"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
