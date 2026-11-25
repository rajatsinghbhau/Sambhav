import React, { useState } from 'react';
import { ConceptGraph, GraphEvidenceEvaluation } from '../types/conceptGraph';
import { generateTeacherRecap } from '../engine/evidenceEngine';
import { PreClassTeachingSupport } from './stage4/PreClassTeachingSupport';
import { TeachingPlanner } from './stage4/TeachingPlanner';
import { ClassLearningSnapshot } from './stage4/ClassLearningSnapshot';
import { StudentActivityHistory } from './stage4/StudentActivityHistory';
import { TeacherDoubtInbox } from './stage4/TeacherDoubtInbox';
import { RevisionQueue } from './stage4/RevisionQueue';
import { ExamRevisionPlanner } from './stage4/ExamRevisionPlanner';
import {
  Sparkles,
  Edit3,
  Check,
  ArrowRight,
  BookOpen,
  Users,
  BarChart3,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { offlineStorage } from '../utils/offlinePersistence';
import { createDefaultTeachingPlan } from '../engine/stage4Engine';
import { TeachingPlanItem, TeachingPlan } from '../types/stage4';

interface TeacherDashboardProps {
  graph: ConceptGraph;
  language?: 'EN' | 'KN';
  beforeEvidence: GraphEvidenceEvaluation | null;
  afterEvidence: GraphEvidenceEvaluation | null;
  onOpenPrepareLesson?: () => void;
}

export type TeacherDashboardTab = 'prepare' | 'activity' | 'evidence' | 'revision';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  graph,
  language = 'EN',
  beforeEvidence,
  afterEvidence,
  onOpenPrepareLesson
}) => {
  const recap = generateTeacherRecap(beforeEvidence, afterEvidence);

  const [activeTab, setActiveTab] = useState<TeacherDashboardTab>('prepare');
  const [recapNotes, setRecapNotes] = useState<string>(recap.defaultRecapDraft);
  const [isEditingRecap, setIsEditingRecap] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [planTrigger, setPlanTrigger] = useState<number>(0);
  const [planNotification, setPlanNotification] = useState<string | null>(null);

  React.useEffect(() => {
    setRecapNotes(recap.defaultRecapDraft);
  }, [recap.defaultRecapDraft]);

  const handleSaveRecap = () => {
    sounds.playSuccessChime();
    setIsEditingRecap(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddReinforcementToPlan = (conceptId: string) => {
    sounds.playSuccessChime();
    const node = graph.nodes.find(n => n.id === conceptId);
    const conceptLabel = node ? `${node.symbol} ${language === 'KN' ? (node.kannadaLabel || node.label) : node.label}` : conceptId;

    // Load active teaching plan or create default
    const existingPlan = offlineStorage.loadTeachingPlan() || createDefaultTeachingPlan('Water Cycle', conceptId);

    // Create targeted reinforcement item
    const reinforcementItem: TeachingPlanItem = {
      id: `item-reinf-${Date.now()}`,
      phase: 'Engage Everyone',
      title: `Reinforce ${node?.label || 'Concept'}: Cold Glass Hands-on Observation`,
      duration: 10,
      description: `Targeted practice for ${node?.label || 'concept'} based on demonstrated class evidence. Students observe water droplet formation on a chilled cold glass.`,
      conceptId: conceptId,
      activityId: 'cold-glass'
    };

    // Insert as prominent item
    const updatedItems = [
      ...existingPlan.items.slice(0, 3),
      reinforcementItem,
      ...existingPlan.items.slice(3)
    ];

    const updatedPlan: TeachingPlan = {
      ...existingPlan,
      items: updatedItems,
      totalDuration: updatedItems.reduce((acc, it) => acc + it.duration, 0),
      teacherNote: `Class reinforcement added for ${conceptLabel}. Teacher decides.`,
      updatedAt: new Date().toISOString()
    };

    offlineStorage.saveTeachingPlan(updatedPlan);
    setPlanTrigger(prev => prev + 1);
    setPlanNotification(language === 'KN' 
      ? `✓ ${conceptLabel} ಬಲವರ್ಧನೆಯನ್ನು ನಾಳೆಯ ಬೋಧನಾ ಯೋಜನೆಗೆ ಸೇರಿಸಲಾಗಿದೆ!` 
      : `✓ Added ${conceptLabel} reinforcement to Tomorrow's Teaching Plan!`
    );
    setActiveTab('prepare'); // Navigate directly to Tab 1: Prepare & Lesson Plan!
    setTimeout(() => setPlanNotification(null), 5000);
  };

  const learningLoop = language === 'KN'
    ? [
        { en: 'Prepare', kn: 'ಸಿದ್ಧತೆ' },
        { en: 'Teach', kn: 'ಬೋಧನೆ' },
        { en: 'Communicate', kn: 'ಸಂವಹನ' },
        { en: 'Demonstrate', kn: 'ಪ್ರದರ್ಶನ' },
        { en: 'Evidence', kn: 'ಸಾಕ್ಷ್ಯಾಧಾರ' },
        { en: 'Reinforce', kn: 'ಬಲವರ್ಧನೆ' },
        { en: 'Recheck', kn: 'ಮರುಪರಿಶೀಲನೆ' },
        { en: 'Revise', kn: 'ಪುನರಾವರ್ತನೆ' }
      ]
    : [
        { en: 'Prepare', kn: 'Prepare' },
        { en: 'Teach', kn: 'Teach' },
        { en: 'Communicate', kn: 'Communicate' },
        { en: 'Demonstrate', kn: 'Demonstrate' },
        { en: 'Evidence', kn: 'Evidence' },
        { en: 'Reinforce', kn: 'Reinforce' },
        { en: 'Recheck', kn: 'Recheck' },
        { en: 'Revise', kn: 'Revise' }
      ];

  const dashboardTabs = [
    {
      id: 'prepare',
      label: language === 'KN' ? '1. ಸಿದ್ಧತೆ ಮತ್ತು ಪಾಠ ಯೋಜನೆ' : '1. Prepare & Lesson Plan',
      icon: BookOpen,
      desc: language === 'KN' ? 'ಏನು ಮತ್ತು ಹೇಗೆ ಬೋಧಿಸಬೇಕು' : 'What & how to teach clearly'
    },
    {
      id: 'activity',
      label: language === 'KN' ? '2. ವಿದ್ಯಾರ್ಥಿ ಚಟುವಟಿಕೆ ಮತ್ತು ಸಂದೇಹಗಳು' : '2. Student Activity & Doubts',
      icon: Users,
      desc: language === 'KN' ? 'ವಿದ್ಯಾರ್ಥಿಗಳ ಪ್ರಶ್ನೆಗಳು' : 'What students do & ask'
    },
    {
      id: 'evidence',
      label: language === 'KN' ? '3. ಸಾಕ್ಷ್ಯಾಧಾರ ಮತ್ತು ಸಾರಾಂಶ' : '3. Evidence & Recap',
      icon: BarChart3,
      desc: language === 'KN' ? 'ಪ್ರದರ್ಶಿತ ಪುರಾವೆಗಳು' : 'What is demonstrated'
    },
    {
      id: 'revision',
      label: language === 'KN' ? '4. ಅಂತರದ ಪುನರಾವರ್ತನೆ ಮತ್ತು ಪರೀಕ್ಷೆ' : '4. Spaced Revision & Exam',
      icon: RotateCcw,
      desc: language === 'KN' ? 'ಮುಂದೆ ಪುನರಾವರ್ತಿಸುವುದು' : 'What to revise later'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner answering "SAMBHAV helps teachers turn classroom evidence into the next teaching action." */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'KN' ? 'ಶಿಕ್ಷಕರ ಗುಪ್ತಚರ ಕೇಂದ್ರ' : 'Teacher Intelligence Hub'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {language === 'KN' ? 'ತರಗತಿ ಸಾಕ್ಷ್ಯಾಧಾರ ಮತ್ತು ಬೋಧನಾ ವಾಸ್ತುಶಿಲ್ಪ' : 'Classroom Evidence & Teaching Architecture'}
          </h2>
          <p className="text-sm text-indigo-100 font-medium leading-relaxed">
            {language === 'KN'
              ? '“ತರಗತಿಯ ಸಾಕ್ಷ್ಯವನ್ನು ಮುಂದಿನ ಬೋಧನಾ ಕ್ರಿಯೆಯನ್ನಾಗಿ ಪರಿವರ್ತಿಸಲು ಸಂಭವ್ ಶಿಕ್ಷಕರಿಗೆ ನೆರವಾಗುತ್ತದೆ.”'
              : '“SAMBHAV helps teachers turn classroom evidence into the next teaching action.”'}
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="bg-white/10 border border-white/20 p-4 rounded-2xl text-xs space-y-1 self-start md:self-auto shrink-0 max-w-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
            {language === 'KN' ? 'ಬೋಧನಾ ಸಾರಾಂಶ' : 'Pedagogical Recap'}
          </span>
          <p className="font-bold text-white leading-snug">
            {recap.summarySentence}
          </p>
          <span className="text-[10px] text-indigo-200 block pt-1">
            {language === 'KN' ? 'ಗಮನ:' : 'Focus:'} {recap.suggestedFocus}
          </span>
        </div>
      </div>

      {/* 8-Phase Learning Loop Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
          {language === 'KN' ? 'ಪರಿಕಲ್ಪನಾ-ನಕ್ಷೆ ಕಲಿಕಾ ಚಕ್ರ:' : 'Concept-Graph Learning Loop:'}
        </span>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {learningLoop.map((step, idx) => (
            <React.Fragment key={step.en}>
              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs">
                {language === 'KN' ? step.kn : step.en}
              </span>
              {idx < learningLoop.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 4 CORE TABS: Prepare, Student Activity, Evidence, Revision */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 overflow-x-auto scrollbar-none">
        {dashboardTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playPop();
                setActiveTab(tab.id as TeacherDashboardTab);
              }}
              type="button"
              className={`min-h-[50px] shrink-0 min-w-fit px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap btn-tactile ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 ring-2 ring-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PREPARE */}
      {activeTab === 'prepare' && (
        <div className="space-y-6">
          {/* AI Concept Graph Ingestion Action Card */}
          {onOpenPrepareLesson && (
            <div className="bg-gradient-to-r from-amber-50 via-indigo-50/50 to-sky-50 rounded-3xl border-2 border-indigo-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Google Gemini 2.5 Flash</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {language === 'KN' ? 'AI ಪರಿಕಲ್ಪನಾ ನಕ್ಷೆಯೊಂದಿಗೆ ಇಂದಿನ ಪಾಠ ಸಿದ್ಧಪಡಿಸಿ' : "Prepare Today's Lesson with AI Concept Graph"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl">
                  {language === 'KN'
                    ? 'ಯಾವುದೇ ವಿಜ್ಞಾನ ಪಾಠದ ಪ್ಯಾರಾಗ್ರಾಫ್ ನಕಲಿಸಿ. ಶಿಕ್ಷಕರ ಪರಿಶೀಲನೆಗೆ ಅನುಮೋದಿತ ಪರಿಕಲ್ಪನಾ ನಕ್ಷೆಯನ್ನು AI ರಚಿಸುತ್ತದೆ.'
                    : 'Paste any science lesson paragraph. AI parses pedagogical milestones into a verified Concept Graph for teacher review and approval.'}
                </p>
              </div>

              <button
                onClick={() => {
                  sounds.playPop();
                  onOpenPrepareLesson();
                }}
                type="button"
                className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 btn-tactile shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{language === 'KN' ? 'AI ಪಾಠ ಸಿದ್ಧತೆ ತೆರೆಯಿರಿ' : 'Open AI Lesson Ingestion'}</span>
              </button>
            </div>
          )}

          {planNotification && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-black text-xs sm:text-sm rounded-2xl animate-in zoom-in-95 flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{planNotification}</span>
            </div>
          )}
          <PreClassTeachingSupport graph={graph} language={language} />
          <TeachingPlanner planTrigger={planTrigger} language={language} />
        </div>
      )}

      {/* TAB 2: STUDENT ACTIVITY & DOUBTS */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <ClassLearningSnapshot
            graph={graph}
            language={language}
            onAddReinforcementToPlan={handleAddReinforcementToPlan}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <StudentActivityHistory language={language} />
            <TeacherDoubtInbox language={language} />
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE & RECAP */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* Editable Recap Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                  {language === 'KN' ? 'ಶಿಕ್ಷಕರ ಮುಂದುವರಿಕೆ ಬೋಧನಾ ಸಾರಾಂಶ' : 'Teacher Pedagogical Continuation (Derived Recap)'}
                </span>
                <h4 className="text-xl font-black text-white mt-0.5">
                  {recap.summarySentence}
                </h4>
              </div>

              <button
                onClick={() => setIsEditingRecap(!isEditingRecap)}
                type="button"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors self-start cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingRecap ? (language === 'KN' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel Edit') : (language === 'KN' ? 'ಸಾರಾಂಶ ಸಂಪಾದಿಸಿ' : 'Edit Recap Note')}</span>
              </button>
            </div>

            {isEditingRecap ? (
              <div className="space-y-3">
                <label htmlFor="recap-editor-input" className="text-xs text-indigo-200 block">
                  {language === 'KN'
                    ? 'ನಾಳೆಯ ಪುನರಾವರ್ತನಾ ಪಾಠ ಯೋಜನೆ ಟಿಪ್ಪಣಿಗಳನ್ನು ಸಂಪಾದಿಸಿ (ಶಿಕ್ಷಕರು ಅನುಮೋದಿಸುತ್ತಾರೆ):'
                    : "Edit tomorrow's recap lesson plan notes (Teacher Approves):"}
                </label>
                <textarea
                  id="recap-editor-input"
                  rows={3}
                  value={recapNotes}
                  onChange={(e) => setRecapNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/10 text-white border border-white/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleSaveRecap}
                  type="button"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'KN' ? 'ಅನುಮೋದಿಸಿ ಮತ್ತು ಉಳಿಸಿ' : 'Approve & Save Recap'}</span>
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {recapNotes}
                </p>
                {savedSuccess && (
                  <p className="text-xs text-emerald-400 font-bold mt-2 flex items-center gap-1">
                    <Check className="w-4 h-4" /> {language === 'KN' ? 'ಸಾರಾಂಶವನ್ನು ಅನುಮೋದಿಸಲಾಗಿದೆ ಮತ್ತು ಉಳಿಸಲಾಗಿದೆ!' : 'Recap approved and saved!'}
                  </p>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
              <span>
                {language === 'KN' ? 'ಬಲಪಡಿಸಿದ ಪರಿಕಲ್ಪನೆ:' : 'Reinforced Concept:'}{' '}
                <strong className="text-white">
                  {recap.reinforcedNode ? `${recap.reinforcedNode.symbol} ${language === 'KN' ? (recap.reinforcedNode.kannadaLabel || recap.reinforcedNode.label) : recap.reinforcedNode.label}` : (language === 'KN' ? 'ಯಾವುದೂ ಇಲ್ಲ' : 'None')}
                </strong>
              </span>
              <span>•</span>
              <span>
                {language === 'KN' ? 'ಮುಂದಿನ ಗುರಿ:' : 'Next Target:'}{' '}
                <strong className="text-white">
                  {recap.nextNode ? `${recap.nextNode.symbol} ${language === 'KN' ? (recap.nextNode.kannadaLabel || recap.nextNode.label) : recap.nextNode.label}` : (language === 'KN' ? 'ವಿಷಯ ಸಂಶ್ಲೇಷಣೆ' : 'Topic Synthesis')}
                </strong>
              </span>
            </div>
          </div>

          <ClassLearningSnapshot
            graph={graph}
            language={language}
            onAddReinforcementToPlan={handleAddReinforcementToPlan}
          />
        </div>
      )}

      {/* TAB 4: REVISION & EXAM PLANNER */}
      {activeTab === 'revision' && (
        <div className="space-y-6">
          <RevisionQueue graph={graph} language={language} />
          <ExamRevisionPlanner graph={graph} language={language} />
        </div>
      )}
    </div>
  );
};
