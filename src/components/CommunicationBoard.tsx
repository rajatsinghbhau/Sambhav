import React, { useState } from 'react';
import { ConceptGraph } from '../types/conceptGraph';
import { COMMUNICATION_PHRASES } from '../data/communicationData';
import { ConfirmSpeakModal } from './ConfirmSpeakModal';

interface CommunicationBoardProps {
  graph: ConceptGraph;
  onSelectConcept?: (conceptId: string) => void;
}

export const CommunicationBoard: React.FC<CommunicationBoardProps> = ({
  graph,
  onSelectConcept
}) => {
  const [pendingPhrase, setPendingPhrase] = useState<string | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState<boolean>(true);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);

  const handlePhraseClick = (phraseText: string) => {
    setPendingPhrase(phraseText);
  };

  const handleConfirmSpeak = () => {
    if (!pendingPhrase) return;
    const textToSpeak = pendingPhrase;
    setPendingPhrase(null);
    setLastSpoken(textToSpeak);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.onerror = () => {
          setSpeechAvailable(false);
        };
        window.speechSynthesis.speak(utterance);
        setSpeechAvailable(true);
      } catch {
        setSpeechAvailable(false);
      }
    } else {
      setSpeechAvailable(false);
    }
  };

  const handleCancelSpeak = () => {
    setPendingPhrase(null);
  };

  return (
    <section aria-labelledby="comm-board-title" className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-2">
        <div>
          <h2 id="comm-board-title" className="text-2xl font-bold tracking-tight text-slate-900">
            Today's Communication Board
          </h2>
          <p className="text-slate-600 font-medium mt-0.5 text-base">
            {graph.title || 'Water Cycle'}
          </p>
        </div>
        {lastSpoken && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-sm px-3.5 py-1.5 rounded-full border border-emerald-200 self-start">
            <span className="font-semibold">Last shared:</span>
            <span>“{lastSpoken}”</span>
          </div>
        )}
      </div>

      {/* 7 Concept Buttons */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Lesson Concepts (Touch to speak or reinforce)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {graph.nodes.map(node => (
            <button
              key={node.id}
              onClick={() => {
                handlePhraseClick(node.label);
                if (onSelectConcept) onSelectConcept(node.id);
              }}
              type="button"
              className="min-h-[58px] min-w-[48px] p-3 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50/60 hover:bg-indigo-50/70 hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 active:scale-95 transition-all text-center cursor-pointer group"
              aria-label={`Concept: ${node.label} (${node.kannadaLabel})`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">
                {node.symbol}
              </span>
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {node.label}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {node.kannadaLabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 6 Classroom Communication Phrases */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Classroom Phrases (Confirm-Before-Speak Protected)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMMUNICATION_PHRASES.map(phrase => (
            <button
              key={phrase.id}
              onClick={() => handlePhraseClick(phrase.text)}
              type="button"
              className="min-h-[56px] min-w-[48px] px-4 py-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 active:scale-[0.98] transition-all text-left cursor-pointer shadow-sm"
              aria-label={`Phrase: ${phrase.text}`}
            >
              <span className="text-2xl shrink-0" aria-hidden="true">
                {phrase.symbol}
              </span>
              <span className="text-sm md:text-base font-semibold text-slate-800">
                {phrase.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Confirm Before Speak Modal */}
      <ConfirmSpeakModal
        phrase={pendingPhrase}
        onConfirm={handleConfirmSpeak}
        onCancel={handleCancelSpeak}
        speechAvailable={speechAvailable}
      />
    </section>
  );
};
