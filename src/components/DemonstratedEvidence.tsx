import React from 'react';
import { GraphEvidenceEvaluation } from '../types/conceptGraph';
import { CheckCircle2, AlertTriangle, CircleDashed, ShieldCheck } from 'lucide-react';

interface DemonstratedEvidenceProps {
  evaluation: GraphEvidenceEvaluation;
}

export const DemonstratedEvidence: React.FC<DemonstratedEvidenceProps> = ({ evaluation }) => {
  const getStatusBadge = (status: 'GREEN' | 'YELLOW' | 'WHITE', label: string) => {
    switch (status) {
      case 'GREEN':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span aria-hidden="true">🟢</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{label}</span>
          </div>
        );
      case 'YELLOW':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span aria-hidden="true">🟡</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>{label}</span>
          </div>
        );
      case 'WHITE':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            <span aria-hidden="true">⚪</span>
            <CircleDashed className="w-3.5 h-3.5 text-slate-500" />
            <span>{label}</span>
          </div>
        );
    }
  };

  const getCardBorder = (status: 'GREEN' | 'YELLOW' | 'WHITE') => {
    switch (status) {
      case 'GREEN':
        return 'border-emerald-300 bg-emerald-50/30';
      case 'YELLOW':
        return 'border-amber-300 bg-amber-50/30';
      case 'WHITE':
      default:
        return 'border-slate-200 bg-white opacity-85';
    }
  };

  return (
    <section aria-labelledby="demonstrated-evidence-title" className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="demonstrated-evidence-title" className="text-2xl font-bold tracking-tight text-slate-900">
              Demonstrated Evidence
            </h2>
            <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Deterministic Evaluation
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Pure rule-based verification against graph milestones. No grades, scores, or AI speculation.
          </p>
        </div>

        {/* Accessible Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200">
            🟢 Demonstrated
          </span>
          <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200">
            🟡 Needs reinforcement
          </span>
          <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
            ⚪ Not yet demonstrated
          </span>
        </div>
      </div>

      {/* Grid of Nodes with Evidence Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
        {evaluation.orderedResults.map(res => (
          <div
            key={res.nodeId}
            className={`border-2 rounded-xl p-4 transition-all flex flex-col justify-between ${getCardBorder(res.status)}`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">{res.symbol}</span>
                  <h3 className="font-bold text-slate-900 text-base">{res.label}</h3>
                </div>
                {getStatusBadge(res.status, res.statusLabel)}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {res.explanation}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Node ID: <code className="font-mono">{res.nodeId}</code></span>
              <span className="font-medium">
                {res.status === 'GREEN' && '✓ Predecessor verified'}
                {res.status === 'YELLOW' && '⚠ Predecessor missing/later'}
                {res.status === 'WHITE' && '— Absent from chain'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
