import React from 'react';
import { ArrowDown, Play, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface JudgeLandingFlowProps {
  onStartDemo: () => void;
  onExploreFreely: () => void;
}

export const JudgeLandingFlow: React.FC<JudgeLandingFlowProps> = ({
  onStartDemo,
  onExploreFreely,
}) => {
  const steps = [
    { title: 'Lesson', desc: 'Teacher prepares Water Cycle text or curriculum', icon: '📖' },
    { title: 'Concept Graph', desc: 'Canonical linear milestones (Sun → Heat → Water → ...)', icon: '🗺️' },
    { title: 'Communication', desc: 'Accessible touch-first AAC communication board with audio speech', icon: '💬' },
    { title: 'Teach-Back', desc: 'Child constructs concept sequence (Attempt 1: Condensation early)', icon: '🧩' },
    { title: 'Demonstrated Evidence', desc: 'Deterministic predecessor rule: 🟢 Demonstrated | 🟡 Needs reinforcement', icon: '📊' },
    { title: 'Reinforcement', desc: 'Targeted practice check on weak concept (Condensation)', icon: '🔁' },
    { title: 'Teacher Recap', desc: 'Derived pedagogical continuation: “Condensation reinforced. Rain next.”', icon: '📋' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 space-y-8 shadow-sm animate-in fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-700">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>SAMBHAV 2.0 Product Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Inclusive Classroom Learning Flow
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Understand the complete child and teacher journey in seconds.
        </p>

        {/* Master One-Click Demo Mode Button */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              sounds.playSuccessChime();
              onStartDemo();
            }}
            type="button"
            className="min-h-[52px] px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-base shadow-lg shadow-indigo-600/30 flex items-center gap-2.5 transition-all cursor-pointer classy-btn"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start One-Click Demo</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              onExploreFreely();
            }}
            type="button"
            className="min-h-[52px] px-6 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm cursor-pointer classy-btn"
          >
            Explore Freely
          </button>
        </div>
      </div>

      {/* Vertical Linear Flow Diagram matching Section 8 requirements */}
      <div className="max-w-xl mx-auto space-y-2 pt-2">
        {steps.map((s, idx) => (
          <React.Fragment key={s.title}>
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center gap-4 shadow-2xs hover:border-indigo-300 transition-colors">
              <span className="text-3xl p-2 bg-white rounded-xl shadow-2xs shrink-0">{s.icon}</span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block">Step {idx + 1}</span>
                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{s.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{s.desc}</p>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex justify-center text-slate-300 py-0.5">
                <ArrowDown className="w-4 h-4 text-indigo-400" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
