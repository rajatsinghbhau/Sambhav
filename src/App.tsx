import { useState, useEffect } from 'react';
import { WATER_CYCLE_GRAPH } from './data/canonicalGraph';
import { evaluateEvidence } from './engine/evidenceEngine';
import { ConceptGraph, GraphEvidenceEvaluation } from './types/conceptGraph';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { ConceptGraphScreen } from './components/screens/ConceptGraphScreen';
import { CommunicationBoardScreen } from './components/screens/CommunicationBoardScreen';
import { ConfirmBeforeSpeakScreen } from './components/screens/ConfirmBeforeSpeakScreen';
import { TeachBackScreen } from './components/screens/TeachBackScreen';
import { EvidenceDashboardScreen } from './components/screens/EvidenceDashboardScreen';
import { PrepareLessonModal } from './components/PrepareLessonModal';
import { LimitationsPanel } from './components/LimitationsPanel';
import { offlineStorage, registerServiceWorker } from './utils/offlinePersistence';
import { UserCheck, PlusCircle, Star } from 'lucide-react';
import { sounds } from './utils/soundEffects';

export type ScreenTab =
  | 'home'
  | 'graph'
  | 'communication'
  | 'confirm_speak'
  | 'teach_back'
  | 'evidence';

export function App() {
  const [graph, setGraph] = useState<ConceptGraph>(WATER_CYCLE_GRAPH);
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [language, setLanguage] = useState<'EN' | 'KN'>('EN');
  const [childChain, setChildChain] = useState<string[]>([]);
  const [activePhrase, setActivePhrase] = useState<string>('The water vapour rises and cools.');
  const [speechAvailable, setSpeechAvailable] = useState<boolean>(true);

  const [beforeEvidence, setBeforeEvidence] = useState<GraphEvidenceEvaluation | null>(null);
  const [afterEvidence, setAfterEvidence] = useState<GraphEvidenceEvaluation | null>(null);

  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [isPrepareLessonOpen, setIsPrepareLessonOpen] = useState<boolean>(false);

  // SECTION 1: Offline Rehydration ("Generate Online. Run Offline.")
  useEffect(() => {
    // 1. Rehydrate language preference
    const savedLang = offlineStorage.loadLanguage();
    if (savedLang) {
      setLanguage(savedLang);
    }

    // 2. Rehydrate cached approved graph
    const cachedGraph = offlineStorage.loadApprovedGraph();
    if (cachedGraph && cachedGraph.nodes && cachedGraph.nodes.length >= 5) {
      setGraph(cachedGraph);
    }

    // 3. Rehydrate cached evidence & chain
    const cachedState = offlineStorage.loadEvidenceState();
    if (cachedState.childChain && cachedState.childChain.length > 0) {
      setChildChain(cachedState.childChain);
    }
    if (cachedState.beforeEvidence) {
      setBeforeEvidence(cachedState.beforeEvidence);
    }
    if (cachedState.afterEvidence) {
      setAfterEvidence(cachedState.afterEvidence);
    }

    // 4. Non-blocking Service Worker registration (does not block browser app if offline or unsupported)
    registerServiceWorker();
  }, []);

  const handleLanguageToggle = (lang: 'EN' | 'KN') => {
    sounds.playPop();
    setLanguage(lang);
    offlineStorage.saveLanguage(lang);
  };

  const handleStartLearning = () => {
    sounds.playPop();
    setCurrentTab('graph');
  };

  // SECTION 7 & 9: Real Deterministic One-Click Demo Mode
  const handleWatchDemo = () => {
    sounds.playSuccessChime();
    // Scripted Attempt 1: Condensation early (weak concept)
    const attempt1Chain = ['condensation', 'sun', 'heat', 'water', 'evaporation', 'vapour'];
    setChildChain(attempt1Chain);
    // Real deterministic calculation
    const ev1 = evaluateEvidence(graph, attempt1Chain);
    setBeforeEvidence(ev1);

    // Scripted Attempt 2: Correct sequence after reinforcement
    const attempt2Chain = ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation'];
    // Real deterministic calculation
    const ev2 = evaluateEvidence(graph, attempt2Chain);
    setAfterEvidence(ev2);

    // Cache offline
    offlineStorage.saveApprovedGraph(graph);
    offlineStorage.saveEvidenceState(attempt2Chain, ev1, ev2);

    setCurrentTab('evidence');
  };

  const handleConfirmSpeakDirect = () => {
    sounds.playSuccessChime();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(activePhrase);
        utterance.rate = 0.9;
        if (language === 'KN') {
          utterance.lang = 'kn-IN';
        }
        utterance.onerror = () => {
          // Gracefully continue without crashing
          setSpeechAvailable(false);
        };
        window.speechSynthesis.speak(utterance);
        setSpeechAvailable(true);
      } catch {
        setSpeechAvailable(false);
      }
    } else {
      setSpeechAvailable(false);
    }
    setTimeout(() => {
      setCurrentTab('communication');
    }, 1200);
  };

  const handleSeedAttempt1 = () => {
    sounds.playPop();
    const chain = ['condensation', 'sun', 'heat', 'water', 'evaporation', 'vapour'];
    setChildChain(chain);
    const ev = evaluateEvidence(graph, chain);
    setBeforeEvidence(ev);
    offlineStorage.saveEvidenceState(chain, ev, afterEvidence);
  };

  const handleSeedAttempt2 = () => {
    sounds.playPop();
    const chain = ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation'];
    setChildChain(chain);
    const ev = evaluateEvidence(graph, chain);
    setAfterEvidence(ev);
    offlineStorage.saveEvidenceState(chain, beforeEvidence, ev);
  };

  const handleCheckChain = () => {
    sounds.playSuccessChime();
    const ev = evaluateEvidence(graph, childChain);
    if (!beforeEvidence) {
      setBeforeEvidence(ev);
      offlineStorage.saveEvidenceState(childChain, ev, null);
    } else {
      setAfterEvidence(ev);
      offlineStorage.saveEvidenceState(childChain, beforeEvidence, ev);
    }
    setCurrentTab('evidence');
  };

  const handleApproveNewGraph = (newGraph: ConceptGraph) => {
    setGraph(newGraph);
    setChildChain([]);
    setBeforeEvidence(null);
    setAfterEvidence(null);
    offlineStorage.saveApprovedGraph(newGraph);
    offlineStorage.saveEvidenceState([], null, null);
    setCurrentTab('graph');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* HEADER */}
      <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 text-xl font-bold">
              💧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  SAMBHAV 2.0
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Stage 3B Hardened
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Concept-Graph Inclusive Classroom
              </p>
            </div>
          </div>

          {/* Child Profile Status Badge (Fictional student Ananya) */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" aria-hidden="true">👧</span>
              <div>
                <div className="text-xs font-black text-slate-900">Student: Ananya</div>
                <div className="flex items-center gap-0.5 text-amber-500 text-[10px]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-indigo-600 font-extrabold ml-1.5">Water Cycle Unit</span>
                </div>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Trust Principle</span>
              <span className="text-xs font-bold text-slate-700">AI suggests. Teacher approves. Child confirms.</span>
            </div>
          </div>

          {/* Controls: Language Toggle (EN | ಕನ್ನಡ) & Teacher Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SECTION 2: EN | ಕನ್ನಡ Language Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/90" role="group" aria-label="Language selection">
              <button
                type="button"
                onClick={() => handleLanguageToggle('EN')}
                aria-label="Switch to English"
                aria-pressed={language === 'EN'}
                className={`min-h-[48px] px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  language === 'EN'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageToggle('KN')}
                aria-label="Switch to Kannada"
                aria-pressed={language === 'KN'}
                className={`min-h-[48px] px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  language === 'KN'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            <button
              onClick={() => setIsPrepareLessonOpen(true)}
              type="button"
              aria-label="Prepare Today's Lesson with AI Concept Graph"
              className="min-h-[48px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">Prepare Today's Lesson</span>
              <span className="sm:hidden">Prepare</span>
            </button>

            <button
              onClick={() => setIsTeacherMode(!isTeacherMode)}
              type="button"
              aria-label="Toggle Teacher Mode"
              aria-pressed={isTeacherMode}
              className={`min-h-[48px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 shadow-2xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isTeacherMode
                  ? 'bg-amber-400 text-amber-950 border-amber-300 font-black'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{isTeacherMode ? 'Teacher Mode: ON' : 'Teacher Mode'}</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS (min 48px touch targets, accessible focus) */}
        <div className="w-full bg-slate-100/70 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none py-2">
            <div className="flex items-center gap-2 min-w-max">
              {[
                { id: 'home', label: '1. Welcome & Flow', emoji: '🌟' },
                { id: 'graph', label: '2. Concept Graph', emoji: '🗺️' },
                { id: 'communication', label: '3. Communication Board', emoji: '💬' },
                { id: 'confirm_speak', label: '4. Confirm-Before-Speak', emoji: '🔊' },
                { id: 'teach_back', label: '5. Teach-Back Chain', emoji: '🧩' },
                { id: 'evidence', label: '6. Evidence & Recap', emoji: '📊' },
              ].map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sounds.playPop();
                      setCurrentTab(tab.id as ScreenTab);
                    }}
                    type="button"
                    aria-label={tab.label}
                    aria-selected={isActive}
                    className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-200'
                        : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {currentTab === 'home' && (
          <WelcomeScreen
            language={language}
            onStartLearning={handleStartLearning}
            onWatchDemo={handleWatchDemo}
          />
        )}

        {currentTab === 'graph' && (
          <ConceptGraphScreen
            graph={graph}
            language={language}
            onNext={() => {
              sounds.playPop();
              setCurrentTab('communication');
            }}
            onBack={() => {
              sounds.playPop();
              setCurrentTab('home');
            }}
          />
        )}

        {currentTab === 'communication' && (
          <CommunicationBoardScreen
            graph={graph}
            language={language}
            onPhraseClick={(phrase) => {
              setActivePhrase(phrase);
            }}
          />
        )}

        {currentTab === 'confirm_speak' && (
          <ConfirmBeforeSpeakScreen
            phrase={activePhrase}
            onConfirm={handleConfirmSpeakDirect}
            onChange={() => {
              sounds.playWhoosh();
              setCurrentTab('communication');
            }}
            speechAvailable={speechAvailable}
          />
        )}

        {currentTab === 'teach_back' && (
          <TeachBackScreen
            graph={graph}
            language={language}
            chain={childChain}
            onChangeChain={setChildChain}
            onCheckChain={handleCheckChain}
            onClear={() => setChildChain([])}
            onSeedAttempt1={handleSeedAttempt1}
            onSeedAttempt2={handleSeedAttempt2}
          />
        )}

        {currentTab === 'evidence' && (
          <EvidenceDashboardScreen
            beforeEvidence={beforeEvidence}
            afterEvidence={afterEvidence}
            language={language}
            onRetry={() => {
              handleSeedAttempt2();
            }}
          />
        )}

        {/* SECTION 5 & 6: Limitations Panel & Un-fabricated Validation ("Support signal, not assessment") */}
        <div className="pt-4 border-t border-slate-200">
          <LimitationsPanel />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200/80 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <p className="text-slate-800 font-bold">
            SAMBHAV 2.0 • Concept-Graph Inclusive Classroom
          </p>
          <p className="text-emerald-700 font-bold">
            Stage 3B: Hardened Offline AAC • Dual Language (EN | ಕನ್ನಡ) • Deterministic Evidence Loop
          </p>
        </div>
      </footer>

      {/* PREPARE TODAY'S LESSON MODAL */}
      <PrepareLessonModal
        isOpen={isPrepareLessonOpen}
        onClose={() => setIsPrepareLessonOpen(false)}
        onApproveGraph={handleApproveNewGraph}
      />
    </div>
  );
}

export default App;