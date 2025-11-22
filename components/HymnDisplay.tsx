
import React, { useState, useEffect } from 'react';
import { HymnData, HymnSection } from '../types';
import { Music, BookOpen, Clock, Activity, Settings, Plus, Minus, Save, Video, Heart } from 'lucide-react';
import { Button } from './Button';
import { transposeChordString, transposeNote } from '../utils/musicUtils';

interface HymnDisplayProps {
  data: HymnData;
  onSave: (hymn: HymnData) => void;
  onOpenVideo: (hymn: HymnData) => void;
  isSaved: boolean;
}

export const HymnDisplay: React.FC<HymnDisplayProps> = ({ data, onSave, onOpenVideo, isSaved }) => {
  // State for local modifications
  const [transposeSteps, setTransposeSteps] = useState(0);
  const [tempo, setTempo] = useState(data.suggestedTempo || 100);
  const [currentKey, setCurrentKey] = useState(data.keySignature);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (data.keySignature) {
      const newKey = transposeNote(data.keySignature, transposeSteps);
      setCurrentKey(newKey);
    }
  }, [transposeSteps, data.keySignature]);

  useEffect(() => {
      setTransposeSteps(0);
      setTempo(data.suggestedTempo || 100);
      setCurrentKey(data.keySignature);
  }, [data]);

  const renderLyrics = (text: string) => {
    const processedText = transposeSteps !== 0 
      ? transposeChordString(text, transposeSteps) 
      : text;
    
    const parts = processedText.split(/(\[.*?\])/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            return <span key={i} className="text-advent-gold font-bold text-sm align-text-top mr-1 opacity-90">{part.replace(/[\[\]]/g, '')}</span>;
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-advent-card rounded-xl shadow-2xl overflow-hidden border border-white/5 animate-fade-in relative">
      
      {/* Header */}
      <div className="p-8 text-center bg-gradient-to-b from-white/5 to-transparent relative">
        {data.number && (
            <div className="absolute top-6 left-6 bg-advent-gold text-advent-dark font-display font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                {data.number}
            </div>
        )}
        
        <div className="absolute top-6 right-6 flex gap-2">
            <button 
                onClick={() => onSave(data)}
                className={`p-2 rounded-full transition-all ${isSaved ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                title="Salvar na Biblioteca"
            >
                <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button 
                onClick={() => onOpenVideo(data)}
                className="p-2 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-advent-blue rounded-full transition-colors"
                title="Modo Vídeo"
            >
                <Video size={20} />
            </button>
            <button 
                onClick={() => setShowControls(!showControls)}
                className={`p-2 rounded-full transition-colors ${showControls ? 'bg-advent-blue text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                title="Ajustes"
            >
                <Settings size={20} />
            </button>
        </div>

        <h2 className="text-3xl md:text-5xl font-display font-bold text-advent-gold mb-3 mt-6 tracking-tight drop-shadow-lg">{data.title}</h2>
        <div className="flex items-center justify-center gap-2 text-slate-400 mb-8">
            <BookOpen size={14} />
            <span className="italic font-serif text-sm">{data.scriptureReference}</span>
        </div>

        {/* Controls */}
        {showControls && (
            <div className="mb-8 bg-black/20 border border-white/10 rounded-lg p-6 backdrop-blur-sm max-w-md mx-auto animate-fade-in">
                <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col items-center gap-3">
                        <span className="text-xs font-bold uppercase text-advent-gold tracking-widest">Transpor</span>
                        <div className="flex items-center gap-4 bg-black/30 rounded-full p-1 border border-white/5">
                            <button onClick={() => setTransposeSteps(s => s - 1)} className="p-2 hover:text-white text-slate-400 transition-colors"><Minus size={16}/></button>
                            <span className="font-bold text-xl text-white w-8 text-center font-display">{currentKey}</span>
                            <button onClick={() => setTransposeSteps(s => s + 1)} className="p-2 hover:text-white text-slate-400 transition-colors"><Plus size={16}/></button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <span className="text-xs font-bold uppercase text-advent-gold tracking-widest">BPM</span>
                        <div className="flex items-center gap-3 w-full">
                             <span className="text-xs text-slate-500">Lento</span>
                             <input 
                                type="range" 
                                min="60" 
                                max="160" 
                                value={tempo} 
                                onChange={(e) => setTempo(parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-advent-gold"
                             />
                             <span className="font-mono text-sm font-bold text-white">{tempo}</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {!showControls && (
            <div className="grid grid-cols-3 gap-2 text-sm border-y border-white/5 py-4 max-w-md mx-auto">
            <div className="flex flex-col items-center gap-1">
                <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500">Tom</span>
                <div className="flex items-center gap-2 font-bold text-slate-200">
                <Music size={14} className="text-advent-blue" />
                {currentKey}
                </div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500">Compasso</span>
                <div className="flex items-center gap-2 font-bold text-slate-200">
                <Clock size={14} className="text-advent-blue" />
                {data.timeSignature}
                </div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500">BPM</span>
                <div className="flex items-center gap-2 font-bold text-slate-200">
                <Activity size={14} className="text-advent-blue" />
                {tempo}
                </div>
            </div>
            </div>
        )}
      </div>

      {/* Lyrics */}
      <div className="p-8 md:p-12 bg-advent-card">
        <div className="max-w-2xl mx-auto space-y-10">
          {data.sections.map((section: HymnSection, idx: number) => (
            <div key={idx} className={`relative ${section.type.toLowerCase().match(/refrão|chorus|coro/) ? 'pl-6 border-l-2 border-advent-gold' : ''}`}>
              <span className="absolute -top-6 left-0 text-[10px] font-bold uppercase text-advent-blue tracking-widest">
                {section.type}
              </span>
              <p className="whitespace-pre-line text-xl md:text-2xl font-serif leading-loose text-slate-300">
                {renderLyrics(section.lyrics)}
              </p>
            </div>
          ))}
        </div>

        {data.chords && !data.number && (
          <div className="mt-16 p-6 bg-black/20 rounded-lg border border-advent-blue/20">
            <h4 className="text-xs font-bold text-advent-blue mb-2 uppercase tracking-widest">Harmonia Sugerida</h4>
            <p className="font-mono text-sm text-advent-gold opacity-80">{data.chords}</p>
          </div>
        )}
      </div>
    </div>
  );
};
