import React from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { DISTRACTOR_NODES } from '../../data/canonicalGraph';
import { RotateCcw, X, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface TeachBackScreenProps {
  graph: ConceptGraph;
  language?: 'EN' | 'KN';
  chain: string[];
  onChangeChain: (chain: string[]) => void;
  onCheckChain: () => void;
  onClear: () => void;
  onSeedAttempt1: () => void;
  onSeedAttempt2: () => void;
}

export const TeachBackScreen: React.FC<TeachBackScreenProps> = ({
  graph,
  language = 'EN',
  chain,
  onChangeChain,
  onCheckChain,
  onClear,
  onSeedAttempt1,
  onSeedAttempt2,
}) => {
  const allBankItems = [
    ...graph.nodes.map(n => ({
      id: n.id,
      label: n.label,
      kannadaLabel: n.kannadaLabel,
      symbol: n.symbol,
      isDistractor: false
    })),
    ...DISTRACTOR_NODES.map(d => ({
      id: d.id,
      label: d.label,
      kannadaLabel: d.kannadaLabel,
      symbol: d.symbol,
      isDistractor: true
    }))
  ];

  const handleAdd = (id: string) => {
    sounds.playPop();
    onChangeChain([...chain, id]);
  };

  const handleRemove = (index: number) => {
    sounds.playWhoosh();
    onChangeChain(chain.filter((_, idx) => idx !== index));
  };

  const getItem = (id: string) => {
    return allBankItems.find(i => i.id === id) || { id, label: id, kannadaLabel: id, symbol: '🔹', isDistractor: false };
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'KN' ? 'ಜಲಚಕ್ರವನ್ನು ನಿರ್ಮಿಸಿ (Build the Water Cycle)' : 'Build the Water Cycle'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
          {language === 'KN'
            ? 'ನಿಮ್ಮ ಸರಪಳಿಯನ್ನು ನಿರ್ಮಿಸಲು ಬಲಭಾಗದಲ್ಲಿರುವ ಪರಿಕಲ್ಪನಾ ಬ್ಯಾಂಕ್‌ನಿಂದ ಕಾರ್ಡ್‌ಗಳನ್ನು ಸ್ಪರ್ಶಿಸಿ'
            : 'Tap cards from the Concept Bank on the right to build your chain'}
        </p>
      </div>

      {/* Main Builder Grid: Chain on the Left, Concept Bank on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Columns: Active Chain Sequence */}
        <div className="lg:col-span-3 bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/20 border-2 border-slate-200 rounded-3xl p-6 min-h-[240px]">
          {chain.length === 0 ? (
            <div className="h-48 border-3 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-white/60">
              <span className="text-4xl mb-2 animate-bounce">🧩</span>
              <p className="text-base font-extrabold text-slate-800">
                {language === 'KN' ? 'ನಿಮ್ಮ ಸರಪಳಿ ಖಾಲಿಯಾಗಿದೆ' : 'Your chain is empty'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Tap cards from the Concept Bank, or click the Judge Shortcuts below to simulate child attempts.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {chain.map((id, index) => {
                const item = getItem(id);
                const isFirst = index === 0;
                const displayLabel = language === 'KN' ? (item.kannadaLabel || item.label) : item.label;

                return (
                  <React.Fragment key={`${id}-${index}`}>
                    <div
                      className={`relative px-4 py-3 rounded-2xl border-2 flex flex-col items-center text-center shadow-xs transition-all btn-tactile min-w-[80px] ${
                        isFirst
                          ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <button
                        onClick={() => handleRemove(index)}
                        type="button"
                        aria-label={`Remove ${displayLabel}`}
                        className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-rose-500 hover:bg-rose-600 active:scale-90 text-white rounded-full flex items-center justify-center text-xs shadow-md cursor-pointer transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="text-3xl mb-1" aria-hidden="true">{item.symbol}</span>
                      <span className="text-xs font-black text-slate-900">{displayLabel}</span>
                    </div>

                    {index < chain.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-blue-500 stroke-[3] shrink-0" aria-hidden="true" />
                    )}
                  </React.Fragment>
                );
              })}

              {/* Dashed placeholder box */}
              <div className="w-20 h-24 border-3 border-dashed border-blue-300 rounded-2xl flex items-center justify-center text-blue-400 text-2xl font-bold bg-white/50" aria-hidden="true">
                +
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Concept Bank Card */}
        <div className="lg:col-span-1 bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 text-center">
            {language === 'KN' ? 'ಪರಿಕಲ್ಪನಾ ಬ್ಯಾಂಕ್ (Concept Bank)' : 'Concept Bank'}
          </h3>
          <div className="space-y-2">
            {allBankItems.map((item) => {
              const displayLabel = language === 'KN' ? (item.kannadaLabel || item.label) : item.label;

              return (
                <button
                  key={item.id}
                  onClick={() => handleAdd(item.id)}
                  type="button"
                  aria-label={`Add ${displayLabel} to chain`}
                  className={`w-full min-h-[50px] p-2.5 rounded-2xl border-2 flex items-center gap-3 text-left transition-all cursor-pointer font-bold text-xs shadow-2xs btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    item.isDistractor
                      ? 'border-slate-200 bg-white hover:border-slate-400 text-slate-600'
                      : 'border-blue-200 bg-white hover:border-blue-400 text-blue-950'
                  }`}
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">{item.symbol}</span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{displayLabel}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {language === 'KN' ? item.label : item.kannadaLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons & Judge Script Shortcuts */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <button
          onClick={() => {
            sounds.playWhoosh();
            onClear();
          }}
          type="button"
          aria-label="Clear all concepts from chain"
          className="min-h-[48px] px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 flex items-center gap-2 cursor-pointer btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{language === 'KN' ? 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ' : 'Clear All'}</span>
        </button>

        {/* Judge Shortcuts */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <span className="text-[11px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
            Judge Shortcuts:
          </span>
          <button
            onClick={onSeedAttempt1}
            type="button"
            aria-label="Seed Attempt 1 (Condensation early)"
            className="min-h-[48px] px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-extrabold text-xs hover:bg-amber-100 cursor-pointer shadow-2xs btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Attempt 1 (Condensation early)
          </button>
          <button
            onClick={onSeedAttempt2}
            type="button"
            aria-label="Seed Attempt 2 (Ordered retry)"
            className="min-h-[48px] px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-xs hover:bg-emerald-100 cursor-pointer shadow-2xs btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Attempt 2 (Ordered retry)
          </button>
        </div>

        {/* Check Chain Button */}
        <button
          onClick={onCheckChain}
          type="button"
          aria-label="Evaluate demonstrated evidence against concept graph"
          className="min-h-[48px] px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span>✓ {language === 'KN' ? 'ನನ್ನ ಸರಪಳಿಯನ್ನು ಪರೀಕ್ಷಿಸಿ' : 'Check My Chain'}</span>
        </button>
      </div>
    </div>
  );
};