/**
 * THE DEVIL'S EYE - Full-screen Cinematic Login & Neural Initialization
 * Holographic AI Command Portal with initialization sequence and Guest clearance.
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, Shield, Terminal, Zap, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { playHudClick, playHudScan, playHudSuccess } from '../../services/soundFx';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginAsGuest } = useApp();

  const [bootStep, setBootStep] = useState<number>(0);
  const bootLogs = [
    'CONNECTING CINEMA CORE [PORT 8080]...',
    'VERIFYING NEURAL BIOMETRICS & PERMISSIONS...',
    'INITIALIZING AI MULTIMODAL INGESTION MATRIX...',
    'LOADING NEURAL INTERFACE v2.8.1...',
    'READY FOR OPERATOR CLEARANCE.',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBootStep((prev) => {
        if (prev < bootLogs.length - 1) {
          playHudScan();
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [bootLogs.length]);

  return (
    <div className="relative w-screen h-screen bg-[#02040a] text-slate-100 flex flex-col justify-between overflow-hidden select-none bg-hud-grid">
      {/* Background radial glow & animated scanlines */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

      {/* Top Header HUD bar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-cyan-500/20 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="relative w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-400/80 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <Eye className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="text-base font-display font-black tracking-widest text-cyan-200">
              THE DEVIL'S EYE
            </div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400/70 uppercase">
              AI CINEMA COMMAND SYSTEM
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/80 border border-cyan-500/30 rounded-full px-4 py-1.5 font-mono text-xs text-cyan-300">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>SYSTEM STATUS: <strong className="text-emerald-400">READY / STANDBY</strong></span>
        </div>
      </header>

      {/* Center Cinematic Stage */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="max-w-xl w-full">
          {/* Main Holographic Terminal Box */}
          <div className="hud-panel p-8 rounded-xl border border-cyan-500/40 relative shadow-[0_0_50px_rgba(0,240,255,0.12)] hud-corners-all">
            {/* Top corner target indicators */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-6">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>BOOT SEQUENCE // SEC-AUTH-09</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                PROTO: DE-V2 // ENCRYPTED
              </div>
            </div>

            {/* Central Holographic Emblem */}
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 border-dashed animate-[spin_15s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-blue-500/60 animate-[spin_8s_linear_infinite_reverse]" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-b from-cyan-500/20 to-blue-900/40 border border-cyan-300/80 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,240,255,0.5)]">
                  <Eye className="w-8 h-8 text-cyan-300" />
                </div>
              </div>

              <h1 className="text-2xl font-display font-extrabold tracking-wider text-cyan-100">
                THE DEVIL'S EYE
              </h1>
              <p className="text-xs font-tech text-cyan-400/80 mt-1 uppercase tracking-widest">
                AI UNDERSTANDS → AI WRITES → AI EDITS → HUMAN TOUCH → EXPORT
              </p>
            </div>

            {/* Terminal Boot Log Feed */}
            <div className="bg-[#02050e] border border-cyan-500/30 rounded p-3 mb-6 font-mono text-[11.5px] space-y-1 text-slate-300 min-h-[120px]">
              {bootLogs.slice(0, bootStep + 1).map((log, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-cyan-400 font-bold">&gt;</span>
                  <span className={index === bootStep ? 'text-cyan-300 font-medium' : 'text-slate-400'}>
                    {log}
                  </span>
                  {index < bootStep && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 ml-auto" />
                  )}
                </div>
              ))}
              {bootStep < bootLogs.length - 1 && (
                <div className="inline-block w-2 h-3.5 bg-cyan-400 animate-pulse" />
              )}
            </div>

            {/* Authentication Action Controls */}
            <div className="space-y-3 pt-2">
              {/* Google Sign-in */}
              <button
                onClick={() => {
                  playHudClick();
                  loginWithGoogle();
                }}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech text-sm font-bold tracking-wider py-3 px-4 rounded border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center space-x-2.5 cursor-pointer group"
              >
                <Shield className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
                <span>SIGN IN WITH GOOGLE (CREATOR ACCESS)</span>
                <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Guest / Local Demo Mode */}
              <button
                onClick={() => {
                  playHudSuccess();
                  loginAsGuest();
                }}
                className="w-full bg-[#081324] hover:bg-[#0c1f3a] text-cyan-300 hover:text-cyan-200 font-tech text-xs tracking-wider py-2.5 px-4 rounded border border-cyan-500/30 hover:border-cyan-400/60 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>EXPLORE WORKSTATION (GUEST / LOCAL DEMO MODE)</span>
              </button>
            </div>

            <div className="text-[10px] font-mono text-center text-slate-500 mt-4">
              SECURE LOCAL CLIENT PERSISTENCE • ZERO-DEPENDENCY OFFLINE ENGINE
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Telemetry */}
      <footer className="px-8 py-3 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-cyan-400/60 z-10">
        <div>THE DEVIL'S EYE // CORE v2.8.1 MULTIMODAL KERNEL</div>
        <div className="flex items-center space-x-4">
          <span>LATENCY: 12ms</span>
          <span>GPU ACCELERATED</span>
          <span>NEURAL ENCRYPTION: ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};
