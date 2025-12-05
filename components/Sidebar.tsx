

import React, { useState, useEffect } from 'react';
import { HardDrive, FileText, Settings, Video, Clapperboard, Globe, Moon, Sun, HelpCircle, X, Clock as ClockIcon, ExternalLink, Calendar, MessageSquare, Send } from 'lucide-react';
import { Theme, Language, ClockStyle } from '../types';
import { TRANSLATIONS, FAQ_DATA } from '../i18n';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  clockStyle: ClockStyle;
  setClockStyle: (s: ClockStyle) => void;
  showLunarDate: boolean;
  setShowLunarDate: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, 
  theme, setTheme, 
  language, setLanguage,
  clockStyle, setClockStyle,
  showLunarDate, setShowLunarDate
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [time, setTime] = useState(new Date());
  const t = TRANSLATIONS[language];
  const faqs = FAQ_DATA[language];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'backup', icon: HardDrive, label: t.backupVerify },
    { id: 'logs', icon: FileText, label: t.logGeneration },
    { id: 'transcode', icon: Video, label: t.transcode },
    { id: 'xml', icon: Clapperboard, label: t.xml },
  ];

  const handleHelpJump = (tabId?: string) => {
    if (tabId) {
      setActiveTab(tabId);
      setShowHelp(false);
    }
  };

  const handleSendFeedback = () => {
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setShowFeedback(false);
    }, 2000);
  };

  const bgClass = theme === 'silver' ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-800';
  const textClass = theme === 'silver' ? 'text-slate-600' : 'text-zinc-400';
  const activeClass = theme === 'silver' ? 'bg-slate-100 text-indigo-600 shadow-sm' : 'bg-white/10 text-white shadow-sm';
  const hoverClass = theme === 'silver' ? 'hover:bg-slate-50 hover:text-slate-900' : 'hover:bg-white/5 hover:text-zinc-200';
  const titleClass = theme === 'silver' ? 'text-slate-900' : 'text-white';
  const modalBg = theme === 'silver' ? 'bg-white' : 'bg-zinc-900';
  const modalText = theme === 'silver' ? 'text-slate-900' : 'text-white';

  const renderClock = () => {
    // Format full date with Weekday
    const dateStr = time.toLocaleDateString(language, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    let lunarStr = '';
    if (showLunarDate) {
      try {
        const formatter = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
          calendar: 'chinese',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const rawLunar = formatter.format(time);
        
        // Post-processing for Chinese Locale to remove Gregorian Year (e.g. "2024") if present
        // and ensure pure "甲辰年 X月X日" format
        if (language === 'zh') {
           // Regex to remove leading digits + space/char
           // Example input: "2024甲辰年九月廿六" -> "甲辰年九月廿六"
           lunarStr = rawLunar.replace(/^\d+/, ''); 
        } else {
           lunarStr = rawLunar;
        }
      } catch (e) {
        lunarStr = "Lunar Data Unavailable";
      }
    }
    
    if (clockStyle === 'analog') {
      const seconds = time.getSeconds() * 6;
      const minutes = time.getMinutes() * 6 + seconds / 60;
      const hours = (time.getHours() % 12) * 30 + minutes / 12;

      return (
        <div className="flex flex-col items-center justify-center p-4 mt-auto mb-2 border-t border-b border-gray-500/10">
          <div className={`relative w-24 h-24 rounded-full border-2 ${theme === 'silver' ? 'border-slate-300 bg-slate-50' : 'border-zinc-700 bg-zinc-900'}`}>
            {/* Markers */}
            {[0, 90, 180, 270].map(deg => (
               <div key={deg} className={`absolute w-1 h-1 bg-gray-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-10px)` }} />
            ))}
            {/* Hands */}
            <div className="absolute top-1/2 left-1/2 w-[2px] h-6 bg-indigo-500 origin-bottom rounded-full -translate-x-1/2 -translate-y-full" style={{ transform: `translate(-50%, -100%) rotate(${hours}deg)` }} />
            <div className="absolute top-1/2 left-1/2 w-[1.5px] h-8 bg-gray-500 origin-bottom rounded-full -translate-x-1/2 -translate-y-full" style={{ transform: `translate(-50%, -100%) rotate(${minutes}deg)` }} />
            <div className="absolute top-1/2 left-1/2 w-[1px] h-9 bg-red-500 origin-bottom rounded-full -translate-x-1/2 -translate-y-full" style={{ transform: `translate(-50%, -100%) rotate(${seconds}deg)` }} />
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-gray-600 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className={`mt-3 text-center`}>
            <div className={`text-[10px] font-medium uppercase tracking-wide ${textClass}`}>{dateStr}</div>
            {showLunarDate && <div className={`text-[10px] opacity-70 ${textClass}`}>{language !== 'zh' ? t.lunarPrefix : ''}{lunarStr}</div>}
          </div>
        </div>
      );
    }

    const timeStr = time.toLocaleTimeString(language, { 
       hour: '2-digit', minute: '2-digit', second: '2-digit', 
       hour12: clockStyle === 'digital-12' 
    });

    return (
      <div className={`flex flex-col items-center justify-center p-4 rounded-xl mt-auto mb-2 border ${theme === 'silver' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className={`text-2xl font-mono font-bold tracking-widest ${titleClass}`}>
           {timeStr}
        </div>
        <div className={`text-xs uppercase tracking-wide mt-2 font-medium text-center ${textClass}`}>
           {dateStr}
        </div>
        {showLunarDate && (
           <div className={`text-[10px] mt-1 opacity-70 ${textClass}`}>
             {language !== 'zh' ? t.lunarPrefix : ''}{lunarStr}
           </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`w-64 h-screen border-r flex flex-col p-4 transition-colors duration-300 ${bgClass}`}>
        <div className="mb-8 px-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-xs">DL</div>
          <h1 className={`text-base font-bold tracking-tight ${titleClass}`}>@DLooog DIT Pro</h1>
        </div>

        <nav className="space-y-1 mb-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === item.id ? activeClass : `${textClass} ${hoverClass}`
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Clock Positioned Below Nav */}
        <div className="flex-1 flex flex-col justify-end">
           {renderClock()}
        </div>

        <div className={`pt-4 border-t ${theme === 'silver' ? 'border-slate-200' : 'border-zinc-800'}`}>
          <div className="flex gap-2 mb-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${textClass} ${hoverClass} ${showSettings ? activeClass : ''}`}
            >
              <Settings size={18} />
              {t.settings}
            </button>
            <button 
              onClick={() => setShowHelp(true)}
              className={`flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${textClass} ${hoverClass}`}
              title={t.help}
            >
              <HelpCircle size={18} />
            </button>
             <button 
              onClick={() => setShowFeedback(true)}
              className={`flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${textClass} ${hoverClass}`}
              title={t.feedback}
            >
              <MessageSquare size={18} />
            </button>
          </div>

          {showSettings && (
            <div className={`mt-2 p-3 rounded-lg space-y-3 ${theme === 'silver' ? 'bg-slate-50' : 'bg-zinc-900'} max-h-56 overflow-y-auto`}>
              
              {/* Language Selector */}
              <div className="space-y-1">
                <label className={`text-[10px] uppercase font-bold flex items-center gap-1 ${textClass}`}>
                  <Globe size={10} /> {t.language}
                </label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className={`w-full text-xs p-1.5 rounded border ${theme === 'silver' ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-700 text-white'}`}
                >
                  <option value="en">English</option>
                  <option value="zh">中文 (Chinese)</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="ko">한국어 (Korean)</option>
                  <option value="es">Español</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>

              {/* Theme Selector */}
              <div className="space-y-1">
                <label className={`text-[10px] uppercase font-bold flex items-center gap-1 ${textClass}`}>
                   {theme === 'silver' ? <Sun size={10} /> : <Moon size={10} />} {t.theme}
                </label>
                 <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className={`w-full text-xs p-1.5 rounded border ${theme === 'silver' ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-700 text-white'}`}
                >
                  <option value="dark">{t.themeDark}</option>
                  <option value="silver">{t.themeSilver}</option>
                </select>
              </div>

               {/* Clock Style Selector */}
               <div className="space-y-1">
                <label className={`text-[10px] uppercase font-bold flex items-center gap-1 ${textClass}`}>
                   <ClockIcon size={10} /> {t.clockStyle}
                </label>
                 <select 
                  value={clockStyle}
                  onChange={(e) => setClockStyle(e.target.value as ClockStyle)}
                  className={`w-full text-xs p-1.5 rounded border ${theme === 'silver' ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-700 text-white'}`}
                >
                  <option value="digital-24">{t.digital24}</option>
                  <option value="digital-12">{t.digital12}</option>
                  <option value="analog">{t.analog}</option>
                </select>
              </div>

              {/* Lunar Toggle */}
              <div className="flex items-center justify-between pt-1">
                 <label className={`text-[10px] uppercase font-bold flex items-center gap-1 ${textClass}`}>
                    <Calendar size={10} /> {t.showLunar}
                 </label>
                 <input 
                   type="checkbox" 
                   checked={showLunarDate}
                   onChange={(e) => setShowLunarDate(e.target.checked)}
                   className="accent-indigo-500 w-3 h-3"
                 />
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl p-6 ${modalBg} border ${theme === 'silver' ? 'border-slate-200' : 'border-zinc-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${modalText}`}>
                <HelpCircle className="text-indigo-500" />
                {t.help}
              </h2>
              <button 
                onClick={() => setShowHelp(false)}
                className={`p-2 rounded-full hover:bg-gray-500/10 ${textClass}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {faqs.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-lg border transition-all hover:shadow-md ${theme === 'silver' ? 'bg-slate-50 border-slate-200 hover:border-indigo-200' : 'bg-zinc-950 border-zinc-800 hover:border-indigo-900'}`}>
                  <div className="flex justify-between items-start">
                     <h3 className={`font-semibold mb-2 ${theme === 'silver' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                      {item.q}
                    </h3>
                    {item.targetTab && (
                      <button 
                        onClick={() => handleHelpJump(item.targetTab)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full ${theme === 'silver' ? 'bg-white text-slate-500 hover:text-indigo-600 shadow-sm' : 'bg-zinc-900 text-zinc-500 hover:text-indigo-400'}`}
                        title={t.goToFeature}
                      >
                         <ExternalLink size={10} /> {t.goToFeature}
                      </button>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${theme === 'silver' ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-500/20 text-center">
              <p className={`text-xs ${textClass}`}>Version 2.1.0 - Build 20241026</p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${modalBg} border ${theme === 'silver' ? 'border-slate-200' : 'border-zinc-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${modalText}`}>
                <MessageSquare className="text-indigo-500" />
                {t.feedback}
              </h2>
              <button 
                onClick={() => setShowFeedback(false)}
                className={`p-2 rounded-full hover:bg-gray-500/10 ${textClass}`}
              >
                <X size={20} />
              </button>
            </div>
            
            {feedbackSent ? (
               <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                     <Send size={32} />
                  </div>
                  <p className={`text-lg font-medium ${modalText}`}>{t.feedbackSuccess}</p>
               </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  className={`w-full h-32 p-4 rounded-lg resize-none outline-none border ${theme === 'silver' ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500' : 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500'}`}
                  placeholder={t.feedbackPlaceholder}
                ></textarea>
                <button 
                  onClick={handleSendFeedback}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {t.sendFeedback}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
