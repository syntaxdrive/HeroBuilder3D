
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HeroConfig, LayoutType } from '../types';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private mesh: THREE.Mesh | null = null;
  private clock: THREE.Clock;
  private pointLight: THREE.PointLight | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private directionalLight: THREE.DirectionalLight | null = null;
  private gridHelper: THREE.GridHelper | null = null;
  private currentConfig: HeroConfig | null = null;
  private originalPositions: Float32Array | null = null;
  private entranceStartTime: number = 0;
  private lastEntranceAnimation: string = 'none';
  private basePosition: THREE.Vector3 = new THREE.Vector3();
  private isMobileLayout: boolean = false;

  constructor(container: HTMLDivElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.camera.position.z = window.innerWidth < 768 ? 20 : 12;
    this.clock = new THREE.Clock();

    this.initLights();
    this.animate();
  }

  private initLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    this.directionalLight.position.set(10, 10, 10);
    this.scene.add(this.directionalLight);

    this.pointLight = new THREE.PointLight(0x00f0ff, 20, 50);
    this.pointLight.position.set(-10, -5, 5);
    this.scene.add(this.pointLight);

    // Initialize Grid Helper (Hidden by default)
    this.gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    this.gridHelper.position.y = -4;
    this.gridHelper.visible = false;
    this.scene.add(this.gridHelper);
  }

  public updateObject(config: HeroConfig) {
    if (config.entranceAnimation !== this.lastEntranceAnimation) {
      this.entranceStartTime = this.clock.getElapsedTime();
      this.lastEntranceAnimation = config.entranceAnimation;
    }

    this.currentConfig = config;
    
    // Update Lighting
    if (this.pointLight) {
      this.pointLight.color.set(config.objColor);
    }
    if (this.ambientLight) {
      this.ambientLight.intensity = config.lightingIntensity * 0.5;
      this.ambientLight.color.set(config.lightingColor);
    }
    if (this.directionalLight) {
      this.directionalLight.intensity = config.lightingIntensity;
      this.directionalLight.color.set(config.lightingColor);
    }

    // Update Grid
    if (this.gridHelper) {
      this.gridHelper.visible = config.showGrid;
    }

    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }

    const detail = Math.floor(config.complexity * 64) + 4;
    
    let geometry: THREE.BufferGeometry;
    switch (config.shape) {
      case 'torus':
        geometry = new THREE.TorusKnotGeometry(2, 0.6, detail * 4, detail);
        break;
      case 'torus_ring':
        geometry = new THREE.TorusGeometry(2, 0.6, detail * 2, detail * 4);
        break;
      case 'box':
        geometry = new THREE.BoxGeometry(3, 3, 3, detail, detail, detail);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(1.5, 1.5, 4, detail * 2, detail);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(2, 4, detail * 2, detail);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(2.5, Math.min(Math.floor(detail / 10), 5));
        break;
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(2.5, Math.min(Math.floor(detail / 10), 5));
        break;
      case 'blob':
      case 'sphere':
      default:
        geometry = new THREE.IcosahedronGeometry(2.5, Math.min(detail, 12));
    }

    this.originalPositions = geometry.attributes.position.array.slice() as Float32Array;

    const material = new THREE.MeshPhysicalMaterial({
      color: config.objColor,
      metalness: config.metalness,
      roughness: config.roughness,
      wireframe: config.wireframe,
      transmission: config.transmission || 0,
      thickness: 2,
      ior: 1.5,
      clearcoat: 1,
      emissive: config.objColor,
      emissiveIntensity: 0.05,
      flatShading: config.distortion > 0.7,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.setScalar(config.modelScale || 1);
    this.scene.add(this.mesh);
    this.applyLayoutOffsets();
  }

  public captureSnapshot(): string {
    return this.renderer.domElement.toDataURL('image/png');
  }

  private applyLayoutOffsets() {
    if (!this.mesh || !this.currentConfig) return;
    
    // Use the canvas client width to determine layout mode (supports simulated viewports)
    const width = this.renderer.domElement.clientWidth;
    const isMobile = width < 768;
    const aspect = this.camera.aspect;
    
    this.isMobileLayout = isMobile || (aspect < 0.8);

    if (this.isMobileLayout) {
      // Lowered Y to 2.0 to keep it safely in view (centered in top half)
      this.basePosition.set(0, 2.0, 0);
      // Increased Z to 28 to provide a wider field of view on narrow screens
      this.camera.position.z = 28 / Math.max(aspect, 0.5);
    } else {
      // Tablet and Desktop share the same layout logic
      this.camera.position.z = 15;
      
      switch (this.currentConfig.layout) {
        case 'split-left':
          this.basePosition.set(4.8, 0, 0);
          break;
        case 'split-right':
          this.basePosition.set(-4.8, 0, 0);
          break;
        case 'asymmetric-offset':
          this.basePosition.set(3.5, 1.5, 0);
          break;
        default:
          this.basePosition.set(0, 0, 0);
      }
    }
    
    // Apply immediately so there's no frame lag
    this.mesh.position.copy(this.basePosition);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.applyLayoutOffsets();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    const time = this.clock.getElapsedTime();

    if (this.mesh && this.currentConfig && this.originalPositions) {
      const { distortion, rotationSpeed, floatSpeed, layout, modelScale } = this.currentConfig;
      
      // Entrance Animation Logic
      let entranceScale = 1;
      let entranceY = 0;
      let entranceRotation = 0;
      let entranceOpacity = 1;

      if (this.currentConfig.entranceAnimation && this.currentConfig.entranceAnimation !== 'none') {
        const elapsed = time - this.entranceStartTime;
        const duration = 1.5;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        switch (this.currentConfig.entranceAnimation) {
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

      this.mesh.rotation.y = (time * 0.15 * rotationSpeed) + entranceRotation;
      this.mesh.rotation.z = time * 0.1 * rotationSpeed;
      
      // Apply mobile scale reduction (35%) if in mobile layout to ensure it fits
      const mobileScaleFactor = this.isMobileLayout ? 0.65 : 1;
      this.mesh.scale.setScalar((modelScale || 1) * entranceScale * mobileScaleFactor);
      
      const floatY = Math.sin(time * 0.8 * floatSpeed) * (0.3 * floatSpeed);
      
      // Use basePosition calculated in applyLayoutOffsets
      this.mesh.position.copy(this.basePosition);
      this.mesh.position.y += floatY + entranceY;

      // Update material opacity
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.transparent = true;
        this.mesh.material.opacity = entranceOpacity;
      }

      if (distortion > 0) {
        const positions = this.mesh.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          const x = this.originalPositions[i];
          const y = this.originalPositions[i + 1];
          const z = this.originalPositions[i + 2];
          const offset = Math.sin(x * 2 + time) * Math.cos(y * 2 + time) * distortion;
          positions[i] = x + (x / 2.5) * offset;
          positions[i + 1] = y + (y / 2.5) * offset;
          positions[i + 2] = z + (z / 2.5) * offset;
        }
        this.mesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.renderer.dispose();
    this.scene.clear();
  }
}
