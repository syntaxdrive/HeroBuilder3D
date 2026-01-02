
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from './components/Editor';
import Preview, { PreviewHandle } from './components/Preview';
import { HeroConfig, User, UiTheme } from './types';
import { DEFAULT_CONFIG, BACKEND_API_URL } from './constants';
import { GoogleGenAI, Type } from "@google/genai";

const GOOGLE_CLIENT_ID = "713393437299-v80v8h82488h82488.apps.googleusercontent.com";

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) { return null; }
};

const App: React.FC = () => {
  const previewRef = useRef<PreviewHandle>(null);
  const [config, setConfig] = useState<HeroConfig>(DEFAULT_CONFIG);
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize theme from localStorage to prevent resets
  const [uiTheme, setUiTheme] = useState<UiTheme>(() => {
    const saved = localStorage.getItem('hero_ui_theme') as UiTheme;
    return saved || 'dark';
  });

  const [showAuth, setShowAuth] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportTab, setExportTab] = useState<'react' | 'vanilla' | 'cms' | 'json' | 'image'>('react');
  const [loading, setLoading] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [liveMode, setLiveMode] = useState(false);

  useEffect(() => {
    document.body.className = `theme-${uiTheme}`;
  }, [uiTheme]);

  const handleThemeChange = (theme: UiTheme) => {
    setUiTheme(theme);
    localStorage.setItem('hero_ui_theme', theme);
  };

  const syncUserWithBackend = useCallback(async (email: string, userData?: Partial<User>) => {
    if (!BACKEND_API_URL) return null;
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: userData ? "updateUser" : "getUser", email, ...userData })
      });
      return await response.json();
    } catch (err) { return null; }
  }, []);

  const handleCredentialResponse = useCallback(async (response: any) => {
    const payload = decodeJwt(response.credential);
    if (payload) {
      const baseUser: User = { email: payload.email, name: payload.name, picture: payload.picture, isPro: false, plan: 'free', exportsToday: 0 };
      const synced = await syncUserWithBackend(payload.email, baseUser);
      const finalUser = synced ? { ...baseUser, ...synced } : baseUser;
      setUser(finalUser);
      localStorage.setItem('hero_builder_user', JSON.stringify(finalUser));
      setShowAuth(false);
    }
  }, [syncUserWithBackend]);

  useEffect(() => {
    const initApp = async () => {
      const savedUser = localStorage.getItem('hero_builder_user');
      if (savedUser) {
        const localUser = JSON.parse(savedUser);
        const syncedUser = await syncUserWithBackend(localUser.email);
        if (syncedUser) {
          const merged = { ...localUser, ...syncedUser };
          setUser(merged);
          localStorage.setItem('hero_builder_user', JSON.stringify(merged));
        } else {
          setUser(localUser);
        }
      }
      setLoading(false);
    };
    initApp();

    const initGsi = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, auto_select: true });
        const parent = document.getElementById('google-btn-hidden');
        if (parent) google.accounts.id.renderButton(parent, { theme: 'outline', size: 'large', width: 320 });
      }
    };
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) { initGsi(); clearInterval(interval); }
    }, 200);
    return () => clearInterval(interval);
  }, [handleCredentialResponse, syncUserWithBackend]);

  const handleAiSynthesize = async (prompt: string) => {
    if (!prompt || !user?.isPro) return;
    setIsSynthesizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a professional 3D Hero design for: "${prompt}". Respond with JSON only.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              bgColor: { type: Type.STRING },
              headlineColor: { type: Type.STRING },
              subtitleColor: { type: Type.STRING },
              objColor: { type: Type.STRING },
              shape: { type: Type.STRING, enum: ['sphere', 'torus', 'box', 'blob'] },
              distortion: { type: Type.NUMBER },
              complexity: { type: Type.NUMBER },
              transmission: { type: Type.NUMBER },
              modelScale: { type: Type.NUMBER },
              wireframe: { type: Type.BOOLEAN }
            },
            required: ['headline', 'subtitle', 'bgColor', 'headlineColor', 'subtitleColor', 'objColor', 'shape']
          }
        }
      });
      const aiConfig = JSON.parse(response.text || '{}');
      setConfig(prev => ({ ...prev, ...aiConfig }));
    } catch (error) { console.error(error); } finally { setIsSynthesizing(false); }
  };

  const getReactExport = () => {
    return `
/**
 * 1. INSTALL DEPENDENCIES:
 * npm install three @types/three @react-three/fiber @react-three/drei
 *
 * 2. USAGE:
 * Import this component into your React app.
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const Scene = ({ config }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.15;
      meshRef.current.position.y = Math.sin(time * 0.8) * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={2} />
      <mesh ref={meshRef} scale={config.modelScale}>
        <torusKnotGeometry args={[2, 0.6, 128, 32]} />
        <meshPhysicalMaterial 
          color="${config.objColor}"
          metalness={${config.metalness}}
          roughness={${config.roughness}}
          wireframe={${config.wireframe}}
        />
      </mesh>
    </>
  );
};

export const HeroSection = () => {
  const config = ${JSON.stringify(config, null, 2)};

  return (
    <div style={{ backgroundColor: config.bgColor, height: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={35} />
        <Scene config={config} />
        <OrbitControls enableZoom={false} />
      </Canvas>
      <div style={{ position: 'absolute', inset: 0, padding: '8%', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
        <div style={{ pointerEvents: 'auto', maxWidth: '600px' }}>
          <h1 style={{ color: config.headlineColor, fontSize: config.fontSize + 'px', margin: 0 }}>
            {config.headline}
          </h1>
          <p style={{ color: config.subtitleColor, marginTop: '20px' }}>
            {config.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
    `.trim();
  };

  const getVanillaHtmlExport = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>3D Hero Bundle</title>
  <style>
    body { margin: 0; background: ${config.bgColor}; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; }
    #ui-overlay { position: absolute; inset: 0; padding: 10%; pointer-events: none; display: flex; align-items: center; }
    .content { pointer-events: auto; max-width: 600px; }
    h1 { font-size: ${config.fontSize}px; color: ${config.headlineColor}; margin: 0; line-height: 0.9; }
    p { color: ${config.subtitleColor}; margin-top: 24px; font-size: 18px; }
  </style>
