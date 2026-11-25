import React from 'react';
import { Play, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
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
    { num: '01', title: 'Lesson Prep', desc: 'Curriculum text ingestion or NCERT canonical topics', icon: '📖' },
    { num: '02', title: 'Concept DAG', desc: 'Canonical prerequisite graph (Sun → Heat → Evap...)', icon: '🗺️' },
    { num: '03', title: 'AAC Multi-Sensory', desc: 'Touch-first visual, procedural audio & haptics', icon: '💬' },
    { num: '04', title: 'Teach-Back', desc: 'Student constructs causal sequence chain', icon: '🧩' },
    { num: '05', title: 'Evidence Engine', desc: 'Deterministic assessment: 🟢 Mastered | 🟡 Needs Practice', icon: '📊' },
    { num: '06', title: 'Reinforce', desc: 'Targeted tactile checkpoints on weak transitions', icon: '🔁' },
    { num: '07', title: 'Spaced Exam Plan', desc: 'Automated +2d, +7d, +21d retention schedule', icon: '📋' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full text-[11px] font-bold text-indigo-700 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Judge & Educator Architecture Overview</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Complete Closed-Loop Learning Pipeline
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            How SAMBHAV 2.0 turns student multimodal interaction into deterministic diagnostic evidence and teacher action.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <button
            onClick={() => {
              sounds.playSuccessChime();
              onStartDemo();
            }}
            type="button"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch 1-Click Demo</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              onExploreFreely();
            }}
            type="button"
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Explore Freely
          </button>
        </div>
      </div>

      {/* 7-Step Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {steps.map((s, idx) => (
          <div
            key={s.num}
            className="relative p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col justify-between space-y-3 group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {s.num}
              </span>
              <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-900 leading-tight">
                {s.title}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                {s.desc}
              </p>
            </div>

            {idx < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 pointer-events-none">
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Core Architectural Trust Guarantee Bar */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-800">
            Pedagogical Integrity:
          </span>
          <span className="text-slate-600 font-medium">
            Grading is 100% deterministic (zero LLM hallucination). AI is reserved for simulation generation.
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
          <span>• Offline-Ready</span>
          <span>• Dual Bilingual (EN/KN)</span>
          <span>• Zero Student PII Leakage</span>
        </div>
      </div>
    </div>
  );
};
