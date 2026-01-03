
import { HeroConfig } from './types';

export const DEFAULT_CONFIG: HeroConfig = {
  headline: 'Modern Design Laboratory',
  headlineColor: '#ffffff',
  subtitle: 'A specialized tool for creating interactive 3D hero sections. Simple, powerful, and built for modern websites.',
  subtitleColor: 'rgba(255, 255, 255, 0.4)',
  ctaText: 'Get Started',
  ctaTextColor: '#000000',
  ctaBgColor: '#ffffff',
  ctaLink: '#',
  fontSize: 72,
  fontFamily: 'Inter',
  alignment: 'left',
  layout: 'split-left',
  bgColor: '#000000',
  objColor: '#00ffff',
  shape: 'torus',
  metalness: 0.9,
  roughness: 0.1,
  complexity: 0.5,
  distortion: 0.1,
  transmission: 0,
  floatSpeed: 1,
  rotationSpeed: 1,
  wireframe: false,
  modelScale: 1.0,
  lightingIntensity: 1.5,
  lightingColor: '#ffffff',
  showGrid: false,
  entranceAnimation: 'none'
};

export const PRESETS: Record<string, Partial<HeroConfig>> = {
  'Blueprint': {
    bgColor: '#ffffff',
    objColor: '#2563eb',
    headlineColor: '#2563eb',
    subtitleColor: 'rgba(37, 99, 235, 0.4)',
    ctaBgColor: '#2563eb',
    ctaTextColor: '#ffffff',
    wireframe: true,
    metalness: 0.1,
    roughness: 0.9
  },
  'Obsidian': {
    bgColor: '#050505',
    objColor: '#ff0033',
    headlineColor: '#ffffff',
    subtitleColor: 'rgba(255,255,255,0.3)',
    ctaBgColor: '#ff0033',
    ctaTextColor: '#ffffff',
    shape: 'blob',
    complexity: 0.8
  },
  'Crystal': {
    bgColor: '#111111',
    objColor: '#ffffff',
    transmission: 0.95,
    roughness: 0.05,
    metalness: 0.1,
    headlineColor: '#ffffff',
    subtitleColor: 'rgba(255,255,255,0.5)',
    ctaBgColor: '#ffffff',
    ctaTextColor: '#000000'
  }
};

export const MATERIAL_PRESETS: Record<string, Partial<HeroConfig>> = {
  'Liquid Metal': {
    metalness: 1.0,
    roughness: 0.0,
    transmission: 0,
    wireframe: false,
    objColor: '#silver' // Will need to be handled if color isn't desired
  },
  'Frosted Glass': {
    metalness: 0.1,
    roughness: 0.45,
    transmission: 0.9,
    wireframe: false
  },
  'Neon Wireframe': {
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0,
    wireframe: true
  },
  'Matte Clay': {
    metalness: 0.0,
    roughness: 1.0,
    transmission: 0,
    wireframe: false
  },
  'Polished Plastic': {
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0,
    wireframe: false
  }
};

export const FREE_EXPORT_LIMIT = 3;
export const SUBSCRIPTION_PRICE = 5.00;
export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
export const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

export const FREE_SHAPES = ['sphere', 'box', 'cylinder', 'cone'];
export const FREE_ANIMATIONS = ['none', 'fade', 'slide-up'];

