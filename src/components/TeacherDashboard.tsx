import React, { useState } from 'react';
import { GraphEvidenceEvaluation } from '../types/conceptGraph';
import { generateTeacherRecap } from '../engine/evidenceEngine';
import { Sparkles, Edit3, Check, ArrowRight } from 'lucide-react';

interface TeacherDashboardProps {
  beforeEvidence: GraphEvidenceEvaluation | null;
  afterEvidence: GraphEvidenceEvaluation | null;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  beforeEvidence,
  afterEvidence
}) => {
  const recap = generateTeacherRecap(beforeEvidence, afterEvidence);

  const [recapNotes, setRecapNotes] = useState<string>(recap.defaultRecapDraft);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    setRecapNotes(recap.defaultRecapDraft);
  }, [recap.defaultRecapDraft]);

  const handleSaveRecap = () => {
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const learningLoop = [
    'Teach',
    'Communicate',
    'Demonstrate',
    'Identify Gap',
    'Reinforce',
    'Recheck',
    'Recap'
  ];

  return (
    <section aria-labelledby="teacher-dashboard-title" className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="teacher-dashboard-title" className="text-2xl font-bold tracking-tight text-slate-900">
              Classroom Evidence & Teacher Dashboard
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Teacher Mode
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Student: <strong className="text-slate-900 font-bold">Ananya</strong> • Topic: <strong className="text-slate-900">Water Cycle</strong>
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-indigo-950 text-sm font-semibold flex items-center gap-2 self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{recap.summarySentence}</span>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Inclusive Learning Loop
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {learningLoop.map((step, idx) => (
            <React.Fragment key={step}>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                {step}
              </span>
              {idx < learningLoop.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
              Generated Teacher Recap
            </span>
            <h4 className="text-lg font-bold text-white mt-0.5">
              {recap.suggestedFocus}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              type="button"
              className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors self-start cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Cancel Edit' : 'Edit Recap'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <label htmlFor="recap-notes-input" className="text-xs text-indigo-200 block">
              Edit tomorrow's recap lesson plan notes (Teacher Approves):
            </label>
            <textarea
              id="recap-notes-input"
              rows={3}
              value={recapNotes}
              onChange={(e) => setRecapNotes(e.target.value)}
              className="w-full text-sm bg-white/10 text-white border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleSaveRecap}
              type="button"
              className="min-h-[44px] px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              Approve & Save Recap
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {recapNotes}
            </p>
            {savedSuccess && (
              <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Recap approved and saved!
              </p>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
          <span>
            Reinforced Concept: <strong className="text-white">{recap.reinforcedNode ? `${recap.reinforcedNode.symbol} ${recap.reinforcedNode.label}` : 'None'}</strong>
          </span>
          <span>•</span>
          <span>
            Next Target Concept: <strong className="text-white">{recap.nextNode ? `${recap.nextNode.symbol} ${recap.nextNode.label}` : 'None'}</strong>
          </span>
        </div>
      </div>
    </section>
  );
};
