import React from 'react';
import { Info } from 'lucide-react';

export const LimitationsPanel: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Support signal, not assessment.
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Core ethical boundary and operational principles
          </p>
        </div>
      </div>

      <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl">
        <p className="text-sm font-bold text-indigo-950 leading-relaxed">
          “SAMBHAV records demonstrated evidence against the teacher-approved Concept Graph. It does not diagnose, grade intelligence, or determine ability. Teacher decides.”
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-600">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
          <span className="font-black text-slate-800 block">• Voice is optional</span>
          <p className="leading-snug">Visual tap-to-communicate and teach-back sequences function fully without requiring speech production.</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
          <span className="font-black text-slate-800 block">• Speech recognition not required</span>
          <p className="leading-snug">The product does not listen or evaluate audio pronunciation. Non-speaking children confirm concepts visually.</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
          <span className="font-black text-slate-800 block">• Kannada TTS device dependency</span>
          <p className="leading-snug">SpeechSynthesis in Kannada depends on host device voice engines. When unavailable, text displays cleanly without crashing.</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
          <span className="font-black text-slate-800 block">• Prototype scope</span>
          <p className="leading-snug">This prototype currently demonstrates the Water Cycle lesson milestone sequence and teacher ingestion flow.</p>
        </div>
      </div>

      {/* Validation Section (Strict adherence to section 6: No fabricated claims) */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
          Validation
        </h4>
        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs text-slate-500 italic">
          "[Insert verified educator observation here]"
        </div>
      </div>
    </div>
  );
};
