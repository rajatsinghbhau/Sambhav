import React from 'react';
import { ConceptGraph } from '../types/conceptGraph';
import { ArrowRight, Info } from 'lucide-react';

interface ConceptGraphViewerProps {
  graph: ConceptGraph;
  onEditLabel?: (nodeId: string, newLabel: string) => void;
  isTeacherMode?: boolean;
}

export const ConceptGraphViewer: React.FC<ConceptGraphViewerProps> = ({
  graph,
  onEditLabel,
  isTeacherMode = false
}) => {
  return (
    <section aria-labelledby="graph-viewer-title" className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="graph-viewer-title" className="text-xl md:text-2xl font-bold text-slate-900">
              Canonical Concept Graph
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
              Single Source of Truth
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Teacher-approved sequence of conceptual milestones connecting AAC with classroom learning.
          </p>
        </div>

        {isTeacherMode && (
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Teachers may edit node labels only. Graph relationships are locked.</span>
          </div>
        )}
      </div>

      {/* Concept Chain Visual Flow */}
      <div className="mt-6 overflow-x-auto pb-4">
        <div className="flex items-center min-w-max gap-2 py-2">
          {graph.nodes.map((node, index) => {
            const edge = graph.edges.find(e => e.from === node.id);

            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div className="w-40 bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-xs hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl" aria-hidden="true">{node.symbol}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-600">
                      Step {index + 1}
                    </span>
                  </div>

                  {isTeacherMode && onEditLabel ? (
                    <div className="space-y-1">
                      <label htmlFor={`edit-label-${node.id}`} className="sr-only">
                        Edit label for {node.id}
                      </label>
                      <input
                        id={`edit-label-${node.id}`}
                        type="text"
                        value={node.label}
                        onChange={(e) => onEditLabel(node.id, e.target.value)}
                        className="w-full text-sm font-bold text-slate-900 px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-500">{node.kannadaLabel}</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{node.label}</h3>
                      <p className="text-xs text-slate-500 font-medium">{node.kannadaLabel}</p>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-3 leading-snug">
                    {node.explanation}
                  </p>
                </div>

                {/* Edge Arrow */}
                {edge && (
                  <div className="flex flex-col items-center justify-center px-1 text-slate-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                      {edge.relation.replace('_', ' ')}
                    </span>
                    <ArrowRight className="w-5 h-5 text-indigo-500" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};
