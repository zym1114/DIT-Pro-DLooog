
import { ClipMetadata, BackupRecord, TranscodeRecord } from "./types";

export const MOCK_CLIPS_A: ClipMetadata[] = [
  { name: "A001_C001_1024XJ.mxf", size: "4.2 GB", duration: "00:02:14:00", resolution: "4096x2160", frameRate: "24.00", logFormat: "LogC4", audioTracks: 4, timecodeStart: "10:00:00:00", timecodeEnd: "10:02:14:00", cameraModel: "ALEXA 35" },
  { name: "A001_C002_1024XJ.mxf", size: "1.1 GB", duration: "00:00:35:00", resolution: "4096x2160", frameRate: "24.00", logFormat: "LogC4", audioTracks: 4, timecodeStart: "10:04:12:00", timecodeEnd: "10:04:47:00", cameraModel: "ALEXA 35" },
  { name: "A001_C003_1024XJ.mxf", size: "8.5 GB", duration: "00:04:30:00", resolution: "4096x2160", frameRate: "48.00", logFormat: "LogC4", audioTracks: 4, timecodeStart: "10:06:00:00", timecodeEnd: "10:10:30:00", cameraModel: "ALEXA 35" },
  // Intentionally skipping C004 to test missing clip detection
  { name: "A001_C005_1024XJ.mxf", size: "2.3 GB", duration: "00:01:12:00", resolution: "4096x2160", frameRate: "24.00", logFormat: "LogC4", audioTracks: 4, timecodeStart: "10:15:20:00", timecodeEnd: "10:16:32:00", cameraModel: "ALEXA 35" },
];

export const MOCK_CLIPS_B: ClipMetadata[] = [
  { name: "B002_C001_1024TH.mxf", size: "3.2 GB", duration: "00:01:40:00", resolution: "4096x2160", frameRate: "24.00", logFormat: "LogC4", audioTracks: 2, timecodeStart: "14:22:10:00", timecodeEnd: "14:23:50:00", cameraModel: "ALEXA Mini LF" },
  { name: "B002_C002_1024TH.mxf", size: "3.5 GB", duration: "00:01:55:00", resolution: "4096x2160", frameRate: "24.00", logFormat: "LogC4", audioTracks: 2, timecodeStart: "14:25:00:00", timecodeEnd: "14:26:55:00", cameraModel: "ALEXA Mini LF" },
];

export const MOCK_CLIPS_C: ClipMetadata[] = [
  { name: "C001_C001_1024AB.mxf", size: "0.5 GB", duration: "00:00:15:00", resolution: "3840x2160", frameRate: "23.98", logFormat: "S-Log3", audioTracks: 4, timecodeStart: "08:11:05:00", timecodeEnd: "08:11:20:00", cameraModel: "FX9" },
];

export const MOCK_HISTORY: BackupRecord[] = [
  { id: 'h-1', date: '2023-10-24 10:00', cardLabel: 'Mag A (Red)', totalSize: '128 GB', clipCount: 15, destination: '/Volumes/RAID/Day1', status: 'SUCCESS' },
  { id: 'h-2', date: '2023-10-24 14:30', cardLabel: 'Mag A (Red)', totalSize: '64 GB', clipCount: 8, destination: '/Volumes/RAID/Day1', status: 'SUCCESS' },
];

export const MOCK_TRANSCODE_HISTORY: TranscodeRecord[] = [
  { id: 't-1', date: '2023-10-24 10:15', clipName: 'A001_C001_1024XJ.mxf', format: 'H.264', outputSize: '450 MB', duration: '00:02:14:00', sourcePath: '/Volumes/MagA/Clips', destPath: '/Volumes/Dailies', status: 'COMPLETED' },
  { id: 't-2', date: '2023-10-24 10:18', clipName: 'A001_C002_1024XJ.mxf', format: 'H.264', outputSize: '120 MB', duration: '00:00:35:00', sourcePath: '/Volumes/MagA/Clips', destPath: '/Volumes/Dailies', status: 'COMPLETED' },
];

export const RELEASE_NOTES_EN = [
  "New App Name: @DLooog DIT Pro.",
  "Enhanced Onboarding Guide: Learn about UI locking and safety features.",
  "Transcode Upgrades: File size estimation and manual target size adjustment.",
  "Detailed Logs: Generate session logs for transcode queues.",
  "History: Transcode history now saves up to 200 records (Last 10 visible)."
];

export const RELEASE_NOTES_ZH = [
  "全新软件名：@DLooog DIT Pro。",
  "增强的新手引导：了解界面锁定与安全防误触功能。",
  "转码升级：新增文件体积预估与目标大小手动调整。",
  "详细日志：支持生成转码会话日志与自定义时段记录。",
  "历史记录：转码历史保留最近200条记录（界面显示最近10条）。"
];
