
import React, { useState, useEffect } from 'react';
import { CardState, ClipMetadata, TranscodeSettings, Theme, Language, WatermarkPosition, TranscodeRecord } from '../types';
import { Play, Pause, FastForward, Rewind, Layers, Clock, Settings2, FileOutput, FolderInput, FolderOutput, Scale, History, FileText, Upload, Monitor } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';

interface TranscodePanelProps {
  cards: CardState[];
  theme: Theme;
  language: Language;
  transcodeHistory: TranscodeRecord[];
  onAddTranscodeRecord: (record: TranscodeRecord) => void;
}

const TranscodePanel: React.FC<TranscodePanelProps> = ({ cards, theme, language, transcodeHistory, onAddTranscodeRecord }) => {
  const [activeClip, setActiveClip] = useState<ClipMetadata | null>(cards[0]?.clips[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [settings, setSettings] = useState<TranscodeSettings>({
    burnInTimecode: true,
    timecodeSource: 'file',
    manualTimecodeStart: '00:00:00:00',
    burnInWatermark: false,
    watermarkText: "PROPERTY OF STUDIO",
    watermarkPosition: 'center',
    applyLut: true,
    lutName: "ARRI_709_v2.cube",
    format: 'ProRes 422 Proxy',
    outputResolution: '1080p',
    frameRate: 'Source',
    sourcePath: "/Volumes/Mag_A/Clips",
    destPath: "/Volumes/Dailies/Day_01",
    logPath: "/Volumes/Dailies/Logs",
    targetSizeMB: 0,
    generateLog: true
  });

  const [calculatedSize, setCalculatedSize] = useState(0);

  const t = TRANSLATIONS[language];
  const isSilver = theme === 'silver';
  
  const toggleSetting = (key: keyof TranscodeSettings) => {
    setSettings(prev => ({ ...prev, [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key] }));
  };

  const handleLutFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSettings(prev => ({ ...prev, lutName: e.target.files![0].name }));
    }
  };

  // Timecode Validation and Masking (HH:MM:SS:FF)
  const handleTimecodeChange = (val: string) => {
    // Remove non-numeric characters
    const numeric = val.replace(/\D/g, '');
    
    // Truncate to max 8 digits
    const truncated = numeric.slice(0, 8);
    
    // Add colons
    let formatted = truncated;
    if (truncated.length > 2) formatted = truncated.slice(0, 2) + ':' + truncated.slice(2);
    if (truncated.length > 4) formatted = formatted.slice(0, 5) + ':' + formatted.slice(5);
    if (truncated.length > 6) formatted = formatted.slice(0, 8) + ':' + formatted.slice(8);

    setSettings({...settings, manualTimecodeStart: formatted});
  };

  const allClips = cards.flatMap(c => c.clips);

  // Simple size calculation simulation
  useEffect(() => {
    if (!activeClip) return;
    
    // Parse Duration "HH:MM:SS:FF" to seconds (approx)
    const parts = activeClip.duration.split(':').map(Number);
    const durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];

    // Bitrate assumption (Mbps)
    let bitrate = 45; // Default ProRes Proxy
    if (settings.format.includes('H.264')) bitrate = 15;
    if (settings.format.includes('H.265')) bitrate = 10;
    if (settings.format.includes('4444')) bitrate = 300;
    
    // Adjust for FPS if not Source
    let fpsMultiplier = 1;
    if (settings.frameRate !== 'Source') {
       const targetFps = parseFloat(settings.frameRate);
       const sourceFps = parseFloat(activeClip.frameRate);
       if (!isNaN(targetFps) && !isNaN(sourceFps)) {
          fpsMultiplier = targetFps / sourceFps;
       }
    }

    const size = ((durationSec * bitrate) / 8) * fpsMultiplier; // MB
    
    if (settings.targetSizeMB === 0) {
       setCalculatedSize(Math.round(size));
    } else {
       setCalculatedSize(settings.targetSizeMB);
    }

  }, [activeClip, settings.format, settings.targetSizeMB, settings.frameRate]);

  const handleRender = () => {
    if (!activeClip) return;
    
    // Simple verification of manual timecode before render
    if (settings.timecodeSource === 'manual') {
       const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]):([0-9][0-9])$/;
       if (!regex.test(settings.manualTimecodeStart)) {
          alert("Invalid Timecode Format. Please use HH:MM:SS:FF");
          return;
       }
    }

    // Simulate Render
    const newRecord: TranscodeRecord = {
      id: `t-${Date.now()}`,
      date: new Date().toLocaleString(),
      clipName: activeClip.name,
      format: settings.format,
      outputSize: `${calculatedSize} MB`,
      duration: activeClip.duration,
      sourcePath: settings.sourcePath,
      destPath: settings.destPath,
      status: 'COMPLETED'
    };
    onAddTranscodeRecord(newRecord);
    alert(t.renderQueue + " (Simulated)");
  };
  
  const sidebarBg = isSilver ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800';
  const textColor = isSilver ? 'text-slate-900' : 'text-white';
  const subText = isSilver ? 'text-slate-500' : 'text-zinc-400';
  const inputBg = isSilver ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-700 text-white';

  const getWatermarkPositionClass = (pos: WatermarkPosition) => {
    switch (pos) {
      case 'top-left': return 'top-8 left-8';
      case 'top-right': return 'top-8 right-8';
      case 'bottom-left': return 'bottom-20 left-8';
      case 'bottom-right': return 'bottom-20 right-8';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  const isVertical = settings.outputResolution.includes('Vertical') || settings.outputResolution.includes('x1920') || settings.outputResolution.includes('x1280') || settings.outputResolution.includes('x3840');

  return (
    <div className={`h-full flex flex-col xl:flex-row ${language === 'ar' ? 'rtl' : ''}`}>
      
      {/* Settings Sidebar */}
      <div className={`w-full xl:w-96 p-6 border-b xl:border-b-0 xl:border-r overflow-y-auto ${sidebarBg}`}>
        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textColor}`}>
           <Settings2 size={20} />
           {t.transcodeSettings}
        </h2>

        <div className="space-y-6">
          {/* Output Format */}
          <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${subText}`}>
              <FileOutput size={12} /> {t.outputFormat}
            </label>
            <div className="space-y-2">
              <select 
                value={settings.format} 
                onChange={(e) => setSettings({...settings, format: e.target.value as any})}
                className={`w-full p-2.5 rounded text-sm outline-none border ${inputBg}`}
              >
                <option value="ProRes 422 Proxy">ProRes 422 Proxy</option>
                <option value="ProRes 422 LT">ProRes 422 LT</option>
                <option value="ProRes 4444">ProRes 4444</option>
                <option value="H.264 High">H.264 High</option>
                <option value="H.265 Main10">H.265 Main10</option>
                <option value="DNxHD 115">DNxHD 115</option>
                <option value="DNxHR LB">DNxHR LB</option>
              </select>

              <div className="grid grid-cols-2 gap-2">
                 <select 
                  value={settings.outputResolution} 
                  onChange={(e) => setSettings({...settings, outputResolution: e.target.value as any})}
                  className={`w-full p-2.5 rounded text-sm outline-none border ${inputBg}`}
                >
                  <option value="1080p">{t.res1080p}</option>
                  <option value="720p">{t.res720p}</option>
                  <option value="UHD">{t.resUHD}</option>
                  <option value="1080x1920">{t.resVerticalHD}</option>
                  <option value="720x1280">{t.resVertical720}</option>
                  <option value="2160x3840">{t.resVerticalUHD}</option>
                </select>

                <select 
                  value={settings.frameRate} 
                  onChange={(e) => setSettings({...settings, frameRate: e.target.value as any})}
                  className={`w-full p-2.5 rounded text-sm outline-none border ${inputBg}`}
                >
                  <option value="Source">{t.fpsSource}</option>
                  <option value="23.976">23.976</option>
                  <option value="24">24</option>
                  <option value="25">25</option>
                  <option value="29.97">29.97</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="59.94">59.94</option>
                  <option value="60">60</option>
                </select>
              </div>
            </div>
          </div>

          {/* Size Calculator */}
          <div className={`p-4 rounded-lg border space-y-3 ${isSilver ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
             <div className="flex justify-between items-center">
                <label className={`text-xs font-bold uppercase ${subText}`}>{t.estSize}</label>
                <span className={`text-sm font-mono font-bold ${textColor}`}>{Math.round(calculatedSize)} MB</span>
             </div>
             <div className="space-y-1">
                <label className={`text-[10px] uppercase ${subText}`}>{t.targetSize}</label>
                <input 
                  type="number" 
                  value={settings.targetSizeMB || ''}
                  onChange={(e) => setSettings({...settings, targetSizeMB: parseInt(e.target.value) || 0})}
                  placeholder="Auto"
                  className={`w-full p-2 rounded text-xs border ${inputBg}`}
                />
             </div>
          </div>

           {/* Paths */}
           <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${subText}`}>
              <FolderInput size={12} /> {t.sourcePath}
            </label>
            <input 
              type="text" 
              value={settings.sourcePath}
              onChange={(e) => setSettings({...settings, sourcePath: e.target.value})}
              className={`w-full p-2 rounded text-xs outline-none border ${inputBg}`}
            />
             <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${subText}`}>
              <FolderOutput size={12} /> {t.destPath}
            </label>
             <input 
              type="text" 
              value={settings.destPath}
              onChange={(e) => setSettings({...settings, destPath: e.target.value})}
              className={`w-full p-2 rounded text-xs outline-none border ${inputBg}`}
            />
          </div>

          {/* Color Pipeline */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${subText}`}>
                   <Monitor size={12} /> {t.colorPipeline}
                </label>
                <input 
                  type="checkbox" 
                  checked={settings.applyLut} 
                  onChange={() => toggleSetting('applyLut')} 
                  className="toggle-checkbox accent-indigo-500"
                />
             </div>
             {settings.applyLut && (
               <div className={`flex items-center gap-2 p-2 rounded border ${inputBg}`}>
                  <label className="cursor-pointer flex-1 truncate text-xs">
                    {settings.lutName}
                    <input type="file" accept=".cube" className="hidden" onChange={handleLutFileSelect} />
                  </label>
                  <Upload size={14} className="opacity-50" />
               </div>
             )}
          </div>

          {/* Burn-ins */}
          <div className="space-y-4 pt-4 border-t border-gray-700/20">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${subText}`}>{t.burnIns}</h3>
            
            {/* Timecode */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textColor}`}>Timecode</span>
                <input 
                  type="checkbox" 
                  checked={settings.burnInTimecode} 
                  onChange={() => toggleSetting('burnInTimecode')} 
                  className="accent-indigo-500 w-4 h-4"
                />
              </div>
              
              {settings.burnInTimecode && (
                <div className={`p-3 rounded border text-xs space-y-2 ${isSilver ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                   <div className="flex gap-2 mb-2">
                     <button 
                       onClick={() => setSettings({...settings, timecodeSource: 'file'})}
                       className={`flex-1 py-1 rounded ${settings.timecodeSource === 'file' ? 'bg-indigo-500 text-white' : 'bg-gray-500/10'}`}
                     >
                       {t.tcFile}
                     </button>
                      <button 
                       onClick={() => setSettings({...settings, timecodeSource: 'manual'})}
                       className={`flex-1 py-1 rounded ${settings.timecodeSource === 'manual' ? 'bg-indigo-500 text-white' : 'bg-gray-500/10'}`}
                     >
                       {t.tcManual}
                     </button>
                   </div>
                   {settings.timecodeSource === 'manual' && (
                     <input 
                        type="text" 
                        value={settings.manualTimecodeStart} 
                        onChange={(e) => handleTimecodeChange(e.target.value)}
                        className={`w-full p-1.5 rounded text-center font-mono tracking-widest border ${inputBg}`}
                     />
                   )}
                </div>
              )}
            </div>

            {/* Watermark */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textColor}`}>{t.watermark}</span>
                <input 
                  type="checkbox" 
                  checked={settings.burnInWatermark} 
                  onChange={() => toggleSetting('burnInWatermark')} 
                  className="accent-indigo-500 w-4 h-4"
                />
              </div>
              {settings.burnInWatermark && (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    value={settings.watermarkText}
                    onChange={(e) => setSettings({...settings, watermarkText: e.target.value})}
                    className={`w-full p-2 rounded text-xs outline-none border ${inputBg}`}
                  />
                  <div className="flex justify-between items-center text-xs">
                     <span className={subText}>{t.watermarkPos}:</span>
                     <select 
                        value={settings.watermarkPosition}
                        onChange={(e) => setSettings({...settings, watermarkPosition: e.target.value as any})}
                        className={`p-1 rounded border ${inputBg}`}
                     >
                        <option value="center">Center</option>
                        <option value="top-left">Top Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-right">Bottom Right</option>
                     </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 pt-2">
               <input 
                  type="checkbox" 
                  checked={settings.generateLog} 
                  onChange={() => toggleSetting('generateLog')} 
                  className="accent-indigo-500 w-3 h-3"
               />
               <span className={`text-xs ${subText}`}>{t.genTranscodeLog}</span>
            </div>

          </div>
        </div>

        <button 
          onClick={handleRender}
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          {t.renderQueue}
        </button>
      </div>

      {/* Preview Area & Clip List */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Preview Player */}
        <div className="flex-1 bg-black relative flex items-center justify-center p-8 overflow-hidden group">
          {activeClip ? (
            <div className={`relative bg-zinc-900 shadow-2xl transition-all duration-300 ${isVertical ? 'aspect-[9/16] h-full w-auto' : 'aspect-video w-full max-w-5xl'}`}>
              
              {/* Fake Video Content */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className={`text-zinc-700 text-9xl font-bold opacity-20 select-none ${isVertical ? 'rotate-90' : ''}`}>
                   {activeClip.cameraModel}
                </div>
                {/* Simulation of LUT */}
                {settings.applyLut && <div className="absolute inset-0 bg-indigo-500 mix-blend-overlay opacity-10"></div>}
              </div>

              {/* Overlays */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                {settings.burnInTimecode && (
                  <div className={`font-mono text-white drop-shadow-md font-bold absolute bottom-8 right-8 ${isVertical ? 'text-2xl' : 'text-xl'}`}>
                    {settings.timecodeSource === 'manual' ? settings.manualTimecodeStart : activeClip.timecodeStart}
                  </div>
                )}
                
                {settings.burnInWatermark && (
                  <div className={`absolute text-white/30 font-bold uppercase pointer-events-none whitespace-nowrap ${getWatermarkPositionClass(settings.watermarkPosition)} ${isVertical ? 'text-4xl' : 'text-5xl'}`}>
                    {settings.watermarkText}
                  </div>
                )}
              </div>

              {/* Controls Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 backdrop-blur-[2px]">
                <button className="p-3 text-white hover:text-indigo-400 transition-colors"><Rewind size={32} fill="currentColor" /></button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-5 bg-white text-black rounded-full hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" ml-1 />}
                </button>
                <button className="p-3 text-white hover:text-indigo-400 transition-colors"><FastForward size={32} fill="currentColor" /></button>
              </div>
            </div>
          ) : (
            <div className="text-zinc-600 flex flex-col items-center">
              <Layers size={48} className="mb-4" />
              <p>Select a clip to preview</p>
            </div>
          )}
        </div>

        {/* Bottom Section: Clip List & History */}
        <div className={`h-64 border-t flex flex-col md:flex-row ${isSilver ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-900'}`}>
          
          {/* Source Clips */}
          <div className="flex-1 border-r border-gray-700/20 flex flex-col min-w-0">
             <div className={`p-3 text-xs font-bold uppercase tracking-wider border-b flex justify-between ${isSilver ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                <span>{t.sourceMedia}</span>
                <span>{allClips.length} Clips</span>
             </div>
             <div className="overflow-y-auto flex-1 p-2 space-y-1">
               {allClips.map((clip, idx) => (
                 <div 
                   key={idx}
                   onClick={() => setActiveClip(clip)}
                   className={`p-2 rounded flex items-center justify-between cursor-pointer transition-colors text-xs ${
                     activeClip?.name === clip.name 
                       ? 'bg-indigo-600 text-white' 
                       : isSilver ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-zinc-800 text-zinc-300'
                   }`}
                 >
                   <div className="flex items-center gap-2 truncate">
                      <FileText size={14} />
                      <span className="truncate">{clip.name}</span>
                   </div>
                   <div className="flex items-center gap-3 opacity-70 text-[10px] font-mono shrink-0">
                      <span>{clip.resolution}</span>
                      <span>{clip.duration}</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Transcode History */}
          <div className="w-full md:w-96 flex flex-col min-w-0">
             <div className={`p-3 text-xs font-bold uppercase tracking-wider border-b flex items-center gap-2 ${isSilver ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                <History size={12} />
                <span>{t.transcodeHistory}</span>
             </div>
             <div className="overflow-y-auto flex-1 p-2 space-y-1">
               {transcodeHistory.length === 0 ? (
                  <div className={`text-center py-4 text-xs italic ${subText}`}>{t.noHistory}</div>
               ) : (
                 transcodeHistory.slice(0, 10).map((record) => (
                   <div key={record.id} className={`p-2 rounded border text-[10px] ${isSilver ? 'bg-white border-slate-100' : 'bg-zinc-950 border-zinc-800'}`}>
                      <div className={`flex justify-between mb-1 ${textColor}`}>
                         <span className="font-bold truncate max-w-[150px]">{record.clipName}</span>
                         <span className="text-green-500">{record.status}</span>
                      </div>
                      <div className={`flex justify-between ${subText}`}>
                         <span>{record.format}</span>
                         <span>{record.outputSize}</span>
                      </div>
                   </div>
                 ))
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TranscodePanel;
