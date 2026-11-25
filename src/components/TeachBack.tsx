import React from 'react';
import { ConceptGraph } from '../types/conceptGraph';
import { DISTRACTOR_NODES } from '../data/canonicalGraph';
import { ArrowLeft, ArrowRight, X, Plus, RotateCcw, Play, Check, RefreshCw } from 'lucide-react';

interface TeachBackProps {
  graph: ConceptGraph;
  chain: string[];
  onChangeChain: (newChain: string[]) => void;
  onStartDemo: () => void;
  onAutofillCorrect: () => void;
  onReset: () => void;
  // Stage 2 props
  onRetryTeachBack?: () => void;
  showRetryButton?: boolean;
}

export const TeachBack: React.FC<TeachBackProps> = ({
  graph,
  chain,
  onChangeChain,
  onStartDemo,
  onAutofillCorrect,
  onReset,
  onRetryTeachBack,
  showRetryButton = false
}) => {
  // Available concept bank: 7 canonical + 2 distractors
  const allBankItems: { id: string; label: string; symbol: string; isDistractor?: boolean }[] = [
    ...graph.nodes.map(n => ({ id: n.id, label: n.label, symbol: n.symbol })),
    ...DISTRACTOR_NODES.map(d => ({ id: d.id, label: d.label, symbol: d.symbol, isDistractor: true }))
  ];

  const handleAdd = (id: string) => {
    onChangeChain([...chain, id]);
  };

  const handleRemove = (indexToRemove: number) => {
    onChangeChain(chain.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const newArr = [...chain];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    onChangeChain(newArr);
  };

  const handleMoveRight = (index: number) => {
    if (index >= chain.length - 1) return;
    const newArr = [...chain];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    onChangeChain(newArr);
  };

  const getItemDetails = (id: string) => {
    const item = allBankItems.find(i => i.id === id);
    if (item) return item;
    return { id, label: id, symbol: '🔹', isDistractor: true };
  };

  return (
    <section aria-labelledby="teach-back-title" className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 id="teach-back-title" className="text-2xl font-bold tracking-tight text-slate-900">
            Teach-Back
          </h2>
          <p className="text-slate-600 font-medium text-base mt-0.5">
            Build the Water Cycle
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tap cards from the concept bank to add, reorder, or remove. Not a multiple-choice quiz.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onStartDemo}
            type="button"
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-200 shadow-sm flex items-center gap-2 cursor-pointer transition-all text-sm"
            aria-label="Start Demo / Attempt 1"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Demo (Attempt 1)
          </button>

          {showRetryButton && onRetryTeachBack && (
            <button
              onClick={onRetryTeachBack}
              type="button"
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-200 shadow-sm flex items-center gap-2 cursor-pointer transition-all text-sm animate-pulse"
              aria-label="Retry Teach-Back"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Teach-Back (Attempt 2)
            </button>
          )}

          <button
            onClick={onAutofillCorrect}
            type="button"
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-200 shadow-sm flex items-center gap-2 cursor-pointer transition-all text-sm"
            aria-label="Autofill correct chain"
          >
            <Check className="w-4 h-4" />
            Autofill correct chain
          </button>

          <button
            onClick={onReset}
            type="button"
            className="min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 active:scale-95 focus:outline-none focus:ring-4 focus:ring-slate-100 flex items-center gap-2 cursor-pointer transition-all text-sm"
            aria-label="Reset chain"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            Clear
          </button>
        </div>
      </div>

      {/* Child's Constructed Chain */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Child's Chain ({chain.length} {chain.length === 1 ? 'item' : 'items'})
          </h3>
          {chain.length > 0 && (
            <span className="text-xs text-slate-500">
              Live deterministic evidence updates automatically
            </span>
          )}
        </div>

        {chain.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/60">
            <p className="text-slate-600 font-medium">The chain is currently empty.</p>
            <p className="text-xs text-slate-500 mt-1">
              Select concepts from the bank below or click <strong className="text-indigo-600">Start Demo</strong> to seed Attempt 1.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[96px]">
            {chain.map((id, index) => {
              const item = getItemDetails(id);
              return (
                <div
                  key={`${id}-${index}`}
                  className="bg-white border-2 border-indigo-200 rounded-xl p-2.5 flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-95"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xl" aria-hidden="true">{item.symbol}</span>
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                    <button
                      onClick={() => handleMoveLeft(index)}
                      disabled={index === 0}
                      type="button"
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`Move ${item.label} left`}
                      title="Move left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveRight(index)}
                      disabled={index === chain.length - 1}
                      type="button"
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`Move ${item.label} right`}
                      title="Move right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      type="button"
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 ml-0.5"
                      aria-label={`Remove ${item.label}`}
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Concept Bank */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Concept Bank (Tap to Add to Chain)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {allBankItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleAdd(item.id)}
              type="button"
              className={`min-h-[54px] min-w-[48px] p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center group ${
                item.isDistractor
                  ? 'border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 hover:border-amber-400'
                  : 'border-slate-200 bg-white hover:bg-indigo-50/70 hover:border-indigo-400 shadow-2xs'
              }`}
              aria-label={`Add ${item.label} to chain`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">
                {item.symbol}
              </span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                {item.label}
                <Plus className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
