import React, { useState } from "react";
import {
  HeroConfig,
  ShapeType,
  LayoutType,
  AlignmentType,
  FontFamily,
  User,
  UiTheme,
  Project,
  ViewMode,
} from "../types";
import { MATERIAL_PRESETS, FREE_SHAPES, FREE_ANIMATIONS } from "../constants";

interface EditorProps {
  config: HeroConfig;
  onChange: (newConfig: HeroConfig) => void;
  onExport: () => void;
  isPro: boolean;
  user: User | null;
  projects: Project[];
  onSaveProject: (name: string) => void;
  onLoadProject: (id: string) => void;
  onLogout: () => void;
  onAuthClick: () => void;
  onPricingClick: () => void;
  onLiveViewClick: () => void;
  onClose: () => void;
  onAiSynthesize: (prompt: string) => void;
  isSynthesizing: boolean;
  uiTheme: UiTheme;
  onThemeChange: (t: UiTheme) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const LAYOUTS: { id: LayoutType; label: string }[] = [
  { id: "split-left", label: "Left Side" },
  { id: "split-right", label: "Right Side" },
  { id: "centered-stack", label: "Centered" },
  { id: "asymmetric-offset", label: "Asymmetric" },
];

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  pro?: boolean;
  isPro: boolean;
}> = ({ title, children, pro = false, isPro }) => (
  <div className="mb-8 last:mb-0">
    <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-2">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] opacity-50">
        {title}
      </h3>
      {pro && !isPro && (
        <span className="text-[9px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 border border-[var(--accent)]/20 font-black uppercase tracking-widest rounded-sm">
          PRO
        </span>
      )}
    </div>
    <fieldset
      disabled={pro && !isPro}
      className={`space-y-5 transition-opacity duration-300 ${
        pro && !isPro ? "opacity-40 pointer-events-none grayscale" : ""
      }`}
    >
      {children}
    </fieldset>
  </div>
);

const ControlGroup: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex flex-col gap-3">
    <label className="text-[14px] font-bold uppercase tracking-wide opacity-70">
      {label}
    </label>
    {children}
  </div>
);

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[11px] uppercase tracking-wider opacity-40">
      {label}
    </span>
    <div className="flex items-center justify-between p-4 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all bg-[var(--input-bg)] rounded-lg">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[14px] font-mono bg-transparent outline-none uppercase w-full text-[var(--text-main)]"
      />
      <div className="relative w-9 h-9 border border-[var(--border)] overflow-hidden rounded-md shrink-0 ml-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-[-15px] w-[200%] h-[200%] bg-transparent border-none cursor-pointer"
        />
      </div>
    </div>
  </div>
);

