

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import IngestPanel from './components/IngestPanel';
import ReportPanel from './components/ReportPanel';
import TranscodePanel from './components/TranscodePanel';
import { CardState, CardStatus, Theme, Language, BackupRecord, TranscodeRecord, VerificationMode, ClockStyle } from './types';
import { MOCK_CLIPS_A, MOCK_CLIPS_B, MOCK_CLIPS_C, MOCK_HISTORY, MOCK_TRANSCODE_HISTORY, RELEASE_NOTES_EN, RELEASE_NOTES_ZH } from './constants';
import { CheckCircle, X, ChevronRight, Info, AlertTriangle } from 'lucide-react';
import { TRANSLATIONS } from './i18n';

// Simple Audio Context wrapper for beeps
const playSound = (type: 'start' | 'success' | 'alert') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'start') {
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else {
       osc.frequency.setValueAtTime(200, ctx.currentTime); 
       gain.gain.setValueAtTime(0.1, ctx.currentTime);
       gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
       osc.start();
       osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('backup');
  const [theme, setTheme] = useState<Theme>('silver');
  const [language, setLanguage] = useState<Language>('zh'); // Default to Chinese
  const [isLocked, setIsLocked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false); // Managed by version check
  const [showReleaseNotes, setShowReleaseNotes] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [verificationMode, setVerificationMode] = useState<VerificationMode>('full');
  const [clockStyle, setClockStyle] = useState<ClockStyle>('digital-24');
  const [showLunarDate, setShowLunarDate] = useState(true);

  // Initial State
  const [cards, setCards] = useState<CardState[]>([
    { id: 'card-a', slotLabel: 'Slot A', label: 'Mag A (Red)', color: '#FF5E5E', status: CardStatus.IDLE, progress: 0, transferRateMBps: 0, speedMultiplier: 1, clips: MOCK_CLIPS_A, totalSizeGB: 128, destinationPath: '/Volumes/RAID_01/Day_01', isLocked: false, isMounted: true, history: MOCK_HISTORY },
    { id: 'card-b', slotLabel: 'Slot B', label: 'Mag B (Cyan)', color: '#4FD1C5', status: CardStatus.IDLE, progress: 0, transferRateMBps: 0, speedMultiplier: 1, clips: MOCK_CLIPS_B, totalSizeGB: 64, destinationPath: '/Volumes/RAID_01/Day_01', isLocked: false, isMounted: true, history: [] },
    { id: 'card-c', slotLabel: 'Slot C', label: 'Mag C (Amber)', color: '#F6AD55', status: CardStatus.IDLE, progress: 0, transferRateMBps: 0, speedMultiplier: 1, clips: MOCK_CLIPS_C, totalSizeGB: 32, destinationPath: '/Volumes/SSD_Shuttle/Day_01', isLocked: false, isMounted: true, history: [] },
  ]);

  const [transcodeHistory, setTranscodeHistory] = useState<TranscodeRecord[]>(MOCK_TRANSCODE_HISTORY);

  const addTranscodeRecord = (record: TranscodeRecord) => {
    // Keep max 200 records
    setTranscodeHistory(prev => [record, ...prev].slice(0, 200));
  };

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prevCards => prevCards.map(card => {
        // Skip if paused or idle
        if (
          card.status === CardStatus.IDLE || 
          card.status === CardStatus.PAUSED || 
          card.status === CardStatus.COMPLETED ||
          card.status === CardStatus.ERROR ||
          !card.isMounted
        ) {
          return { ...card, transferRateMBps: 0 };
        }

        let speed = 0.2 * card.speedMultiplier;
        
        // Fast Verify logic for resuming
        if (card.status === CardStatus.RESUMING) {
          speed = 5.0; // Very fast catchup
        }

        // Verification speed depends on mode
        if (card.status === CardStatus.VERIFYING) {
           if (verificationMode === 'quick') {
             speed = 2.0 * card.speedMultiplier; // Fast verify
           } else {
             speed = 0.1 * card.speedMultiplier; // Full checksum (slower)
           }
        }

        // Calculate Simulation Transfer Rate (Mock)
        let rate = 0;
        if (card.status === CardStatus.COPYING || card.status === CardStatus.RESUMING || card.status === CardStatus.VERIFYING) {
           // Base speed roughly 300-800 MB/s for SSDs simulation
           // Add random fluctuation
           const baseRate = 450;
           const fluctuation = Math.random() * 50 - 25;
           rate = (baseRate + fluctuation) * card.speedMultiplier;
           
           // Read speed usually faster than write, so verify is faster in simulation sense (or slower if CPU bound checksum)
           // Let's just vary it slightly
           if (card.status === CardStatus.VERIFYING) rate = rate * 1.5; 
        }

        let newProgress = card.progress + speed;
        
        // Handle Resume catch-up completion
        if (card.status === CardStatus.RESUMING && card.pausedProgress && newProgress >= card.pausedProgress) {
           return { ...card, status: CardStatus.COPYING, progress: card.pausedProgress, transferRateMBps: rate };
        }

        // Transition: Copying -> Verifying
        if (card.status === CardStatus.COPYING && newProgress >= 100) {
          return { ...card, status: CardStatus.VERIFYING, progress: 0, transferRateMBps: rate };
        }
        
        // Transition: Verifying -> Completed
        if (card.status === CardStatus.VERIFYING && newProgress >= 100) {
          playSound('success'); 
          
          const newRecord: BackupRecord = {
            id: `h-${Date.now()}`,
            date: new Date().toLocaleString(),
            cardLabel: card.label,
            totalSize: `${card.totalSizeGB} GB`,
            clipCount: card.clips.length,
            destination: card.destinationPath,
            status: 'SUCCESS'
          };
          
          const newHistory = [newRecord, ...card.history].slice(0, 50);

          return { ...card, status: CardStatus.COMPLETED, progress: 100, transferRateMBps: 0, history: newHistory };
        }

        // Cap at 100
        if (newProgress > 100) newProgress = 100;

        return { ...card, progress: newProgress, transferRateMBps: rate };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [verificationMode]);

  const handleStartOffload = (id: string) => {
    playSound('start');
    setCards(prev => prev.map(c => {
      if (c.id !== id) return c;
      // If resuming from pause
      if (c.status === CardStatus.PAUSED) {
        return { ...c, status: CardStatus.RESUMING };
      }
      // Fresh start
      return { ...c, status: CardStatus.COPYING, progress: 0, pausedProgress: 0 };
    }));
  };

  const handlePause = (id: string) => {
    playSound('alert');
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        return { 
          ...c, 
          status: CardStatus.PAUSED, 
          pausedProgress: c.progress,
          transferRateMBps: 0
        };
      }
      return c;
    }));
  };

  const handleStartAll = () => {
    playSound('start');
    setCards(prev => prev.map(c => {
      if (c.status === CardStatus.IDLE || c.status === CardStatus.PAUSED) {
        if (c.isLocked) return c; // Don't start locked cards
        if (!c.isMounted) return c;
        return { 
          ...c, 
          status: c.status === CardStatus.PAUSED ? CardStatus.RESUMING : CardStatus.COPYING,
          progress: c.status === CardStatus.PAUSED ? c.progress : 0
        };
      }
      return c;
    }));
  };

  const handleToggleSpeed = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, speedMultiplier: c.speedMultiplier === 1 ? 5 : 1 } : c));
  };

  const handleUpdatePath = (id: string, path: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, destinationPath: path } : c));
  };

  const handleUpdateSlotName = (id: string, name: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, slotLabel: name } : c));
  };

  const handleToggleCardLock = (id: string) => {
     setCards(prev => prev.map(c => c.id === id ? { ...c, isLocked: !c.isLocked } : c));
  };

  const handleEjectCard = (id: string) => {
    playSound('alert');
    setCards(prev => prev.map(c => c.id === id ? { ...c, isMounted: false, status: CardStatus.IDLE, progress: 0, transferRateMBps: 0 } : c));
  };

  const handleMountCard = (id: string) => {
    playSound('success');
    setCards(prev => prev.map(c => c.id === id ? { ...c, isMounted: true, status: CardStatus.IDLE, progress: 0 } : c));
  };

  // Theme wrapper classes
  const appContainerClass = theme === 'silver' 
    ? 'bg-slate-50 text-slate-900' 
    : 'bg-black text-zinc-100';

  const t = TRANSLATIONS[language];
  const releaseNotes = language === 'zh' ? RELEASE_NOTES_ZH : RELEASE_NOTES_EN;

  // Onboarding Content
  const steps = [
    { title: t.welcome, desc: t.welcomeDesc },
    { title: t.startGuide, desc: t.guideStep1 },
    { title: "AI & Logs", desc: t.guideStep2 },
    { title: "Transcode", desc: t.guideStep3 },
  ];

  const handleNextStep = () => {
    if (onboardingStep < steps.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  const handleCloseReleaseNotes = () => {
     setShowReleaseNotes(false);
     setShowOnboarding(true); // Show guide after release notes
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'backup':
        return <IngestPanel 
          cards={cards} 
          theme={theme}
          language={language}
          isLocked={isLocked}
          setIsLocked={setIsLocked}
          verificationMode={verificationMode}
          setVerificationMode={setVerificationMode}
          onStartOffload={handleStartOffload} 
          onToggleSpeed={handleToggleSpeed} 
          onStartAll={handleStartAll} 
          onPause={handlePause}
          onUpdatePath={handleUpdatePath}
          onUpdateSlotName={handleUpdateSlotName}
          onToggleCardLock={handleToggleCardLock}
          onEjectCard={handleEjectCard}
          onMountCard={handleMountCard}
        />;
      case 'logs':
        return <ReportPanel cards={cards.filter(c => c.isMounted)} theme={theme} language={language} />;
      case 'transcode':
        return <TranscodePanel 
          cards={cards.filter(c => c.isMounted)} 
          theme={theme} 
          language={language} 
          transcodeHistory={transcodeHistory}
          onAddTranscodeRecord={addTranscodeRecord}
        />;
      case 'xml':
        return (
            <div className={`p-10 flex flex-col items-center justify-center h-full ${theme === 'silver' ? 'text-slate-500' : 'text-zinc-500'}`}>
                <h2 className={`text-2xl font-bold ${theme === 'silver' ? 'text-slate-800' : 'text-white'}`}>
                  {t.xml}
                </h2>
                <div className={`mt-8 p-8 rounded-xl border w-full max-w-lg ${theme === 'silver' ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    <button className={`w-full py-3 rounded-lg border mb-3 ${theme === 'silver' ? 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200' : 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'}`}>
                      Export .XML (Resolve)
                    </button>
                    <button className={`w-full py-3 rounded-lg border ${theme === 'silver' ? 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200' : 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'}`}>
                      Export .ALE (Avid)
                    </button>
                </div>
            </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${appContainerClass}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        clockStyle={clockStyle}
        setClockStyle={setClockStyle}
        showLunarDate={showLunarDate}
        setShowLunarDate={setShowLunarDate}
      />
      <main className={`flex-1 overflow-auto relative ${theme === 'silver' ? 'bg-slate-50' : 'bg-zinc-950'}`}>
          {renderContent()}
      </main>

      {/* Release Notes Modal */}
      {showReleaseNotes && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl ${theme === 'silver' ? 'bg-white' : 'bg-zinc-900'} border ${theme === 'silver' ? 'border-slate-200' : 'border-zinc-800'}`}>
             <div className="flex items-center gap-3 mb-4">
               <Info className="text-indigo-500" size={24} />
               <h2 className={`text-xl font-bold ${theme === 'silver' ? 'text-slate-900' : 'text-white'}`}>{t.whatsNew}</h2>
             </div>
             <ul className={`space-y-3 mb-8 ${theme === 'silver' ? 'text-slate-600' : 'text-zinc-400'}`}>
                {releaseNotes.map((note, i) => (
                   <li key={i} className="flex items-start gap-2">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                     {note}
                   </li>
                ))}
             </ul>
             <button 
               onClick={handleCloseReleaseNotes}
               className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium"
             >
               {t.next}
             </button>
           </div>
        </div>
      )}

      {/* Onboarding Overlay */}
      {showOnboarding && !showReleaseNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${theme === 'silver' ? 'bg-white' : 'bg-zinc-900'} border ${theme === 'silver' ? 'border-slate-200' : 'border-zinc-800'}`}>
             <div className="flex justify-between items-center mb-6">
                <div className="flex gap-1">
                   {steps.map((_, i) => (
                     <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i === onboardingStep ? 'bg-indigo-500' : 'bg-gray-700'}`} />
                   ))}
                </div>
                <button onClick={() => setShowOnboarding(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
             </div>
             
             <div className="text-center py-8">
               <h2 className={`text-2xl font-bold mb-4 ${theme === 'silver' ? 'text-slate-900' : 'text-white'}`}>{steps[onboardingStep].title}</h2>
               {onboardingStep === 1 ? (
                 <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mb-4 text-left flex items-start gap-3">
                   <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                   <p className={`text-sm ${theme === 'silver' ? 'text-slate-700' : 'text-zinc-300'}`}>{steps[onboardingStep].desc}</p>
                 </div>
               ) : (
                 <p className={`text-lg ${theme === 'silver' ? 'text-slate-600' : 'text-zinc-400'}`}>{steps[onboardingStep].desc}</p>
               )}
             </div>

             <div className="flex justify-between mt-8">
               <button onClick={() => setShowOnboarding(false)} className={`text-sm ${theme === 'silver' ? 'text-slate-500' : 'text-zinc-500'}`}>{t.skip}</button>
               <button 
                onClick={handleNextStep}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {onboardingStep === steps.length - 1 ? t.finish : t.next}
                <ChevronRight size={16} />
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
