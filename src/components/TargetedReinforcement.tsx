import React, { useState } from 'react';
import { NodeEvidenceResult } from '../types/conceptGraph';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface TargetedReinforcementProps {
  weakConcept: NodeEvidenceResult | null;
  onCompleteReinforcement: () => void;
}

export const TargetedReinforcement: React.FC<TargetedReinforcementProps> = ({
  weakConcept,
  onCompleteReinforcement
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  if (!weakConcept) {
    return (
      <section aria-labelledby="reinforcement-title" className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <h2 id="reinforcement-title" className="text-xl font-bold text-slate-900 mb-2">
          Targeted Reinforcement
        </h2>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>All currently introduced milestones are demonstrated! No weak concept identified.</span>
        </div>
      </section>
    );
  }

  // Grounded practice choices based on the concept
  const practiceOptions = [
    { id: 'opt-correct', text: weakConcept.explanation, isCorrect: true },
    { id: 'opt-incorrect1', text: 'Water turns directly into solid stone when heated.', isCorrect: false },
    { id: 'opt-incorrect2', text: 'Wind stops all water from moving forever.', isCorrect: false }
  ];

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    setSelectedChoice(optionId);
    setIsAnswered(true);
    if (isCorrect) {
      // confirmed
    }
  };

  const isCorrectSelected = selectedChoice === 'opt-correct';

  return (
    <section aria-labelledby="reinforcement-title" className="bg-amber-50/50 border-2 border-amber-300 rounded-2xl p-6 md:p-8 shadow-sm animate-in fade-in">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
          Targeted Reinforcement
        </span>
        <span className="text-xs text-slate-500 font-medium">
          Priority: {weakConcept.status === 'YELLOW' ? 'First YELLOW Node' : 'First WHITE Node'}
        </span>
      </div>

      <h2 id="reinforcement-title" className="text-2xl font-bold text-slate-900">
        Let's reinforce {weakConcept.label}
      </h2>

      {/* Explanation Box */}
      <div className="my-4 p-5 bg-white border border-amber-200 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" aria-hidden="true">{weakConcept.symbol}</span>
          <h3 className="font-bold text-slate-900 text-lg">{weakConcept.label}</h3>
        </div>
        <p className="text-base text-slate-700 italic border-l-4 border-amber-400 pl-3.5 my-2">
          “{weakConcept.explanation}”
        </p>
      </div>

      {/* Concept-Grounded Practice Question */}
      <div className="mt-6 bg-white p-5 rounded-xl border border-slate-200">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Concept Check: What best describes {weakConcept.label}?
        </h4>

        <div className="space-y-2.5">
          {practiceOptions.map((opt) => {
            const isSelected = selectedChoice === opt.id;
            let btnStyle = 'border-slate-200 bg-slate-50/50 text-slate-800 hover:bg-slate-100 hover:border-slate-300';
            if (isSelected) {
              btnStyle = opt.isCorrect
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300'
                : 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-200';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id, opt.isCorrect)}
                type="button"
                className={`w-full min-h-[48px] p-3 rounded-xl border text-left text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                aria-label={`Choice: ${opt.text}`}
              >
                <span className="text-slate-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              {isCorrectSelected ? (
                <p className="text-emerald-700 font-semibold text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Great job! You confirmed understanding of {weakConcept.label}.
                </p>
              ) : (
                <p className="text-rose-600 font-semibold text-sm">
                  Review the explanation above and try selecting the matching concept definition.
                </p>
              )}
            </div>

            <button
              onClick={onCompleteReinforcement}
              type="button"
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 active:scale-95 transition-all text-sm flex items-center gap-2 cursor-pointer shadow-sm self-end sm:self-auto"
            >
              <span>Proceed to Retry Teach-Back</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
