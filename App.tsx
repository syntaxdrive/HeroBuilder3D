import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "./components/Editor";
import Preview, { PreviewHandle } from "./components/Preview";
import LandingPage from "./components/LandingPage";
import { HeroConfig, User, UiTheme, Project, ViewMode } from "./types";
import {
  DEFAULT_CONFIG,
  BACKEND_API_URL,
  STRIPE_PAYMENT_LINK,
} from "./constants";
import { GoogleGenAI, Type } from "@google/genai";

const GOOGLE_CLIENT_ID =
  "83121900082-lval4goontn6iko50gpu3rhgddgbf6d3.apps.googleusercontent.com";

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const App: React.FC = () => {
  const previewRef = useRef<PreviewHandle>(null);
  const [config, setConfig] = useState<HeroConfig>(() => {
    const saved = localStorage.getItem("hero_draft_config");
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [embedMode, setEmbedMode] = useState(false);

  // Initialize theme from localStorage to prevent resets
  const [uiTheme, setUiTheme] = useState<UiTheme>(() => {
    const saved = localStorage.getItem("hero_ui_theme") as UiTheme;
    return saved || "dark";
  });
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  const [showAuth, setShowAuth] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showProjectSetup, setShowProjectSetup] = useState(false);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [exportTab, setExportTab] = useState<
    "react" | "vanilla" | "cms" | "json" | "image" | "embed"
  >("react");
  const [loading, setLoading] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [liveMode, setLiveMode] = useState(false);
  const [showLanding, setShowLanding] = useState(() => {
    const visited = localStorage.getItem("hero_builder_visited");
    return !visited;
  });

  // Auto-save draft config
  useEffect(() => {
    localStorage.setItem("hero_draft_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    document.body.className = `theme-${uiTheme}`;
  }, [uiTheme]);

  // Check for embed mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const embedId = params.get("embed");
    if (embedId) {
      setEmbedMode(true);
      setShowLanding(false);
      loadProject(embedId);
    }
  }, []);

  const handleThemeChange = (theme: UiTheme) => {
    setUiTheme(theme);
    localStorage.setItem("hero_ui_theme", theme);
  };

  const syncUserWithBackend = useCallback(
    async (email: string, userData?: Partial<User>) => {
      if (!BACKEND_API_URL) return null;
      try {
        const response = await fetch(BACKEND_API_URL, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: userData ? "updateUser" : "getUser",
            email,
            ...userData,
          }),
        });
        return await response.json();
      } catch (err) {
        return null;
      }
    },
    []
  );

  const fetchProjects = useCallback(async (email: string) => {
    if (!BACKEND_API_URL) return;
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "getUserProjects",
          email,
        }),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  }, []);

  const saveProject = async (name: string) => {
    if (!user || !BACKEND_API_URL) return;
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "saveProject",
          email: user.email,
          name,
          config,
        }),
      });
      const result = await response.json();
      if (result.status === "created" || result.status === "updated") {
        fetchProjects(user.email);
        alert("Project saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save project", err);
      alert("Failed to save project.");
    }
  };

  const loadProject = async (id: string) => {
    if (!BACKEND_API_URL) return;
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "getProject",
          id,
        }),
      });
      const project = await response.json();
      if (project && project.config) {
        setConfig(project.config);
      }
    } catch (err) {
      console.error("Failed to load project", err);
    }
  };

  const handleUpgrade = async () => {
    const baseUser = user || {
      name: "Guest User",
      email: "guest@example.com",
      picture: "",
      isPro: false,
      plan: "free" as const,
      exportsToday: 0,
    };
    const updatedUser = { ...baseUser, isPro: true, plan: "pro" as const };
    setUser(updatedUser);
    localStorage.setItem("hero_builder_user", JSON.stringify(updatedUser));

    // Sync with backend
    if (baseUser.email !== "guest@example.com") {
      await syncUserWithBackend(baseUser.email, updatedUser);
    }

    setShowCheckout(false);
    setShowPricing(false);
    alert("Upgrade successful! Welcome to Pro.");
  };

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      const payload = decodeJwt(response.credential);
      if (payload) {
        const baseUser: User = {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          isPro: false,
          plan: "free",
          exportsToday: 0,
        };
        const synced = await syncUserWithBackend(payload.email, baseUser);
        const finalUser = synced ? { ...baseUser, ...synced } : baseUser;
        setUser(finalUser);
        localStorage.setItem("hero_builder_user", JSON.stringify(finalUser));
        fetchProjects(payload.email);

        setShowAuth(false);
      }
    },
    [syncUserWithBackend]
  );

  useEffect(() => {
    const initApp = async () => {
      const savedUser = localStorage.getItem("hero_builder_user");
      if (savedUser) {
        const localUser = JSON.parse(savedUser);
        const syncedUser = await syncUserWithBackend(localUser.email);
        if (syncedUser) {
          const merged = { ...localUser, ...syncedUser };
          setUser(merged);
          localStorage.setItem("hero_builder_user", JSON.stringify(merged));
          fetchProjects(merged.email);
        } else {
          setUser(localUser);
          fetchProjects(localUser.email);
        }
        // Removed auto-dismiss to prevent landing page from vanishing
      }
      setLoading(false);
    };
    initApp();

    const initGsi = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: true,
        });
        const parent = document.getElementById("google-btn-hidden");
        if (parent)
          google.accounts.id.renderButton(parent, {
            theme: "outline",
            size: "large",
            width: 320,
          });
      }
    };
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initGsi();
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [handleCredentialResponse, syncUserWithBackend]);

  useEffect(() => {
    if (showAuth && (window as any).google?.accounts?.id) {
      const parent = document.getElementById("google-btn-hidden");
      if (parent)
        (window as any).google.accounts.id.renderButton(parent, {
          theme: "outline",
          size: "large",
          width: 320,
        });
    }
  }, [showAuth]);

  const handleAiSynthesize = async (prompt: string) => {
    if (!prompt || !user?.isPro) return;
    setIsSynthesizing(true);

    try {
      // 1. Attempt Real AI Generation (Google Gemini)
      // Requires VITE_GEMINI_API_KEY in .env
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
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
                shape: {
                  type: Type.STRING,
                  enum: [
                    "sphere",
                    "torus",
                    "box",
                    "blob",
                    "octahedron",
                    "torus_ring",
                  ],
                },
                distortion: { type: Type.NUMBER },
                complexity: { type: Type.NUMBER },
                transmission: { type: Type.NUMBER },
                metalness: { type: Type.NUMBER },
                roughness: { type: Type.NUMBER },
                modelScale: { type: Type.NUMBER },
                wireframe: { type: Type.BOOLEAN },
              },
              required: [
                "headline",
                "subtitle",
                "bgColor",
                "objColor",
                "shape",
              ],
            },
          },
        });

        const aiConfig = JSON.parse(response.text || "{}");
        setConfig((prev) => ({ ...prev, ...aiConfig }));
        return; // Success, exit function
      }

      throw new Error("No API Key configured");
    } catch (error) {
      console.warn(
        "AI API failed or missing key. Using simulation engine.",
        error
      );

      // 2. Fallback Simulation Engine (Deterministic)
      // Ensures the feature works even without an API key
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Fake delay

      const keywords = prompt.toLowerCase();
      let newConfig: Partial<HeroConfig> = {};

      if (
        keywords.includes("cyber") ||
        keywords.includes("neon") ||
        keywords.includes("future")
      ) {
        newConfig = {
          headline: "NEON FUTURE",
          subtitle: "The digital frontier awaits your arrival.",
          bgColor: "#050510",
          headlineColor: "#00ff99",
          subtitleColor: "#0088ff",
          objColor: "#ff00ff",
          shape: "torus_ring",
          wireframe: true,
          metalness: 0.8,
          roughness: 0.2,
          distortion: 0.8,
        };
      } else if (
        keywords.includes("clean") ||
        keywords.includes("minimal") ||
        keywords.includes("white")
      ) {
        newConfig = {
          headline: "Pure Simplicity",
          subtitle: "Less is more. Design for clarity.",
          bgColor: "#ffffff",
          headlineColor: "#000000",
          subtitleColor: "#666666",
          objColor: "#333333",
          shape: "sphere",
          wireframe: false,
          metalness: 0.1,
          roughness: 0.1,
          transmission: 0.1,
        };
      } else if (keywords.includes("dark") || keywords.includes("saas")) {
        newConfig = {
          headline: "Enterprise Grade",
          subtitle: "Scale your infrastructure with confidence.",
          bgColor: "#000000",
          headlineColor: "#ffffff",
          subtitleColor: "#888888",
          objColor: "#3b82f6",
          shape: "octahedron",
          wireframe: false,
          metalness: 0.6,
          roughness: 0.4,
        };
      } else {
        newConfig = {
          headline: "Generated Concept",
          subtitle: `A unique design based on "${prompt}"`,
          bgColor: "#1a1a1a",
          headlineColor: "#ffffff",
          subtitleColor: "#aaaaaa",
          objColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
          shape: "blob",
          distortion: Math.random(),
          complexity: Math.random(),
        };
      }
      setConfig((prev) => ({ ...prev, ...newConfig }));
    } finally {
      setIsSynthesizing(false);
    }
  };

  const getReactExport = () => {
    const getGeometry = () => {
      switch (config.shape) {
        case "torus":
          return "<torusKnotGeometry args={[2, 0.6, 256, 64]} />";
        case "torus_ring":
          return "<torusGeometry args={[2, 0.6, 64, 128]} />";
        case "box":
          return "<boxGeometry args={[3, 3, 3]} />";
        case "cylinder":
          return "<cylinderGeometry args={[1.5, 1.5, 4, 64]} />";
        case "cone":
          return "<coneGeometry args={[2, 4, 64]} />";
        case "octahedron":
          return "<octahedronGeometry args={[2.5, 0]} />";
        case "tetrahedron":
          return "<tetrahedronGeometry args={[2.5, 0]} />";
        case "sphere":
        case "blob":
        default:
          return "<icosahedronGeometry args={[2.5, 12]} />";
      }
    };

    return `
/**
 * 1. INSTALL DEPENDENCIES:
 * npm install three @types/three @react-three/fiber @react-three/drei
 *
 * 2. USAGE:
 * Import this component into your React app.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const Scene = ({ config }) => {
  const meshRef = useRef();
  const [startTime] = useState(Date.now());
  const { camera } = useThree();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const aspect = window.innerWidth / window.innerHeight;

      if (meshRef.current) {
        if (isMobile || aspect < 0.8) {
          meshRef.current.position.x = 0;
          // Only set Y if not animating entrance, or handle it in useFrame
          // For simplicity in export, we set base position here, but useFrame overrides Y for float/entrance.
          // We need to adjust the base Y in useFrame instead.
        } else if (isTablet) {
          meshRef.current.position.x = 0;
        } else {
          switch (config.layout) {
            case 'split-left': meshRef.current.position.x = 4.8; break;
            case 'split-right': meshRef.current.position.x = -4.8; break;
            case 'asymmetric-offset': meshRef.current.position.x = 3.5; break;
            default: meshRef.current.position.x = 0;
          }
        }
        
        // Camera Z adjustment
        if (isMobile || aspect < 0.8) {
           camera.position.z = 22 / Math.max(aspect, 0.5);
        } else if (isTablet) {
           camera.position.z = 18;
        } else {
           camera.position.z = 15;
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [camera, config.layout]);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const elapsed = (Date.now() - startTime) / 1000;
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const aspect = window.innerWidth / window.innerHeight;

    // Determine Base Y based on layout
    let baseY = 0;
    if (isMobile || aspect < 0.8) baseY = 1.0;
    else if (isTablet) baseY = 1.2;
    else if (config.layout === 'asymmetric-offset') baseY = 1.5;

    if (meshRef.current) {
      // Rotation & Float
      meshRef.current.rotation.y = time * 0.15 * config.rotationSpeed;
      meshRef.current.rotation.z = time * 0.1 * config.rotationSpeed;
      meshRef.current.position.y = baseY + Math.sin(time * 0.8 * config.floatSpeed) * (0.3 * config.floatSpeed);

      // Entrance Animation
      let entranceScale = 1;
      let entranceOpacity = 1;
      let entranceY = 0;
      let entranceRotation = 0;

      if (config.entranceAnimation !== 'none') {
        const duration = 1.5;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        switch (config.entranceAnimation) {
          case 'fade':
            entranceOpacity = easeOut;
            break;
          case 'slide-up':
            entranceY = -10 * (1 - easeOut);
            entranceOpacity = easeOut;
            break;
          case 'scale-pop':
            entranceScale = easeOut;
            entranceOpacity = easeOut;
            break;
          case 'spin-reveal':
            entranceRotation = Math.PI * 2 * (1 - easeOut);
            entranceScale = easeOut;
            entranceOpacity = easeOut;
            break;
        }
        
        meshRef.current.scale.setScalar(config.modelScale * entranceScale);
        meshRef.current.position.y += entranceY;
        meshRef.current.rotation.y += entranceRotation;
        if (meshRef.current.material) {
           meshRef.current.material.opacity = entranceOpacity;
           meshRef.current.material.transparent = true;
        }
      } else {
         meshRef.current.scale.setScalar(config.modelScale);
      }
    }
  });

  return (
    <>
      <ambientLight intensity={config.lightingIntensity * 0.5} color={config.lightingColor} />
      <directionalLight position={[10, 10, 10]} intensity={config.lightingIntensity} color={config.lightingColor} />
      <pointLight position={[-10, -5, 5]} intensity={20} color={config.objColor} />
      
      <mesh ref={meshRef}>
        ${getGeometry()}
        <meshPhysicalMaterial 
          color={config.objColor}
          metalness={config.metalness}
          roughness={config.roughness}
          wireframe={config.wireframe}
          transmission={config.transmission}
          thickness={2}
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
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        padding: '8%', 
        pointerEvents: 'none', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: config.layout === 'centered-stack' ? 'center' : config.layout === 'split-right' ? 'flex-end' : 'flex-start'
      }}>
        <div style={{ pointerEvents: 'auto', maxWidth: '600px', textAlign: config.layout === 'centered-stack' ? 'center' : 'left' }}>
          <h1 style={{ color: config.headlineColor, fontSize: config.fontSize + 'px', margin: 0, lineHeight: 0.9, fontWeight: 800 }}>
            {config.headline}
          </h1>
          <p style={{ color: config.subtitleColor, marginTop: '20px', fontSize: '18px', lineHeight: 1.6 }}>
            {config.subtitle}
          </p>
          <a href={config.ctaLink} style={{
            display: 'inline-block',
            marginTop: '30px',
            padding: '15px 40px',
            backgroundColor: config.ctaBgColor,
            color: config.ctaTextColor,
            textDecoration: 'none',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontSize: '12px'
          }}>
            {config.ctaText}
          </a>
        </div>
      </div>
    </div>
  );
};
    `.trim();
  };

  const getVanillaHtmlExport = () => {
    const getGeometryCode = () => {
      switch (config.shape) {
        case "torus":
          return "new THREE.TorusKnotGeometry(2, 0.6, 256, 64)";
        case "torus_ring":
          return "new THREE.TorusGeometry(2, 0.6, 64, 128)";
        case "box":
          return "new THREE.BoxGeometry(3, 3, 3)";
        case "cylinder":
          return "new THREE.CylinderGeometry(1.5, 1.5, 4, 64)";
        case "cone":
          return "new THREE.ConeGeometry(2, 4, 64)";
        case "octahedron":
          return "new THREE.OctahedronGeometry(2.5, 0)";
        case "tetrahedron":
          return "new THREE.TetrahedronGeometry(2.5, 0)";
        case "sphere":
        case "blob":
        default:
          return "new THREE.IcosahedronGeometry(2.5, 12)";
      }
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>3D Hero Bundle</title>
  <style>
    body { margin: 0; background: ${
      config.bgColor
    }; overflow: hidden; font-family: ${config.fontFamily}, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; }
    #ui-overlay { 
      position: absolute; 
      inset: 0; 
      padding: 10%; 
      pointer-events: none; 
      display: flex; 
      align-items: center;
      justify-content: ${
        config.layout === "centered-stack"
          ? "center"
          : config.layout === "split-right"
          ? "flex-end"
          : "flex-start"
      };
    }
    .content { 
      pointer-events: auto; 
      max-width: 600px; 
      text-align: ${config.layout === "centered-stack" ? "center" : "left"};
    }
    h1 { font-size: ${config.fontSize}px; color: ${
      config.headlineColor
    }; margin: 0; line-height: 0.9; font-weight: 800; }
    p { color: ${
      config.subtitleColor
    }; margin-top: 24px; font-size: 18px; line-height: 1.6; }
    .cta-btn {
      display: inline-block;
      margin-top: 30px;
      padding: 15px 40px;
      background-color: ${config.ctaBgColor};
      color: ${config.ctaTextColor};
      text-decoration: none;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div id="ui-overlay">
    <div class="content">
      <h1>${config.headline}</h1>
      <p>${config.subtitle}</p>
      <a href="${config.ctaLink}" class="cta-btn">${config.ctaText}</a>
    </div>
  </div>
  <div id="canvas-container"></div>

  <script type="importmap">
    { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
  </script>
  <script type="module">
    import * as THREE from 'three';
    
    // Config
    const config = ${JSON.stringify(config)};
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Geometry
    const geo = ${getGeometryCode()};
    const mat = new THREE.MeshPhysicalMaterial({ 
      color: config.objColor, 
      metalness: config.metalness, 
      roughness: config.roughness, 
      wireframe: config.wireframe,
      transmission: config.transmission,
      thickness: 2
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Lights
    scene.add(new THREE.AmbientLight(config.lightingColor, config.lightingIntensity * 0.5));
    const dirLight = new THREE.DirectionalLight(config.lightingColor, config.lightingIntensity);
    dirLight.position.set(10,10,10);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(config.objColor, 20, 50);
    pointLight.position.set(-10, -5, 5);
    scene.add(pointLight);

    camera.position.z = 15;
    
    // Animation State
    const startTime = Date.now();
    
    function animate() {
      requestAnimationFrame(animate);
      const time = (Date.now() - startTime) / 1000;
      
      // Base Animation
      mesh.rotation.y = time * 0.15 * config.rotationSpeed;
      mesh.rotation.z = time * 0.1 * config.rotationSpeed;
      const floatY = Math.sin(time * 0.8 * config.floatSpeed) * (0.3 * config.floatSpeed);
      
      // Entrance Animation
      let entranceScale = 1;
      let entranceOpacity = 1;
      let entranceY = 0;
      let entranceRotation = 0;

      if (config.entranceAnimation !== 'none') {
        const duration = 1.5;
        const progress = Math.min(time / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        switch (config.entranceAnimation) {
          case 'fade':
            entranceOpacity = easeOut;
            break;
          case 'slide-up':
            entranceY = -10 * (1 - easeOut);
            entranceOpacity = easeOut;
            break;
          case 'scale-pop':
            entranceScale = easeOut;
            entranceOpacity = easeOut;
            break;
          case 'spin-reveal':
            entranceRotation = Math.PI * 2 * (1 - easeOut);
            entranceScale = easeOut;
            entranceOpacity = easeOut;
            break;
        }
      }
      
      mesh.scale.setScalar(config.modelScale * entranceScale);
      mesh.position.y = floatY + entranceY;
      mesh.rotation.y += entranceRotation;
      mesh.material.opacity = entranceOpacity;
      mesh.material.transparent = true;

      renderer.render(scene, camera);
    }
    animate();
    
    window.onresize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      // Responsive Layout Logic
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const aspect = camera.aspect;

      if (isMobile || (aspect < 0.8)) {
        mesh.position.x = 0;
        mesh.position.y = 1.0;
        camera.position.z = 22 / Math.max(aspect, 0.5);
      } else if (isTablet) {
        mesh.position.x = 0;
        mesh.position.y = 1.2;
        camera.position.z = 18;
      } else {
        camera.position.z = 15;
        // Desktop Layout
        switch ('${config.layout}') {
          case 'split-left': mesh.position.x = 4.8; mesh.position.y = 0; break;
          case 'split-right': mesh.position.x = -4.8; mesh.position.y = 0; break;
          case 'asymmetric-offset': mesh.position.x = 3.5; mesh.position.y = 1.5; break;
          default: mesh.position.x = 0; mesh.position.y = 0;
        }
      }
    };
    // Trigger initial resize
    window.onresize();
  </script>
</body>
</html>
    `.trim();
  };

  const getCmsExport = () => {
    const escapedHtml = getVanillaHtmlExport().replace(/"/g, "&quot;");
    return `
<!-- 
  COPY THIS BLOCK INTO WORDPRESS (Custom HTML), WEBFLOW (Embed), OR FRAMER (Embed)
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
      const link = document.createElement("a");
      link.download = `hero-design-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  if (embedMode) {
    return (
      <div className="w-full h-screen bg-transparent overflow-hidden">
        <Preview config={config} ref={previewRef} />
      </div>
    );
  }

  if (loading)
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#000000]">
        <div className="w-px h-24 bg-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full bg-[#00ffff] h-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    );

  if (showLanding) {
    return (
      <div className="w-full min-h-screen overflow-y-auto custom-scrollbar">
        <LandingPage
          onStart={() => {
            setShowProjectSetup(true);
          }}
          user={user}
          onLogin={() => setShowAuth(true)}
        />
        {showProjectSetup && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#000000]/95 backdrop-blur-3xl p-6">
            <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--border)] p-10 shadow-3xl flex flex-col items-center gap-8 rounded-3xl relative">
              <button
                onClick={() => setShowProjectSetup(false)}
                className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase text-[10px] font-black tracking-widest"
              >
                Cancel
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-light uppercase text-[var(--text-main)] tracking-tighter mb-2">
                  Initialize Project
                </h2>
                <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-widest">
                  Name your creation to begin
                </p>
              </div>
              <div className="w-full space-y-4">
                <input
                  type="text"
                  placeholder="PROJECT NAME (e.g. NEON_GENESIS)"
                  className="w-full p-4 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[12px] font-mono text-center uppercase tracking-wider outline-none focus:border-[var(--accent)] transition-colors"
                  value={currentProjectName}
                  onChange={(e) => setCurrentProjectName(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (currentProjectName.trim()) {
                      setShowProjectSetup(false);
                      setShowLanding(false);
                      localStorage.setItem("hero_builder_visited", "true");
                      // If user is logged in, we could auto-save here, but for now we just start the session
                      if (user) {
                        saveProject(currentProjectName);
                      }
                    }
                  }}
                  disabled={!currentProjectName.trim()}
                  className="w-full py-4 bg-[var(--accent)] text-[var(--bg)] font-black text-[12px] uppercase tracking-widest hover:opacity-90 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
        {showAuth && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#000000]/95 backdrop-blur-3xl p-6">
            <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--border)] p-10 shadow-3xl flex flex-col items-center gap-8 rounded-3xl relative">
              <button
                onClick={() => setShowAuth(false)}
                className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase text-[10px] font-black tracking-widest"
              >
                Close
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-light uppercase text-[var(--text-main)] tracking-tighter mb-2">
                  Authentication
                </h2>
                <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-widest">
                  Sign in to save your designs
                </p>
              </div>
              <div
                id="google-btn-hidden"
                className="w-full flex justify-center min-h-[40px]"
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden selection:bg-[var(--accent)] selection:text-[var(--bg)]">
      <div
        className={`sidebar-transition fixed md:relative z-[60] h-full w-full md:w-[340px] shrink-0 ${
          sidebarOpen && !liveMode
            ? "translate-x-0"
            : "-translate-x-full md:-ml-[340px]"
        }`}
      >
        <Editor
          config={config}
          onChange={setConfig}
          onExport={() => setShowExport(true)}
          isPro={user?.isPro || false}
          user={user}
          projects={projects}
          onSaveProject={saveProject}
          onLoadProject={loadProject}
          onLogout={() => {
            setUser(null);
            localStorage.removeItem("hero_builder_user");
            localStorage.removeItem("hero_builder_visited");
            window.location.reload();
          }}
          onAuthClick={() => setShowAuth(true)}
          onPricingClick={() => setShowPricing(true)}
          onLiveViewClick={() => {
            setLiveMode(true);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
          onAiSynthesize={handleAiSynthesize}
          isSynthesizing={isSynthesizing}
          uiTheme={uiTheme}
          onThemeChange={handleThemeChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      <main className="flex-1 relative flex flex-col min-w-0 bg-[#050505] items-center justify-center">
        {!liveMode && (
          <>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-10 left-10 md:top-14 md:left-14 z-50 pointer-events-auto btn-outline bg-black/20 backdrop-blur-3xl p-4 rounded-xl group text-white"
            >
              <div
                className={`w-6 h-4 flex flex-col justify-between transition-transform ${
                  sidebarOpen ? "rotate-90" : ""
                }`}
              >
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
              </div>
            </button>
            <div className="absolute top-10 right-10 md:top-14 md:right-14 z-50 pointer-events-none">
              <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">
                HeroBuilder3D
              </span>
            </div>
          </>
        )}
        {liveMode && (
          <button
            onClick={() => setLiveMode(false)}
            className="fixed top-12 right-12 z-[100] px-10 py-5 bg-black/50 backdrop-blur-md border border-white/10 text-[var(--accent)] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-3xl rounded-sm"
          >
            Exit Live View
          </button>
        )}
        <Preview ref={previewRef} config={config} viewMode={viewMode} />
      </main>

      {/* Export Studio Modal */}
      {showExport && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-12">
          <div className="w-full max-w-6xl h-[90vh] bg-[var(--panel)] border border-[var(--border)] p-8 md:p-12 relative rounded-3xl shadow-4xl flex flex-col gap-8 overflow-hidden">
            <button
              onClick={() => setShowExport(false)}
              className="absolute top-10 right-10 text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase text-[12px] font-black tracking-widest transition-colors z-[10]"
            >
              Close_Studio
            </button>

            <div className="flex flex-col gap-2">
              <span className="text-[var(--accent)] text-[11px] font-black uppercase tracking-[0.5em]">
                Distribution_Center_v1.5
              </span>
              <h2 className="text-4xl font-light tracking-tighter uppercase text-[var(--text-main)]">
                Export Studio
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 border-b border-[var(--border)] pb-6">
              {(["react", "vanilla", "cms", "json", "image"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setExportTab(tab)}
                    className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${
                      exportTab === tab
                        ? "bg-[var(--accent)] text-[var(--bg)] shadow-lg"
                        : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    {tab === "vanilla"
                      ? "Pure HTML"
                      : tab === "cms"
                      ? "WordPress / Webflow / Framer"
                      : tab}
                  </button>
                )
              )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col gap-6">
              {exportTab === "image" ? (
                <div className="flex flex-col items-center justify-center h-full gap-8 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl">
                  <p className="text-[var(--text-muted)] text-[14px] uppercase tracking-[0.2em] text-center max-w-md font-bold leading-loose">
                    Ready to capture current viewport in high resolution (4K
                    Optimized).
                  </p>
                  <button
                    onClick={handleSnapshot}
                    className="px-20 py-7 bg-[var(--accent)] text-[var(--bg)] font-black text-[12px] uppercase tracking-widest hover:scale-[1.05] transition-all rounded-xl shadow-2xl"
                  >
                    Download PNG Snapshot
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full gap-6">
                  {exportTab === "react" && (
                    <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 p-5 rounded-xl">
                      <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest block mb-2">
                        Package Installation
                      </span>
                      <code className="text-[13px] font-mono text-[var(--text-main)] opacity-80">
                        npm install three @react-three/fiber @react-three/drei
                      </code>
                    </div>
                  )}
                  <div className="flex-1 relative overflow-hidden bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl">
                    <pre className="absolute inset-0 p-8 overflow-auto text-[13px] font-mono text-[var(--text-main)]/70 leading-relaxed custom-scrollbar select-all">
                      {exportTab === "react"
                        ? getReactExport()
                        : exportTab === "vanilla"
                        ? getVanillaHtmlExport()
                        : exportTab === "cms"
                        ? getCmsExport()
                        : JSON.stringify(config, null, 2)}
                    </pre>
                  </div>
                  <button
                    onClick={() => {
                      const text =
                        exportTab === "react"
                          ? getReactExport()
                          : exportTab === "vanilla"
                          ? getVanillaHtmlExport()
                          : exportTab === "cms"
                          ? getCmsExport()
                          : JSON.stringify(config, null, 2);
                      navigator.clipboard.writeText(text);
                      alert("Code snippet copied.");
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

      {showAuth && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#000000]/95 backdrop-blur-3xl p-6">
          <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--border)] p-10 shadow-3xl flex flex-col items-center gap-8 rounded-3xl relative">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase text-[10px] font-black tracking-widest"
            >
              Close
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-light uppercase text-[var(--text-main)] tracking-tighter mb-2">
                Authentication
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-widest">
                Sign in to save your designs
              </p>
            </div>
            <div
              id="google-btn-hidden"
              className="w-full flex justify-center min-h-[40px]"
            ></div>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#000000]/95 backdrop-blur-3xl p-6">
          <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--border)] p-10 shadow-3xl flex flex-col items-center gap-8 rounded-3xl relative">
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase text-[10px] font-black tracking-widest"
            >
              Close
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-light uppercase text-[var(--text-main)] tracking-tighter mb-2">
                Checkout
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-widest">
                Simulate Payment Provider
              </p>
            </div>

            <div className="w-full p-6 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-center space-y-4">
              <p className="text-[12px] mb-4">Total: $5.00</p>

              <a
                href={`${STRIPE_PAYMENT_LINK}?prefilled_email=${
                  user?.email || ""
                }&client_reference_id=${user?.email || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 bg-[#635bff] text-white font-black text-[12px] uppercase tracking-widest hover:scale-[1.02] transition-all rounded-lg"
              >
                Pay with Card (Stripe)
              </a>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[var(--border)]"></div>
                <span className="flex-shrink mx-4 text-[var(--text-muted)] text-[9px] uppercase">
                  Dev Mode
                </span>
                <div className="flex-grow border-t border-[var(--border)]"></div>
              </div>

              <button
                onClick={handleUpgrade}
                className="w-full py-3 bg-[var(--panel)] border border-[var(--border)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-main)] hover:border-[var(--text-main)] transition-all rounded-lg"
              >
                [DEV] Simulate Success
              </button>
            </div>
          </div>
        </div>
      )}

      {showPricing && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#000000]/95 backdrop-blur-3xl p-6">
          <div className="w-full max-w-2xl bg-[var(--panel)] border border-[var(--border)] p-10 md:p-20 shadow-3xl space-y-10 text-center rounded-3xl">
            <div>
              <span className="text-[var(--accent)] font-black tracking-[1em] text-[10px] uppercase">
                Upgrade Protocol
              </span>
              <h2 className="text-4xl md:text-6xl font-light mt-8 tracking-tighter uppercase text-[var(--text-main)]">
                Pro Studio
              </h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-6 uppercase tracking-widest max-w-sm mx-auto">
                Unlock layouts, advanced materials, and unlimited export
                capabilities.
              </p>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-6 bg-[var(--accent)] text-[var(--bg)] font-black text-[12px] uppercase tracking-widest hover:opacity-90 transition-all rounded-xl"
            >
              Activate Lifetime Access — $5.00
            </button>
            <button
              onClick={() => setShowPricing(false)}
              className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-main)] transition-colors"
            >
              Return to Basic
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes shimmer { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }`}</style>
    </div>
  );
};

export default App;
