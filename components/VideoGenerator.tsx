
import React, { useEffect, useState, useRef } from 'react';
import { HymnData, VideoTheme, User, HymnSection } from '../types';
import { X, Play, Pause, Download, Youtube, Share2, Palette, Wand2, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface VideoGeneratorProps {
  hymn: HymnData;
  audioSrc: string | null;
  user: User;
  onClose: () => void;
}

interface SectionTiming {
    start: number;
    end: number;
    section: HymnSection;
    index: number;
}

const THEMES: Record<VideoTheme, { bgClass: string, accent: string, text: string, animation?: string }> = {
  NEBULA: {
    bgClass: 'bg-radial-gradient',
    accent: 'text-purple-400',
    text: 'font-serif',
    animation: 'animate-stars'
  },
  NATURE: {
    bgClass: 'bg-nature-gradient',
    accent: 'text-emerald-300',
    text: 'font-sans',
    animation: 'animate-clouds'
  },
  CROSS: {
    bgClass: 'bg-cross-gradient',
    accent: 'text-red-500',
    text: 'font-display',
    animation: 'animate-shine'
  },
  GOLD: {
    bgClass: 'bg-gold-gradient',
    accent: 'text-advent-gold',
    text: 'font-display',
    animation: 'animate-shimmer'
  },
  MINIMAL: {
    bgClass: 'bg-slate-900',
    accent: 'text-white',
    text: 'font-sans'
  }
};

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ hymn, audioSrc, user, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timings, setTimings] = useState<SectionTiming[]>([]);
  
  // Studio State
  const [activeTheme, setActiveTheme] = useState<VideoTheme>('NEBULA');
  const [renderStep, setRenderStep] = useState<'EDIT' | 'RENDERING' | 'DONE' | 'UPLOADING' | 'PUBLISHED'>('EDIT');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize Timings based on Character Count (Smart Sync)
  useEffect(() => {
      if (duration > 0) {
          const totalChars = hymn.sections.reduce((acc, s) => acc + s.lyrics.length, 0);
          let accumulatedTime = 0;
          const newTimings = hymn.sections.map((section, index) => {
              const weight = section.lyrics.length / totalChars;
              // Use 95% of duration for lyrics to leave a small tail
              const sectionDuration = weight * (duration * 0.95);
              const timing = {
                  start: accumulatedTime,
                  end: accumulatedTime + sectionDuration,
                  section,
                  index
              };
              accumulatedTime += sectionDuration;
              return timing;
          });
          setTimings(newTimings);
      }
  }, [duration, hymn]);

  useEffect(() => {
    if (isPlaying && duration > 0) {
      const interval = requestAnimationFrame(updatePlayback);
      return () => cancelAnimationFrame(interval);
    }
  }, [isPlaying, duration]);

  const updatePlayback = () => {
      if (audioRef.current) {
          const curr = audioRef.current.currentTime;
          setCurrentTime(curr);
          
          // Find active section based on Smart Sync timings
          const active = timings.find(t => curr >= t.start && curr < t.end);
          if (active) {
              setCurrentSectionIndex(active.index);
          } else if (curr >= (timings[timings.length-1]?.end || 0)) {
              // If past the end of calculated lyrics, stay on last one or show instrumental
              setCurrentSectionIndex(hymn.sections.length - 1);
          }

          if (isPlaying) requestAnimationFrame(updatePlayback);
      }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (!isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
        if (renderStep === 'EDIT') {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log(e));
        }
      }
    }
  };

  const handleRender = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setRenderStep('RENDERING');
    setProgress(0);

    // Simulate rendering process
    let p = 0;
    const interval = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setRenderStep('DONE');
      }
    }, 30);
  };

  const handleYouTubeUpload = () => {
    setRenderStep('UPLOADING');
    setTimeout(() => {
      setRenderStep('PUBLISHED');
    }, 2500);
  };

  const handleAIMagic = () => {
    const themes: VideoTheme[] = ['NATURE', 'CROSS', 'GOLD', 'NEBULA'];
    const random = themes[Math.floor(Math.random() * themes.length)];
    setActiveTheme(random);
  };

  const currentSection = hymn.sections[currentSectionIndex] || hymn.sections[0];
  const themeData = THEMES[activeTheme];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in font-sans overflow-hidden">
       <style>{`
        .bg-radial-gradient { background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%); }
        .bg-nature-gradient { background: linear-gradient(to bottom, #0f2027, #203a43, #2c5364); }
        .bg-cross-gradient { background: linear-gradient(to bottom, #232526, #414345); }
        .bg-gold-gradient { background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); }

        @keyframes moveStars {
            from { transform: translateY(0); }
            to { transform: translateY(-200px); }
        }
        .animate-stars::before {
            content: "";
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            box-shadow: 10px 10px white, 50px 50px white, 90px 20px white, 150px 80px white, 200px 10px white;
            border-radius: 50%;
            animation: moveStars 20s linear infinite;
        }

        @keyframes driftClouds {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-clouds {
            background: linear-gradient(to right, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
            background-size: 200% 200%;
            animation: driftClouds 15s ease infinite;
        }
        
        @keyframes shimmer {
             0% { opacity: 0.3; transform: scale(1); }
             50% { opacity: 0.6; transform: scale(1.1); }
             100% { opacity: 0.3; transform: scale(1); }
        }
        .animate-shimmer { animation: shimmer 5s infinite ease-in-out; }

        @keyframes shine {
             0% { background-position: -200%; }
             100% { background-position: 200%; }
        }
        .animate-shine { 
             background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
             background-size: 200% 100%;
             animation: shine 3s infinite linear;
        }
        
        .visualizer-bar {
             animation: bounce 0.5s infinite ease-in-out alternate;
        }
        @keyframes bounce {
             0% { height: 10%; }
             100% { height: 80%; }
        }
      `}</style>

      {/* RENDER OVERLAY */}
      {renderStep !== 'EDIT' && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8">
          {renderStep === 'RENDERING' && (
            <div className="w-full max-w-md text-center">
              <Loader2 size={48} className="animate-spin text-advent-gold mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2 font-display">Renderizando Vídeo...</h3>
              <p className="text-slate-400 mb-6">Compilando áudio e sincronizando legendas.</p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-advent-gold transition-all duration-75" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-xs font-mono mt-2 block text-right">{progress}%</span>
            </div>
          )}

          {renderStep === 'DONE' && (
            <div className="w-full max-w-lg bg-advent-card border border-white/10 p-8 rounded-2xl text-center animate-slide-up shadow-2xl">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2 font-display">Vídeo Pronto!</h3>
              <p className="text-slate-400 mb-8">Seu vídeo foi processado. Você pode publicá-lo agora.</p>
              
              <div className="grid gap-4">
                <button onClick={handleYouTubeUpload} className="flex items-center justify-center gap-3 w-full bg-[#FF0000] hover:bg-[#CC0000] text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-red-900/20">
                  <Youtube size={24} />
                  Publicar no YouTube
                </button>
                <button className="flex items-center justify-center gap-3 w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-lg font-medium transition-all">
                  <Download size={20} />
                  Baixar Arquivo MP4
                </button>
                <button onClick={() => setRenderStep('EDIT')} className="text-sm text-slate-500 hover:text-white mt-2 underline">
                  Voltar para edição
                </button>
              </div>
            </div>
          )}

          {renderStep === 'UPLOADING' && (
            <div className="w-full max-w-md text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
                <Youtube size={64} className="text-[#FF0000] relative z-10 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mt-6 mb-2">Conectando ao YouTube...</h3>
              <p className="text-slate-400 text-sm">Enviando: "{hymn.title} - Official Lyric Video.mp4"</p>
              <div className="mt-6 flex justify-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}

          {renderStep === 'PUBLISHED' && (
            <div className="w-full max-w-lg bg-advent-card border border-white/10 p-8 rounded-2xl text-center animate-slide-up">
               <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Share2 size={32} className="text-green-400" />
               </div>
               <h3 className="text-2xl font-bold mb-2 text-white">Publicado com Sucesso!</h3>
               <p className="text-slate-400 mb-6">Seu hino já está disponível no canal <strong>{user.name}</strong>.</p>
               
               <div className="bg-black/30 p-4 rounded-lg flex items-center justify-between border border-white/10 mb-8">
                 <span className="text-sm text-blue-400 truncate">https://youtube.com/watch?v=hino-{hymn.id.substring(0,4)}</span>
                 <Button variant="secondary" className="!py-1 !px-3 !text-xs">Copiar</Button>
               </div>

               <Button onClick={onClose} className="w-full">Fechar Estúdio</Button>
            </div>
          )}
        </div>
      )}

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-3">
           <div className="text-white/80 font-display tracking-widest text-sm border-r border-white/20 pr-4">
             ESTÚDIO DE CRIAÇÃO
           </div>
           <div className="flex items-center gap-2">
             <span className="text-xs text-slate-400">Tema:</span>
             <span className="text-xs font-bold text-advent-gold">{activeTheme}</span>
           </div>
        </div>
        <div className="flex gap-4">
            <button onClick={handleRender} className="bg-advent-gold hover:bg-yellow-500 text-black px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Youtube size={16} /> Gerar Vídeo Completo
            </button>
            <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <X size={20} className="text-white" />
            </button>
        </div>
      </div>

      {/* SIDEBAR CONTROLS */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
         <div className="group relative">
            <button className="w-12 h-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-advent-blue hover:border-advent-blue transition-all" title="Temas">
                <Palette size={20} />
            </button>
            <div className="absolute left-14 top-0 bg-black/90 border border-white/10 p-2 rounded-xl flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto min-w-[140px]">
                <span className="text-[10px] font-bold uppercase text-slate-500 px-2">Escolher Tema</span>
                {(Object.keys(THEMES) as VideoTheme[]).map(t => (
                    <button key={t} onClick={() => setActiveTheme(t)} className={`text-left px-3 py-2 rounded text-sm hover:bg-white/10 ${activeTheme === t ? 'text-advent-gold bg-white/5' : 'text-slate-300'}`}>
                        {t}
                    </button>
                ))}
            </div>
         </div>
         
         <button onClick={handleAIMagic} className="w-12 h-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-advent-gold hover:bg-advent-gold hover:text-black transition-all" title="IA Director">
            <Wand2 size={20} />
         </button>
      </div>

      {/* MAIN VIDEO PREVIEW */}
      <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${themeData.bgClass}`}>
        {/* Animated Background Layers */}
        <div className={`absolute inset-0 opacity-30 ${themeData.animation}`}></div>
        {activeTheme === 'NEBULA' && <div className="absolute inset-0 animate-stars opacity-50"></div>}
        {activeTheme === 'CROSS' && <div className="absolute inset-0 animate-shine opacity-20"></div>}
        
        {/* Visualizer Bars (Simulated) */}
        {isPlaying && (
             <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-1 items-end h-20 opacity-30">
                  {[...Array(20)].map((_, i) => (
                      <div 
                          key={i} 
                          className={`w-2 bg-white visualizer-bar`} 
                          style={{ 
                              animationDuration: `${0.2 + Math.random() * 0.4}s`,
                              height: `${20 + Math.random() * 80}%`
                          }} 
                      />
                  ))}
             </div>
        )}

        {activeTheme === 'CROSS' && (
             <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                 <svg width="600" height="600" viewBox="0 0 24 24" fill="currentColor" className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"><path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z"/></svg>
             </div>
        )}

        {/* Lyrics Content */}
        <div className="relative z-10 max-w-5xl px-8 text-center space-y-8 flex flex-col items-center min-h-[400px] justify-center">
            <div className="transition-opacity duration-500">
                 <h2 className={`text-xl md:text-3xl tracking-[0.2em] opacity-80 mb-8 font-display uppercase ${themeData.accent} drop-shadow-lg`}>
                    {hymn.title}
                 </h2>
            </div>
            
            <div key={currentSectionIndex} className="transition-all duration-700 transform animate-fade-in">
               <span className={`inline-block px-4 py-1 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 ${themeData.accent} bg-black/40 backdrop-blur-md`}>
                 {currentSection.type}
               </span>
               
               <p className={`text-3xl md:text-5xl lg:text-6xl leading-tight text-white drop-shadow-2xl whitespace-pre-line ${themeData.text} max-w-4xl mx-auto`}>
                 {currentSection.lyrics.replace(/\[.*?\]/g, '')}
               </p>
            </div>

            <div className="absolute bottom-40 text-center opacity-60">
               <div className="text-white/60 text-sm font-sans italic mb-1">{hymn.scriptureReference}</div>
            </div>
        </div>
        
        {/* Progress Line */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-white/10">
            <div 
              className={`h-full transition-all duration-200 ease-linear shadow-[0_0_15px_currentColor] ${themeData.accent.replace('text-', 'bg-')}`} 
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
        </div>
      </div>

      {/* PLAYBACK CONTROLS */}
      <div className="absolute bottom-10 flex gap-6 items-center z-20">
        <Button variant="secondary" onClick={togglePlay} className="rounded-full w-16 h-16 !p-0 flex items-center justify-center border-2 border-white/20 backdrop-blur-md bg-white/10 hover:bg-white/20 text-white shadow-2xl hover:scale-105 transition-transform">
           {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1"/>}
        </Button>
      </div>

      {/* AUDIO HIDDEN */}
      {audioSrc && (
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          crossOrigin="anonymous"
        />
      )}
    </div>
  );
};
