

import React, { useState } from 'react';
import { CardState, CardStatus, Theme, Language, VerificationMode } from '../types';
import { HardDrive, Play, Pause, RefreshCw, CheckCircle2, FastForward, Lock, Unlock, FolderOpen, History, ShieldCheck, Zap, Shield, LogOut, Disc, AlertTriangle, X, Activity } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';

interface IngestPanelProps {
  cards: CardState[];
  theme: Theme;
  language: Language;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  verificationMode: VerificationMode;
  setVerificationMode: (mode: VerificationMode) => void;
  onToggleSpeed: (id: string) => void;
  onStartOffload: (id: string) => void;
  onPause: (id: string) => void;
  onStartAll: () => void;
  onUpdatePath: (id: string, path: string) => void;
  onUpdateSlotName: (id: string, name: string) => void;
  onToggleCardLock: (id: string) => void;
  onEjectCard: (id: string) => void;
  onMountCard: (id: string) => void;
}

const IngestPanel: React.FC<IngestPanelProps> = ({ 
  cards, theme, language, isLocked, setIsLocked,
  verificationMode, setVerificationMode,
  onToggleSpeed, onStartOffload, onPause, onStartAll, 
  onUpdatePath, onUpdateSlotName, onToggleCardLock,
  onEjectCard, onMountCard
}) => {
  const t = TRANSLATIONS[language];
  const isSilver = theme === 'silver';
  const [confirmEjectId, setConfirmEjectId] = useState<string | null>(null);

  const cardBg = isSilver ? 'bg-white border-slate-200 hover:border-indigo-300' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700';
  const textColor = isSilver ? 'text-slate-900' : 'text-white';
  const subText = isSilver ? 'text-slate-500' : 'text-zinc-400';
  const inputBg = isSilver ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-800 text-zinc-300';
  
  const handleEjectClick = (id: string) => {
    if (isLocked) return;
    setConfirmEjectId(id);
  };

  const confirmEject = () => {
    if (confirmEjectId) {
      onEjectCard(confirmEjectId);
      setConfirmEjectId(null);
    }
  };

  return (
    <div className={`p-8 max-w-7xl mx-auto min-h-full ${language === 'ar' ? 'rtl' : ''}`}>
      
      {/* Header & Global Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold mb-1 ${textColor}`}>{t.backupVerify}</h2>
          <p className={`text-sm ${subText}`}>
             {cards.filter(c => c.isMounted).length} {t.readersDetected}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          
          {/* Verification Mode Toggle */}
          <div className={`flex items-center p-1 rounded-lg border mr-2 transition-opacity ${isSilver ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'} ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
            <button
               onClick={() => setVerificationMode('quick')}
               disabled={isLocked}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${verificationMode === 'quick' ? 'bg-indigo-500 text-white shadow-sm' : subText}`}
               title={t.quickVerify}
            >
              <Zap size={12} fill={verificationMode === 'quick' ? "currentColor" : "none"} />
              {t.quickVerify.split('(')[0]}
            </button>
            <button
               onClick={() => setVerificationMode('full')}
               disabled={isLocked}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${verificationMode === 'full' ? 'bg-indigo-500 text-white shadow-sm' : subText}`}
               title={t.fullVerify}
            >
              <Shield size={12} fill={verificationMode === 'full' ? "currentColor" : "none"} />
              {t.fullVerify.split('(')[0]}
            </button>
          </div>

          {/* Global Lock Button */}
          <button
             onClick={() => setIsLocked(!isLocked)}
             className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 border ${
               isLocked 
                 ? 'bg-red-500 text-white border-red-600' 
                 : isSilver 
                    ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50' 
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
             }`}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
            {isLocked ? t.locked : t.lockUI}
          </button>

          <button
            onClick={onStartAll}
            disabled={isLocked}
            className={`px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-sm ${
              isLocked ? 'opacity-50 cursor-not-allowed bg-gray-500 text-white' :
              isSilver 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            <Play size={16} fill="currentColor" />
            {t.offloadAll}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const cardLocked = isLocked || card.isLocked;
          
          // Determine if card is busy (to lock eject)
          const isBusy = card.status === CardStatus.COPYING || 
                         card.status === CardStatus.VERIFYING || 
                         card.status === CardStatus.RESUMING ||
                         card.status === CardStatus.PAUSED;

          if (!card.isMounted) {
            return (
               <div key={card.id} className={`${cardBg} border rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center h-[400px] border-dashed`}>
                  <Disc size={48} className="mb-4 text-gray-400 opacity-50" />
                  <h3 className={`text-lg font-bold mb-2 ${textColor}`}>{t.noDisk}</h3>
                  <p className={`text-sm mb-6 ${subText}`}>{card.slotLabel}</p>
                  <button 
                    onClick={() => onMountCard(card.id)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium"
                  >
                     {t.mount}
                  </button>
               </div>
            )
          }

          return (
            <div key={card.id} className="flex flex-col gap-4">
              {/* Card Container */}
              <div 
                className={`${cardBg} border rounded-2xl p-6 relative overflow-hidden group transition-all shadow-lg flex-1`}
              >
                {/* Status Glow */}
                <div 
                  className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300`}
                  style={{ backgroundColor: card.color }}
                />

                {/* Individual Lock Overlay */}
                {card.isLocked && !isLocked && (
                   <div className="absolute top-2 right-2 z-10 text-red-500">
                      <Lock size={16} />
                   </div>
                )}

                {/* Eject Confirmation Overlay */}
                {confirmEjectId === card.id && (
                  <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md bg-black/60 transition-opacity`}>
                    <AlertTriangle className="text-red-500 mb-3" size={32} />
                    <h4 className="text-white font-bold mb-2">{t.confirmEjectTitle}</h4>
                    <p className="text-zinc-300 text-xs mb-6">{t.confirmEjectBody}</p>
                    <div className="flex gap-3 w-full">
                       <button 
                         onClick={() => setConfirmEjectId(null)}
                         className="flex-1 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600 text-xs"
                       >
                         {t.cancel}
                       </button>
                       <button 
                         onClick={confirmEject}
                         className="flex-1 py-2 rounded bg-red-600 text-white hover:bg-red-500 text-xs font-bold"
                       >
                         {t.confirm}
                       </button>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative flex-shrink-0 ${isSilver ? 'bg-slate-100' : 'bg-zinc-800'}`}>
                      <HardDrive size={20} style={{ color: card.color }} />
                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 border border-gray-200 dark:border-zinc-700">
                         <span className="text-[10px] font-bold px-1">{card.slotLabel.slice(-1)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Editable Slot Name */}
                      <input 
                        type="text"
                        value={card.slotLabel}
                        disabled={cardLocked}
                        onChange={(e) => onUpdateSlotName(card.id, e.target.value)}
                        className={`font-semibold text-lg bg-transparent border-b border-transparent focus:outline-none w-full truncate ${textColor} ${
                            cardLocked 
                                ? 'opacity-70 cursor-not-allowed' 
                                : 'hover:border-gray-500 focus:border-indigo-500'
                        }`}
                      />
                      <p className={`text-xs font-mono ${subText} truncate`}>{card.label} • {card.totalSizeGB} GB</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => onToggleCardLock(card.id)}
                      className={`p-2 rounded-full transition-colors ${
                         card.isLocked
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                          : isSilver ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-zinc-800 text-zinc-500'
                      }`}
                      title={card.isLocked ? "Unlock Card" : "Lock Card"}
                    >
                      {card.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>

                    <button
                      onClick={() => onToggleSpeed(card.id)}
                      disabled={cardLocked}
                      className={`p-2 rounded-full transition-colors ${
                        card.speedMultiplier > 1 
                          ? 'bg-indigo-500/20 text-indigo-500' 
                          : isSilver ? 'bg-slate-100 text-slate-400 hover:text-slate-600' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Toggle High Speed Mode"
                    >
                      <FastForward size={16} />
                    </button>
                    
                    {/* Eject Button */}
                    <button
                      onClick={() => handleEjectClick(card.id)}
                      disabled={cardLocked || isBusy}
                      className={`p-2 rounded-full transition-colors ${
                         cardLocked || isBusy
                           ? 'opacity-30 cursor-not-allowed' 
                           : isSilver ? 'hover:bg-red-50 text-slate-400 hover:text-red-500' : 'hover:bg-zinc-800 text-zinc-500 hover:text-red-500'
                      }`}
                      title={t.eject}
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>

                {/* Path Selection */}
                <div className="mb-4">
                  <label className={`text-xs font-semibold mb-1 block flex items-center gap-1 ${subText}`}>
                    <FolderOpen size={10} /> {t.copyPath}
                  </label>
                  <input 
                    type="text" 
                    value={card.destinationPath}
                    onChange={(e) => onUpdatePath(card.id, e.target.value)}
                    disabled={cardLocked || isBusy}
                    placeholder={t.pathPlaceholder}
                    className={`w-full px-3 py-1.5 rounded text-xs border focus:border-indigo-500 outline-none transition-all ${inputBg}`}
                  />
                </div>

                {/* Progress Section */}
                <div className="space-y-2 mb-6 relative">
                  <div className="flex justify-between items-end text-xs font-medium">
                    <span className={`${
                        isBusy
                        ? (isSilver ? 'text-indigo-600' : 'text-white') 
                        : subText
                      }`}>
                      {card.status === CardStatus.IDLE && t.statusReady}
                      {card.status === CardStatus.COPYING && `${t.statusCopying} @ ${card.speedMultiplier}x`}
                      {card.status === CardStatus.PAUSED && t.statusPaused}
                      {card.status === CardStatus.RESUMING && t.statusResuming}
                      {card.status === CardStatus.VERIFYING && `${t.statusVerifying} (${verificationMode === 'quick' ? 'Quick' : 'XXHash'})`}
                      {card.status === CardStatus.COMPLETED && t.statusCompleted}
                      {card.status === CardStatus.ERROR && t.statusError}
                    </span>
                    <div className="flex flex-col items-end">
                       {/* Transfer Rate Display */}
                       {(isBusy) && card.transferRateMBps > 0 && (
                          <span className={`text-[10px] font-mono mb-0.5 ${isSilver ? 'text-indigo-500' : 'text-indigo-400'}`}>
                            {card.transferRateMBps.toFixed(0)} MB/s
                          </span>
                       )}
                       <span className={isSilver ? 'text-slate-700' : 'text-zinc-300'}>{Math.round(card.progress)}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="relative pt-2 pb-2"> 
                    <div className={`h-2 w-full rounded-full overflow-hidden ${isSilver ? 'bg-slate-200' : 'bg-zinc-800'}`}>
                      <div 
                        className="h-full transition-all duration-300 ease-out relative"
                        style={{ 
                          width: `${card.progress}%`,
                          backgroundColor: card.status === CardStatus.PAUSED ? '#fbbf24' : card.color 
                        }}
                      >
                        {/* Stripes for Verify/Resume states */}
                        {(card.status === CardStatus.VERIFYING || card.status === CardStatus.RESUMING) && (
                          <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-30 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3">
                  {card.status === CardStatus.IDLE && (
                    <button
                      onClick={() => onStartOffload(card.id)}
                      disabled={cardLocked}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSilver 
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900' 
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {t.startOffload}
                    </button>
                  )}

                  {/* Pause / Resume Controls */}
                  {(card.status === CardStatus.COPYING || card.status === CardStatus.RESUMING) && (
                     <button
                      onClick={() => onPause(card.id)}
                      disabled={cardLocked}
                      className="w-full py-2 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/50 hover:bg-yellow-500/20 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Pause size={16} /> {t.pause}
                    </button>
                  )}

                  {card.status === CardStatus.PAUSED && (
                     <button
                      onClick={() => onStartOffload(card.id)}
                      disabled={cardLocked}
                      className="w-full py-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/50 hover:bg-indigo-500/20 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} /> {t.resume}
                    </button>
                  )}

                  {card.status === CardStatus.COMPLETED && (
                    <div className="flex items-center gap-2 text-green-500 text-sm font-medium w-full justify-center bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                      <CheckCircle2 size={16} />
                      {t.statusCompleted}
                    </div>
                  )}
                  
                   {card.status === CardStatus.VERIFYING && (
                    <div className={`flex items-center justify-center w-full py-2 text-sm animate-pulse ${subText}`}>
                      {t.statusVerifying}
                    </div>
                  )}
                </div>
                
                {/* Grain Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
              </div>

              {/* Verification Records / History */}
              <div className={`p-4 rounded-xl border ${isSilver ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                <div className={`flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider ${subText}`}>
                  <ShieldCheck size={12} />
                  {t.verificationRecords} ({card.slotLabel})
                </div>
                <div className="space-y-2">
                  {card.history.length === 0 ? (
                    <div className={`text-xs italic ${subText} text-center py-2`}>{t.noHistory}</div>
                  ) : (
                    card.history.slice(0, 5).map(record => (
                      <div key={record.id} className={`flex justify-between items-center text-xs p-2 rounded ${isSilver ? 'bg-white border border-slate-100' : 'bg-zinc-900 border border-zinc-800'}`}>
                        <div className={textColor}>
                           <span className="opacity-70">{record.date.split(' ')[1]}</span>
                           <span className="mx-2">•</span>
                           <span>{record.totalSize}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                           <CheckCircle2 size={10} />
                           {record.clipCount} Clips
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IngestPanel;
