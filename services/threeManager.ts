
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { HeroConfig, LayoutType } from '../types';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private mesh: THREE.Mesh | null = null;
  private clock: THREE.Clock;
  private pointLight: THREE.PointLight | null = null;
  private currentConfig: HeroConfig | null = null;
  private originalPositions: Float32Array | null = null;

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
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dLight = new THREE.DirectionalLight(0xffffff, 2);
    dLight.position.set(10, 10, 10);
    this.scene.add(dLight);

    this.pointLight = new THREE.PointLight(0x00f0ff, 20, 50);
    this.pointLight.position.set(-10, -5, 5);
    this.scene.add(this.pointLight);
  }

  public updateObject(config: HeroConfig) {
    this.currentConfig = config;
    if (this.pointLight) {
      this.pointLight.color.set(config.objColor);
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
      case 'box':
        geometry = new THREE.BoxGeometry(3, 3, 3, detail, detail, detail);
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
    
    const isMobile = window.innerWidth < 768;
    const aspect = this.camera.aspect;
    
    if (isMobile || aspect < 1) {
      this.mesh.position.x = 0;
      this.mesh.position.y = 2.8; 
      this.camera.position.z = 24 / Math.max(aspect, 0.6);
    } else {
      this.camera.position.z = 15;
      
      switch (this.currentConfig.layout) {
        case 'split-left':
          this.mesh.position.x = 4.8; 
          this.mesh.position.y = 0;
          break;
        case 'split-right':
          this.mesh.position.x = -4.8;
          this.mesh.position.y = 0;
          break;
        case 'asymmetric-offset':
          this.mesh.position.x = 3.5;
          this.mesh.position.y = 1.5;
          break;
        default:
          this.mesh.position.x = 0;
          this.mesh.position.y = 0;
      }
    }
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
      
      this.mesh.rotation.y = time * 0.15 * rotationSpeed;
      this.mesh.rotation.z = time * 0.1 * rotationSpeed;
      this.mesh.scale.setScalar(modelScale || 1);
      
      const floatY = Math.sin(time * 0.8 * floatSpeed) * (0.3 * floatSpeed);
      const isMobile = window.innerWidth < 768;
      
      let baseY = 0;
      if (isMobile) {
        baseY = 2.8;
      } else {
        if (layout === 'asymmetric-offset') baseY = 1.5;
      }
      
      this.mesh.position.y = baseY + floatY;

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
