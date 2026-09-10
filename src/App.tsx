/**
 * THE DEVIL'S EYE
 * AI-powered movie/web-series explainer creation platform + professional video editor.
 * 
 * Philosophy: AI UNDERSTANDS → AI WRITES → AI EDITS → HUMAN TOUCH → EXPORT
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { ExportModal } from './components/common/ExportModal';

// 17 Module Pages
import { CommandCenter } from './pages/CommandCenter';
import { MovieLibrary } from './pages/MovieLibrary';
import { MovieIntelligence } from './pages/MovieIntelligence';
import { StoryEngine } from './pages/StoryEngine';
import { ScriptStudio } from './pages/ScriptStudio';
import { VoiceLab } from './pages/VoiceLab';
import { AiFirstCut } from './pages/AiFirstCut';
import { ProEditor } from './pages/ProEditor';
import { SubtitleStudio } from './pages/SubtitleStudio';
import { ShortsLab } from './pages/ShortsLab';
import { ThumbnailLab } from './pages/ThumbnailLab';
import { SeoCenter } from './pages/SeoCenter';
import { YouTubePipeline } from './pages/YouTubePipeline';
import { AnalyticsCenter } from './pages/AnalyticsCenter';
import { ContentPlanner } from './pages/ContentPlanner';
import { WebSeriesManager } from './pages/WebSeriesManager';
import { SettingsView } from './pages/SettingsView';

const MainWorkstation: React.FC = () => {
  const { isAuthenticated, activePage } = useApp();

  // If unauthenticated or in boot sequence
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Dynamic Page Router
  const renderActivePage = () => {
    switch (activePage) {
      case 'command-center':
        return <CommandCenter />;
      case 'movie-library':
        return <MovieLibrary />;
      case 'movie-intelligence':
        return <MovieIntelligence />;
      case 'story-engine':
        return <StoryEngine />;
      case 'script-studio':
        return <ScriptStudio />;
      case 'voice-lab':
        return <VoiceLab />;
      case 'ai-first-cut':
        return <AiFirstCut />;
      case 'pro-editor':
        return <ProEditor />;
      case 'subtitles':
      case 'subtitle-studio':
        return <SubtitleStudio />;
      case 'shorts-lab':
        return <ShortsLab />;
      case 'thumbnail-lab':
        return <ThumbnailLab />;
      case 'seo-packaging':
      case 'seo-center':
        return <SeoCenter />;
      case 'youtube':
      case 'youtube-pipeline':
        return <YouTubePipeline />;
      case 'analytics':
        return <AnalyticsCenter />;
      case 'content-planner':
        return <ContentPlanner />;
      case 'web-series':
        return <WebSeriesManager />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col overflow-hidden relative select-none">
      {/* Subtle CRT Scanline overlay effect */}
      <div className="scanlines pointer-events-none fixed inset-0 z-40 opacity-30" />

      {/* Holographic Header */}
      <Header />

      {/* Main Workstation Flex: Sidebar + Dynamic Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Holographic Modals & Notifications */}
      <ToastContainer />
      <ExportModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainWorkstation />
    </AppProvider>
  );
}
