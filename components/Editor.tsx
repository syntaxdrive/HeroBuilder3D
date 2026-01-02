
import React, { useState } from 'react';
import { HeroConfig, ShapeType, LayoutType, AlignmentType, FontFamily, User, UiTheme } from '../types';

interface EditorProps {
  config: HeroConfig;
  onChange: (newConfig: HeroConfig) => void;
  onExport: () => void;
  isPro: boolean;
  user: User | null;
  onLogout: () => void;
  onAuthClick: () => void;
  onPricingClick: () => void;
  onLiveViewClick: () => void;
  onClose: () => void;
  onAiSynthesize: (prompt: string) => void;
  isSynthesizing: boolean;
  uiTheme: UiTheme;
  onThemeChange: (t: UiTheme) => void;
}

const LAYOUTS: { id: LayoutType; label: string }[] = [
  { id: 'split-left', label: 'Left Side' },
  { id: 'split-right', label: 'Right Side' },
  { id: 'centered-stack', label: 'Centered' },
  { id: 'asymmetric-offset', label: 'Asymmetric' }
];

const Section: React.FC<{ title: string; children: React.ReactNode; pro?: boolean; isPro: boolean }> = ({ title, children, pro = false, isPro }) => (
  <div className="mb-14 last:mb-0">
    <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-3">
      <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] opacity-50">{title}</h3>
      {pro && !isPro && (
        <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 border border-[var(--accent)]/20 font-black uppercase tracking-widest rounded-sm">PRO</span>
      )}
    </div>
    <div className="space-y-8">{children}</div>
  </div>
);

const ControlGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-3">
    <label className="text-[14px] font-bold uppercase tracking-wide opacity-70">
      {label}
    </label>
    {children}
  </div>
);

const ColorInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[11px] uppercase tracking-wider opacity-40">{label}</span>
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
  config, onChange, onExport, isPro, user, onLogout,
  onAuthClick, onPricingClick, onLiveViewClick, onClose, onAiSynthesize, isSynthesizing,
  uiTheme, onThemeChange
}) => {
  const [aiPrompt, setAiPrompt] = useState('');

  const handleChange = (field: keyof HeroConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col h-full editor-container w-full custom-scrollbar overflow-y-auto relative">
      
      {/* Top Header Panel */}
      <div className="p-10 pb-8 space-y-6 border-b border-[var(--border)] sticky top-0 z-[70] bg-[var(--panel)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-6 h-6 border-2 border-[var(--accent)] flex items-center justify-center rounded-sm">
                <div className="w-2 h-2 bg-[var(--accent)] animate-pulse" />
             </div>
             <span className="text-[14px] font-black uppercase tracking-[0.2em]">Interface Editor</span>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-[var(--accent)]/10 border border-[var(--border)] rounded-lg transition-colors">
             <svg className="w-5 h-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[var(--input-bg)] rounded-xl border border-[var(--border)]">
               {(['dark', 'light', 'cyan'] as UiTheme[]).map(t => (
                 <button 
                  key={t}
                  onClick={() => onThemeChange(t)}
                  className={`py-2 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all ${uiTheme === t ? 'bg-[var(--panel)] text-[var(--accent)] shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                 >
                   {t}
                 </button>
               ))}
            </div>

            <button onClick={onLiveViewClick} className="w-full py-5 bg-[var(--accent)]/5 border border-[var(--accent)]/20 flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-main)] rounded-lg hover:bg-[var(--accent)]/10 transition-all">
                Full Screen Live View
            </button>

            {user ? (
                <div className="flex flex-col gap-3">
                  <div className="w-full py-4 px-5 border border-[var(--border)] flex items-center justify-between rounded-lg bg-[var(--input-bg)]">
                      <div className="flex items-center gap-4">
                          {user.picture && <img src={user.picture} className="w-7 h-7 rounded-full ring-1 ring-[var(--accent)]/30" alt="User" />}
                          <span className="text-[12px] font-black text-[var(--text-main)] truncate max-w-[140px] uppercase tracking-wider">{user.name}</span>
                      </div>
                      <button onClick={onLogout} className="text-[11px] font-bold opacity-30 hover:opacity-100 uppercase transition-opacity">Logout</button>
                  </div>
                  {!user.isPro && (
                    <button onClick={onPricingClick} className="w-full py-3 bg-[var(--accent)] text-[var(--bg)] text-[11px] font-black uppercase tracking-widest rounded-lg hover:scale-[1.02] transition-transform">
                      Unlock Pro Studio
                    </button>
                  )}
                </div>
            ) : (
                <button onClick={onAuthClick} className="w-full py-5 bg-[var(--text-main)] text-[var(--bg)] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-[var(--accent)] transition-all rounded-lg">
                    Sign In
                </button>
            )}
        </div>
      </div>

      <div className="px-10 pb-32 pt-10">
        
        {/* Layout Engine */}
        <Section title="Design Layout" isPro={isPro}>
            <ControlGroup label="Visual Alignment">
                <div className="grid grid-cols-2 gap-3">
                    {LAYOUTS.map((l) => (
                      <button 
                        key={l.id} 
                        onClick={() => handleChange('layout', l.id)}
                        className={`py-4 px-3 border-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${config.layout === l.id ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5 shadow-xl shadow-[var(--accent)]/5' : 'border-[var(--border)] opacity-30 hover:opacity-100 hover:border-[var(--border)]'}`}
                      >
                        {l.label}
                      </button>
                    ))}
                </div>
            </ControlGroup>
        </Section>

        {/* AI Synthesis */}
        <Section title="AI Intelligence" isPro={isPro} pro>
           <ControlGroup label="Theme Generation Prompt">
              <div className="flex flex-col gap-4">
                 <input 
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Cyberpunk Neon Tokyo"
                    className="w-full editor-input p-5 rounded-lg text-[15px] font-bold tracking-wide outline-none focus:ring-2 ring-[var(--accent)]/20 transition-all border border-[var(--border)]"
                 />
                 <button 
                    disabled={isSynthesizing || !isPro}
                    onClick={() => onAiSynthesize(aiPrompt)}
                    className="w-full py-5 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-all disabled:opacity-20 rounded-lg"
                 >
                    {isSynthesizing ? 'Synthesizing DNA...' : 'Generate Design'}
                 </button>
              </div>
           </ControlGroup>
        </Section>

        {/* Geometry controls */}
        <Section title="3D Geometry DNA" pro isPro={isPro}>
            <div className="grid grid-cols-1 gap-8">
                <ControlGroup label="Shape Selection">
                   <div className="grid grid-cols-2 gap-3">
                     {['sphere', 'torus', 'box', 'blob'].map((s) => (
                       <button 
                        key={s} 
                        onClick={() => handleChange('shape', s)}
                        className={`py-4 px-3 border-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${config.shape === s ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] opacity-30 hover:opacity-100'}`}
                       >
                         {s}
                       </button>
                     ))}
                   </div>
                </ControlGroup>
                <div className="grid grid-cols-1 gap-8">
                    <ControlGroup label={`Object Scale: ${Math.round(config.modelScale * 100)}%`}>
                        <div className="flex items-center gap-4">
                           <input type="range" min="0.5" max="2.5" step="0.05" value={config.modelScale} onChange={(e) => handleChange('modelScale', parseFloat(e.target.value))} />
                        </div>
                    </ControlGroup>
                    <ControlGroup label={`Complexity: ${Math.round(config.complexity * 100)}%`}>
                        <input type="range" min="0" max="1" step="0.01" value={config.complexity} onChange={(e) => handleChange('complexity', parseFloat(e.target.value))} />
                    </ControlGroup>
                    <ControlGroup label={`Shape Distortion: ${Math.round(config.distortion * 100)}%`}>
                        <input type="range" min="0" max="1" step="0.01" value={config.distortion} onChange={(e) => handleChange('distortion', parseFloat(e.target.value))} />
                    </ControlGroup>
                </div>
                <ControlGroup label="Render Style">
                    <button 
                      onClick={() => handleChange('wireframe', !config.wireframe)}
                      className={`w-full py-4 border-2 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] transition-all ${config.wireframe ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] opacity-30'}`}
                    >
                      {config.wireframe ? 'Wireframe Mode' : 'Solid Mesh'}
                    </button>
                </ControlGroup>
            </div>
        </Section>

        {/* Color Palette */}
        <Section title="Color Spectrum" isPro={isPro}>
            <div className="grid grid-cols-1 gap-6">
                <ColorInput label="Site Background" value={config.bgColor} onChange={(v) => handleChange('bgColor', v)} />
                <ColorInput label="Headline Text" value={config.headlineColor} onChange={(v) => handleChange('headlineColor', v)} />
                <ColorInput label="Subtitle Text" value={config.subtitleColor} onChange={(v) => handleChange('subtitleColor', v)} />
                <ColorInput label="3D Object Color" value={config.objColor} onChange={(v) => handleChange('objColor', v)} />
                <div className="grid grid-cols-2 gap-4">
                   <ColorInput label="Button Fill" value={config.ctaBgColor} onChange={(v) => handleChange('ctaBgColor', v)} />
                   <ColorInput label="Button Text" value={config.ctaTextColor} onChange={(v) => handleChange('ctaTextColor', v)} />
                </div>
            </div>
        </Section>

        {/* Typography */}
        <Section title="Typography Node" isPro={isPro}>
          <ControlGroup label="Primary Headline">
            <textarea value={config.headline} onChange={(e) => handleChange('headline', e.target.value)} className="w-full editor-input p-5 rounded-lg text-[16px] font-bold focus:ring-2 ring-[var(--accent)]/20 outline-none transition-all resize-none border border-[var(--border)] leading-tight" rows={2} />
          </ControlGroup>
          <ControlGroup label="Support Subtitle">
            <textarea value={config.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} className="w-full editor-input p-5 rounded-lg text-[15px] font-medium opacity-70 focus:ring-2 ring-[var(--accent)]/20 outline-none transition-all resize-none border border-[var(--border)] leading-relaxed" rows={3} />
          </ControlGroup>
          <div className="grid grid-cols-2 gap-6">
            <ControlGroup label="Scale">
              <div className="flex items-center gap-4 py-3">
                 <input type="range" min="32" max="140" value={config.fontSize} onChange={(e) => handleChange('fontSize', parseInt(e.target.value))} />
                 <span className="text-[14px] font-mono font-black text-[var(--accent)]">{config.fontSize}</span>
              </div>
            </ControlGroup>
            <ControlGroup label="Typeface">
                <select value={config.fontFamily} onChange={(e) => handleChange('fontFamily', e.target.value as FontFamily)} className="w-full editor-input p-4 rounded-lg text-[12px] font-black uppercase outline-none border border-[var(--border)] cursor-pointer">
                  <option value="Inter">01 // Inter</option>
                  <option value="Space Grotesk">02 // Grotesk</option>
                  <option value="serif">03 // Serif</option>
                  <option value="mono">04 // Mono</option>
                </select>
            </ControlGroup>
          </div>
        </Section>

        <div className="pt-20 border-t border-[var(--border)] mt-20">
          <button onClick={onExport} className="w-full py-10 bg-[var(--text-main)] text-[var(--bg)] font-black text-[16px] uppercase tracking-[0.5em] hover:bg-[var(--accent)] transition-all rounded-xl shadow-2xl active:scale-[0.98]">
            Export Protocol
          </button>
          <p className="text-center text-[11px] uppercase tracking-widest opacity-20 mt-8 font-bold">System Build Version 1.2.5-C</p>
        </div>
      </div>
    </div>
  );
};

export default Editor;
