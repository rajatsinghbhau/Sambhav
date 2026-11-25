import React, { useState } from 'react';
import { LearnedTopic } from '../../types/stage4';
import { offlineStorage } from '../../utils/offlinePersistence';
import { RotateCcw, CheckCircle2, Clock, Play, Volume2, X, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface StudentRevisionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGraphId: string;
  onSelectTopicToRevise: (topic: LearnedTopic) => void;
  language?: 'EN' | 'KN';
}

export const StudentRevisionLibraryModal: React.FC<StudentRevisionLibraryModalProps> = ({
  isOpen,
  onClose,
  activeGraphId,
  onSelectTopicToRevise,
  language = 'EN'
}) => {
  const [topics, setTopics] = useState<LearnedTopic[]>(() => offlineStorage.loadLearnedTopics());
  const [justRevisedId, setJustRevisedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartRevision = (topic: LearnedTopic) => {
    sounds.playSuccessChime();
    setJustRevisedId(topic.id);

    // Update revision count and timestamp
    const updated = topics.map(t => {
      if (t.id === topic.id) {
        return {
          ...t,
          status: 'mastered' as const,
          revisionsCompleted: t.revisionsCompleted + 1,
          lastRevisedAt: 'Just now'
        };
      }
      return t;
    });

    setTopics(updated);
    offlineStorage.saveLearnedTopics(updated);

    // Sync with revision queue if present
    const revQueue = offlineStorage.loadRevisionQueue();
    if (revQueue) {
      const updatedQueue = revQueue.map(item =>
        item.lessonId === topic.id ? { ...item, status: 'completed' as const } : item
      );
      offlineStorage.saveRevisionQueue(updatedQueue);
    }

    setTimeout(() => {
      onSelectTopicToRevise(topic);
      onClose();
    }, 600);
  };

  const handleSpeakTopic = (topic: LearnedTopic) => {
    sounds.playPop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const titleToSpeak = language === 'KN' ? (topic.titleKn || topic.title) : topic.title;
        const text = `${titleToSpeak}. ${topic.subtitle}. Learned ${topic.learnedDate}.`;
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        if (language === 'KN') {
          u.lang = 'kn-IN';
        }
        window.speechSynthesis.speak(u);
      } catch {}
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="revision-library-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 p-5 sm:p-7 space-y-4 sm:space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl shadow-xs shrink-0">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h3 id="revision-library-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {language === 'KN' ? 'ನನ್ನ ಪುನರಾವರ್ತನಾ ಗ್ರಂಥಾಲಯ (Revision Library)' : 'My Revision Library'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {language === 'KN'
                  ? 'ಹಿಂದೆ ಕಲಿತ ಪಾಠಗಳನ್ನು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಮತ್ತೆ ನೋಡಿ ಮತ್ತು ಕಲಿಯಿರಿ'
                  : 'Revisit past learned topics anytime to strengthen your knowledge'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Motivational Banner */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-sky-50 via-indigo-50/70 to-emerald-50 rounded-2xl border border-indigo-200/80 flex items-center gap-3 text-xs sm:text-sm text-indigo-950 font-bold">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>
            {language === 'KN'
              ? 'ಪ್ರತಿಯೊಂದು ವಿಷಯವನ್ನು ಪುನರಾವರ್ತಿಸುವುದರಿಂದ ನಿಮ್ಮ ನೆನಪಿನ ಶಕ್ತಿ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸ ಹೆಚ್ಚುತ್ತದೆ!'
              : 'Revisiting concepts helps memory stick. Pick any past lesson to explore and build the story again!'}
          </span>
        </div>

        {/* List of Learned Topics Available for Revision */}
        <div className="space-y-4">
          {topics.map(topic => {
            const isActive = topic.id === activeGraphId;
            const isJustRevised = justRevisedId === topic.id;
            const titleDisplay = language === 'KN' ? (topic.titleKn || topic.title) : topic.title;

            return (
              <div
                key={topic.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                  isActive
                    ? 'bg-indigo-50/60 border-indigo-300 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Row: Symbol + Title + Subtitle */}
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-3xl p-2 bg-white rounded-xl shadow-2xs shrink-0" aria-hidden="true">
                      {topic.symbol}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                          {titleDisplay}
                        </h4>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-600 text-white shrink-0">
                            {language === 'KN' ? 'ಸಕ್ರಿಯ ಪಾಠ' : 'Active Today'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                        {topic.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Milestone Concept Flow (Clean Wrapping Pills - never overflows or collides) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {topic.graph.nodes.map((n: any, idx: number) => (
                    <span
                      key={n.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-800 shadow-2xs whitespace-nowrap"
                      title={n.label}
                    >
                      <span>{n.symbol}</span>
                      <span>{language === 'KN' ? (n.kannadaLabel || n.label) : n.label}</span>
                      {idx < topic.graph.nodes.length - 1 && (
                        <span className="text-slate-400 font-bold ml-0.5">→</span>
                      )}
                    </span>
                  ))}
                </div>

                {/* Bottom Row: Meta Stats on Left & Actions on Right */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-200/60">
                  {/* Meta stats */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{language === 'KN' ? 'ಕಲಿತ ದಿನ:' : 'Learned:'} {topic.learnedDate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {topic.revisionsCompleted}{' '}
                        {language === 'KN'
                          ? 'ಪುನರಾವರ್ತನೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ'
                          : topic.revisionsCompleted === 1 ? 'revision completed' : 'revisions completed'}
                      </span>
                    </span>
                    {topic.status === 'revision_due' && (
                      <>
                        <span>•</span>
                        <span className="text-amber-800 font-bold bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                          {language === 'KN' ? 'ಪುನರಾವರ್ತನೆ ಬಾಕಿ ಇದೆ' : 'Revision Recommended'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Actions: Listen + Revise Topic button */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleSpeakTopic(topic)}
                      type="button"
                      title="Listen to summary"
                      aria-label={`Listen to summary of ${titleDisplay}`}
                      className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleStartRevision(topic)}
                      type="button"
                      className={`min-h-[40px] flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 btn-tactile transition-all whitespace-nowrap ${
                        isJustRevised
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {isJustRevised ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          <span>{language === 'KN' ? 'ಲೋಡ್ ಆಗಿದೆ!' : 'Loaded!'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>{language === 'KN' ? 'ಈಗ ಪುನರಾವರ್ತಿಸಿ' : 'Revise Topic'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
