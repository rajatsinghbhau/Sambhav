import React, { useState } from 'react';
import { ExamRevisionPlan, ExamRevisionSession } from '../../types/stage4';
import { ConceptGraph } from '../../types/conceptGraph';
import { WATER_CYCLE_GRAPH } from '../../data/canonicalGraph';
import { generateExamRevisionPlan } from '../../engine/stage4Engine';
import { offlineStorage } from '../../utils/offlinePersistence';
import { PrintableExamStoryboardModal } from './PrintableExamStoryboardModal';
import { AddSessionModal } from './AddSessionModal';
import { Check, Edit2, Plus, Trash2, Clock, Target, Save, Info, Printer, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ExamRevisionPlannerProps {
  graph?: ConceptGraph;
  language?: 'EN' | 'KN';
}

export const ExamRevisionPlanner: React.FC<ExamRevisionPlannerProps> = ({
  graph = WATER_CYCLE_GRAPH,
  language = 'EN'
}) => {
  const [examDate, setExamDate] = useState<string>('2026-12-15');
  const [plan, setPlan] = useState<ExamRevisionPlan>(() => {
    return offlineStorage.loadExamPlan() || generateExamRevisionPlan('2026-12-15');
  });

  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedTopic, setEditedTopic] = useState<string>('');
  const [editedDesc, setEditedDesc] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showPrintableSheet, setShowPrintableSheet] = useState<boolean>(false);

  // Add Session modal & visual feedback states
  const [showAddSessionModal, setShowAddSessionModal] = useState<boolean>(false);
  const [highlightedSessionId, setHighlightedSessionId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDateChange = (newDate: string) => {
    sounds.playPop();
    setExamDate(newDate);
    const regenerated = generateExamRevisionPlan(newDate);
    setPlan(regenerated);
    offlineStorage.saveExamPlan(regenerated);
    setToastMessage(language === 'KN' ? 'ಪರೀಕ್ಷಾ ದಿನಾಂಕ ನವೀಕರಿಸಲಾಗಿದೆ.' : 'Exam date updated.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartEdit = (session: ExamRevisionSession) => {
    sounds.playPop();
    setEditingSessionId(session.dayNumber);
    setEditedTitle(session.dayTitle);
    setEditedTopic(session.topic);
    setEditedDesc(session.description);
  };

  const handleSaveEdit = (dayNumber: number) => {
    sounds.playSuccessChime();
    const updatedSessions = plan.sessions.map(s => {
      if (s.dayNumber === dayNumber) {
        return {
          ...s,
          dayTitle: editedTitle || s.dayTitle,
          topic: editedTopic || s.topic,
          description: editedDesc || s.description
        };
      }
      return s;
    });

    const updatedPlan: ExamRevisionPlan = {
      ...plan,
      sessions: updatedSessions
    };

    setPlan(updatedPlan);
    offlineStorage.saveExamPlan(updatedPlan);
    setEditingSessionId(null);
    setToastMessage(language === 'KN' ? 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ.' : 'Session changes saved.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteSession = (dayNumber: number) => {
    sounds.playWhoosh();
    const updatedSessions = plan.sessions
      .filter(s => s.dayNumber !== dayNumber)
      .map((s, idx) => ({ ...s, dayNumber: idx + 1, dayTitle: `Day ${idx + 1} — ${s.topic || 'Revision'}` }));

    const updatedPlan: ExamRevisionPlan = {
      ...plan,
      totalDays: updatedSessions.length,
      sessions: updatedSessions
    };

    setPlan(updatedPlan);
    offlineStorage.saveExamPlan(updatedPlan);
    setToastMessage(language === 'KN' ? 'ಅವಧಿಯನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.' : 'Session removed from roadmap.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    sounds.playPop();
    setShowAddSessionModal(true);
  };

  const handleConfirmAddSession = (newSession: ExamRevisionSession) => {
    const updatedSessions = [...plan.sessions, newSession];
    const updatedPlan: ExamRevisionPlan = {
      ...plan,
      totalDays: Math.max(plan.totalDays, newSession.dayNumber, updatedSessions.length),
      sessions: updatedSessions
    };

    setPlan(updatedPlan);
    offlineStorage.saveExamPlan(updatedPlan);

    // Visual feedback
    setHighlightedSessionId(newSession.dayNumber);
    setToastMessage(
      language === 'KN'
        ? `✨ ದಿನ ${newSession.dayNumber} — "${newSession.topic}" ಅವಧಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!`
        : `✨ Session Day ${newSession.dayNumber} — "${newSession.topic}" added to exam plan!`
    );

    setTimeout(() => {
      setHighlightedSessionId(null);
    }, 4500);

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);

    // Scroll to the newly added session
    setTimeout(() => {
      const el = document.getElementById(`session-card-${newSession.dayNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };

  const handleSaveAll = () => {
    sounds.playSuccessChime();
    offlineStorage.saveExamPlan(plan);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>{language === 'KN' ? 'ಪರೀಕ್ಷಾ ಪೂರ್ವ ಕಾರ್ಯತಂತ್ರದ ಮಾರ್ಗಸೂಚಿ' : 'Pre-Exam Strategic Roadmap'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'KN' ? 'ಪರೀಕ್ಷಾ ಸಿದ್ಧತಾ ಯೋಜಕ' : 'Prepare for Exam Planner'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {language === 'KN'
              ? 'ಪಾಠದ ಇತಿಹಾಸ ಮತ್ತು ಬಲವರ್ಧನೆ ದಾಖಲೆಗಳನ್ನು ಆಧರಿಸಿದ ಪುನರಾವರ್ತನಾ ವೇಳಾಪಟ್ಟಿ.'
              : 'Deterministic multi-day revision schedule informed by lesson history and reinforcement records.'}
          </p>
        </div>

        {/* Exam Controls: Date Picker & Printable Storyboard Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={() => {
              sounds.playSuccessChime();
              setShowPrintableSheet(true);
            }}
            type="button"
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'KN' ? '🖨️ 1-ಪುಟದ ದೃಶ್ಯ ಪುನರಾವರ್ತನಾ ಫಲಕ' : '🖨️ View 1-Page Revision Storyboard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="exam-date-picker" className="text-xs font-bold text-slate-600">
              {language === 'KN' ? 'ಪರೀಕ್ಷಾ ಗುರಿ:' : 'Exam:'}
            </label>
            <input
              id="exam-date-picker"
              type="date"
              value={examDate}
              onChange={e => handleDateChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            type="button"
            className="text-emerald-700 hover:text-emerald-900 font-extrabold text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Suggested plan notice with Add Session button */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-950 font-medium">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {language === 'KN'
              ? 'ಪರಿಕಲ್ಪನಾ-ನಕ್ಷೆ ದಾಖಲೆಗಳಿಂದ ರೂಪಿಸಲಾದ ವೇಳಾಪಟ್ಟಿ. ಶಿಕ್ಷಕರೇ ನಿರ್ಧರಿಸುತ್ತಾರೆ.'
              : 'Deterministic timetable generated from concept graph milestone records. Teacher decides.'}
          </span>
        </div>
        <button
          onClick={handleOpenAddModal}
          type="button"
          className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'KN' ? '+ ಅವಧಿ ಸೇರಿಸಿ' : '+ Add Session'}</span>
        </button>
      </div>

      {/* Sessions Timeline */}
      <div className="space-y-3">
        {plan.sessions.map(s => {
          const isEditing = editingSessionId === s.dayNumber;
          const isHighlighted = highlightedSessionId === s.dayNumber;

          return (
            <div
              key={s.dayNumber}
              id={`session-card-${s.dayNumber}`}
              className={`p-5 rounded-2xl border transition-all duration-300 space-y-2.5 shadow-2xs ${
                isHighlighted
                  ? 'bg-indigo-50/80 border-indigo-400 ring-4 ring-indigo-400/20 scale-[1.01]'
                  : 'bg-slate-50/90 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                    isHighlighted ? 'bg-indigo-700 text-white animate-pulse' : 'bg-indigo-600 text-white'
                  }`}>
                    D{s.dayNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {s.dayTitle}
                      </h4>
                      {isHighlighted && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white animate-in zoom-in-90 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>{language === 'KN' ? 'ಹೊಸದಾಗಿ ಸೇರಿಸಲಾಗಿದೆ' : 'Just Added'}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-indigo-700">
                      Topic: {s.topic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{s.duration} min</span>
                  </span>

                  <button
                    onClick={() => handleStartEdit(s)}
                    type="button"
                    aria-label={`Edit Day ${s.dayNumber}`}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteSession(s.dayNumber)}
                    type="button"
                    aria-label={`Delete Day ${s.dayNumber}`}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable form or description */}
              {isEditing ? (
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    placeholder="Session Title"
                    className="w-full text-xs font-bold p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    value={editedTopic}
                    onChange={e => setEditedTopic(e.target.value)}
                    placeholder="Focus Topic"
                    className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <textarea
                    value={editedDesc}
                    onChange={e => setEditedDesc(e.target.value)}
                    placeholder="Session Description"
                    rows={2}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <button
                    onClick={() => handleSaveEdit(s.dayNumber)}
                    type="button"
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-indigo-700"
                  >
                    {language === 'KN' ? 'ಬದಲಾವಣೆ ಉಳಿಸಿ' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {s.description}
                </p>
              )}
            </div>
          );
        })}

        {/* Bottom Interactive "+ Add Revision Session" Card */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] group shadow-2xs"
        >
          <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          <span>
            {language === 'KN'
              ? `+ ದಿನ ${plan.sessions.length + 1} ಕ್ಕೆ ಹೊಸ ಪುನರಾವರ್ತನಾ ಅವಧಿ ಸೇರಿಸಿ`
              : `+ Add Revision Session (Day ${plan.sessions.length + 1})`}
          </span>
          <span className="text-[11px] font-medium text-indigo-500 hidden sm:inline">
            — {language === 'KN' ? 'ಉದ್ದೇಶಿತ ಪರಿಕಲ್ಪನೆ, ಸಮಯ ಮತ್ತು ಗುರಿಗಳನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ' : 'Configure topic, duration, and learning objectives'}
          </span>
        </button>
      </div>

      {/* Save Plan Button */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400 font-medium">
          {language === 'KN' ? 'ಒಟ್ಟು ಪುನರಾವರ್ತನಾ ಅವಧಿಗಳು:' : 'Total Revision Sessions:'} {plan.sessions.length} {language === 'KN' ? 'ದಿನಗಳು' : 'days'}
        </span>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>{language === 'KN' ? 'ಪರೀಕ್ಷಾ ಯೋಜನೆ ಉಳಿಸಲಾಗಿದೆ!' : 'Exam plan saved!'}</span>
            </span>
          )}

          <button
            onClick={handleSaveAll}
            type="button"
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{language === 'KN' ? 'ಪರೀಕ್ಷಾ ಯೋಜನೆ ಉಳಿಸಿ' : 'Save Exam Plan'}</span>
          </button>
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddSessionModal && (
        <AddSessionModal
          isOpen={showAddSessionModal}
          onClose={() => setShowAddSessionModal(false)}
          onAddSession={handleConfirmAddSession}
          graph={graph}
          defaultDayNumber={plan.sessions.length + 1}
          language={language}
        />
      )}

      {/* 1-Page Printable Visual Revision Storyboard Modal */}
      {showPrintableSheet && (
        <PrintableExamStoryboardModal
          isOpen={showPrintableSheet}
          onClose={() => setShowPrintableSheet(false)}
          graph={graph}
          plan={plan}
          language={language}
        />
      )}
    </div>
  );
};
