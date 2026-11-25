import React from 'react';
import { GraphEvidenceEvaluation, EvidenceStatus } from '../../types/conceptGraph';
import { generateTeacherRecap } from '../../engine/evidenceEngine';
import { CheckCircle2, AlertTriangle, CircleDashed, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface EvidenceDashboardScreenProps {
  beforeEvidence: GraphEvidenceEvaluation | null;
  afterEvidence: GraphEvidenceEvaluation | null;
  language?: 'EN' | 'KN';
  onRetry: () => void;
}

export const EvidenceDashboardScreen: React.FC<EvidenceDashboardScreenProps> = ({
  beforeEvidence,
  afterEvidence,
  language = 'EN',
  onRetry,
}) => {
  const recap = generateTeacherRecap(beforeEvidence, afterEvidence);

  const renderStatusItem = (status: EvidenceStatus, label: string, kannadaLabel?: string) => {
    const displayLabel = language === 'KN' ? (kannadaLabel || label) : label;
    const subLabel = language === 'KN' ? label : kannadaLabel;

    switch (status) {
      case 'GREEN':
        return (
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" aria-label="Demonstrated status" />
            <div className="flex items-baseline gap-1.5">
              <span>{displayLabel}</span>
              {subLabel && <span className="text-[10px] text-slate-400 font-normal">({subLabel})</span>}
            </div>
            <span className="text-[11px] text-emerald-800 font-bold ml-auto bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span>🟢</span>
              <span>{language === 'KN' ? 'ಪ್ರದರ್ಶಿಸಲಾಗಿದೆ' : 'Demonstrated'}</span>
            </span>
          </div>
        );
      case 'YELLOW':
        return (
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-amber-950 bg-amber-50/80 p-3 rounded-xl border border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-label="Needs reinforcement status" />
            <div className="flex items-baseline gap-1.5">
              <span>{displayLabel}</span>
              {subLabel && <span className="text-[10px] text-amber-700 font-semibold">({subLabel})</span>}
            </div>
            <span className="text-[11px] text-amber-900 font-bold ml-auto bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span>🟡</span>
              <span>{language === 'KN' ? 'ಬಲವರ್ಧನೆ ಅಗತ್ಯವಿದೆ' : 'Needs reinforcement'}</span>
            </span>
          </div>
        );
      case 'WHITE':
      default:
        return (
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-400 p-3 rounded-xl border border-dashed border-slate-200 bg-white">
            <CircleDashed className="w-4 h-4 text-slate-300 shrink-0" aria-label="Not yet demonstrated status" />
            <div className="flex items-baseline gap-1.5">
              <span>{displayLabel}</span>
              {subLabel && <span className="text-[10px] text-slate-300">({subLabel})</span>}
            </div>
            <span className="text-[11px] text-slate-400 ml-auto font-normal flex items-center gap-1">
              <span>⚪</span>
              <span>{language === 'KN' ? 'ಇನ್ನೂ ಪ್ರದರ್ಶಿಸಲಾಗಿಲ್ಲ' : 'Not yet demonstrated'}</span>
            </span>
          </div>
        );
    }
  };

  const beforeNodes = beforeEvidence?.orderedResults || [];
  const afterNodes = afterEvidence?.orderedResults || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Legend header matching Section 3: No color-only meaning */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>🟢 Demonstrated</span>
        </div>
        <div className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>🟡 Needs reinforcement</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <CircleDashed className="w-4 h-4 text-slate-400" />
          <span>⚪ Not yet demonstrated</span>
        </div>
      </div>

      {/* Side-by-side comparison boxes: Before (Attempt 1) -> After (Attempt 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left: Before (Attempt 1) */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-center font-bold text-slate-900 text-sm sm:text-base mb-4 border-b border-slate-200/80 pb-2.5 flex items-center justify-center gap-2">
              <span>{language === 'KN' ? 'ಮೊದಲ ಪ್ರಯತ್ನ (First Try)' : 'First Try (Attempt 1)'}</span>
              <span className="text-xs bg-amber-100/80 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">Initial</span>
            </div>
            <div className="space-y-2">
              {beforeNodes.length > 0 ? (
                beforeNodes.map((n) => (
                  <div key={n.nodeId}>
                    {renderStatusItem(n.status, n.label, n.kannadaLabel)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-8">
                  {language === 'KN' ? 'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಯತ್ನ ದಾಖಲಾಗಿಲ್ಲ.' : 'No attempt recorded yet. Build your story in Tell the Story!'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: After (Attempt 2) */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-center font-bold text-slate-900 text-sm sm:text-base mb-4 border-b border-slate-200/80 pb-2.5 flex items-center justify-center gap-2">
              <span>{language === 'KN' ? 'ಅಭ್ಯಾಸದ ನಂತರ (After Practice)' : 'After Practice (Attempt 2)'}</span>
              <span className="text-xs bg-emerald-100/80 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">Practiced</span>
            </div>
            <div className="space-y-2">
              {afterNodes.length > 0 ? (
                afterNodes.map((n) => (
                  <div key={n.nodeId}>
                    {renderStatusItem(n.status, n.label, n.kannadaLabel)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 italic mb-3">
                    {language === 'KN'
                      ? 'ಮಗು ಬಲವರ್ಧನೆಯನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿದೆ ಮತ್ತು ಮರುಪ್ರಯತ್ನಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ.'
                      : 'You practiced the concept and are ready to try the story again!'}
                  </p>
                  <button
                    onClick={() => {
                      sounds.playSuccessChime();
                      onRetry();
                    }}
                    type="button"
                    aria-label="Practice and retry story"
                    className="min-h-[44px] px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <span>{language === 'KN' ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Retry Story)' : 'Try Story Again (Retry)'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Derived Teacher Pedagogical Continuation Banner (Pure Deterministic - Never Hardcoded) */}
      <div className="bg-gradient-to-r from-amber-50/80 via-emerald-50/60 to-blue-50/60 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-float">⭐</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              {language === 'KN' ? 'ಶಿಕ್ಷಕರ ಮುಂದಿನ ಯೋಜನೆ (Teacher Next Step)' : "Teacher's Next Teaching Plan"}
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {recap.summarySentence}
            </span>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-white border border-emerald-300 rounded-xl text-emerald-800 shadow-2xs shrink-0">
          Teacher Guide
        </span>
      </div>

      {/* Learning Loop Process Map */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
          {language === 'KN' ? 'ನಾವು ಒಟ್ಟಿಗೆ ಕಲಿಯುವ ವಿಧಾನ (How We Learn Together)' : 'How We Learn Together'}
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span>📖 Teach</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span>💬 Communicate</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span>🧩 Demonstrate</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold">
            <span>🔁 Reinforce</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold">
            <span>✅ Recheck</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold">
            <span>🏆 Recap</span>
          </div>
        </div>
      </div>
    </div>
  );
};