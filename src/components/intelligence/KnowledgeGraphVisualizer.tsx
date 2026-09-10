/**
 * THE DEVIL'S EYE - Knowledge Graph Visualizer
 * Structured Cinema Narrative & Ontological Graph.
 * Character -> appears in -> Scene
 * Character -> interacts with -> Character
 * Scene -> contains -> Event
 * Event -> causes -> Event
 * Character -> located at -> Location
 * Character -> owns/uses -> Object
 * Scene -> contains -> Dialogue
 * Scene -> contains -> Music
 * Event -> occurs at -> Timestamp
 */

import React, { useState } from 'react';
import { GraphNode, GraphEdge } from '../../types';
import { 
  Network, 
  Filter, 
  Info, 
  User, 
  Film, 
  MapPin, 
  Box, 
  Sparkles, 
  Music, 
  Layers, 
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react';
import { playHudClick, playHudScan } from '../../services/soundFx';

interface KnowledgeGraphVisualizerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const KnowledgeGraphVisualizer: React.FC<KnowledgeGraphVisualizerProps> = ({
  nodes,
  edges,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [zoom, setZoom] = useState<number>(1);

  const categories = [
    { id: 'all', label: 'All Entities', icon: Network },
    { id: 'character', label: 'Characters', icon: User },
    { id: 'scene', label: 'Scenes', icon: Film },
    { id: 'location', label: 'Locations', icon: MapPin },
    { id: 'object', label: 'Totems & Objects', icon: Box },
    { id: 'event', label: 'Key Events', icon: Sparkles },
    { id: 'music', label: 'Music & Stems', icon: Music },
  ];

  const filteredNodes = filterCategory === 'all' 
    ? nodes 
    : nodes.filter(n => n.category === filterCategory);

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredEdges = edges.filter(e => 
    filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  const connectedEdges = edges.filter(
    e => e.source === selectedNodeId || e.target === selectedNodeId
  );

  const handleNodeClick = (node: GraphNode) => {
    playHudClick();
    setSelectedNodeId(node.id);
  };

  return (
    <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 hud-corners space-y-4 bg-[#030816]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300">
            <Network className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold text-slate-100 uppercase tracking-wider">
              CINEMA KNOWLEDGE GRAPH
            </h3>
            <p className="text-[11px] font-mono text-cyan-400/70">
              CROSS-MODAL CAUSALITY, CHARACTER INTERACTION & TOTEM RELATIONSHIPS
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              playHudClick();
              setZoom(Math.max(0.7, zoom - 0.15));
            }}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-cyan-400 px-1">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => {
              playHudClick();
              setZoom(Math.min(1.4, zoom + 0.15));
            }}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              playHudClick();
              setZoom(1);
            }}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 cursor-pointer"
            title="Reset Zoom"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex flex-wrap gap-1.5 text-xs font-tech">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                playHudClick();
                setFilterCategory(cat.id);
              }}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Canvas & Inspector View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SVG Graph Canvas (Col 8) */}
        <div className="lg:col-span-8 relative aspect-[16/10] bg-[#02050f] border border-cyan-500/20 rounded-lg overflow-hidden bg-hud-grid">
          {/* Subtle Cyber scanline */}
          <div className="absolute inset-0 bg-scanline pointer-events-none opacity-20" />

          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing"
            viewBox="0 0 640 560"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <defs>
              <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Render Links */}
            {filteredEdges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isHighlighted = selectedNodeId === edge.source || selectedNodeId === edge.target;

              return (
                <g key={edge.id}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isHighlighted ? '#00f0ff' : '#1e3a5f'}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeDasharray={isHighlighted ? 'none' : '4,4'}
                    className="transition-all duration-300"
                  />
                  {/* Midpoint relation label */}
                  {isHighlighted && (
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 4}
                      fill="#38bdf8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="bg-black px-1"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer pulse ring for selected node */}
                  {isSelected && (
                    <circle
                      r="22"
                      fill="none"
                      stroke={node.color}
                      strokeWidth="1.5"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Outer glowing halo */}
                  <circle
                    r={isSelected ? 18 : 14}
                    fill="#030816"
                    stroke={node.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-200 group-hover:stroke-white"
                  />

                  {/* Inner center dot */}
                  <circle
                    r={isSelected ? 6 : 4}
                    fill={node.color}
                  />

                  {/* Node Label Text */}
                  <text
                    y={isSelected ? 30 : 26}
                    fill={isSelected ? '#ffffff' : '#94a3b8'}
                    fontSize={isSelected ? '11' : '10'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom HUD Legend */}
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-black/80 border border-cyan-500/20 text-[10px] font-mono text-slate-400 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                <span>Character</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <span>Scene</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                <span>Location</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                <span>Totem/Object</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#ec4899]" />
                <span>Event</span>
              </span>
            </div>
            <span className="text-cyan-400">CLICK ANY NODE TO INSPECT CAUSAL LINKS</span>
          </div>
        </div>

        {/* Selected Node Telemetry & Connected Links Inspector (Col 4) */}
        <div className="lg:col-span-4 p-3.5 rounded-lg bg-[#02050f] border border-cyan-500/30 flex flex-col justify-between space-y-3">
          {selectedNode ? (
            <div className="space-y-3">
              <div className="border-b border-cyan-500/20 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    {selectedNode.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">ID: {selectedNode.id}</span>
                </div>
                <h4 className="text-sm font-tech font-bold text-slate-100 mt-1">{selectedNode.label}</h4>
              </div>

              {/* Connected Vectors */}
              <div className="space-y-2">
                <div className="text-[11px] font-tech font-bold uppercase text-cyan-300 flex items-center justify-between">
                  <span>Connected Relational Links ({connectedEdges.length})</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {connectedEdges.map((e) => {
                    const isSource = e.source === selectedNode.id;
                    const otherNodeId = isSource ? e.target : e.source;
                    const otherNode = nodes.find(n => n.id === otherNodeId);

                    return (
                      <div
                        key={e.id}
                        className="p-2.5 rounded bg-[#040a18] border border-cyan-500/20 hover:border-cyan-400/40 transition-colors text-xs space-y-1"
                      >
                        <div className="flex items-center space-x-1.5 font-mono text-[10px] text-cyan-300">
                          <span className="font-bold">{isSource ? '──>' : '<──'}</span>
                          <span className="uppercase text-amber-300">[{e.label}]</span>
                          <span className="text-slate-200 font-bold">{otherNode?.label || otherNodeId}</span>
                        </div>
                        {e.details && (
                          <p className="text-[11px] text-slate-400 font-sans pl-3 border-l border-cyan-500/30">
                            {e.details}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              SELECT A GRAPH NODE TO VIEW ITS CAUSAL EDGES AND CINEMATIC PROBABILITY TENSORS.
            </div>
          )}

          <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20 text-[10px] font-mono text-slate-400">
            ONTOLOGY: Verified across 8 analysis passes. Ready for automatic script explainer hook synthesis.
          </div>
        </div>
      </div>
    </div>
  );
};
