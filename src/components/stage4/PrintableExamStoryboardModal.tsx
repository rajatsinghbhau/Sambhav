import React from 'react';
import { ExamRevisionPlan } from '../../types/stage4';
import { ConceptGraph } from '../../types/conceptGraph';
import { Printer, X, Sparkles, CheckSquare, Clock } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface PrintableExamStoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  graph: ConceptGraph;
  plan: ExamRevisionPlan;
  language?: 'EN' | 'KN';
}

export const PrintableExamStoryboardModal: React.FC<PrintableExamStoryboardModalProps> = ({
  isOpen,
  onClose,
  graph,
  plan,
  language = 'EN'
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sounds.playPop();
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-storyboard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border-2 border-slate-200 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[94vh] overflow-y-auto overflow-x-hidden print:p-0 print:border-none print:shadow-none print:max-h-full">
        {/* Header (hidden in print or styled neatly) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-100 text-indigo-900 border border-indigo-200">
                1-Page Inclusive Visual Storyboard
              </span>
              <span className="text-xs font-bold text-slate-500">
                Exam Target: {plan.examDate}
              </span>
            </div>
            <h3 id="print-storyboard-title" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {graph.title || 'Water Cycle'} — Complete Exam Revision Storyboard
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Child-friendly visual sequence, tactile concept milestones, and self-check guide for home and classroom revision.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden shrink-0 self-end sm:self-center">
            <button
              onClick={handlePrint}
              type="button"
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Storyboard Step-by-Step Flow */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>🗺️</span>
            <span>Step-by-Step Storyboard Flow (Follow the Arrows)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {graph.nodes.map((node, idx) => (
              <div
                key={node.id}
                className="p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col items-center justify-between text-center space-y-1 print:border-slate-400"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-3xl my-1" aria-hidden="true">{node.symbol}</span>
                <span className="text-xs font-black text-slate-900 leading-tight">
                  {language === 'KN' ? (node.kannadaLabel || node.label) : node.label}
                </span>
                <span className="text-[10px] text-slate-500 font-bold leading-tight line-clamp-2">
                  {node.explanation}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Session Strategic Exam Roadmap */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>📅</span>
            <span>Daily 15-Minute Strategic Revision Roadmap</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plan.sessions.map(s => (
              <div
                key={s.dayNumber}
                className="p-4 rounded-2xl bg-white border-2 border-slate-200 space-y-1.5 shadow-2xs print:border-slate-400"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-indigo-600 text-white uppercase">
                    Day {s.dayNumber}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.duration} min
                  </span>
                </div>
                <h5 className="text-xs font-black text-slate-900 leading-tight">
                  {s.topic}
                </h5>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {s.description}
                </p>
                <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Student Self-Check Complete</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Memory Analogies for Students */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-2 print:border-slate-400">
          <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Essential Memory Analogies for Inclusive AAC Students</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
            <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200">
              <strong className="block text-amber-950 mb-0.5">☀️ Heat & Evaporation:</strong>
              <span>Like a wet towel drying quickly on a sunny clothesline. Water floats away into the air.</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200">
              <strong className="block text-amber-950 mb-0.5">☁️ Condensation:</strong>
              <span>Like drops forming on the outside of cold chilled water glass. Cool air turns vapour into drops.</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200">
              <strong className="block text-amber-950 mb-0.5">🌧️ Precipitation:</strong>
              <span>When the cloud holds too many water drops, they become too heavy and fall down as rain.</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          SAMBHAV 2.0 Concept-Graph Inclusive Classroom • Trust Principle: AI suggests. Teacher approves. Child confirms.
        </div>
      </div>
    </div>
  );
};
