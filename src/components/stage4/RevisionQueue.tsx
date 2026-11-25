import React, { useState } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { RevisionItem, RevisionQueueSection } from '../../types/stage4';
import { generateInitialRevisionQueue } from '../../engine/stage4Engine';
import { offlineStorage } from '../../utils/offlinePersistence';
import { CheckCircle2, Clock, RotateCcw, Info, PlusCircle } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface RevisionQueueProps {
  graph: ConceptGraph;
  onAddConceptToLesson?: (conceptId: string) => void;
}

export const RevisionQueue: React.FC<RevisionQueueProps> = ({
  graph,
  onAddConceptToLesson
}) => {
  const [items, setItems] = useState<RevisionItem[]>(() => {
    return offlineStorage.loadRevisionQueue() || generateInitialRevisionQueue(graph);
  });

  const [activeTab, setActiveTab] = useState<RevisionQueueSection>('due_today');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleMarkCompleted = (id: string) => {
    sounds.playSuccessChime();
    const updated = items.map(it => it.id === id ? { ...it, status: 'completed' as const } : it);
    setItems(updated);
    offlineStorage.saveRevisionQueue(updated);
  };

  const handleMoveDate = (id: string) => {
    sounds.playPop();
    const updated = items.map(it => {
      if (it.id === id) {
        // Shift to coming up
        return {
          ...it,
          section: 'coming_up' as const,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      }
      return it;
    });
    setItems(updated);
    offlineStorage.saveRevisionQueue(updated);
    setActionNotice('Concept date moved to Coming Up (+3 days).');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleAddToLesson = (conceptId: string) => {
    sounds.playSuccessChime();
    if (onAddConceptToLesson) {
      onAddConceptToLesson(conceptId);
    }
    setActionNotice(`Added ${conceptId} to today's active lesson revision plan.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const filteredItems = items.filter(it => it.section === activeTab);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Spaced Revision Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Curriculum Revision Queue
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Post-class evidence-informed spaced intervals (+2d, +7d, +21d, Exam).
          </p>
        </div>

        {/* Suggested revision schedule. Teacher decides. Notice */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-center">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Suggested revision schedule. Teacher decides.</span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Queue Section Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        {[
          { id: 'due_today', label: 'Due Today', emoji: '🔔', count: items.filter(i => i.section === 'due_today' && i.status !== 'completed').length },
          { id: 'coming_up', label: 'Coming Up', emoji: '📅', count: items.filter(i => i.section === 'coming_up').length },
          { id: 'before_exam', label: 'Before Exam', emoji: '🎯', count: items.filter(i => i.section === 'before_exam').length },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveTab(tab.id as RevisionQueueSection);
            }}
            className={`min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center ml-1">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
            No revision items currently in this section.
          </div>
        ) : (
          filteredItems.map(item => {
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-1.5 bg-slate-50 rounded-xl shadow-2xs">
                      {item.conceptSymbol}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-900">
                          {item.conceptLabel}
                        </h4>
                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          Due: {item.dueDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Reason: {item.reason}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                    isCompleted
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isCompleted ? 'Completed' : 'Review Required'}
                  </span>
                </div>

                {/* Actions: Review, Move Date, Add to Lesson */}
                {!isCompleted && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleMarkCompleted(item.id)}
                      type="button"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Reviewed</span>
                    </button>

                    <button
                      onClick={() => handleMoveDate(item.id)}
                      type="button"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Move Date</span>
                    </button>

                    <button
                      onClick={() => handleAddToLesson(item.conceptId)}
                      type="button"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add to Lesson</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
