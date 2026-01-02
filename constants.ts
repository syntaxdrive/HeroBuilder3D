
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
  modelScale: 1.0
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

export const FREE_EXPORT_LIMIT = 3;
export const SUBSCRIPTION_PRICE = 5.00;
export const BACKEND_API_URL = "https://script.google.com/macros/s/AKfycbyU5-LzcE4uUXL_59kBzV404_1DhY3U7o-X8M1U1A1zTetVveAzoMFEP3HkJtJgLsf6Ew/exec";
