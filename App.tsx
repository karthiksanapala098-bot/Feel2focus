
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppStep, Mood, Goal, StudyPlan, StudySession, CompletedSession, UserProfile } from './types';
import { EXAM_GOALS } from './constants';
import { generateStudyPlan, generateDailyInsights } from './services/geminiService';
import Timer from './components/Timer';
import AIChatbot from './components/AIChatbot';
import Relaxation from './components/Relaxation';
import Stepper from './components/Stepper';
import BackButton from './components/BackButton';
import { 
  Clock, Zap, ChevronRight, Brain, Sparkles, 
  History, Trophy, TrendingUp, 
  Settings, Shield, Rocket, Activity, Binary, Menu, X, CheckSquare, Square
} from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LOGIN);
  const [history, setHistory] = useState<AppStep[]>([]);
  const [userGoal, setUserGoal] = useState<Goal | null>(null);
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTime, setAvailableTime] = useState(120);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const [sessionHistory, setSessionHistory] = useState<CompletedSession[]>([]);
  const [completedSessionIds, setCompletedSessionIds] = useState<Set<string>>(new Set());
  const [aiInsights, setAiInsights] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Operator_Alpha",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alpha&backgroundColor=064e3b&baseColor=bef264",
    level: 1,
    xp: 0
  });

  const navigateTo = useCallback((nextStep: AppStep) => {
    setHistory(prev => [...prev, step]);
    setStep(nextStep);
  }, [step]);

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevStep = newHistory.pop();
    setHistory(newHistory);
    if (prevStep !== undefined) {
      setStep(prevStep);
      if (prevStep === AppStep.DASHBOARD) {
        setActiveSession(null);
      }
    }
  }, [history]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      goBack();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [goBack]);

  const handleMoodSelect = async (mood: Mood) => {
    setCurrentMood(mood);
    setIsLoading(true);
    try {
      const plan = await generateStudyPlan(userGoal?.name || 'Neural Protocol', mood, availableTime);
      setStudyPlan(plan);
      navigateTo(AppStep.DASHBOARD);
    } catch (error) {
      console.error(error);
      setStudyPlan({
        title: "EMERGENCY_RECOVERY_PROTOCOL",
        motivation: "System link unstable. Reverting to baseline recovery path.",
        sessions: [
          { id: 'err1', topic: "Neural Recalibration", duration: 25, type: 'focus' },
          { id: 'err2', topic: "Bio-Sync Break", duration: 5, type: 'break' },
          { id: 'err3', topic: "Buffer Integration", duration: 15, type: 'revision' }
        ]
      });
      navigateTo(AppStep.DASHBOARD);
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = useCallback(async (session: StudySession, manual = false) => {
    if (completedSessionIds.has(session.id)) return;

    const completed: CompletedSession = { ...session, completedAt: new Date(), manualLog: manual };
    const newHistory = [completed, ...sessionHistory];
    
    setSessionHistory(newHistory);
    setCompletedSessionIds(prev => new Set(prev).add(session.id));

    const xpGain = session.duration * 10;
    setUserProfile(prev => ({ 
      ...prev, 
      xp: prev.xp + xpGain, 
      level: Math.floor((prev.xp + xpGain) / 1000) + 1 
    }));
    
    if (newHistory.length % 2 === 0) {
      const insights = await generateDailyInsights(newHistory, userGoal?.name || "");
      setAiInsights(insights);
    }
    
    if (!manual) {
      setActiveSession(null);
      setStep(AppStep.DASHBOARD);
      setHistory([]);
    }
  }, [sessionHistory, completedSessionIds, userGoal, userProfile]);

  const totalFocusedMinutes = sessionHistory.reduce((acc, s) => acc + s.duration, 0);
  const dailyProgress = Math.min(100, (totalFocusedMinutes / availableTime) * 100);

  return (
    <div className="min-h-screen text-slate-100 selection:bg-lime-500/30 overflow-x-hidden">
      
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isNavOpen ? 'h-screen glass' : 'h-20'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center border-b border-lime-500/10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo(AppStep.DASHBOARD)}>
              <div className="w-10 h-10 bg-black border border-lime-500/50 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all group-hover:scale-110">
                <Binary className="w-6 h-6 text-lime-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tighter mono highlight-text leading-none">FEEL2FOCUS</span>
                <span className="text-[7px] font-black mono text-lime-500/40 uppercase tracking-[0.4em]">Neural_OS_v4.2</span>
              </div>
            </div>
            
            <AnimatePresence>
              {step !== AppStep.LOGIN && history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hidden md:block"
                >
                  <BackButton onClick={goBack} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-6">
            {step !== AppStep.LOGIN && (
              <div className="hidden md:flex items-center gap-4 glass px-4 py-2 rounded-2xl border-lime-500/20">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-2.5 h-2.5 text-lime-400 animate-pulse" />
                    <span className="text-[9px] font-black text-lime-400 mono uppercase tracking-widest">Active</span>
                  </div>
                  <span className="text-xs font-black mono text-white">{userProfile.name}</span>
                </div>
                <img src={userProfile.avatar} className="w-9 h-9 rounded-xl border border-lime-500/40 bg-black p-0.5" />
              </div>
            )}
            <button 
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="w-10 h-10 flex items-center justify-center glass rounded-xl border-lime-500/20 hover:border-lime-500/50 transition-all"
            >
              {isNavOpen ? <X className="w-5 h-5 text-lime-400" /> : <Menu className="w-5 h-5 text-lime-400" />}
            </button>
          </div>
        </div>

        <div className={`flex flex-col items-center justify-center gap-8 h-[calc(100vh-80px)] transition-all duration-700 ${isNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          {[
            { label: 'Control Center', icon: Activity, action: () => { navigateTo(AppStep.DASHBOARD); setIsNavOpen(false); } },
            { label: 'Mission Select', icon: Rocket, action: () => { navigateTo(AppStep.GOAL_SELECTION); setIsNavOpen(false); } },
            { label: 'Neural Reset', icon: Brain, action: () => { navigateTo(AppStep.RELAXATION); setIsNavOpen(false); } },
            { label: 'System Config', icon: Settings, action: () => setIsNavOpen(false) }
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={item.action}
              className="group flex items-center gap-6 text-4xl font-black mono uppercase tracking-tighter text-white/40 hover:text-lime-400 transition-all hover:scale-105"
            >
              <item.icon className="w-10 h-10 transition-transform group-hover:rotate-12" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        
        {step !== AppStep.LOGIN && <Stepper currentStep={step} />}

        <AnimatePresence mode="wait">
          {step === AppStep.LOGIN && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20"
            >
              <div className="flex-1 space-y-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-5 py-2 glass rounded-full border-lime-500/30 text-lime-400 font-black text-[10px] uppercase tracking-[0.3em]">
                  <Shield className="w-4 h-4" /> Neural Uplink Pending
                </div>
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
                  DOMINATE <span className="highlight-text">FOCUS</span>
                </h1>
                <p className="text-xl text-white/50 font-medium leading-relaxed max-w-xl italic border-l-2 border-lime-500/20 pl-6">
                  A tactical interface for cognitive optimization. Synchronize your biology with smart learning protocols powered by Gemini Core.
                </p>
                <button 
                  onClick={() => navigateTo(AppStep.GOAL_SELECTION)} 
                  className="group relative px-12 py-7 bg-lime-500 text-black font-black text-2xl rounded-3xl shadow-[0_0_50px_rgba(163,230,53,0.5)] transition-all hover:scale-105 active:scale-95 overflow-hidden uppercase mono"
                >
                  <span className="relative z-10 flex items-center gap-3">INITIALIZE <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-lime-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
              <div className="flex-1 relative group">
                  <div className="w-[420px] h-[420px] glass rounded-[3.5rem] -rotate-6 border-lime-500/20 p-10 flex flex-col justify-between shadow-2xl relative z-10 overflow-hidden transition-all group-hover:rotate-0 duration-1000">
                      <div className="flex justify-between items-start">
                          <div className="w-14 h-14 bg-lime-500/10 rounded-2xl flex items-center justify-center border border-lime-500/20"><Rocket className="text-lime-500 w-7 h-7" /></div>
                          <div className="text-right"><span className="block text-3xl font-black mono text-lime-400">92%</span><span className="text-[10px] font-bold text-white/20 mono uppercase">Uptime</span></div>
                      </div>
                      <div className="space-y-4">
                          <div className="h-1.5 w-full bg-white/5 rounded-full"><div className="h-full w-4/5 bg-lime-500" /></div>
                          <div className="h-1.5 w-2/3 bg-white/5 rounded-full"><div className="h-full w-3/5 bg-emerald-500" /></div>
                      </div>
                      <div className="p-6 glass rounded-3xl border-lime-500/20 flex items-center gap-4 bg-black/40">
                          <div className="w-10 h-10 bg-lime-500/20 rounded-xl flex items-center justify-center text-lime-500"><Zap className="w-5 h-5 animate-pulse" /></div>
                          <div className="flex flex-col">
                            <p className="text-[9px] font-black text-lime-500 mono uppercase tracking-widest">Neural Link Operational</p>
                          </div>
                      </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-lime-500/10 blur-[120px] rounded-full" />
              </div>
            </motion.div>
          )}

          {step === AppStep.GOAL_SELECTION && (
            <motion.div 
              key="goals"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                 <h2 className="text-4xl font-black mono tracking-widest uppercase highlight-text">MISSION SELECT</h2>
                 <BackButton onClick={goBack} label="RETURN_TO_PORTAL" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {EXAM_GOALS.map((goal) => (
                  <button 
                    key={goal.id} 
                    onClick={() => { setUserGoal(goal); navigateTo(AppStep.MOOD_SELECTION); }}
                    className="group relative p-10 glass rounded-[3rem] border-lime-500/10 text-left transition-all hover:-translate-y-4 hover:bg-lime-500/5 hover:border-lime-500/30 overflow-hidden shadow-2xl swipe-card"
                  >
                    <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-20 transition-all duration-700 group-hover:scale-150">
                      <span className="text-[8rem]">{goal.icon}</span>
                    </div>
                    <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-4xl mb-6 border-lime-500/20 group-hover:scale-110 transition-transform bg-black/40">
                      {goal.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-2 mono highlight-text uppercase">{goal.name}</h3>
                    <p className="text-white/40 text-sm font-medium leading-relaxed italic h-10 overflow-hidden">{goal.description}</p>
                    <div className="mt-8 flex items-center gap-2 text-lime-400 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                      Initialize <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === AppStep.MOOD_SELECTION && (
            <motion.div 
              key="mood"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-4xl mx-auto text-center"
            >
              {isLoading ? (
                <div className="py-24 flex flex-col items-center gap-10">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-lime-500/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
                    <Binary className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lime-400 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mono highlight-text animate-pulse uppercase tracking-widest">SYNCING NEURAL LOADS</h3>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <BackButton onClick={goBack} label="REVISE_GOAL" />
                    <h2 className="text-4xl font-black mono uppercase tracking-widest highlight-text">CALIBRATE ENERGY</h2>
                    <div className="w-32 hidden md:block"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Object.values(Mood).map((mood) => (
                      <button 
                        key={mood} 
                        onClick={() => handleMoodSelect(mood)} 
                        className="relative group p-8 glass rounded-[2rem] border-lime-500/10 hover:border-lime-500/50 hover:bg-lime-500/5 transition-all text-left flex items-center gap-6 shadow-xl"
                      >
                        <div className="text-4xl group-hover:scale-125 transition-transform">{mood.split(' ')[0]}</div>
                        <div className="flex flex-col">
                          <span className="font-black text-xl mono text-white group-hover:text-lime-400 transition-colors uppercase">{mood.split(' ').slice(1).join(' ')}</span>
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-0.5">Ready for Sync</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-16 p-10 glass rounded-[3rem] border-lime-500/20 shadow-2xl relative">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-2">
                          <Clock className="text-lime-400 w-5 h-5" />
                          <span className="font-black mono text-base text-lime-400 uppercase tracking-widest">BUDGET (MIN)</span>
                      </div>
                      <span className="px-4 py-1.5 glass rounded-xl text-base font-black mono border-lime-500/30 text-white">{availableTime}</span>
                    </div>
                    <input 
                      type="range" min="15" max="480" step="15" 
                      value={availableTime} onChange={(e) => setAvailableTime(parseInt(e.target.value))} 
                      className="w-full h-2.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-lime-500 shadow-[0_0_10px_rgba(163,230,53,0.3)] mb-4" 
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === AppStep.DASHBOARD && studyPlan && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-3 space-y-10">
                  <div className="p-8 glass rounded-[2.5rem] border-lime-500/10 space-y-8 shadow-xl">
                      <div className="flex items-center gap-3">
                          <TrendingUp className="text-lime-400 w-5 h-5" />
                          <h3 className="font-black mono text-xs uppercase tracking-widest">METRICS</h3>
                      </div>
                      <div className="space-y-4">
                          <div className="flex justify-between text-[10px] font-black text-white/40 mono uppercase">
                              <span>Link Strength</span>
                              <span className="text-lime-400">{dailyProgress.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-lime-500" style={{ width: `${dailyProgress}%` }} />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 glass rounded-2xl text-center border-lime-500/5 bg-black/20">
                              <span className="block text-3xl font-black mono text-white">{totalFocusedMinutes}</span>
                              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Total Focus</span>
                          </div>
                      </div>
                  </div>
                  <div className="p-8 glass rounded-[2.5rem] border-lime-500/10 shadow-xl bg-black/20">
                    <div className="flex items-center gap-3 mb-6">
                      <History className="text-lime-400 w-5 h-5" />
                      <h3 className="font-black mono text-xs uppercase tracking-widest">MISSION LOGS</h3>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {sessionHistory.length === 0 ? (
                        <div className="text-center py-10 opacity-20 border-2 border-dashed border-white/5 rounded-2xl">
                          <p className="text-[9px] font-black mono uppercase">No Session Data</p>
                        </div>
                      ) : (
                        sessionHistory.map((s, i) => (
                          <div key={i} className="p-4 glass rounded-xl border-white/5 flex justify-between items-center group hover:bg-lime-500/5 transition-all">
                            <div className="space-y-0.5">
                              <p className="font-black text-xs mono truncate max-w-[100px] uppercase text-white">{s.topic}</p>
                              <p className="text-[9px] font-bold text-white/20 mono">
                                {s.manualLog ? 'Log Check: ' : 'Timer Done: '}
                                {s.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="text-lime-400 font-black mono text-[10px] bg-lime-500/10 px-2 py-0.5 rounded-full">+{s.duration}m</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-10">
                  <header className="flex flex-col gap-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-2">
                          <div className="px-3 py-1 glass rounded-full text-[9px] font-black text-lime-400 border-lime-500/30 mono uppercase tracking-widest bg-black/40">Mission: {userGoal?.name}</div>
                          <div className="px-3 py-1 glass rounded-full text-[9px] font-black text-emerald-400 border-emerald-500/30 mono uppercase tracking-widest bg-black/40">Vibe: {currentMood?.split(' ')[1]}</div>
                        </div>
                        <BackButton onClick={goBack} label="RE_SYNC_PROTOCOL" />
                      </div>
                      <h1 className="text-5xl font-black tracking-tighter mono uppercase highlight-text">{studyPlan.title}</h1>
                      <div className="relative p-5 glass rounded-2xl border-l-4 border-lime-500 bg-black/40">
                        <p className="text-white/60 text-lg italic font-medium leading-relaxed">"{studyPlan.motivation}"</p>
                      </div>
                  </header>

                  <div className="p-8 glass rounded-[3rem] border-lime-500/20 relative overflow-hidden shadow-2xl bg-black/30">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-lime-500 to-emerald-500" />
                      <div className="flex items-center justify-between mb-8">
                          <h3 className="text-2xl font-black mono tracking-widest uppercase highlight-text">PROTOCOL SEQUENCE</h3>
                      </div>
                      <div className="space-y-4">
                          {studyPlan.sessions.map((session, idx) => {
                          const isCompleted = completedSessionIds.has(session.id);
                          return (
                          <div 
                              key={session.id}
                              className="w-full group relative flex items-center justify-between p-6 glass rounded-[2rem] border-white/5 hover:border-lime-500/50 transition-all shadow-lg overflow-hidden"
                          >
                              <div className="flex items-center gap-6">
                                <button 
                                  onClick={() => completeSession(session, true)}
                                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-lime-500 border-lime-500 text-black' : 'border-lime-500/20 hover:border-lime-500/50 text-lime-400'}`}
                                >
                                  {isCompleted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 opacity-40" />}
                                </button>
                                <button 
                                    onClick={() => { setActiveSession(session); navigateTo(AppStep.TIMER); }}
                                    className="text-left group/btn"
                                >
                                    <h4 className={`font-black text-lg mono transition-colors uppercase tracking-wider ${isCompleted ? 'text-white/30 line-through' : 'group-hover/btn:text-lime-400 text-white'}`}>{session.topic}</h4>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-white/30 mono uppercase tracking-widest"><Clock className="w-3 h-3" /> {session.duration}m</span>
                                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase mono border ${
                                            session.type === 'focus' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                                            session.type === 'break' ? 'bg-lime-500/10 text-lime-400 border-lime-500/30' : 'bg-stone-500/10 text-stone-400 border-stone-500/30'
                                        }`}>{session.type}</span>
                                    </div>
                                </button>
                              </div>
                              {!isCompleted && (
                                <button onClick={() => { setActiveSession(session); navigateTo(AppStep.TIMER); }}>
                                  <ChevronRight className="w-6 h-6 text-lime-400 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                              )}
                          </div>
                          )})}
                      </div>
                  </div>

                  {aiInsights && (
                    <div className="p-8 glass rounded-[2.5rem] border-lime-400/20 bg-lime-400/5 flex gap-6 shadow-xl relative overflow-hidden group">
                      <div className="w-14 h-14 bg-lime-400/10 rounded-2xl flex items-center justify-center shrink-0 border border-lime-400/30 shadow-[0_0_15px_rgba(163,230,53,0.2)]">
                          <Sparkles className="w-6 h-6 text-lime-400 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-black text-[10px] text-lime-400 mono uppercase tracking-[0.3em] mb-1">NEURAL_STRATEGY</h4>
                        <p className="text-white/70 text-base font-medium leading-relaxed italic border-l-2 border-lime-500/40 pl-3">"{aiInsights}"</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-3 space-y-10">
                  <div className="p-8 glass rounded-[2.5rem] bg-emerald-600/10 border-emerald-500/20 shadow-xl relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:rotate-12 transition-all duration-700"><Trophy className="w-32 h-32 text-lime-400" /></div>
                    <div className="relative z-10">
                      <Trophy className="w-10 h-10 mb-5 text-lime-400 drop-shadow-[0_0_15px_rgba(163,230,53,0.4)]" />
                      <h3 className="text-2xl font-black mono leading-none mb-3 uppercase highlight-text">LEVEL_RANK</h3>
                      <div className="space-y-4">
                          <div className="flex justify-between text-[10px] font-black mono text-white/40 uppercase">
                              <span>XP</span>
                              <span className="text-lime-400">{userProfile.xp % 1000} / 1000</span>
                          </div>
                          <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-lime-500 shadow-[0_0_15px_rgba(163,230,53,0.6)] transition-all duration-700" style={{ width: `${(userProfile.xp % 1000) / 10}%` }} />
                          </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                      <button 
                        onClick={() => navigateTo(AppStep.RELAXATION)} 
                        className="w-full group p-8 glass rounded-[2.5rem] border-lime-500/10 hover:bg-lime-500/5 hover:border-lime-500/40 transition-all flex flex-col items-center gap-6 shadow-xl relative overflow-hidden"
                      >
                          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all border-lime-500/20 shadow-inner bg-black/40">
                              <Brain className="w-8 h-8 text-lime-400" />
                          </div>
                          <div className="text-center">
                              <span className="block font-black mono text-base uppercase tracking-widest highlight-text">NEURAL_RESET</span>
                              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">2-min cycle</span>
                          </div>
                      </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === AppStep.TIMER && activeSession && (
            <motion.div 
              key="timer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-4xl mx-auto py-12"
            >
              <div className="mb-8 flex justify-center">
                <BackButton onClick={goBack} label="ABORT_ACTIVE_LINK" className="scale-110" />
              </div>
              <Timer 
                title={activeSession.topic}
                initialMinutes={activeSession.duration}
                onComplete={() => completeSession(activeSession)}
              />
            </motion.div>
          )}

          {step === AppStep.RELAXATION && (
            <motion.div 
              key="relax"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
            >
              <Relaxation onBack={goBack} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {step !== AppStep.LOGIN && <AIChatbot />}
      
    </div>
  );
};

export default App;
