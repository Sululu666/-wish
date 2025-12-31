export interface FlyingWish {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  delay: number;
  color: string;
  isCenter?: boolean;
}

export interface DecorationParticle {
  id: string;
  type: 'star' | 'sparkle' | 'pearl' | 'diamond';
  x: number;
  y: number;
  z: number;
  scale: number;
  color: string;
  delay: number;
  rotation: number;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SHOWING = 'SHOWING',
}
