
import React, { useState, useRef, useEffect } from 'react';
import { generateHymnAudio, generateHymnLyrics, generateWorshipPlan } from './services/geminiService';
import { HYMN_DATABASE } from './services/hymnDatabase';
import { login, logout, getCurrentUser, saveHymnToLibrary, getUserHymns } from './services/authService';
import { Button } from './components/Button';
import { HymnDisplay } from './components/HymnDisplay';
import { VideoGenerator } from './components/VideoGenerator';
import { AppStatus, HymnData, PREDEFINED_THEMES, Tab, WorshipPlan, User } from './types';
import { Mic, Play, RotateCcw, Volume2, Search, Book, Sparkles, Calendar, ChevronRight, Music, AlertCircle, User as UserIcon, LogOut, Library, Heart, Cross } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>(Tab.HYMNAL);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  
  // Common State
  const [hymnData, setHymnData] = useState<HymnData | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Composer State
  const [themeInput, setThemeInput] = useState('');
  const [validationError, setValidationError] = useState('');

  // Hymnal/Library State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHymns, setFilteredHymns] = useState(HYMN_DATABASE);
  const [libraryHymns, setLibraryHymns] = useState<HymnData[]>([]);

  // Planner State
  const [planTheme, setPlanTheme] = useState('');
  const [planOccasion, setPlanOccasion] = useState('');
  const [worshipPlan, setWorshipPlan] = useState<WorshipPlan | null>(null);

  // --- Auth Initialization ---
  useEffect(() => {
    // This runs on mount to check for an existing session
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setLibraryHymns(getUserHymns(savedUser));
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const source = activeTab === Tab.LIBRARY ? libraryHymns : HYMN_DATABASE;
    
    const results = source.filter(h => 
      h.title.toLowerCase().includes(query) || 
      h.number?.toString().includes(query) ||
      h.sections.some(s => s.lyrics.toLowerCase().includes(query))
    );
    setFilteredHymns(results);
  }, [searchQuery, activeTab, libraryHymns]);

  useEffect(() => {
    if (audioSrc && audioRef.current && !showVideoGenerator) {
      audioRef.current.play().catch(e => console.log("Auto-play prevented:", e));
    }
    if (showVideoGenerator && audioRef.current) {
        audioRef.current.pause();
    }
  }, [audioSrc, showVideoGenerator]);

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    const u = login(usernameInput);
    setUser(u);
    setLibraryHymns(getUserHymns(u));
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    reset();
  };

  const handleSaveHymn = (hymn: HymnData) => {
    if (!user) return;
    const updatedUser = saveHymnToLibrary(user, hymn);
    setUser(updatedUser);
    setLibraryHymns(getUserHymns(updatedUser));
    // Visual feedback could be added here
  };

  const handleComposerSubmit = () => {
    if (!themeInput.trim()) {
      setValidationError('Por favor, descreva um tema para o hino.');
      return;
    }
    if (themeInput.trim().length < 5) {
      setValidationError('O tema é muito curto. Descreva com mais detalhes.');
      return;
    }
    setValidationError('');
    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!themeInput.trim()) return;
    
    setStatus(AppStatus.LOADING);
    setHymnData(null);
    setAudioSrc(null);
    
    try {
      const data = await generateHymnLyrics(themeInput);
      // Add creator info
      if (user) data.createdBy = user.id;
      
      setHymnData(data);
      setStatus(AppStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGeneratePlan = async () => {
    if (!planTheme.trim()) return;
    setStatus(AppStatus.LOADING);
    setWorshipPlan(null);
    
    try {
      const plan = await generateWorshipPlan(planTheme, planOccasion || "Culto Divino");
      setWorshipPlan(plan);
      setStatus(AppStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateAudio = async () => {
    if (!hymnData) return;
    
    setStatus(AppStatus.LOADING);
    try {
      // Now returns a playable Blob URL string
      const audioUrl = await generateHymnAudio(hymnData);
      setAudioSrc(audioUrl);
      setStatus(AppStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setHymnData(null);
    setAudioSrc(null);
    setThemeInput('');
    setValidationError('');
    setStatus(AppStatus.IDLE);
    setWorshipPlan(null);
    setShowVideoGenerator(false);
  };

  const selectHymn = (hymn: HymnData) => {
      setHymnData(hymn);
      setAudioSrc(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Render Methods ---

  if (!user) {
    return (
      <div className="min-h-screen bg-advent-dark flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        <div className="w-full max-w-md bg-advent-card border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-in">
           <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-advent-gold/10 rounded-full mb-6 border border-advent-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                <Cross size={40} className="text-advent-gold" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">Hinos Adventistas</h1>
              <p className="text-slate-400">Plataforma de louvor e composição.</p>
           </div>
           <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-300 mb-1">Seu Nome ou Usuário</label>
               <input 
                 type="text" 
                 value={usernameInput}
                 onChange={(e) => setUsernameInput(e.target.value)}
                 className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-advent-gold focus:ring-1 focus:ring-advent-gold outline-none transition-all"
                 placeholder="Ex: Adorador123"
               />
             </div>
             <Button className="w-full" type="submit">
               Entrar na Plataforma
             </Button>
           </form>
        </div>
      </div>
    );
  }

  const renderTabs = () => (
      <div className="flex justify-center gap-2 md:gap-4 mb-8 border-b border-white/10 pb-4 px-4 overflow-x-auto no-scrollbar">
          {[
            { t: Tab.HYMNAL, icon: Book, label: 'Hinário' },
            { t: Tab.LIBRARY, icon: Library, label: 'Minha Lista' },
            { t: Tab.PLANNER, icon: Calendar, label: 'Liturgia' },
            { t: Tab.COMPOSER, icon: Sparkles, label: 'Compositor IA' },
          ].map(item => (
             <button 
                key={item.t}
                onClick={() => { setActiveTab(item.t); reset(); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap font-display tracking-wide ${activeTab === item.t ? 'bg-advent-gold text-advent-dark shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
            >
                <item.icon size={16}/> {item.label}
            </button>
          ))}
      </div>
  );

  const renderList = (isEmptyMessage: string) => (
    <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-advent-card p-4 rounded-xl border border-white/10 mb-6 flex items-center gap-3 sticky top-24 z-40 shadow-xl">
            <Search className="text-slate-500" size={20} />
            <input 
                type="text"
                placeholder="Buscar por número, título ou letra..."
                className="flex-grow bg-transparent outline-none text-slate-200 placeholder-slate-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <div className="space-y-3">
            {filteredHymns.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-lg">
                   {isEmptyMessage}
                </div>
            ) : (
                filteredHymns.map(hymn => (
                    <div 
                        key={hymn.id} 
                        onClick={() => selectHymn(hymn)}
                        className="bg-advent-card p-4 rounded-lg border border-white/5 hover:border-advent-blue/50 hover:bg-white/5 transition-all cursor-pointer flex justify-between items-center group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-advent-gold bg-advent-gold/10 w-10 h-10 flex items-center justify-center rounded-full text-sm font-display">
                                {hymn.number || <Sparkles size={14}/>}
                            </span>
                            <div>
                                <h3 className="font-serif font-bold text-slate-200 group-hover:text-advent-blue transition-colors">{hymn.title}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-2">
                                  <span className="flex items-center gap-1"><Music size={10}/> {hymn.keySignature}</span>
                                  {activeTab === Tab.LIBRARY && <span className="text-advent-gold/60">• Salvo</span>}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-600 group-hover:text-advent-blue" size={20} />
                    </div>
                ))
            )}
        </div>
    </div>
  );

  const renderPlanner = () => (
    <div className="max-w-2xl mx-auto animate-fade-in">
        {!worshipPlan ? (
            <div className="bg-advent-card p-8 rounded-2xl border border-white/10 shadow-xl">
                <h2 className="text-2xl font-display font-bold text-advent-gold mb-6 flex items-center gap-2">
                    <Calendar className="text-advent-blue"/> Planejador de Culto
                </h2>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Tema do Culto</label>
                        <input 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-advent-gold focus:ring-1 focus:ring-advent-gold outline-none transition-all"
                            placeholder="Ex: Gratidão pela Colheita"
                            value={planTheme}
                            onChange={(e) => setPlanTheme(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Ocasião (Opcional)</label>
                        <input 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-advent-gold focus:ring-1 focus:ring-advent-gold outline-none transition-all"
                            placeholder="Ex: Santa Ceia, Culto Jovem"
                            value={planOccasion}
                            onChange={(e) => setPlanOccasion(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleGeneratePlan} disabled={!planTheme} isLoading={status === AppStatus.LOADING} className="w-full mt-4">
                        Gerar Sugestões
                    </Button>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="bg-advent-blue/10 border border-advent-blue/20 p-6 rounded-xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-advent-blue text-lg font-display">{worshipPlan.theme}</h3>
                        <p className="text-sm text-slate-400">Sugestão de liturgia</p>
                    </div>
                    <Button variant="secondary" onClick={reset} className="!px-4 !py-2 text-xs uppercase tracking-widest">Novo</Button>
                </div>
                
                <div className="space-y-4">
                    {worshipPlan.items.map((item, idx) => (
                        <div key={idx} className="bg-advent-card p-6 rounded-xl border-l-4 border-advent-gold hover:bg-white/5 transition-colors">
                            <span className="text-[10px] font-bold uppercase text-advent-blue tracking-widest">{item.moment}</span>
                            <h4 className="text-xl font-serif font-bold text-slate-200 mt-2">{item.suggestion}</h4>
                            <p className="text-sm text-slate-500 mt-3 italic border-t border-white/5 pt-3">"{item.reasoning}"</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  const renderComposer = () => {
      if (hymnData) return null;
      return (
        <div className="max-w-2xl mx-auto text-center animate-fade-in mt-8 relative">
          {status === AppStatus.LOADING && (
             <div className="absolute inset-0 bg-advent-dark/90 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-2xl animate-fade-in border border-white/10">
                <div className="animate-spin text-advent-gold mb-6">
                  <Sparkles size={48} />
                </div>
                <p className="text-white font-display text-xl font-bold animate-pulse">Compondo obra...</p>
                <p className="text-slate-500 text-sm mt-2">Buscando inspiração divina</p>
             </div>
          )}

          <div className={`transition-all duration-300 ${status === AppStatus.LOADING ? 'blur-sm opacity-50' : ''}`}>
            <div className="mb-8">
                <div className="inline-block p-4 bg-advent-gold/10 rounded-full mb-4 text-advent-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    <Sparkles size={32} />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
                Compositor Sacro
                </h2>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                Descreva um tema bíblico ou sentimento espiritual, e nossa IA criará um hino exclusivo para seu louvor.
                </p>
            </div>

            <div className="bg-advent-card p-8 rounded-2xl shadow-2xl border border-white/10 mb-10 text-left relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-advent-gold/10 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>

                <label className="block text-xs font-bold text-advent-gold uppercase tracking-widest mb-3 ml-1">Tema do Hino</label>
                <div className={`relative transition-all duration-200 ${validationError ? 'animate-shake' : ''}`}>
                    <textarea
                        value={themeInput}
                        onChange={(e) => {
                            setThemeInput(e.target.value);
                            if (validationError) setValidationError('');
                        }}
                        placeholder="Ex: A esperança da segunda vinda em meio às provações..."
                        className={`w-full px-5 py-5 rounded-xl text-lg outline-none transition-all resize-none border bg-black/20 text-white placeholder-slate-600 focus:bg-black/40 ${validationError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-advent-gold focus:shadow-[0_0_15px_rgba(212,175,55,0.1)]'}`}
                        rows={3}
                        disabled={status === AppStatus.LOADING}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleComposerSubmit();
                            }
                        }}
                    />
                    <div className="flex justify-between items-center mt-3 px-1 h-5">
                         <span className={`text-xs font-medium transition-colors ${themeInput.length > 0 && themeInput.length < 5 ? 'text-orange-400' : themeInput.length >= 5 ? 'text-green-500' : 'text-slate-600'}`}>
                            {themeInput.length} caracteres
                         </span>
                         {validationError && (
                            <span className="text-xs font-bold text-red-400 flex items-center gap-1 animate-fade-in">
                                <AlertCircle size={12} /> {validationError}
                            </span>
                         )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        onClick={handleComposerSubmit}
                        disabled={status === AppStatus.LOADING}
                        className="w-full md:w-auto py-4 px-10 text-lg shadow-xl shadow-blue-900/20"
                    >
                        <Sparkles size={18} /> Criar Hino
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 justify-center text-slate-600 mb-2">
                    <div className="h-px w-12 bg-white/10"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sugestões</span>
                    <div className="h-px w-12 bg-white/10"></div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {PREDEFINED_THEMES.map((theme) => (
                    <button
                        key={theme.label}
                        onClick={() => {
                            setThemeInput(theme.value);
                            setValidationError('');
                        }}
                        disabled={status === AppStatus.LOADING}
                        className="px-4 py-2 bg-white/5 border border-white/5 hover:border-advent-gold hover:text-advent-gold hover:bg-white/10 rounded-full text-xs font-bold uppercase tracking-wide transition-all text-slate-400 shadow-lg"
                    >
                        {theme.label}
                    </button>
                    ))}
                </div>
            </div>
          </div>
      </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans pb-20 bg-advent-dark text-advent-text">
      {/* Video Generator Overlay */}
      {showVideoGenerator && hymnData && user && (
        <VideoGenerator 
            hymn={hymnData} 
            audioSrc={audioSrc} 
            user={user}
            onClose={() => setShowVideoGenerator(false)} 
        />
      )}

      {/* Header */}
      <header className="bg-advent-dark/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {reset(); setActiveTab(Tab.HYMNAL);}}>
             <div className="bg-gradient-to-br from-advent-gold to-yellow-600 p-2 rounded-lg shadow-lg group-hover:brightness-110 transition-all">
                <Cross size={24} className="text-advent-dark" strokeWidth={2.5} />
             </div>
            <div>
              <h1 className="text-lg font-display font-bold tracking-tight leading-tight text-white">Hinos Adventistas</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
              {hymnData && (
                <Button variant="secondary" onClick={reset} className="!px-3 !py-1.5 text-xs hidden md:flex">
                  <RotateCcw size={14} /> Voltar
                </Button>
              )}
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                 <span className="text-xs font-bold text-advent-gold hidden sm:block">{user.name}</span>
                 <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors" title="Sair">
                    <LogOut size={18} />
                 </button>
              </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 relative z-0">
        {/* Main Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-[-1]"></div>
        
        {!hymnData && renderTabs()}

        {/* Content Switching */}
        
        {status === AppStatus.ERROR && !hymnData && (
          <div className="max-w-md mx-auto mb-8 p-6 bg-red-900/20 border border-red-500/20 rounded-lg text-center animate-fade-in">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h3 className="font-bold text-lg mb-2 text-red-200">Erro na Conexão</h3>
            <p className="text-sm mb-4 text-red-300">Não foi possível processar a solicitação. Tente novamente.</p>
            <Button variant="outline" onClick={() => setStatus(AppStatus.IDLE)} className="mx-auto border-red-500/30 text-red-300 hover:bg-red-900/30">
              Reiniciar
            </Button>
          </div>
        )}

        {activeTab === Tab.HYMNAL && renderList('Nenhum hino encontrado no hinário.')}
        {activeTab === Tab.LIBRARY && renderList('Você ainda não salvou nenhum hino.')}
        {activeTab === Tab.PLANNER && renderPlanner()}
        {activeTab === Tab.COMPOSER && renderComposer()}

        {/* HYMN DISPLAY */}
        {hymnData && (
          <div className="animate-slide-up space-y-8 pb-12">
            <HymnDisplay 
                data={hymnData} 
                onSave={handleSaveHymn} 
                onOpenVideo={() => setShowVideoGenerator(true)}
                isSaved={user.savedHymnIds.includes(hymnData.id)}
            />
            
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
              {!audioSrc ? (
                <Button 
                  onClick={handleGenerateAudio} 
                  isLoading={status === AppStatus.LOADING}
                  className="w-full md:w-auto shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  <Mic size={20} /> Gerar Áudio e Voz (IA)
                </Button>
              ) : (
                <div className="bg-advent-card border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-md animate-fade-in">
                   <div className="flex items-center gap-2 mb-4 text-advent-gold text-sm font-bold tracking-widest">
                     <Volume2 size={16} />
                     <span>REPRODUÇÃO DE ÁUDIO</span>
                   </div>
                   <audio 
                     ref={audioRef} 
                     controls 
                     src={audioSrc} 
                     className="w-full h-10 accent-advent-gold"
                   />
                   <button 
                     onClick={() => setShowVideoGenerator(true)}
                     className="mt-4 text-xs text-slate-400 hover:text-white underline underline-offset-4"
                   >
                     Abrir Visualização em Vídeo
                   </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
