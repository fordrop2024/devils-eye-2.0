/**
 * THE DEVIL'S EYE - Official AI Visual Identity Component
 * 
 * Preserves the exact logo geometry, gunmetal metallic structure,
 * red/orange energy iris, vertical slit pupil, and official typography.
 * 
 * Implements subtle, cinematic state-based animations:
 * - Real application event control (IDLE, WATCHING, THINKING, PROCESSING, ANALYZING, etc.)
 * - Natural blinks, restrained iris energy breathing, pupil dilation & gaze tracking
 * - Optical HUD alignment without cartoon exaggeration or logo distortion.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EyeConfig } from '../../types';
import { DEFAULT_EYE_CONFIG } from '../../services/eyeConfigDefaults';
import { useApp } from '../../context/AppContext';

export type DevilEyeState =
  | 'IDLE'
  | 'WATCHING'
  | 'THINKING'
  | 'PROCESSING'
  | 'ANALYZING'
  | 'FOCUS'
  | 'ALERT'
  | 'WARNING'
  | 'ERROR'
  | 'SUCCESS'
  | 'SLEEP'
  | 'WAKE-UP'
  | 'DEVIL MODE';

export interface DevilEyeProps {
  state?: DevilEyeState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showWordmark?: boolean;
  showTelemetry?: boolean;
  interactive?: boolean;
  className?: string;
  config?: Partial<EyeConfig>;
  onClick?: () => void;
}

export const DevilEye: React.FC<DevilEyeProps> = ({
  state: propState,
  size = 'md',
  showWordmark = false,
  showTelemetry = false,
  interactive = true,
  className = '',
  config: propConfig,
  onClick
}) => {
  let contextConfig: EyeConfig = DEFAULT_EYE_CONFIG;
  let contextState: DevilEyeState = 'IDLE';

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const app = useApp();
    if (app) {
      if (app.eyeConfig) contextConfig = app.eyeConfig;
      if (app.devilEyeState) contextState = app.devilEyeState;
    }
  } catch {
    // Safe fallback if rendered outside AppContext
  }

  const effectiveConfig: EyeConfig = useMemo(() => {
    return propConfig ? { ...contextConfig, ...propConfig } : contextConfig;
  }, [contextConfig, propConfig]);

  const state = propState || contextState;

  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Blink timer configured via eyeConfig
  useEffect(() => {
    if (state === 'SLEEP') return;

    let timeoutId: any;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        const freq = (effectiveConfig.blinkFrequency || 5) * 1000;
        const nextInterval = (freq * 0.7) + (Math.random() * freq * 0.6);
        timeoutId = setTimeout(triggerBlink, nextInterval);
      }, effectiveConfig.blinkDuration || 160);
    };

    const initialDelay = Math.random() * 2000 + 1500;
    timeoutId = setTimeout(triggerBlink, initialDelay);
    return () => clearTimeout(timeoutId);
  }, [state, effectiveConfig.blinkFrequency, effectiveConfig.blinkDuration]);

  // Mouse tracking based on eyeConfig and responseMode
  useEffect(() => {
    if (!interactive || !effectiveConfig.cursorTracking) {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    if (effectiveConfig.responseMode === 'fixed') {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    if (effectiveConfig.responseMode === 'scanning') {
      let scanAngle = 0;
      const interval = setInterval(() => {
        scanAngle += 0.08 * effectiveConfig.animationSpeed;
        const x = Math.sin(scanAngle) * 5 * effectiveConfig.movementSensitivity;
        setPupilOffset({ x, y: 0 });
      }, 50);
      return () => clearInterval(interval);
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      const maxDisplacement = (state === 'DEVIL MODE' ? 8 : state === 'FOCUS' ? 3 : 5) * effectiveConfig.movementSensitivity;
      const clampedX = Math.max(-maxDisplacement, Math.min(maxDisplacement, deltaX * maxDisplacement));
      const clampedY = Math.max(-maxDisplacement, Math.min(maxDisplacement, deltaY * maxDisplacement));

      setPupilOffset({ x: clampedX, y: clampedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, state, effectiveConfig.cursorTracking, effectiveConfig.movementSensitivity, effectiveConfig.responseMode, effectiveConfig.animationSpeed]);

  // Dimensions mapping
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'xs':
        return { box: 'w-7 h-7', image: 'w-7 h-7', text: 'text-[10px]', ring: 'p-0.5' };
      case 'sm':
        return { box: 'w-10 h-10', image: 'w-10 h-10', text: 'text-xs', ring: 'p-1' };
      case 'md':
        return { box: 'w-20 h-20', image: 'w-20 h-20', text: 'text-sm', ring: 'p-1.5' };
      case 'lg':
        return { box: 'w-36 h-36', image: 'w-36 h-36', text: 'text-base', ring: 'p-2' };
      case 'hero':
      default:
        return { box: 'w-64 h-64 sm:w-72 sm:h-72', image: 'w-64 h-64 sm:w-72 sm:h-72', text: 'text-lg', ring: 'p-3' };
    }
  }, [size]);

  // Dynamic glow and HUD colors based on effective hue
  const computedGlow = useMemo(() => {
    if (effectiveConfig.hue !== 0) {
      return `hsla(${effectiveConfig.hue}, 90%, 55%, ${0.65 * effectiveConfig.glowIntensity})`;
    }
    return effectiveConfig.glowColor || 'rgba(239, 68, 68, 0.65)';
  }, [effectiveConfig.hue, effectiveConfig.glowColor, effectiveConfig.glowIntensity]);

  // State visuals and dynamic speed scaling
  const animSpeed = effectiveConfig.animationSpeed || 1.0;

  const stateVisuals = useMemo(() => {
    switch (state) {
      case 'WATCHING':
        return {
          glow: computedGlow,
          border: 'border-red-500/50',
          badgeBg: 'bg-red-950/70 border-red-500/50 text-red-300',
          pulseSpeed: 'duration-1000',
          label: 'WATCHING'
        };
      case 'THINKING':
        return {
          glow: effectiveConfig.hue !== 0 ? computedGlow : 'rgba(249, 115, 22, 0.6)',
          border: 'border-orange-500/60',
          badgeBg: 'bg-orange-950/70 border-orange-500/50 text-orange-300',
          pulseSpeed: 'duration-700',
          label: 'THINKING'
        };
      case 'PROCESSING':
        return {
          glow: effectiveConfig.hue !== 0 ? computedGlow : 'rgba(234, 88, 12, 0.7)',
          border: 'border-amber-500/60',
          badgeBg: 'bg-amber-950/70 border-amber-500/60 text-amber-300',
          pulseSpeed: 'duration-500',
          label: 'PROCESSING'
        };
      case 'ANALYZING':
        return {
          glow: computedGlow,
          border: 'border-red-600/80 shadow-[0_0_25px_rgba(220,38,38,0.5)]',
          badgeBg: 'bg-red-950/90 border-red-500 text-red-200 animate-pulse',
          pulseSpeed: 'duration-500',
          label: 'ANALYZING CINEMA'
        };
      case 'FOCUS':
        return {
          glow: effectiveConfig.hue !== 0 ? computedGlow : 'rgba(6, 182, 212, 0.85)',
          border: 'border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.4)]',
          badgeBg: 'bg-cyan-950/80 border-cyan-400 text-cyan-300',
          pulseSpeed: 'duration-300',
          label: 'TARGET LOCKED'
        };
      case 'ALERT':
        return {
          glow: 'rgba(239, 68, 68, 0.9)',
          border: 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)]',
          badgeBg: 'bg-red-900 border-red-400 text-red-100 animate-ping',
          pulseSpeed: 'duration-300',
          label: 'ALERT'
        };
      case 'WARNING':
        return {
          glow: 'rgba(245, 158, 11, 0.75)',
          border: 'border-amber-400',
          badgeBg: 'bg-amber-950/80 border-amber-400 text-amber-200',
          pulseSpeed: 'duration-500',
          label: 'WARNING'
        };
      case 'ERROR':
        return {
          glow: 'rgba(220, 38, 38, 0.95)',
          border: 'border-red-700 shadow-[0_0_30px_rgba(185,28,28,0.9)]',
          badgeBg: 'bg-red-950 border-red-600 text-red-400',
          pulseSpeed: 'duration-200',
          label: 'ERROR'
        };
      case 'SUCCESS':
        return {
          glow: 'rgba(16, 185, 129, 0.75)',
          border: 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]',
          badgeBg: 'bg-emerald-950/80 border-emerald-400 text-emerald-200',
          pulseSpeed: 'duration-1000',
          label: 'COMPLETE'
        };
      case 'SLEEP':
        return {
          glow: 'rgba(100, 116, 139, 0.2)',
          border: 'border-slate-700',
          badgeBg: 'bg-slate-900 border-slate-700 text-slate-500',
          pulseSpeed: 'duration-2000',
          label: 'STANDBY'
        };
      case 'WAKE-UP':
        return {
          glow: computedGlow,
          border: 'border-cyan-400',
          badgeBg: 'bg-slate-900 border-cyan-400 text-cyan-300',
          pulseSpeed: 'duration-500',
          label: 'BOOTING AI'
        };
      case 'DEVIL MODE':
        return {
          glow: 'rgba(255, 0, 0, 0.95)',
          border: 'border-red-500 shadow-[0_0_35px_rgba(255,0,0,0.8)]',
          badgeBg: 'bg-black border-red-500 text-red-500 font-black tracking-widest',
          pulseSpeed: 'duration-300',
          label: 'DEVIL MODE ACTIVE'
        };
      case 'IDLE':
      default:
        return {
          glow: computedGlow,
          border: 'border-red-900/40',
          badgeBg: 'bg-slate-950/80 border-red-950 text-slate-400',
          pulseSpeed: 'duration-1500',
          label: 'IDLE'
        };
    }
  }, [state, computedGlow, effectiveConfig.hue]);

  const effectiveState = isHovered && state === 'IDLE' ? 'WATCHING' : state;

  return (
    <div 
      ref={containerRef}
      id="devils-eye-ai-core"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Outer Holographic Reticle Rings */}
      <div className={`relative ${sizeConfig.box} flex items-center justify-center`}>
        {/* Subtle Ambient Radial Glow */}
        <div 
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-700"
          style={{ 
            background: `radial-gradient(circle, ${stateVisuals.glow} 0%, transparent 70%)`,
            transform: `scale(${state === 'ANALYZING' || state === 'DEVIL MODE' ? 1.35 : 1.1})`
          }}
        />

        {/* Outer Rotating HUD Calibration Ring (visible on medium & larger) */}
        {(size === 'md' || size === 'lg' || size === 'hero') && (
          <motion.div
            animate={{ rotate: state === 'ANALYZING' ? 360 : [0, 360] }}
            transition={{ 
              repeat: Infinity, 
              duration: (state === 'ANALYZING' ? 8 : (effectiveConfig.irisRotationSpeed || 30)) / animSpeed, 
              ease: 'linear' 
            }}
            className="absolute -inset-2 rounded-full border border-dashed pointer-events-none"
            style={{ borderColor: computedGlow, opacity: effectiveConfig.hudIntensity || 0.7 }}
          />
        )}

        {/* Scanline Sweep in ANALYZING & PROCESSING states */}
        {(state === 'ANALYZING' || state === 'PROCESSING') && (
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.6 / animSpeed, ease: 'easeInOut' }}
            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent z-20 pointer-events-none opacity-80"
          />
        )}

        {/* Official Logo Housing & Base Image */}
        <div 
          className={`relative ${sizeConfig.image} rounded-full overflow-hidden border ${stateVisuals.border} transition-all duration-500 bg-[#060a14] flex items-center justify-center`}
          style={{
            boxShadow: `0 0 20px ${stateVisuals.glow}`
          }}
        >
          {/* THE DEVIL'S EYE OFFICIAL LOGO ASSET WITH REAL-TIME HUE & SATURATION FILTER */}
          <motion.img
            src="/assets/devils-eye-logo.jpg"
            alt="THE DEVIL'S EYE AI Core"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain pointer-events-none"
            style={{
              filter: `hue-rotate(${effectiveConfig.hue || 0}deg) saturate(${effectiveConfig.saturation ?? 100}%) brightness(${effectiveConfig.brightness ?? 100}%) contrast(110%)`,
              transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px) scale(${
                effectiveState === 'FOCUS' ? 1.04 : effectiveState === 'DEVIL MODE' ? 1.08 : 1
              })`,
              transition: 'transform 0.12s ease-out'
            }}
          />

          {/* Iris Energy Pulse Overlay */}
          <motion.div 
            animate={{
              opacity: state === 'ANALYZING' ? [0.15, 0.4, 0.15] : state === 'THINKING' ? [0.1, 0.35, 0.1] : [0.05, 0.15, 0.05]
            }}
            transition={{ repeat: Infinity, duration: (state === 'ANALYZING' ? 1.2 : 2.5) / animSpeed, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-red-600/30 to-transparent mix-blend-screen pointer-events-none"
          />

          {/* Natural Eyelid Shutter (Blink or Sleep) */}
          <AnimatePresence>
            {(isBlinking || state === 'SLEEP') && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.1, ease: 'easeInOut' }}
                className="absolute inset-0 bg-[#02040a] z-30 pointer-events-none origin-center"
              >
                <div 
                  className="absolute top-1/2 left-0 right-0 h-[1px] shadow-[0_0_8px_#ef4444]"
                  style={{ backgroundColor: computedGlow }} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner Precision Targeting Ticks (Hero & Large size) */}
          {(size === 'lg' || size === 'hero') && (
            <>
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l pointer-events-none" style={{ borderColor: computedGlow }} />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r pointer-events-none" style={{ borderColor: computedGlow }} />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l pointer-events-none" style={{ borderColor: computedGlow }} />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r pointer-events-none" style={{ borderColor: computedGlow }} />
            </>
          )}
        </div>
      </div>

      {/* Official Wordmark */}
      {showWordmark && (
        <div className="mt-2 text-center">
          <div 
            className="font-display font-black tracking-[0.25em] text-xs uppercase"
            style={{ 
              color: effectiveConfig.hue !== 0 ? `hsl(${effectiveConfig.hue}, 90%, 65%)` : '#ef4444',
              textShadow: `0 0 8px ${computedGlow}` 
            }}
          >
            THE DEVIL'S EYE
          </div>
          <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
            CINEMATIC MULTIMODAL AI
          </div>
        </div>
      )}

      {/* Live AI State Telemetry Tag */}
      {showTelemetry && (
        <div className="mt-2.5 flex items-center space-x-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider border ${stateVisuals.badgeBg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
            {stateVisuals.label}
          </span>
        </div>
      )}
    </div>
  );
};

