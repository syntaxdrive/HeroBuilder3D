
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { HeroConfig } from '../types';
import { SceneManager } from '../services/threeManager';

interface PreviewProps {
  config: HeroConfig;
}

export interface PreviewHandle {
  capture: () => string;
}

const Preview = forwardRef<PreviewHandle, PreviewProps>(({ config }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useImperativeHandle(ref, () => ({
    capture: () => {
      return sceneManagerRef.current?.captureSnapshot() || '';
    }
  }));

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (containerRef.current && sceneManagerRef.current) {
        sceneManagerRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };

    if (containerRef.current && !sceneManagerRef.current) {
      sceneManagerRef.current = new SceneManager(containerRef.current);
      handleResize();
    }

    const sm = sceneManagerRef.current;
    if (sm) {
      sm.updateObject(config);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config]);

  const getLayoutStyles = () => {
    switch (config.layout) {
      case 'split-right':
        return {
          textSection: "absolute top-1/2 right-[8%] md:right-[15%] -translate-y-1/2 text-center md:text-right max-w-xl z-20",
          sceneOpacity: 1,
        };
      case 'centered-stack':
        return {
          textSection: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-8 z-20",
          sceneOpacity: 0.25,
        };
      case 'asymmetric-offset':
        return {
          textSection: "absolute bottom-12 md:bottom-24 left-8 md:left-24 max-w-xl z-20 flex flex-col gap-8 text-left",
          sceneOpacity: 1,
        };
      case 'split-left':
      default:
        return {
          textSection: "absolute top-1/2 left-[8%] md:left-[15%] -translate-y-1/2 text-center md:text-left max-w-xl z-20",
          sceneOpacity: 1,
        };
    }
  };

  const layout = getLayoutStyles();

  const textStyle = {
    fontSize: isMobile 
      ? `clamp(34px, 12vw, ${Math.min(config.fontSize, 54)}px)` 
      : `${config.fontSize}px`,
    fontFamily: config.fontFamily,
    color: config.headlineColor,
    lineHeight: 0.85,
    letterSpacing: '-0.05em',
    fontWeight: 800,
  };

  const subtitleStyle = {
    color: config.subtitleColor,
    fontFamily: config.fontFamily === 'mono' ? 'monospace' : config.fontFamily,
    fontSize: isMobile ? '13px' : '16px',
    lineHeight: 1.6
  };

  return (
    <div 
      className="relative flex-1 h-screen overflow-hidden select-none transition-colors duration-700"
      style={{ backgroundColor: config.bgColor }}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: isMobile ? '40px 40px' : '140px 140px' }} />

      {/* 3D Render Layer (Canvas Container) */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 transition-opacity duration-1000" 
        style={{ opacity: layout.sceneOpacity }}
      />

      {/* Interface Overlay Layer */}
      <div className="relative z-10 w-full h-full pointer-events-none">
          <div className={`${layout.textSection} pointer-events-auto flex flex-col gap-8 md:gap-10`}>
            
            <div className="space-y-4">
               <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mb-2 md:mb-8 block">Project Sequence // Live_Data</span>
               <h1 className="title-font transition-all duration-700 ease-out break-words w-full" style={textStyle}>
                 {config.headline}
               </h1>
            </div>
            
            <p className="font-light leading-relaxed uppercase tracking-[0.1em] transition-colors duration-500" style={subtitleStyle}>
              {config.subtitle}
            </p>
            
            <div className={`flex flex-wrap gap-6 md:gap-12 items-center ${config.layout === 'centered-stack' ? 'justify-center' : config.layout === 'split-right' ? 'justify-end' : 'justify-start'} pt-2`}>
              <a 
                href={config.ctaLink} 
                className="px-10 md:px-16 py-5 md:py-7 font-black text-[11px] md:text-[12px] uppercase tracking-[0.4em] transition-all hover:scale-[1.05] active:scale-95 shadow-2xl rounded-sm"
                style={{ backgroundColor: config.ctaBgColor, color: config.ctaTextColor }}
              >
                {config.ctaText}
              </a>
              <button className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors border-b border-white/5 pb-1">
                View Archive
              </button>
            </div>
          </div>
      </div>

      <div className="absolute bottom-10 left-10 z-20 pointer-events-none flex items-center gap-10">
         <div className="flex flex-col">
            <span className="text-[8px] font-black tracking-[0.4em] text-white/10 uppercase mb-3">Simulation_Active</span>
            <div className="w-16 md:w-32 h-[2px] bg-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-current animate-[progress_6s_infinite]" style={{ color: config.objColor }} />
            </div>
         </div>
      </div>
      
      <style>{`
         @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
});

export default Preview;
