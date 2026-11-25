import React, { useState } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { TeachingActivity } from '../../types/stage4';
import { getTeachingSuggestions } from '../../engine/stage4Engine';
import { Sparkles, Check, Edit2, Lightbulb, Clock, Info } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface PreClassTeachingSupportProps {
  graph: ConceptGraph;
  onSelectActivityForPlan?: (activity: TeachingActivity) => void;
}

export const PreClassTeachingSupport: React.FC<PreClassTeachingSupportProps> = ({
  graph,
  onSelectActivityForPlan
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('condensation');
  const [usedActivities, setUsedActivities] = useState<Record<string, boolean>>({});
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editedDescription, setEditedDescription] = useState<string>('');

  const selectedNode = graph.nodes.find(n => n.id === selectedConceptId) || graph.nodes[0];
  const suggestions = getTeachingSuggestions(selectedConceptId);

  const handleUseActivity = (activity: TeachingActivity) => {
    sounds.playSuccessChime();
    setUsedActivities(prev => ({ ...prev, [activity.id]: true }));
    if (onSelectActivityForPlan) {
      onSelectActivityForPlan(activity);
    }
  };

  const handleStartEdit = (activity: TeachingActivity) => {
    sounds.playPop();
    setEditingActivityId(activity.id);
    setEditedDescription(activity.description);
  };

  const handleSaveEdit = (_activityId: string) => {
    sounds.playSuccessChime();
    setEditingActivityId(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Hands-on':
        return '🧪';
      case 'Visual':
        return '🖼️';
      case 'Movement':
        return '🎭';
      case 'Pair Activity':
        return '👥';
      case 'Communication':
        return '🗣️';
      case 'Quick Demonstration':
        return '⚡';
      default:
        return '💡';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Pre-Class Teaching Support</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            How can I teach this concept clearly?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Curated, inclusive pedagogical suggestions available before class begins.
          </p>
        </div>

        {/* Suggested approach. Teacher decides. Notice */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-center">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Suggested approach. Teacher decides.</span>
        </div>
      </div>

      {/* Concept Selector Pill Row */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Select Curriculum Concept:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {graph.nodes.map(node => {
            const isSelected = node.id === selectedConceptId;
            return (
              <button
                key={node.id}
                onClick={() => {
                  sounds.playPop();
                  setSelectedConceptId(node.id);
                }}
                type="button"
                className={`min-h-[48px] px-4 py-2 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap btn-tactile ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{node.symbol}</span>
                <span>{node.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested ways to introduce it */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
          <span>{selectedNode.symbol}</span>
          <span>{selectedNode.label}: Suggested ways to introduce it</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map(act => {
            const isUsed = usedActivities[act.id];
            const isEditing = editingActivityId === act.id;

            return (
              <div
                key={act.id}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-indigo-200 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs">
                        {getTypeIcon(act.type)}
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                          {act.type}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {act.title}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{act.duration} min</span>
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editedDescription}
                        onChange={e => setEditedDescription(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2 rounded-xl border border-indigo-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        onClick={() => handleSaveEdit(act.id)}
                        type="button"
                        className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {editedDescription && editingActivityId !== act.id ? editedDescription : act.description}
                    </p>
                  )}

                  {/* Inclusive Tip */}
                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Inclusive Tip:</strong> {act.inclusiveTip}</span>
                  </div>
                </div>

                {/* Actions: Use this activity, Swap activity, Edit */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => handleUseActivity(act)}
                    type="button"
                    className={`min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isUsed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isUsed ? 'Activity Added' : 'Use this activity'}</span>
                  </button>

                  <button
                    onClick={() => handleStartEdit(act)}
                    type="button"
                    aria-label="Edit activity description"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
