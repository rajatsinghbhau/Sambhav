import { useState, useEffect } from 'react';
import { WATER_CYCLE_GRAPH } from './data/canonicalGraph';
import { evaluateEvidence } from './engine/evidenceEngine';
import { ConceptGraph, GraphEvidenceEvaluation } from './types/conceptGraph';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { ConceptGraphScreen } from './components/screens/ConceptGraphScreen';
import { CommunicationBoardScreen } from './components/screens/CommunicationBoardScreen';
import { TeachBackScreen } from './components/screens/TeachBackScreen';
import { EvidenceDashboardScreen } from './components/screens/EvidenceDashboardScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { PrepareLessonModal } from './components/PrepareLessonModal';
import { LimitationsPanel } from './components/LimitationsPanel';
import { DemoLoginScreen } from './components/DemoLoginScreen';
import { SimplifiedExplanationModal } from './components/stage4/SimplifiedExplanationModal';
import { StudentAskDoubtModal } from './components/stage4/StudentAskDoubtModal';
import { StudentRevisionLibraryModal } from './components/stage4/StudentRevisionLibraryModal';
import { LearnedTopic } from './types/stage4';
import { offlineStorage, registerServiceWorker } from './utils/offlinePersistence';
import { PlusCircle, LogOut, RotateCcw } from 'lucide-react';
import { sounds } from './utils/soundEffects';

export type UserRole = 'student' | 'teacher' | null;

export type StudentTab =
  | 'home'
  | 'graph'
  | 'communication'
  | 'teach_back'
  | 'evidence';

