import React, { useState } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { DISTRACTOR_NODES } from '../../data/canonicalGraph';
import { COMMUNICATION_PHRASES } from '../../data/communicationData';
import { Volume2, VolumeX, Check, RefreshCw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface CommunicationBoardScreenProps {
  graph: ConceptGraph;
  language?: 'EN' | 'KN';
  onPhraseClick?: (phraseText: string) => void;
}

export const CommunicationBoardScreen: React.FC<CommunicationBoardScreenProps> = ({
  graph,
  language = 'EN',
  onPhraseClick,
}) => {
  const boardConcepts = [
    ...graph.nodes,
    ...DISTRACTOR_NODES
  ];

  // In-place modal state for instant, seamless confirmation right on the board
  const [pendingPhrase, setPendingPhrase] = useState<string | null>(null);
  const [pendingPhraseAudio, setPendingPhraseAudio] = useState<string | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState<boolean>(true);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const [isSpeakingAnimation, setIsSpeakingAnimation] = useState<boolean>(false);

  const handleSelect = (displayText: string, audioText?: string) => {
    sounds.playPop();
    setPendingPhrase(displayText);
    setPendingPhraseAudio(audioText || displayText);
    if (onPhraseClick) {
      onPhraseClick(displayText);
    }
  };

  const handleConfirmSpeak = () => {
    if (!pendingPhrase) return;
    const textToDisplay = pendingPhrase;
    const textToSpeak = pendingPhraseAudio || pendingPhrase;
    setPendingPhrase(null);
    setPendingPhraseAudio(null);
    setLastSpoken(textToDisplay);
    sounds.playSuccessChime();

    // Trigger Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        if (language === 'KN') {
          utterance.lang = 'kn-IN';
        }

        setIsSpeakingAnimation(true);
        utterance.onend = () => {
          setIsSpeakingAnimation(false);
        };
        utterance.onerror = () => {
          // Graceful fallback: do not crash
          setIsSpeakingAnimation(false);
          setSpeechAvailable(false);
        };

        window.speechSynthesis.speak(utterance);
        setSpeechAvailable(true);
      } catch {
        setSpeechAvailable(false);
        setIsSpeakingAnimation(false);
      }
    } else {
      setSpeechAvailable(false);
    }
  };

  const handleCancel = () => {
    sounds.playWhoosh();
    setPendingPhrase(null);
    setPendingPhraseAudio(null);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {language === 'KN' ? 'ಇಂದಿನ ಸಂವಹನ ಮಂಡಳಿ' : "Today's Communication Board"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            {language === 'KN'
              ? 'ದೃಢೀಕರಿಸಿ-ಮಾತನಾಡುವ ರಕ್ಷಣೆಯೊಂದಿಗೆ ಮಾತನಾಡಲು ಯಾವುದೇ ದೊಡ್ಡ ಪರಿಕಲ್ಪನೆಯನ್ನು ಸ್ಪರ್ಶಿಸಿ'
              : 'Touch any large concept or phrase to speak with Confirm-Before-Speak protection'}
          </p>
        </div>

        {lastSpoken && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold animate-in fade-in" aria-live="polite">
            <Volume2 className={`w-4 h-4 text-emerald-600 ${isSpeakingAnimation ? 'animate-bounce' : ''}`} />
            <span>Spoken: “{lastSpoken}”</span>
          </div>
        )}
      </div>

      {/* 3x3 Grid of Large Concept Buttons (minimum 48px touch targets, accessible focus) */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 text-center sm:text-left">
          {language === 'KN' ? 'ಮುಖ್ಯ ವಿಜ್ಞಾನ ಪರಿಕಲ್ಪನೆಗಳು (Core Concepts)' : 'Core Science Concepts'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {boardConcepts.map((item) => {
            const primaryLabel = language === 'KN' ? (item.kannadaLabel || item.label) : item.label;
            const secondaryLabel = language === 'KN' ? item.label : item.kannadaLabel;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(primaryLabel, primaryLabel)}
                type="button"
                className="min-h-[110px] min-w-[48px] p-4 rounded-3xl border-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white hover:bg-blue-50/80 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-xs group btn-tactile"
                aria-label={`Concept: ${primaryLabel}`}
              >
                <span className="text-4xl group-hover:scale-115 transition-transform mb-1.5" aria-hidden="true">
                  {item.symbol}
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900">
                  {primaryLabel}
                </span>
                {secondaryLabel && (
                  <span className="text-[11px] text-blue-700 font-bold mt-0.5">
                    {secondaryLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Classroom Helpers (6 colored pill boxes matching image #3) */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 text-center sm:text-left">
          {language === 'KN' ? 'ತರಗತಿ ಸಹಾಯಕ ವಾಕ್ಯಗಳು (Classroom Helpers)' : 'Classroom Helpers'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {COMMUNICATION_PHRASES.map((phrase, idx) => {
            const displayText = language === 'KN' ? phrase.kannadaText : phrase.text;
            const styles = [
              'bg-sky-50 border-sky-300 text-sky-950 hover:bg-sky-100',
              'bg-rose-50 border-rose-300 text-rose-950 hover:bg-rose-100',
              'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100',
              'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100',
              'bg-green-100/80 border-green-400 text-green-950 hover:bg-green-100',
              'bg-blue-50 border-blue-300 text-blue-950 hover:bg-blue-100',
            ];
            const appliedStyle = styles[idx % styles.length];

            return (
              <button
                key={phrase.id}
                onClick={() => handleSelect(displayText, displayText)}
                type="button"
                className={`min-h-[64px] min-w-[48px] px-5 py-3.5 rounded-2xl border-2 flex items-center gap-3.5 transition-all cursor-pointer font-extrabold text-sm shadow-xs active:scale-95 btn-tactile focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${appliedStyle}`}
                aria-label={`Helper phrase: ${displayText}`}
              >
                <span className="text-2xl shrink-0" aria-hidden="true">{phrase.symbol}</span>
                <span className="leading-snug text-left">{displayText}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONFIRM-BEFORE-SPEAK MODAL: Mandated 2-step verification */}
      {pendingPhrase && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-2 border-slate-200 p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Volume2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full">
                Confirm-Before-Speak
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {language === 'KN' ? 'ನೀವು ಹೇಳಲು ಬಯಸಿದ್ದೀರಾ?' : 'Did you mean?'}
              </h3>
            </div>

            {/* Selected Phrase Box */}
            <div className="p-6 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-300 rounded-2xl text-center">
              <p className="text-2xl font-black text-indigo-950">
                “{pendingPhrase}”
              </p>
            </div>

            {!speechAvailable && (
              <div className="flex items-center justify-center gap-2 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-300 text-xs font-bold">
                <VolumeX className="w-4 h-4 shrink-0" />
                <span>Speech synthesizer unavailable on device (text displayed visually)</span>
              </div>
            )}

            {/* Action buttons with min 48px target */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleCancel}
                type="button"
                aria-label="Change selection"
                className="min-h-[52px] px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold text-sm hover:bg-slate-100 flex items-center justify-center gap-2 cursor-pointer btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>← {language === 'KN' ? 'ಬದಲಾಯಿಸಿ' : 'Change'}</span>
              </button>

              <button
                onClick={handleConfirmSpeak}
                type="button"
                aria-label="Confirm and speak"
                className="min-h-[52px] px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>✓ {language === 'KN' ? 'ಹೌದು, ಮಾತನಾಡಿ' : 'Yes, speak'}</span>
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-400 font-medium">
              We never speak without your confirmation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};