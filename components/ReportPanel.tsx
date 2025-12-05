
import React, { useState } from 'react';
import { CardState, LogReport, Theme, Language } from '../types';
import { generateSmartLog } from '../services/ditService';
import { FileWarning, Download, Loader2, Sparkles, AlertTriangle, Upload, FileText, Save, CheckCircle, Folder } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';

interface ReportPanelProps {
  cards: CardState[];
  theme: Theme;
  language: Language;
}

const ReportPanel: React.FC<ReportPanelProps> = ({ cards, theme, language }) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0].id);
  const [inputMode, setInputMode] = useState<'text' | 'upload'>('text');
  
  // Inputs
  const [scriptNotes, setScriptNotes] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customPath, setCustomPath] = useState<string>("");

  const [report, setReport] = useState<LogReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedToDisk, setSavedToDisk] = useState(false);

  const t = TRANSLATIONS[language];
  const isSilver = theme === 'silver';

  const selectedCard = cards.find(c => c.id === selectedCardId);

  const containerBg = isSilver ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800';
  const textColor = isSilver ? 'text-slate-900' : 'text-white';
  const subText = isSilver ? 'text-slate-500' : 'text-zinc-400';
  const inputBg = isSilver ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCard) return;
    setLoading(true);
    setSavedToDisk(false);
    try {
      const data = await generateSmartLog(selectedCard.clips, selectedCard.label, scriptNotes, uploadedImage || undefined);
      // Ensure date is present, default to today if AI returns something weird or null
      if (!data.date || data.date === "undefined") {
        data.date = new Date().toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });
      }
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLog = () => {
    // Simulate saving logic
    setSavedToDisk(true);
    setTimeout(() => setSavedToDisk(false), 3000);
  };

  return (
    <div className={`h-full flex flex-col md:flex-row gap-6 p-6 ${language === 'ar' ? 'rtl' : ''}`}>
      
      {/* Input Section */}
      <div className="w-full md:w-5/12 space-y-6 flex flex-col h-full overflow-hidden">
        <div className={`${containerBg} p-6 rounded-xl border flex flex-col h-full`}>
          <h3 className={`${textColor} font-semibold mb-4 flex items-center gap-2`}>
            <Sparkles size={18} className="text-yellow-500" />
            {t.logGenTitle}
          </h3>
          
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <div>
              <label className={`block text-xs mb-1 ${subText}`}>{t.selectSource}</label>
              <select 
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className={`w-full rounded-lg p-2.5 outline-none border ${inputBg}`}
              >
                {cards.map(c => (
                  <option key={c.id} value={c.id}>{c.label} ({c.clips.length} Clips)</option>
                ))}
              </select>
            </div>

            {/* Custom Log Path */}
            <div>
              <label className={`block text-xs mb-1 ${subText} flex items-center gap-1`}>
                 <Folder size={10} /> {t.customLogPath}
              </label>
              <input 
                type="text" 
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder={t.pathPlaceholder}
                className={`w-full rounded-lg p-2.5 text-xs outline-none border ${inputBg}`}
              />
            </div>

            {/* Input Mode Toggle */}
            <div>
              <label className={`block text-xs mb-2 ${subText}`}>{t.inputType}</label>
              <div className={`flex rounded-lg border overflow-hidden ${isSilver ? 'border-slate-200' : 'border-zinc-700'}`}>
                <button 
                  onClick={() => setInputMode('text')}
                  className={`flex-1 py-2 text-xs font-medium flex justify-center items-center gap-1 ${inputMode === 'text' ? 'bg-indigo-600 text-white' : `${isSilver ? 'bg-slate-50 text-slate-600' : 'bg-zinc-800 text-zinc-400'}`}`}
                >
                  <FileText size={12} /> {t.textInput}
                </button>
                <button 
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 py-2 text-xs font-medium flex justify-center items-center gap-1 border-x ${isSilver ? 'border-slate-200' : 'border-zinc-700'} ${inputMode === 'upload' ? 'bg-indigo-600 text-white' : `${isSilver ? 'bg-slate-50 text-slate-600' : 'bg-zinc-800 text-zinc-400'}`}`}
                >
                  <Upload size={12} /> {t.fileUpload}
                </button>
              </div>
            </div>

            {/* Dynamic Input Area */}
            <div className="flex-1 overflow-y-auto min-h-0 border rounded-lg relative">
              
              {inputMode === 'text' && (
                <textarea
                  value={scriptNotes}
                  onChange={(e) => setScriptNotes(e.target.value)}
                  placeholder={t.textInput}
                  className={`w-full h-full p-3 text-sm outline-none resize-none ${inputBg} border-0`}
                />
              )}

              {inputMode === 'upload' && (
                <div className={`w-full h-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${uploadedImage ? 'border-indigo-500 bg-indigo-500/10' : `${isSilver ? 'border-slate-300 bg-slate-50' : 'border-zinc-700 bg-zinc-900'}`}`}>
                  <input 
                    type="file" 
                    accept="image/*,.pdf,.doc,.docx" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadedImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                       <img src={uploadedImage} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium">Click to change</div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 pointer-events-none">
                      <Upload className={`mx-auto ${subText}`} size={32} />
                      <p className={`text-sm ${subText}`}>{t.uploadPlaceholder}</p>
                      <p className="text-xs text-indigo-500">Supports JPG, PNG (OCR enabled)</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {loading ? t.analyzing : t.generateLog}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className={`flex-1 rounded-xl border p-8 overflow-y-auto ${containerBg}`}>
        {!report ? (
          <div className={`h-full flex flex-col items-center justify-center opacity-50 space-y-4 ${subText}`}>
            <FileWarning size={48} />
            <p>No report generated yet.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className={`flex justify-between items-start border-b pb-6 ${isSilver ? 'border-slate-200' : 'border-zinc-800'}`}>
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${textColor}`}>Daily Production Report</h1>
                <p className={subText}>Date: {report.date}</p>
                <div className="flex gap-2 mt-2">
                   <span className="text-xs bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded border border-indigo-500/20">{selectedCard?.destinationPath}</span>
                   {customPath && <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20">Custom: {customPath}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-mono text-indigo-500">{report.cameraModel}</div>
                <div className={`text-sm ${subText}`}>{report.formats}</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Clips', val: report.totalClips },
                { label: 'Data Volume', val: report.totalSize },
                { label: 'First Clip', val: report.firstClip },
                { label: 'Last Clip', val: report.lastClip }
              ].map((stat, i) => (
                <div key={i} className={`p-4 rounded-lg border ${isSilver ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                   <div className={`text-xs uppercase ${subText}`}>{stat.label}</div>
                   <div className={`text-lg font-semibold truncate ${textColor}`}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* Missing Clips Warning */}
            {report.missingClips && report.missingClips.length > 0 ? (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-start gap-4">
                <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="text-red-500 font-semibold mb-1">{t.missingClips}</h4>
                  <ul className="list-disc list-inside text-red-400 text-sm font-mono">
                    {report.missingClips.map((clip, i) => <li key={i}>{clip}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
               <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 <span className="text-green-500 text-sm">{t.continuityVerified}</span>
               </div>
            )}

            {/* Analysis Text */}
            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-medium uppercase tracking-wider mb-2 ${subText}`}>{t.technicalSummary}</h4>
                <p className={`text-sm leading-relaxed p-4 rounded-lg border ${isSilver ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                  {report.notes}
                </p>
              </div>
              
              {report.scriptMatch && (
                <div>
                  <h4 className={`text-sm font-medium uppercase tracking-wider mb-2 ${subText}`}>Script Sync Analysis</h4>
                  <p className={`text-sm leading-relaxed p-4 rounded-lg border ${isSilver ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                    {report.scriptMatch}
                  </p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex justify-end pt-4 gap-3">
              {savedToDisk ? (
                 <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20 animate-in fade-in">
                    <CheckCircle size={16} />
                    {t.logSaved}
                 </div>
              ) : (
                 <button 
                  onClick={handleSaveLog}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isSilver ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                 >
                   <Save size={16} />
                   {t.saveLog}
                 </button>
              )}
              
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isSilver ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}>
                <Download size={16} />
                Export PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPanel;