export function App() {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return offlineStorage.loadCurrentRole();
  });

  const [graph, setGraph] = useState<ConceptGraph>(() => {
    const cachedGraph = offlineStorage.loadApprovedGraph();
    if (cachedGraph && cachedGraph.nodes && cachedGraph.nodes.length >= 5) {
      return cachedGraph;
    }
    return WATER_CYCLE_GRAPH;
  });

  const [currentTab, setCurrentTab] = useState<StudentTab>('home');

  const [language, setLanguage] = useState<'EN' | 'KN'>(() => {
    return offlineStorage.loadLanguage() || 'EN';
  });

  const [childChain, setChildChain] = useState<string[]>(() => {
    const cachedState = offlineStorage.loadEvidenceState();
    return cachedState.childChain && cachedState.childChain.length > 0 ? cachedState.childChain : [];
  });

  const [beforeEvidence, setBeforeEvidence] = useState<GraphEvidenceEvaluation | null>(() => {
    const cachedState = offlineStorage.loadEvidenceState();
    return cachedState.beforeEvidence || null;
  });

  const [afterEvidence, setAfterEvidence] = useState<GraphEvidenceEvaluation | null>(() => {
    const cachedState = offlineStorage.loadEvidenceState();
    return cachedState.afterEvidence || null;
  });

  const [isPrepareLessonOpen, setIsPrepareLessonOpen] = useState<boolean>(false);
  const [isExplainSimplyOpen, setIsExplainSimplyOpen] = useState<boolean>(false);
  const [isAskDoubtOpen, setIsAskDoubtOpen] = useState<boolean>(false);
  const [isRevisionLibraryOpen, setIsRevisionLibraryOpen] = useState<boolean>(false);

  // Non-blocking Service Worker registration on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  const handleSelectRole = (role: 'student' | 'teacher') => {
    sounds.playSuccessChime();
    setUserRole(role);
    offlineStorage.saveCurrentRole(role);
    if (role === 'student') {
      setCurrentTab('home');
    }
  };

  const handleLogout = () => {
    sounds.playPop();
    setUserRole(null);
    offlineStorage.saveCurrentRole(null);
  };

  const handleLanguageToggle = (lang: 'EN' | 'KN') => {
    sounds.playPop();
    setLanguage(lang);
    offlineStorage.saveLanguage(lang);
  };

  const handleStartLearning = () => {
    sounds.playPop();
    setCurrentTab('graph');
  };

  // Real Deterministic One-Click Demo Mode (Section 7 & 9)
  const handleWatchDemo = () => {
    sounds.playSuccessChime();
    const attempt1Chain = ['condensation', 'sun', 'heat', 'water', 'evaporation', 'vapour'];
    setChildChain(attempt1Chain);
    const ev1 = evaluateEvidence(graph, attempt1Chain);
    setBeforeEvidence(ev1);

    const attempt2Chain = ['sun', 'heat', 'water', 'evaporation', 'vapour', 'condensation'];
    const ev2 = evaluateEvidence(graph, attempt2Chain);
    setAfterEvidence(ev2);

    offlineStorage.saveApprovedGraph(graph);
    offlineStorage.saveEvidenceState(attempt2Chain, ev1, ev2);

    setCurrentTab('evidence');
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

    // Automatically archive in student's learned topics revision library
    const newTopic: LearnedTopic = {
      id: newGraph.id || `topic-${Date.now()}`,
      title: newGraph.title || 'Curriculum Science Lesson',
      titleKn: newGraph.title,
      subtitle: newGraph.subtitle || 'Teacher Approved Learning Topic',
      symbol: newGraph.nodes[0]?.symbol || '🔬',
      graph: newGraph,
      learnedDate: 'Today',
      status: 'in_progress',
      revisionsCompleted: 0
    };
    offlineStorage.addOrUpdateLearnedTopic(newTopic);

    setCurrentTab('graph');
  };

  const handleSelectTopicToRevise = (topic: LearnedTopic) => {
    setGraph(topic.graph);
    setChildChain([]);
    setBeforeEvidence(null);
    setAfterEvidence(null);
    offlineStorage.saveApprovedGraph(topic.graph);
    offlineStorage.saveEvidenceState([], null, null);
    setCurrentTab('graph');
    sounds.playSuccessChime();
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
                <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  userRole === 'teacher'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {userRole === 'teacher' ? 'Teacher Edition' : 'Student Edition'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Concept-Graph Inclusive Classroom
              </p>
            </div>
          </div>

          {/* Active User Persona Badge */}
          {userRole && (
            <div className="hidden xl:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/70">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" aria-hidden="true">
                  {userRole === 'teacher' ? '🧑‍🏫' : '👧'}
                </span>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {userRole === 'teacher' ? 'Teacher: Educator' : 'Student: Ananya'}
                  </div>
                  <div className="text-[11px] text-indigo-600 font-extrabold truncate max-w-[140px] leading-tight">
                    {userRole === 'teacher' ? 'Classroom Hub' : (graph.title || 'Water Cycle Lesson')}
                  </div>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Trust Principle</span>
                <span className="text-xs font-bold text-slate-700">AI suggests. Teacher approves. Child confirms.</span>
              </div>
            </div>
          )}

          {/* Controls: Role Switcher & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/90" role="group" aria-label="Language selection">
              <button
                type="button"
                onClick={() => handleLanguageToggle('EN')}
                aria-label="Switch to English"
                aria-pressed={language === 'EN'}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
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
                className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  language === 'KN'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* Teacher Only: Prepare Lesson AI Ingestion Button */}
            {userRole === 'teacher' && (
              <button
                onClick={() => setIsPrepareLessonOpen(true)}
                type="button"
                aria-label="Prepare Today's Lesson with AI Concept Graph"
                className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <PlusCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="hidden sm:inline">
                  {language === 'KN' ? 'ಪಾಠ ಸಿದ್ಧತೆ' : 'Prepare Lesson'}
                </span>
              </button>
            )}

            {/* Logout to Demo Login Screen */}
            {userRole && (
              <button
                onClick={handleLogout}
                type="button"
                aria-label="Log out of session"
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer transition-colors text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'KN' ? 'ಲಾಗ್ ಔಟ್' : 'Log out'}</span>
              </button>
            )}
          </div>
        </div>

        {/* STUDENT ONLY: Navigation Tabs */}
        {userRole === 'student' && (
          <div className="w-full bg-slate-100/70 border-t border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none py-2">
              <div className="flex items-center gap-2 min-w-max">
                {[
                  { id: 'home', label: '1. Welcome', emoji: '🌟' },
                  { id: 'graph', label: '2. Lesson Map', emoji: '🗺️' },
                  { id: 'communication', label: '3. Talk & Share', emoji: '💬' },
                  { id: 'teach_back', label: '4. Tell the Story', emoji: '🧩' },
                  { id: 'evidence', label: '5. What I Learned', emoji: '📊' },
                ].map((tab) => {
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        sounds.playPop();
                        setCurrentTab(tab.id as StudentTab);
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
        )}
      </header>

      {/* MAIN WORKSPACE */}
      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* CASE 0: ROLE NOT SELECTED -> SHOW DEMO LOGIN PORTAL */}
        {!userRole && (
          <DemoLoginScreen
            onSelectRole={handleSelectRole}
            language={language}
          />
        )}

        {/* CASE 1: TEACHER ROLE ACTIVE -> EXCLUSIVE TEACHER DASHBOARD */}
        {userRole === 'teacher' && (
          <div className="space-y-6">
            <TeacherDashboard
              graph={graph}
              language={language}
              beforeEvidence={beforeEvidence}
              afterEvidence={afterEvidence}
              onOpenPrepareLesson={() => setIsPrepareLessonOpen(true)}
            />
          </div>
        )}

        {/* CASE 2: STUDENT ROLE ACTIVE -> EXCLUSIVE STUDENT EXPERIENCE */}
        {userRole === 'student' && (
          <>
            {/* PART 15: Student Quick Action Hub */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl p-1.5 bg-indigo-50 rounded-xl shrink-0">
                  {graph.nodes[0]?.symbol || '💧'}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                      Active Lesson
                    </span>
                    <button
                      onClick={() => {
                        sounds.playPop();
                        setIsRevisionLibraryOpen(true);
                      }}
                      type="button"
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer whitespace-nowrap"
                    >
                      (Change / Revise Past Topics)
                    </button>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                    {graph.title || 'The Water Cycle'}
                  </h3>
                </div>
              </div>

              {/* Quick Actions: 📖 Learn, 🔎 Explain Simply, 💬 Ask a Doubt, 🗣️ Communication, 🧩 Teach-Back, 🔄 Revise */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    sounds.playPop();
                    setCurrentTab('graph');
                  }}
                  type="button"
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    currentTab === 'graph'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>📖 Learn</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setIsExplainSimplyOpen(true);
                  }}
                  type="button"
                  className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-black text-sky-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                >
                  <span>🔎 Explain Simply</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setIsAskDoubtOpen(true);
                  }}
                  type="button"
                  className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-black text-indigo-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                >
                  <span>💬 Ask a Doubt</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setCurrentTab('communication');
                  }}
                  type="button"
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    currentTab === 'communication'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>🗣️ Talk & Share</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setCurrentTab('teach_back');
                  }}
                  type="button"
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    currentTab === 'teach_back'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>🧩 Tell the Story</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setIsRevisionLibraryOpen(true);
                  }}
                  type="button"
                  className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-black text-purple-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>🔄 Revise Past Topics</span>
                </button>
              </div>
            </div>

            {/* STUDENT SCREENS */}
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
                onOpenAskDoubt={() => setIsAskDoubtOpen(true)}
                onOpenExplainSimply={() => setIsExplainSimplyOpen(true)}
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
          </>
        )}

        {/* LIMITATIONS & ETHICAL BOUNDARY PANEL */}
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
          <p className="text-indigo-700 font-bold">
            Role-Separated Architecture • Student AAC & Teach-Back • Teacher Intelligence & Revision
          </p>
        </div>
      </footer>

      {/* PREPARE TODAY'S LESSON MODAL (TEACHER) */}
      <PrepareLessonModal
        isOpen={isPrepareLessonOpen}
        onClose={() => setIsPrepareLessonOpen(false)}
        onApproveGraph={handleApproveNewGraph}
        language={language}
      />

      {/* SIMPLIFIED EXPLANATION MODAL (STUDENT) */}
      <SimplifiedExplanationModal
        isOpen={isExplainSimplyOpen}
        onClose={() => setIsExplainSimplyOpen(false)}
        graph={graph}
        initialConceptId="condensation"
        onOpenAskDoubt={() => setIsAskDoubtOpen(true)}
      />

      {/* STUDENT ASK A DOUBT MODAL (STUDENT) */}
      <StudentAskDoubtModal
        isOpen={isAskDoubtOpen}
        onClose={() => setIsAskDoubtOpen(false)}
        graph={graph}
        studentName="Ananya"
        language={language}
      />

      {/* STUDENT REVISION & PAST TOPICS LIBRARY MODAL (STUDENT) */}
      <StudentRevisionLibraryModal
        isOpen={isRevisionLibraryOpen}
        onClose={() => setIsRevisionLibraryOpen(false)}
        activeGraphId={graph.id}
        onSelectTopicToRevise={handleSelectTopicToRevise}
        language={language}
      />
    </div>
  );
}

export default App;
