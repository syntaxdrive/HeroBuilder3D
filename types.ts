
export type ShapeType = 'sphere' | 'torus' | 'box' | 'blob' | 'custom';
export type LayoutType = 'split-left' | 'split-right' | 'centered-stack' | 'asymmetric-offset';
export type AlignmentType = 'left' | 'center' | 'right';
export type FontFamily = 'Space Grotesk' | 'Inter' | 'serif' | 'mono';
export type UiTheme = 'dark' | 'light' | 'cyan';

export interface HeroConfig {
  headline: string;
  headlineColor: string;
  subtitle: string;
  subtitleColor: string;
  ctaText: string;
  ctaTextColor: string;
  ctaBgColor: string;
  ctaLink: string;
  fontSize: number;
  fontFamily: FontFamily;
  alignment: AlignmentType;
  layout: LayoutType;
  bgColor: string;
  objColor: string;
  shape: ShapeType;
  metalness: number;
  roughness: number;
  complexity: number;
  distortion: number;
  transmission: number;
  floatSpeed: number;
  rotationSpeed: number;
  wireframe: boolean;
  modelScale: number;
}

export interface User {
  email: string;
  isPro: boolean;
  plan: 'free' | 'pro';
  expiry?: string;
  name?: string;
  picture?: string;
  exportsToday: number;
}
