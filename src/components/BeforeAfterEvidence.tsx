import React from 'react';
import { GraphEvidenceEvaluation, EvidenceStatus } from '../types/conceptGraph';
import { ArrowDown, CheckCircle2, AlertTriangle, CircleDashed } from 'lucide-react';

interface BeforeAfterEvidenceProps {
  beforeEvidence: GraphEvidenceEvaluation | null;
  afterEvidence: GraphEvidenceEvaluation | null;
}

export const BeforeAfterEvidence: React.FC<BeforeAfterEvidenceProps> = ({
  beforeEvidence,
  afterEvidence
}) => {
  if (!beforeEvidence && !afterEvidence) {
    return null;
  }

  const renderBadge = (status: EvidenceStatus, label: string) => {
    switch (status) {
      case 'GREEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span aria-hidden="true">🟢</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>{label}</span>
          </span>
        );
      case 'YELLOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span aria-hidden="true">🟡</span>
            <AlertTriangle className="w-3 h-3 text-amber-700" />
            <span>{label}</span>
          </span>
        );
      case 'WHITE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            <span aria-hidden="true">⚪</span>
            <CircleDashed className="w-3 h-3 text-slate-500" />
            <span>{label}</span>
          </span>
        );
    }
  };

  // Compare each node from before to after
  const nodes = afterEvidence?.orderedResults || beforeEvidence?.orderedResults || [];

  return (
    <section aria-labelledby="before-after-title" className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
        <div>
          <h2 id="before-after-title" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Before / After Evidence Comparison
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Persisted evidence records comparing Attempt 1 against Retry Teach-Back. Derived purely from actual evidence data.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node) => {
          const beforeNode = beforeEvidence?.results[node.nodeId];
          const afterNode = afterEvidence?.results[node.nodeId];

          const isReinforcedTransition =
            beforeNode?.status === 'YELLOW' && afterNode?.status === 'GREEN';

          return (
            <div
              key={node.nodeId}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                isReinforcedTransition
                  ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl" aria-hidden="true">{node.symbol}</span>
                    <span className="font-bold text-slate-900 text-sm">{node.label}</span>
                  </div>
                  {isReinforcedTransition && (
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-600 text-white tracking-wider">
                      Reinforced
                    </span>
                  )}
                </div>

                {/* Transition flow */}
                <div className="space-y-2 py-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Attempt 1:</span>
                    {beforeNode
                      ? renderBadge(beforeNode.status, beforeNode.statusLabel)
                      : <span className="text-slate-400 italic">No record</span>}
                  </div>

                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className={`w-4 h-4 ${isReinforcedTransition ? 'text-indigo-600 animate-bounce' : ''}`} />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Retry:</span>
                    {afterNode
                      ? renderBadge(afterNode.status, afterNode.statusLabel)
                      : <span className="text-slate-400 italic">No record</span>}
                  </div>
                </div>
              </div>

              {isReinforcedTransition && (
                <div className="mt-3 pt-2.5 border-t border-indigo-200 text-center">
                  <span className="text-xs font-bold text-indigo-900">
                    🟡 Needs reinforcement → 🟢 Demonstrated
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
