import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Film, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Sparkles, 
  RefreshCw,
  FileVideo,
  ArrowRight
} from 'lucide-react';
import { playHudClick } from '../services/soundFx';

export const MovieLibrary: React.FC = () => {
  const { 
    movieLibraryList, 
    refreshMovieLibrary, 
    activeMovieRecord, 
    selectMovieFromLibrary, 
    deleteMovie,
    setIsIngestionCenterOpen, 
    startAnalysisJob,
    activeAnalysisJob,
    navigateTo 
  } = useApp();

  useEffect(() => {
    refreshMovieLibrary();
  }, [refreshMovieLibrary]);

  const formatDuration = (secs?: number): string => {
    if (!secs) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 p-6 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-lg font-display font-bold text-cyan-200 tracking-wider flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            <span>CINEMA MOVIE LIBRARY</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Source of truth: Real ingested movies and Gemini Files API records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              playHudClick();
              refreshMovieLibrary();
            }}
            className="p-2 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 text-xs transition-all cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playHudClick();
              setIsIngestionCenterOpen(true);
            }}
            className="px-3.5 py-1.5 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>INGEST NEW MOVIE</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto w-full mt-6 space-y-6">
        
        {movieLibraryList.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#040c20] border border-cyan-500/20 max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-950/60 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-tech font-bold text-slate-100">
                NO ANALYZED MOVIE AVAILABLE
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No movie has been ingested yet. Upload an MP4 video file up to 2GB to begin processing through the Gemini Files API.
              </p>
            </div>
            <button
              onClick={() => {
                playHudClick();
                setIsIngestionCenterOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-tech font-bold transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)]"
            >
              UPLOAD FIRST MOVIE
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {movieLibraryList.map((movie) => {
              const isSelected = activeMovieRecord?.id === movie.id;
              const isActive = movie.status === 'ACTIVE';
              const isProcessing = movie.status === 'PROCESSING' || movie.status === 'GEMINI_PROCESSING' || movie.status === 'UPLOADING';
              const isFailed = movie.status === 'FAILED';

              return (
                <div
                  key={movie.id}
                  className={`bg-[#050b1c] border rounded-xl p-5 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.2)] bg-[#071434]'
                      : 'border-cyan-500/20 hover:border-cyan-400/40'
                  }`}
                >
                  <div>
                    {/* Top status bar */}
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isActive
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : isFailed
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 animate-pulse'
                      }`}>
                        {isActive ? 'MOVIE READY' : movie.status}
                      </span>
                      <span className="text-slate-400">{movie.resolution || '1080p'}</span>
                    </div>

                    {/* Movie title */}
                    <h3 className="text-base font-bold text-slate-100 mt-3 font-tech truncate" title={movie.originalName}>
                      {movie.originalName}
                    </h3>

                    {/* Meta tags */}
                    <div className="mt-2 space-y-1 text-xs font-mono text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>SIZE:</span>
                        <span className="text-slate-200">{movie.fileSizeFormatted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>DURATION:</span>
                        <span className="text-slate-200">{movie.durationFormatted || formatDuration(movie.duration)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>GEMINI ID:</span>
                        <span className="text-cyan-400 text-[10px] truncate max-w-[160px]">
                          {movie.geminiFileId || 'PENDING'}
                        </span>
                      </div>
                    </div>

                    {/* Error message display if failed */}
                    {isFailed && (
                      <div className="mt-3 p-2 bg-rose-950/40 border border-rose-500/30 rounded text-[11px] font-mono text-rose-300">
                        <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-rose-400" />
                        {movie.errorMessage || 'Ingestion failed in Gemini Files API'}
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        selectMovieFromLibrary(movie);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded text-xs font-tech font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                          : 'bg-slate-800 hover:bg-cyan-950/60 border border-slate-700 text-slate-200'
                      }`}
                    >
                      {isSelected ? 'LOADED IN CORE' : 'SELECT & LOAD'}
                    </button>

                    {isActive && isSelected && (
                      <button
                        onClick={async () => {
                          playHudClick();
                          await startAnalysisJob();
                          navigateTo('command-center');
                        }}
                        disabled={activeAnalysisJob?.status === 'RUNNING' || activeAnalysisJob?.status === 'QUEUED'}
                        className="py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-tech font-bold text-xs rounded border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center gap-1 cursor-pointer"
                        title="Start Multimodal Analysis"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>ANALYZE</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteMovie(movie.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
                      title="Delete movie"
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
    </div>
  );
};
