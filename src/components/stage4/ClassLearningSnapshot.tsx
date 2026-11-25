import React from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { DEMO_STUDENTS } from '../../data/stage4Data';
import { getClassSnapshot } from '../../engine/stage4Engine';
import { Users, AlertTriangle, CheckCircle2, CircleDashed, PlusCircle } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ClassLearningSnapshotProps {
  graph: ConceptGraph;
  language?: 'EN' | 'KN';
  onAddReinforcementToPlan?: (conceptId: string) => void;
}

export const ClassLearningSnapshot: React.FC<ClassLearningSnapshotProps> = ({
  graph,
  language = 'EN',
  onAddReinforcementToPlan
}) => {
  const snapshot = getClassSnapshot(DEMO_STUDENTS, graph);

  // Identify class reinforcement opportunities (concept with highest yellow count)
  let maxYellowCount = 0;
  let topYellowConceptId: string | null = null;

  Object.values(snapshot).forEach(item => {
    if (item.yellow > maxYellowCount) {
      maxYellowCount = item.yellow;
      topYellowConceptId = item.conceptId;
    }
  });

  const reinforcementNode = topYellowConceptId ? graph.nodes.find(n => n.id === topYellowConceptId) : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'KN' ? 'ತರಗತಿ ಕಲಿಕೆಯ ಚಿತ್ರಣ' : 'Class Learning Snapshot'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'KN' ? 'ತರಗತಿ ಸಾಕ್ಷ್ಯ ಸಂಗ್ರಹ' : 'Class Evidence Aggregate'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {language === 'KN'
              ? 'ವಿದ್ಯಾರ್ಥಿಗಳ ಸಂಪೂರ್ಣ ಸಾಕ್ಷ್ಯಾಧಾರಗಳನ್ನು ಶುದ್ಧ ನಿಯಮಗಳ ಮೂಲಕ ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗಿದೆ.'
              : 'Aggregated demonstrated milestones across the cohort evaluated by pure deterministic rules.'}
          </p>
        </div>

        {/* Fictional Data Badge (Strict Section 5 compliance) */}
        <div className="bg-slate-100 border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-xl text-xs font-bold self-start sm:self-center">
          {language === 'KN' ? 'ಡೆಮೊ ತರಗತಿ — ಕಾಲ್ಪನಿಕ ಡೇಟಾ' : 'Demo Class — Fictional Data'}
        </div>
      </div>

      {/* PART 13: CLASS REINFORCEMENT OPPORTUNITY (Connected evidence -> action) */}
      {reinforcementNode && maxYellowCount >= 2 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/80 border-2 border-amber-300 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl p-2 bg-white rounded-xl shadow-2xs shrink-0">
                {reinforcementNode.symbol}
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                  {language === 'KN' ? 'ತರಗತಿ ಬಲವರ್ಧನೆ ಅವಕಾಶ' : 'Class Reinforcement Opportunity'}
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  {language === 'KN' ? (reinforcementNode.kannadaLabel || reinforcementNode.label) : reinforcementNode.label}: {maxYellowCount} {language === 'KN' ? 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಬಲವರ್ಧನೆ ಅಗತ್ಯವಿದೆ' : 'students need reinforcement'}
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {language === 'KN'
                    ? 'ಮುಂದೆ ಹೋಗುವ ಮೊದಲು ಪ್ರಾಯೋಗಿಕ ಪ್ರಾತ್ಯಕ್ಷಿಕೆಯ ಮೂಲಕ ಈ ಪರಿಕಲ್ಪನೆಯನ್ನು ಪುನರಾವರ್ತಿಸಿ.'
                    : 'Consider revisiting this concept through hands-on demonstration before moving forward.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playSuccessChime();
                if (onAddReinforcementToPlan && topYellowConceptId) {
                  onAddReinforcementToPlan(topYellowConceptId);
                }
              }}
              type="button"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'KN' ? 'ನಾಳೆಯ ಯೋಜನೆಗೆ ಸೇರಿಸಿ' : "Add to Tomorrow's Plan"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Milestone Evidence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {graph.nodes.map(node => {
          const counts = snapshot[node.id] || { green: 0, yellow: 0, white: 0 };

          return (
            <div
              key={node.id}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-1.5 bg-white rounded-xl shadow-2xs">{node.symbol}</span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">
                    {language === 'KN' ? (node.kannadaLabel || node.label) : node.label}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {language === 'KN' ? node.label : node.kannadaLabel}
                  </span>
                </div>
              </div>

              {/* Status Breakdown (🟢 Demonstrated, 🟡 Needs reinforcement, ⚪ Not yet) */}
              <div className="space-y-1.5 text-xs font-bold pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>🟢 {language === 'KN' ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Demonstrated'}</span>
                  </span>
                  <span className="font-black">{counts.green}</span>
                </div>

                <div className="flex items-center justify-between text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>🟡 {language === 'KN' ? 'ಬಲವರ್ಧನೆ ಅಗತ್ಯ' : 'Needs reinforcement'}</span>
                  </span>
                  <span className="font-black">{counts.yellow}</span>
                </div>

                <div className="flex items-center justify-between text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <CircleDashed className="w-3.5 h-3.5 text-slate-400" />
                    <span>⚪ {language === 'KN' ? 'ಇನ್ನೂ ಪ್ರದರ್ಶಿಸಿಲ್ಲ' : 'Not yet demonstrated'}</span>
                  </span>
                  <span className="font-black">{counts.white}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
