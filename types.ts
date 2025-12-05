
export enum CardStatus {
  IDLE = 'IDLE',
  COPYING = 'COPYING',
  PAUSED = 'PAUSED', // Interrupted state
  RESUMING = 'RESUMING', // Fast verification before resuming
  VERIFYING = 'VERIFYING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type Theme = 'dark' | 'silver';
export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'ar';
export type VerificationMode = 'quick' | 'full';
export type ClockStyle = 'digital-12' | 'digital-24' | 'analog';

export interface ClipMetadata {
  name: string;
  size: string;
  duration: string;
  resolution: string; // e.g., "4K DCI"
  frameRate: string; // e.g., "24.00"
  logFormat: string; // e.g., "ARRI LogC4"
  audioTracks: number;
  timecodeStart: string;
  timecodeEnd: string;
  cameraModel: string;
  lens?: string;
}

export interface BackupRecord {
  id: string;
  date: string;
  cardLabel: string;
  totalSize: string;
  clipCount: number;
  destination: string;
  status: 'SUCCESS' | 'ERROR';
}

export interface TranscodeRecord {
  id: string;
  date: string;
  clipName: string;
  format: string;
  outputSize: string;
  duration: string;
  sourcePath: string;
  destPath: string;
  status: 'COMPLETED' | 'FAILED';
}

export interface CardState {
  id: string;
  slotLabel: string; // Now editable
  label: string;
  color: string; // Tailwind class prefix or hex
  status: CardStatus;
  progress: number; // 0-100
  transferRateMBps: number; // Current speed in MB/s
  pausedProgress?: number; // Tracks where we left off
  speedMultiplier: number; // For simulation acceleration
  clips: ClipMetadata[];
  totalSizeGB: number;
  destinationPath: string; // Custom copy path
  isLocked: boolean; // Individual card lock
  isMounted: boolean; // Simulation of physical connection
  history: BackupRecord[];
}

export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export interface TranscodeSettings {
  burnInTimecode: boolean;
  timecodeSource: 'file' | 'manual';
  manualTimecodeStart: string;
  burnInWatermark: boolean;
  watermarkText: string;
  watermarkPosition: WatermarkPosition;
  applyLut: boolean;
  lutName: string; // Filename or path
  format: 'ProRes 422 Proxy' | 'ProRes 422 LT' | 'ProRes 4444' | 'H.264 High' | 'H.265 Main10' | 'DNxHD 115' | 'DNxHR LB';
  outputResolution: '1080p' | '720p' | 'UHD' | '1080x1920' | '720x1280' | '2160x3840';
  frameRate: 'Source' | '23.976' | '24' | '25' | '29.97' | '30' | '50' | '59.94' | '60';
  sourcePath: string;
  destPath: string;
  logPath: string;
  targetSizeMB: number; // User manual override for size
  generateLog: boolean;
}

export interface ScriptEntry {
  id: string;
  scene: string;
  take: string;
  clipName: string;
  notes: string;
  good: boolean;
}

export interface LogReport {
  date: string;
  cameraModel: string;
  totalClips: number;
  firstClip: string;
  lastClip: string;
  missingClips: string[];
  totalSize: string;
  formats: string;
  notes: string;
  scriptMatch?: string;
}

export interface FAQItem {
  q: string;
  a: string;
  targetTab?: string; // Tab ID to jump to
}