</head>
<body>
  <div id="ui-overlay">
    <div class="content">
      <h1>${config.headline}</h1>
      <p>${config.subtitle}</p>
    </div>
  </div>
  <div id="canvas-container"></div>

  <script type="importmap">
    { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
  </script>
  <script type="module">
    import * as THREE from 'three';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const geo = new THREE.TorusKnotGeometry(2, 0.6, 128, 32);
    const mat = new THREE.MeshPhysicalMaterial({ color: '${config.objColor}', metalness: ${config.metalness}, roughness: ${config.roughness}, wireframe: ${config.wireframe} });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(${config.modelScale});
    scene.add(mesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(10,10,10);
    scene.add(light);

    camera.position.z = 15;
    function animate() {
      requestAnimationFrame(animate);
      mesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();
    window.onresize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
  </script>
</body>
</html>
    `.trim();
  };

  const getCmsExport = () => {
    const escapedHtml = getVanillaHtmlExport().replace(/"/g, '&quot;');
    return `
<!-- 
  COPY THIS BLOCK INTO WORDPRESS (Custom HTML) OR WEBFLOW (Embed)
-->
<div style="width:100%; height:100vh; min-height:600px; position:relative; overflow:hidden;">
  <iframe srcdoc="${escapedHtml}" 
          style="width:100%; height:100%; border:none;" 
          scrolling="no"></iframe>
</div>
    `.trim();
  };

  const handleSnapshot = () => {
    const dataUrl = previewRef.current?.capture();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `hero-design-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#000000]">
      <div className="w-px h-24 bg-white/10 relative overflow-hidden"><div className="absolute top-0 left-0 w-full bg-[#00ffff] h-full animate-[shimmer_2s_infinite]"></div></div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden selection:bg-[var(--accent)] selection:text-[var(--bg)]">
      <div className={`sidebar-transition fixed md:relative z-[60] h-full w-full md:w-[420px] shrink-0 ${sidebarOpen && !liveMode ? 'translate-x-0' : '-translate-x-full md:-ml-[420px]'}`}>
        <Editor 
          config={config} onChange={setConfig} onExport={() => setShowExport(true)} 
          isPro={user?.isPro || false} user={user} onLogout={() => { setUser(null); localStorage.removeItem('hero_builder_user'); window.location.reload(); }}
          onAuthClick={() => setShowAuth(true)} onPricingClick={() => setShowPricing(true)}
          onLiveViewClick={() => { setLiveMode(true); setSidebarOpen(false); }}
          onClose={() => setSidebarOpen(false)} onAiSynthesize={handleAiSynthesize} isSynthesizing={isSynthesizing}
          uiTheme={uiTheme} onThemeChange={handleThemeChange}
        />
      </div>

      <main className="flex-1 relative flex flex-col min-w-0">
        {!liveMode && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute top-10 left-10 md:top-14 md:left-14 z-50 pointer-events-auto btn-outline bg-black/20 backdrop-blur-3xl p-4 rounded-xl group text-white">
            <div className={`w-6 h-4 flex flex-col justify-between transition-transform ${sidebarOpen ? 'rotate-90' : ''}`}><div className="hamburger-line"></div><div className="hamburger-line"></div><div className="hamburger-line"></div></div>
          </button>
        )}
        {liveMode && <button onClick={() => setLiveMode(false)} className="fixed top-12 right-12 z-[100] px-10 py-5 bg-black/50 backdrop-blur-md border border-white/10 text-[var(--accent)] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-3xl rounded-sm">Exit Live View</button>}
        <Preview ref={previewRef} config={config} />
      </main>

      {/* Export Studio Modal */}
      {showExport && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-12">
           <div className="w-full max-w-6xl h-[90vh] bg-[var(--panel)] border border-[var(--border)] p-8 md:p-12 relative rounded-3xl shadow-4xl flex flex-col gap-8 overflow-hidden">
              <button onClick={() => setShowExport(false)} className="absolute top-10 right-10 text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase text-[12px] font-black tracking-widest transition-colors z-[10]">Close_Studio</button>
              
              <div className="flex flex-col gap-2">
                <span className="text-[var(--accent)] text-[11px] font-black uppercase tracking-[0.5em]">Distribution_Center_v1.5</span>
                <h2 className="text-4xl font-light tracking-tighter uppercase text-[var(--text-main)]">Export Studio</h2>
              </div>

              <div className="flex flex-wrap gap-3 border-b border-[var(--border)] pb-6">
                 {(['react', 'vanilla', 'cms', 'json', 'image'] as const).map(tab => (
                   <button 
                    key={tab}
                    onClick={() => setExportTab(tab)}
                    className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${exportTab === tab ? 'bg-[var(--accent)] text-[var(--bg)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                   >
                     {tab === 'vanilla' ? 'Pure HTML' : tab === 'cms' ? 'WordPress / Webflow' : tab}
                   </button>
                 ))}
              </div>

              <div className="flex-1 overflow-hidden flex flex-col gap-6">
                {exportTab === 'image' ? (
                  <div className="flex flex-col items-center justify-center h-full gap-8 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl">
                    <p className="text-[var(--text-muted)] text-[14px] uppercase tracking-[0.2em] text-center max-w-md font-bold leading-loose">Ready to capture current viewport in high resolution (4K Optimized).</p>
                    <button onClick={handleSnapshot} className="px-20 py-7 bg-[var(--accent)] text-[var(--bg)] font-black text-[12px] uppercase tracking-widest hover:scale-[1.05] transition-all rounded-xl shadow-2xl">
                      Download PNG Snapshot
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col h-full gap-6">
                    {exportTab === 'react' && (
                      <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 p-5 rounded-xl">
                        <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest block mb-2">Package Installation</span>
                        <code className="text-[13px] font-mono text-[var(--text-main)] opacity-80">npm install three @react-three/fiber @react-three/drei</code>
                      </div>
                    )}
                    <div className="flex-1 relative overflow-hidden bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl">
                      <pre className="absolute inset-0 p-8 overflow-auto text-[13px] font-mono text-[var(--text-main)]/70 leading-relaxed custom-scrollbar select-all">
                        {exportTab === 'react' ? getReactExport() : 
                         exportTab === 'vanilla' ? getVanillaHtmlExport() :
                         exportTab === 'cms' ? getCmsExport() :
                         JSON.stringify(config, null, 2)}
                      </pre>
                    </div>
                    <button 
                      onClick={() => { 
                        const text = exportTab === 'react' ? getReactExport() : 
                                   exportTab === 'vanilla' ? getVanillaHtmlExport() :
                                   exportTab === 'cms' ? getCmsExport() :
                                   JSON.stringify(config, null, 2);
                        navigator.clipboard.writeText(text); 
                        alert('Code snippet copied.'); 
                      }} 
                      className="w-full py-6 bg-[var(--text-main)] text-[var(--bg)] text-[12px] font-black uppercase tracking-[0.4em] hover:bg-[var(--accent)] transition-all rounded-xl"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {showPricing && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#000000]/95 backdrop-blur-3xl p-6">
           <div className="w-full max-w-2xl bg-[var(--panel)] border border-[var(--border)] p-10 md:p-20 shadow-3xl space-y-10 text-center rounded-3xl">
              <div>
                <span className="text-[var(--accent)] font-black tracking-[1em] text-[10px] uppercase">Upgrade Protocol</span>
                <h2 className="text-4xl md:text-6xl font-light mt-8 tracking-tighter uppercase text-[var(--text-main)]">Pro Studio</h2>
                <p className="text-[var(--text-muted)] text-[11px] mt-6 uppercase tracking-widest max-w-sm mx-auto">Unlock layouts, AI generation, and unlimited export capabilities.</p>
              </div>
              <button onClick={() => user ? setShowCheckout(true) : setShowAuth(true)} className="w-full py-6 bg-[var(--text-main)] text-[var(--bg)] font-black text-[12px] uppercase tracking-widest hover:bg-[var(--accent)] transition-all rounded-xl">Activate Lifetime Access — $5.00</button>
              <button onClick={() => setShowPricing(false)} className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-main)] transition-colors">Return to Basic</button>
           </div>
        </div>
      )}

      <style>{`@keyframes shimmer { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }`}</style>
    </div>
  );
};

export default App;