const Editor: React.FC<EditorProps> = ({
  config,
  onChange,
  onExport,
  isPro,
  user,
  onLogout,
  onAuthClick,
  onPricingClick,
  onLiveViewClick,
  onClose,
  onAiSynthesize,
  isSynthesizing,
  uiTheme,
  onThemeChange,
  projects,
  onSaveProject,
  onLoadProject,
  viewMode,
  onViewModeChange,
}) => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [showProjects, setShowProjects] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const handleChange = (field: keyof HeroConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col h-full editor-container w-full custom-scrollbar overflow-y-auto relative">
      {/* Top Header Panel - Compact */}
      <div className="p-5 space-y-4 border-b border-[var(--border)] sticky top-0 z-[70] bg-[var(--panel)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border border-[var(--accent)] flex items-center justify-center rounded-sm">
              <div className="w-1.5 h-1.5 bg-[var(--accent)] animate-pulse" />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.15em]">
              Editor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--accent)]/10 border border-[var(--border)] rounded-md transition-colors md:hidden"
            >
              <svg
                className="w-4 h-4 opacity-40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-[var(--input-bg)] rounded-lg border border-[var(--border)] p-1">
          {(["desktop", "tablet", "mobile"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                viewMode === mode
                  ? "bg-[var(--panel)] text-[var(--accent)] shadow-sm"
                  : "opacity-40 hover:opacity-100"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Compact Toolbar */}
        <div className="grid grid-cols-2 gap-2">
          {/* Project History Toggle */}
          <button
            onClick={() => setShowProjects(!showProjects)}
            className={`flex items-center justify-center gap-2 p-2.5 border border-[var(--border)] rounded-lg transition-all ${
              showProjects
                ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                : "bg-[var(--input-bg)] hover:border-[var(--accent)]"
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider">
              Projects
            </span>
          </button>

          {/* Live View Toggle */}
          <button
            onClick={onLiveViewClick}
            className="flex items-center justify-center gap-2 p-2.5 border border-[var(--border)] bg-[var(--input-bg)] rounded-lg hover:border-[var(--accent)] transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-wider">
              Live View
            </span>
          </button>
        </div>

        {/* Projects Panel (Expandable) */}
        {showProjects && (
          <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--bg)]/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {user ? (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="PROJECT NAME"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="flex-1 bg-[var(--input-bg)] border border-[var(--border)] p-2 rounded-md text-[10px] outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (newProjectName) {
                        onSaveProject(newProjectName);
                        setNewProjectName("");
                      }
                    }}
                    className="px-3 bg-[var(--accent)] text-[var(--bg)] font-bold rounded-md text-[9px] uppercase tracking-wider hover:opacity-90"
                  >
                    Save
                  </button>
                </div>

                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 border border-[var(--border)] rounded-md bg-[var(--bg)] hover:border-[var(--accent)] transition-colors group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold truncate max-w-[100px]">
                          {p.name}
                        </span>
                        <span className="text-[8px] opacity-50 font-mono">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onLoadProject(p.id)}
                          className="flex-1 py-1.5 bg-[var(--panel)] border border-[var(--border)] text-[8px] uppercase tracking-wider hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors rounded"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            const script = `<iframe src="${window.location.origin}?embed=${p.id}" style="width:100%;height:100vh;border:none;"></iframe>`;
                            navigator.clipboard.writeText(script);
                            alert("Embed code copied!");
                          }}
                          className="flex-1 py-1.5 bg-[var(--panel)] border border-[var(--border)] text-[8px] uppercase tracking-wider hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors rounded"
                        >
                          Embed
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-[10px] opacity-50 text-center py-2">
                      No saved projects.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-[10px] opacity-50 mb-2">Sign in to save</p>
                <button
                  onClick={onAuthClick}
                  className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider underline"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        )}

        {/* User & Theme Row */}
        <div className="flex items-center gap-2">
          {/* User Profile / Login */}
          <div className="flex-1">
            {user ? (
              <div className="flex items-center justify-between p-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)]">
                <div className="flex items-center gap-2">
                  {user.picture && (
                    <img
                      src={user.picture}
                      className="w-5 h-5 rounded-full ring-1 ring-[var(--accent)]/30"
                      alt="User"
                    />
                  )}
                  <span className="text-[10px] font-bold text-[var(--text-main)] truncate max-w-[80px] uppercase">
                    {user.name.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-[9px] font-bold opacity-30 hover:opacity-100 uppercase"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[10px] font-black uppercase tracking-wider hover:border-[var(--accent)] transition-colors text-center"
              >
                Login
              </button>
            )}
          </div>

          {/* Theme Toggle (Mini) */}
          <div className="flex bg-[var(--input-bg)] rounded-lg border border-[var(--border)] p-1">
            {(["dark", "light", "cyan"] as UiTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => onThemeChange(t)}
                className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                  uiTheme === t
                    ? "bg-[var(--panel)] text-[var(--accent)] shadow-sm"
                    : "opacity-30 hover:opacity-100"
                }`}
                title={t}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    t === "dark"
                      ? "bg-black"
                      : t === "light"
                      ? "bg-white border border-black/20"
                      : "bg-cyan-400"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-20 pt-5">
        {/* Pro Upgrade Banner */}
        {user && !user.isPro && (
          <button
            onClick={onPricingClick}
            className="w-full mb-6 py-3 bg-[var(--accent)] text-[var(--bg)] text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
          >
            Unlock Pro Features
          </button>
        )}
        {/* Layout Engine */}
        <Section title="Design Layout" isPro={isPro}>
          <ControlGroup label="Visual Alignment">
            <div className="grid grid-cols-2 gap-3">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleChange("layout", l.id)}
                  className={`py-4 px-3 border-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${
                    config.layout === l.id
                      ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5 shadow-xl shadow-[var(--accent)]/5"
                      : "border-[var(--border)] opacity-30 hover:opacity-100 hover:border-[var(--border)]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </ControlGroup>
        </Section>

        {/* Geometry controls */}
        <Section title="3D Geometry DNA" isPro={isPro}>
          <div className="grid grid-cols-1 gap-8">
            <ControlGroup label="Shape Selection">
              <div className="grid grid-cols-2 gap-3">
                {[
                  "sphere",
                  "torus",
                  "box",
                  "blob",
                  "cylinder",
                  "cone",
                  "torus_ring",
                  "octahedron",
                  "tetrahedron",
                ].map((s) => {
                  const isLocked = !isPro && !FREE_SHAPES.includes(s);
                  return (
                    <button
                      key={s}
                      disabled={isLocked}
                      onClick={() => handleChange("shape", s)}
                      className={`relative py-4 px-3 border-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${
                        config.shape === s
                          ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5"
                          : "border-[var(--border)] opacity-30 hover:opacity-100"
                      } ${
                        isLocked
                          ? "opacity-20 cursor-not-allowed hover:opacity-20"
                          : ""
                      }`}
                    >
                      {s.replace("_", " ")}
                      {isLocked && (
                        <div className="absolute top-1 right-1 text-[8px] bg-[var(--accent)] text-[var(--bg)] px-1 rounded">
                          PRO
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ControlGroup>
            <div className="grid grid-cols-1 gap-8">
              <ControlGroup
                label={`Object Scale: ${Math.round(config.modelScale * 100)}%`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={config.modelScale}
                    onChange={(e) =>
                      handleChange("modelScale", parseFloat(e.target.value))
                    }
                  />
                </div>
              </ControlGroup>
              <ControlGroup
                label={`Complexity: ${Math.round(config.complexity * 100)}%`}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.complexity}
                  onChange={(e) =>
                    handleChange("complexity", parseFloat(e.target.value))
                  }
                />
              </ControlGroup>
              <ControlGroup
                label={`Shape Distortion: ${Math.round(
                  config.distortion * 100
                )}%`}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.distortion}
                  onChange={(e) =>
                    handleChange("distortion", parseFloat(e.target.value))
                  }
                />
              </ControlGroup>
            </div>
          </div>
        </Section>

        {/* Material Library (Presets) */}
        <Section title="Material Library" pro isPro={isPro}>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(MATERIAL_PRESETS).map(([name, preset]) => (
              <button
                key={name}
                onClick={() => {
                  const newConfig = { ...config, ...preset };
                  // If preset has objColor, use it, otherwise keep current
                  if (preset.objColor) newConfig.objColor = preset.objColor;
                  onChange(newConfig);
                }}
                className="py-3 px-2 border border-[var(--border)] rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[var(--accent)] hover:text-[var(--bg)] hover:border-[var(--accent)] transition-all text-center"
              >
                {name}
              </button>
            ))}
          </div>
        </Section>

        {/* Material Physics */}
        <Section title="Material Physics" pro isPro={isPro}>
          <div className="grid grid-cols-1 gap-8">
            <ControlGroup
              label={`Metalness: ${Math.round(config.metalness * 100)}%`}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.metalness}
                onChange={(e) =>
                  handleChange("metalness", parseFloat(e.target.value))
                }
              />
            </ControlGroup>
            <ControlGroup
              label={`Roughness: ${Math.round(config.roughness * 100)}%`}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.roughness}
                onChange={(e) =>
                  handleChange("roughness", parseFloat(e.target.value))
                }
              />
            </ControlGroup>
            <ControlGroup
              label={`Transmission (Glass): ${Math.round(
                config.transmission * 100
              )}%`}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.transmission}
                onChange={(e) =>
                  handleChange("transmission", parseFloat(e.target.value))
                }
              />
            </ControlGroup>
          </div>
        </Section>

        {/* Animation Studio */}
        <Section title="Animation Studio" isPro={isPro}>
          <div className="grid grid-cols-1 gap-8">
            <ControlGroup label={`Rotation Speed: ${config.rotationSpeed}x`}>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={config.rotationSpeed}
                onChange={(e) =>
                  handleChange("rotationSpeed", parseFloat(e.target.value))
                }
              />
            </ControlGroup>
            <ControlGroup label={`Float Intensity: ${config.floatSpeed}x`}>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={config.floatSpeed}
                onChange={(e) =>
                  handleChange("floatSpeed", parseFloat(e.target.value))
                }
              />
            </ControlGroup>
            <ControlGroup label="Entrance Effect">
              <div className="grid grid-cols-2 gap-2">
                {["none", "fade", "scale-pop", "spin-reveal", "slide-up"].map(
                  (anim) => {
                    const isLocked = !isPro && !FREE_ANIMATIONS.includes(anim);
                    return (
                      <button
                        key={anim}
                        disabled={isLocked}
                        onClick={() => handleChange("entranceAnimation", anim)}
                        className={`relative py-2 px-2 border border-[var(--border)] rounded-lg text-[10px] font-black uppercase tracking-wider transition-all text-center ${
                          config.entranceAnimation === anim
                            ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                            : "hover:border-[var(--accent)]"
                        } ${
                          isLocked
                            ? "opacity-20 cursor-not-allowed hover:border-[var(--border)]"
                            : ""
                        }`}
                      >
                        {anim.replace("-", " ")}
                        {isLocked && (
                          <div className="absolute top-0 right-0 text-[6px] bg-[var(--accent)] text-[var(--bg)] px-1 rounded-bl">
                            PRO
                          </div>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </ControlGroup>
          </div>
        </Section>

        {/* Color Palette */}
        <Section title="Color Spectrum" isPro={isPro}>
          <div className="grid grid-cols-1 gap-6">
            <ColorInput
              label="Site Background"
              value={config.bgColor}
              onChange={(v) => handleChange("bgColor", v)}
            />
            <ColorInput
              label="Headline Text"
              value={config.headlineColor}
              onChange={(v) => handleChange("headlineColor", v)}
            />
            <ColorInput
              label="Subtitle Text"
              value={config.subtitleColor}
              onChange={(v) => handleChange("subtitleColor", v)}
            />
            <ColorInput
              label="3D Object Color"
              value={config.objColor}
              onChange={(v) => handleChange("objColor", v)}
            />
            <div className="grid grid-cols-2 gap-4">
              <ColorInput
                label="Button Fill"
                value={config.ctaBgColor}
                onChange={(v) => handleChange("ctaBgColor", v)}
              />
              <ColorInput
                label="Button Text"
                value={config.ctaTextColor}
                onChange={(v) => handleChange("ctaTextColor", v)}
              />
            </div>
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography Node" isPro={isPro}>
          <ControlGroup label="Primary Headline">
            <textarea
              value={config.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              className="w-full editor-input p-5 rounded-lg text-[16px] font-bold focus:ring-2 ring-[var(--accent)]/20 outline-none transition-all resize-none border border-[var(--border)] leading-tight"
              rows={2}
            />
          </ControlGroup>
          <ControlGroup label="Support Subtitle">
            <textarea
              value={config.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              className="w-full editor-input p-5 rounded-lg text-[15px] font-medium opacity-70 focus:ring-2 ring-[var(--accent)]/20 outline-none transition-all resize-none border border-[var(--border)] leading-relaxed"
              rows={3}
            />
          </ControlGroup>
          <div className="grid grid-cols-2 gap-6">
            <ControlGroup label="Scale">
              <div className="flex items-center gap-4 py-3">
                <input
                  type="range"
                  min="32"
                  max="140"
                  value={config.fontSize}
                  onChange={(e) =>
                    handleChange("fontSize", parseInt(e.target.value))
                  }
                />
                <span className="text-[14px] font-mono font-black text-[var(--accent)]">
                  {config.fontSize}
                </span>
              </div>
            </ControlGroup>
            <ControlGroup label="Typeface">
              <select
                value={config.fontFamily}
                onChange={(e) =>
                  handleChange("fontFamily", e.target.value as FontFamily)
                }
                className="w-full editor-input p-4 rounded-lg text-[12px] font-black uppercase outline-none border border-[var(--border)] cursor-pointer"
              >
                <option value="Inter">01 // Inter</option>
                <option value="Space Grotesk">02 // Grotesk</option>
                <option value="serif">03 // Serif</option>
                <option value="mono">04 // Mono</option>
              </select>
            </ControlGroup>
          </div>
        </Section>

        <div className="pt-20 border-t border-[var(--border)] mt-20">
          <button
            onClick={onExport}
            className="w-full py-10 bg-[var(--text-main)] text-[var(--bg)] font-black text-[16px] uppercase tracking-[0.5em] hover:bg-[var(--accent)] transition-all rounded-xl shadow-2xl active:scale-[0.98]"
          >
            Export Protocol
          </button>
          <p className="text-center text-[11px] uppercase tracking-widest opacity-20 mt-8 font-bold">
            System Build Version 1.2.5-C
          </p>
        </div>
      </div>
    </div>
  );
};

export default Editor;
