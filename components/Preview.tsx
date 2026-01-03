import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { HeroConfig, ViewMode } from "../types";
import { SceneManager } from "../services/threeManager";

interface PreviewProps {
  config: HeroConfig;
  viewMode?: ViewMode;
}

export interface PreviewHandle {
  capture: () => string;
}

const Preview = forwardRef<PreviewHandle, PreviewProps>(
  ({ config, viewMode = "desktop" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const [isMobile, setIsMobile] = useState(viewMode === "mobile");

    useImperativeHandle(ref, () => ({
      capture: () => {
        return sceneManagerRef.current?.captureSnapshot() || "";
      },
    }));

    useEffect(() => {
      setIsMobile(viewMode === "mobile");
      if (containerRef.current && sceneManagerRef.current) {
        sceneManagerRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    }, [viewMode]);

    useEffect(() => {
      const handleResize = () => {
        if (containerRef.current && sceneManagerRef.current) {
          sceneManagerRef.current.resize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
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

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [config]);

    const getLayoutStyles = () => {
      // Force mobile layout styles based on viewMode or screen width
      if (viewMode === "mobile" || isMobile) {
        return {
          textSection:
            "absolute bottom-0 left-0 w-full h-1/2 flex flex-col justify-center items-center px-6 text-center z-20",
          sceneOpacity: 1,
        };
      }

      switch (config.layout) {
        case "split-right":
          return {
            textSection:
              "absolute top-1/2 right-[8%] -translate-y-1/2 text-right max-w-[550px] z-20 hidden md:block",
            sceneOpacity: 1,
          };
        case "centered-stack":
          return {
            textSection:
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[80%] z-20",
            sceneOpacity: 0.25,
          };
        case "asymmetric-offset":
          return {
            textSection:
              "absolute bottom-[15vh] left-[10%] max-w-xl z-20 flex flex-col gap-8 text-left hidden md:flex",
            sceneOpacity: 1,
          };
        case "split-left":
        default:
          return {
            textSection:
              "absolute top-1/2 left-[8%] md:left-[15%] lg:left-[8%] -translate-y-1/2 text-left max-w-[550px] z-20 hidden md:block",
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
      letterSpacing: "-0.05em",
      fontWeight: 800,
    };

    const subtitleStyle = {
      color: config.subtitleColor,
      fontFamily:
        config.fontFamily === "mono" ? "monospace" : config.fontFamily,
      fontSize: isMobile ? "13px" : "16px",
      lineHeight: 1.6,
    };

    // Container dimensions based on viewMode
    const containerStyle = {
      width:
        viewMode === "mobile"
          ? "375px"
          : viewMode === "tablet"
          ? "768px"
          : "100%",
      height:
        viewMode === "mobile"
          ? "667px"
          : viewMode === "tablet"
          ? "1024px"
          : "100%",
      maxHeight: viewMode === "desktop" ? "100vh" : "90vh",
      borderRadius: viewMode === "desktop" ? "0" : "20px",
      border:
        viewMode === "desktop" ? "none" : "1px solid rgba(255,255,255,0.1)",
      boxShadow:
        viewMode === "desktop"
          ? "none"
          : "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    };

    return (
      <div className="flex items-center justify-center w-full h-full bg-[#050505] overflow-hidden">
        <div
          className="relative overflow-hidden select-none transition-all duration-700"
          style={{ ...containerStyle, backgroundColor: config.bgColor }}
        >
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: isMobile ? "40px 40px" : "140px 140px",
            }}
          />

          {/* 3D Render Layer (Canvas Container) */}
          <div
            ref={containerRef}
            className="absolute inset-0 z-0 transition-opacity duration-1000"
            style={{ opacity: layout.sceneOpacity }}
          />

          {/* Interface Overlay Layer */}
          <div className="relative z-10 w-full h-full pointer-events-none">
            <div
              className={`${layout.textSection} pointer-events-auto flex flex-col gap-8 md:gap-10`}
            >
              <div className="space-y-4">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mb-2 md:mb-8 block">
                  Project Sequence // Live_Data
                </span>
                <h1
                  className="title-font transition-all duration-700 ease-out break-words w-full"
                  style={textStyle}
                >
                  {config.headline}
                </h1>
              </div>

              <p
                className="font-light leading-relaxed uppercase tracking-[0.1em] transition-colors duration-500"
                style={subtitleStyle}
              >
                {config.subtitle}
              </p>

              <div
                className={`flex flex-wrap gap-6 md:gap-12 items-center ${
                  config.layout === "centered-stack" || viewMode !== "desktop"
                    ? "justify-center"
                    : config.layout === "split-right"
                    ? "justify-end"
                    : "justify-start"
                } pt-2`}
              >
                <a
                  href={config.ctaLink}
                  className="px-10 md:px-16 py-5 md:py-7 font-black text-[11px] md:text-[12px] uppercase tracking-[0.4em] transition-all hover:scale-[1.05] active:scale-95 shadow-2xl rounded-sm"
                  style={{
                    backgroundColor: config.ctaBgColor,
                    color: config.ctaTextColor,
                  }}
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
              <span className="text-[8px] font-black tracking-[0.4em] text-white/10 uppercase mb-3">
                Simulation_Active
              </span>
              <div className="w-16 md:w-32 h-[2px] bg-white/5 relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-current animate-[progress_6s_infinite]"
                  style={{ color: config.objColor }}
                />
              </div>
            </div>
          </div>

          <style>{`
          @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        `}</style>
        </div>
      </div>
    );
  }
);

export default Preview;
