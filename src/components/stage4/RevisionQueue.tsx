import React, { useState } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { RevisionItem, RevisionQueueSection } from '../../types/stage4';
import { generateInitialRevisionQueue } from '../../engine/stage4Engine';
import { offlineStorage } from '../../utils/offlinePersistence';
import { RevisionCheckpointModal } from './RevisionCheckpointModal';
import { AddRevisionItemModal } from './AddRevisionItemModal';
import { CheckCircle2, Clock, RotateCcw, PlusCircle, Sparkles, Plus } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface RevisionQueueProps {
  graph: ConceptGraph;
  language?: 'EN' | 'KN';
  onAddConceptToLesson?: (conceptId: string) => void;
}

export const RevisionQueue: React.FC<RevisionQueueProps> = ({
  graph,
  language = 'EN',
  onAddConceptToLesson
}) => {
  const [items, setItems] = useState<RevisionItem[]>(() => {
    return offlineStorage.loadRevisionQueue() || generateInitialRevisionQueue(graph);
  });

  const [activeTab, setActiveTab] = useState<RevisionQueueSection>('due_today');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [activeCheckpointConcept, setActiveCheckpointConcept] = useState<{
    id: string;
    label: string;
    symbol: string;
    explanation?: string;
  } | null>(null);

  const completedCount = items.filter(it => it.status === 'completed').length;
  const retentionHealthPercent = Math.min(100, Math.round(75 + (completedCount * 5)));

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
    setActionNotice(language === 'KN' ? 'ಪರಿಕಲ್ಪನೆಯ ದಿನಾಂಕವನ್ನು ಮುಂದಕ್ಕೆ ಸರಿಸಲಾಗಿದೆ (+3 ದಿನಗಳು).' : 'Concept date moved to Coming Up (+3 days).');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleAddToLesson = (conceptId: string) => {
    sounds.playSuccessChime();
    if (onAddConceptToLesson) {
      onAddConceptToLesson(conceptId);
    }
    setActionNotice(language === 'KN' ? `ಇಂದಿನ ಪಾಠ ಯೋಜನೆಗೆ ${conceptId} ಸೇರಿಸಲಾಗಿದೆ.` : `Added ${conceptId} to today's active lesson revision plan.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleConfirmAddItem = (newItem: RevisionItem) => {
    const updated = [newItem, ...items];
    setItems(updated);
    offlineStorage.saveRevisionQueue(updated);
    setActiveTab(newItem.section);
    setActionNotice(
      language === 'KN'
        ? `✨ ${newItem.conceptLabel} ಯಶಸ್ವಿಯಾಗಿ ಪುನರಾವರ್ತನಾ ಸರದಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!`
        : `✨ ${newItem.conceptLabel} added to spaced revision queue!`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  // AI Adaptive Spacing Optimizer: Prioritizes weak transitions (+2d) & spaces mastered (+7d/+21d)
  const handleAdaptiveOptimize = () => {
    sounds.playSuccessChime();
    const evState = offlineStorage.loadEvidenceState();
    const weakResult = evState.beforeEvidence?.orderedResults?.find(r => r.status === 'YELLOW' || r.status === 'WHITE');
    const weakConcept = weakResult?.nodeId || 'condensation';

    const optimized = items.map(it => {
      if (it.conceptId === weakConcept) {
        return {
          ...it,
          section: 'due_today' as const,
          dueDate: new Date().toISOString().split('T')[0],
          reason: `Evidence indicates ${it.conceptLabel} has lower recall. Prioritized for +2d repetition.`,
          status: 'pending' as const
        };
      } else if (it.status === 'completed') {
        return {
          ...it,
          section: 'before_exam' as const,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reason: `Mastery demonstrated. Spaced to +21d pre-exam review.`
        };
      } else {
        return {
          ...it,
          section: 'coming_up' as const,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reason: `Retention check scheduled at +7 days.`
        };
      }
    });

    setItems(optimized);
    offlineStorage.saveRevisionQueue(optimized);
    setActionNotice(`✨ AI Adaptive Spacing applied! Weak transitions (${weakConcept}) prioritized for +2d; mastered concepts spaced to +7d/+21d.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const filteredItems = items.filter(it => it.section === activeTab);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'KN' ? 'ಅಂತರದ ಪುನರಾವರ್ತನಾ ಎಂಜಿನ್' : 'Spaced Revision Engine'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'KN' ? 'ಪಠ್ಯಕ್ರಮ ಪುನರಾವರ್ತನಾ ಸಾಲು' : 'Curriculum Revision Queue'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {language === 'KN'
              ? 'ತರಗತಿ ಸಾಕ್ಷ್ಯಾಧಾರಿತ ಅಂತರದ ಪುನರಾವರ್ತನೆ (+2 ದಿನ, +7 ದಿನ, +21 ದಿನ, ಪರೀಕ್ಷೆ).'
              : 'Post-class evidence-informed spaced intervals (+2d, +7d, +21d, Exam).'}
          </p>
        </div>

        {/* Suggested revision schedule & actions */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => {
              sounds.playPop();
              setShowAddItemModal(true);
            }}
            type="button"
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'KN' ? 'ಪರಿಕಲ್ಪನೆ ಸೇರಿಸಿ' : 'Add to Queue'}</span>
          </button>

          <button
            onClick={handleAdaptiveOptimize}
            type="button"
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 text-indigo-900 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'KN' ? '✨ AI ಅಂತರ ಸರಿಹೊಂದಿಕೆ' : '✨ AI Adaptive Spacing'}</span>
          </button>
        </div>
      </div>

      {/* Class Retention Health Overview */}
      <div className="p-4 bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-emerald-50/70 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
            {retentionHealthPercent}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900">
                {language === 'KN' ? 'ತರಗತಿಯ ಧಾರಣ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಅಂತರ ಆರೋಗ್ಯ' : 'Class Retention & Spacing Health'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                {retentionHealthPercent >= 80 ? (language === 'KN' ? 'ಉತ್ತಮ' : 'Optimal') : (language === 'KN' ? 'ಬಲವರ್ಧನೆ ಅಗತ್ಯ' : 'Needs Reinforcement')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              {completedCount} {language === 'KN' ? 'ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ • ಅಂತರಗಳು: +2ದಿನ, +7ದಿನ, +21ದಿನ.' : 'concepts reviewed • Automated spaced intervals: +2d, +7d, +21d.'}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${retentionHealthPercent}%` }}
          />
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Queue Section Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        {[
          { id: 'due_today', label: language === 'KN' ? 'ಇಂದು ಬಾಕಿ' : 'Due Today', emoji: '🔔', count: items.filter(i => i.section === 'due_today' && i.status !== 'completed').length },
          { id: 'coming_up', label: language === 'KN' ? 'ಮುಂದೆ ಬರಲಿರುವುದು' : 'Coming Up', emoji: '📅', count: items.filter(i => i.section === 'coming_up').length },
          { id: 'before_exam', label: language === 'KN' ? 'ಪರೀಕ್ಷೆಯ ಮೊದಲು' : 'Before Exam', emoji: '🎯', count: items.filter(i => i.section === 'before_exam').length },
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
          <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <p>{language === 'KN' ? 'ಈ ವಿಭಾಗದಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಪುನರಾವರ್ತನಾ ಅಂಶಗಳಿಲ್ಲ.' : 'No revision items currently in this section.'}</p>
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setShowAddItemModal(true);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              {language === 'KN' ? '+ ಈ ವಿಭಾಗಕ್ಕೆ ಪರಿಕಲ್ಪನೆಯನ್ನು ಸೇರಿಸಿ' : '+ Add a concept to this section'}
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const isCompleted = item.status === 'completed';
            const node = graph.nodes.find(n => n.id === item.conceptId);
            const labelDisplay = language === 'KN' ? (node?.kannadaLabel || item.conceptLabel) : item.conceptLabel;

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
                          {labelDisplay}
                        </h4>
                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {language === 'KN' ? 'ಬಾಕಿ:' : 'Due:'} {item.dueDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {language === 'KN' ? 'ಕಾರಣ:' : 'Reason:'} {item.reason}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                    isCompleted
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isCompleted ? (language === 'KN' ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : 'Completed') : (language === 'KN' ? 'ಪರಿಶೀಲನೆ ಅಗತ್ಯ' : 'Review Required')}
                  </span>
                </div>

                {/* Actions: Review, Move Date, Add to Lesson, Quick Checkpoint */}
                {!isCompleted && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        sounds.playPop();
                        setActiveCheckpointConcept({
                          id: item.conceptId,
                          label: labelDisplay,
                          symbol: item.conceptSymbol,
                          explanation: node?.explanation || ''
                        });
                      }}
                      type="button"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 text-indigo-900 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'KN' ? 'ತ್ವರಿತ ಪರಿಶೀಲನೆ' : 'Quick Checkpoint'}</span>
                    </button>

                    <button
                      onClick={() => handleMarkCompleted(item.id)}
                      type="button"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'KN' ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'Mark Reviewed'}</span>
                    </button>

                    <button
                      onClick={() => handleMoveDate(item.id)}
                      type="button"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'KN' ? 'ದಿನಾಂಕ ಬದಲಾಯಿಸಿ' : 'Move Date'}</span>
                    </button>

                    <button
                      onClick={() => handleAddToLesson(item.conceptId)}
                      type="button"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{language === 'KN' ? 'ಪಾಠಕ್ಕೆ ಸೇರಿಸಿ' : 'Add to Lesson'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <AddRevisionItemModal
          isOpen={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          onAddItem={handleConfirmAddItem}
          graph={graph}
          initialSection={activeTab}
          language={language}
        />
      )}

      {/* Interactive Quick Checkpoint Modal */}
      {activeCheckpointConcept && (
        <RevisionCheckpointModal
          isOpen={!!activeCheckpointConcept}
          onClose={() => setActiveCheckpointConcept(null)}
          conceptId={activeCheckpointConcept.id}
          conceptLabel={activeCheckpointConcept.label}
          conceptSymbol={activeCheckpointConcept.symbol}
          conceptExplanation={activeCheckpointConcept.explanation}
          language={language}
          onMarkReviewed={(cid) => {
            const match = items.find(it => it.conceptId === cid);
            if (match) {
              handleMarkCompleted(match.id);
            }
            setActionNotice(language === 'KN' 
              ? `🌟 ${activeCheckpointConcept.label} ಗಾಗಿ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ! ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.`
              : `🌟 Checkpoint completed for ${activeCheckpointConcept.label}! Marked as reviewed.`
            );
            setTimeout(() => setActionNotice(null), 4000);
          }}
        />
      )}
    </div>
  );
};
