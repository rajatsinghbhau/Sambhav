import React, { useState } from 'react';
import { ExamRevisionPlan, ExamRevisionSession } from '../../types/stage4';
import { ConceptGraph } from '../../types/conceptGraph';
import { WATER_CYCLE_GRAPH } from '../../data/canonicalGraph';
import { generateExamRevisionPlan } from '../../engine/stage4Engine';
import { offlineStorage } from '../../utils/offlinePersistence';
import { PrintableExamStoryboardModal } from './PrintableExamStoryboardModal';
import { Check, Edit2, Plus, Trash2, Clock, Target, Save, Info, Printer } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ExamRevisionPlannerProps {
  graph?: ConceptGraph;
}

export const ExamRevisionPlanner: React.FC<ExamRevisionPlannerProps> = ({
  graph = WATER_CYCLE_GRAPH
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

  const handleDateChange = (newDate: string) => {
    sounds.playPop();
    setExamDate(newDate);
    const regenerated = generateExamRevisionPlan(newDate);
    setPlan(regenerated);
    offlineStorage.saveExamPlan(regenerated);
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
  };

  const handleDeleteSession = (dayNumber: number) => {
    sounds.playWhoosh();
    const updatedSessions = plan.sessions
      .filter(s => s.dayNumber !== dayNumber)
      .map((s, idx) => ({ ...s, dayNumber: idx + 1, dayTitle: `Day ${idx + 1} — Revision` }));

    const updatedPlan: ExamRevisionPlan = {
      ...plan,
      totalDays: updatedSessions.length,
      sessions: updatedSessions
    };

    setPlan(updatedPlan);
    offlineStorage.saveExamPlan(updatedPlan);
  };

  const handleAddSession = () => {
    sounds.playPop();
    const newDayNumber = plan.sessions.length + 1;
    const newSession: ExamRevisionSession = {
      dayNumber: newDayNumber,
      dayTitle: `Day ${newDayNumber} — Additional Targeted Review`,
      topic: 'Targeted Review Session',
      conceptIds: ['condensation'],
      description: 'Review condensation and moisture cooling transitions.',
      duration: 30
    };

    const updatedPlan: ExamRevisionPlan = {
      ...plan,
      totalDays: newDayNumber,
      sessions: [...plan.sessions, newSession]
    };

    setPlan(updatedPlan);
    offlineStorage.saveExamPlan(updatedPlan);
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
            <span>Pre-Exam Strategic Roadmap</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Prepare for Exam Planner
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Deterministic 7-day revision schedule informed by lesson history and reinforcement records.
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
            <span>🖨️ View 1-Page Revision Storyboard</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="exam-date-picker" className="text-xs font-bold text-slate-600">
              Exam:
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

      {/* Suggested plan notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-950 font-medium">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Deterministic timetable generated from concept graph milestone records. Teacher decides.</span>
        </div>
        <button
          onClick={handleAddSession}
          type="button"
          className="min-h-[36px] px-3 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Session</span>
        </button>
      </div>

      {/* 7-Day Sessions Timeline */}
      <div className="space-y-3">
        {plan.sessions.map(s => {
          const isEditing = editingSessionId === s.dayNumber;

          return (
            <div
              key={s.dayNumber}
              className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 hover:border-slate-300 transition-all space-y-2.5 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    D{s.dayNumber}
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      {s.dayTitle}
                    </h4>
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
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteSession(s.dayNumber)}
                    type="button"
                    aria-label={`Delete Day ${s.dayNumber}`}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
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
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Save Changes
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
      </div>

      {/* Save Plan Button */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400 font-medium">
          Total Revision Sessions: {plan.sessions.length} days
        </span>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Exam plan saved!</span>
            </span>
          )}

          <button
            onClick={handleSaveAll}
            type="button"
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Exam Plan</span>
          </button>
        </div>
      </div>

      {/* 1-Page Printable Visual Revision Storyboard Modal */}
      {showPrintableSheet && (
        <PrintableExamStoryboardModal
          isOpen={showPrintableSheet}
          onClose={() => setShowPrintableSheet(false)}
          graph={graph}
          plan={plan}
        />
      )}
    </div>
  );
};
