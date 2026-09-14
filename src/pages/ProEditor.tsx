import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EditorTopBar } from '../components/editor/EditorTopBar';
import { LeftMediaPanel } from '../components/editor/LeftMediaPanel';
import { RightInspectorPanel } from '../components/editor/RightInspectorPanel';
import { SourceMonitor } from '../components/editor/SourceMonitor';
import { ProgramMonitor } from '../components/editor/ProgramMonitor';
import { TimelineTrackView } from '../components/editor/TimelineTrackView';

export const ProEditor: React.FC = () => {
  const { currentProject } = useApp();
  const [activeMediaAsset, setActiveMediaAsset] = useState<any>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-[#02050e] text-slate-100 overflow-hidden select-none">
      {/* Top Workspace Bar */}
      <EditorTopBar selectedClipId={selectedClipId} />

      {/* Main Center Stage: Left Media Panel + Dual Monitors + Right Inspector */}
      <div className="flex-1 flex overflow-hidden border-b border-cyan-500/20">
        {/* Left Media Bin & Assets */}
        <LeftMediaPanel onSelectMedia={setActiveMediaAsset} />

        {/* Center: Dual Video Monitors */}
        <div className="flex-1 flex flex-col border-r border-cyan-500/20 overflow-hidden">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-[#030612] overflow-hidden">
            <SourceMonitor activeMedia={activeMediaAsset} />
            <ProgramMonitor />
          </div>
        </div>

        {/* Right Inspector & AI Director Controls */}
        <RightInspectorPanel selectedClipId={selectedClipId} />
      </div>

      {/* Bottom: Multitrack Timeline & Transport */}
      <div className="h-72 shrink-0 bg-[#030717]">
        <TimelineTrackView 
          selectedClipId={selectedClipId} 
          onSelectClip={setSelectedClipId} 
        />
      </div>
    </div>
  );
};
