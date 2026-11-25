import React, { useState } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { DISTRACTOR_NODES } from '../../data/canonicalGraph';
import { COMMUNICATION_PHRASES, CommunicationPhrase } from '../../data/communicationData';
import {
  Volume2,
  VolumeX,
  Trash2,
  Delete,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { offlineStorage } from '../../utils/offlinePersistence';

interface CommunicationBoardScreenProps {
  graph: ConceptGraph;
  language?: 'EN' | 'KN';
  onPhraseClick?: (phraseText: string) => void;
  onOpenAskDoubt?: () => void;
  onOpenExplainSimply?: () => void;
}

interface SentenceToken {
  id: string;
  label: string;
  symbol: string;
  kannadaLabel?: string;
}

interface ActiveHelperAlert {
  id: string;
  symbol: string;
  title: string;
  description: string;
  type: 'hand' | 'question' | 'repeat' | 'help' | 'understand' | 'speak';
  timestamp: string;
}

export const CommunicationBoardScreen: React.FC<CommunicationBoardScreenProps> = ({
  graph,
  language = 'EN',
  onPhraseClick,
  onOpenAskDoubt,
  onOpenExplainSimply,
}) => {
  const boardConcepts = [
    ...graph.nodes,
    ...DISTRACTOR_NODES
  ];

  const [speechAvailable, setSpeechAvailable] = useState<boolean>(true);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const [isSpeakingAnimation, setIsSpeakingAnimation] = useState<boolean>(false);
  const [sentenceQueue, setSentenceQueue] = useState<SentenceToken[]>([]);
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);
  const [showHelperExplanation, setShowHelperExplanation] = useState<boolean>(false);
  const [activeHelperAlert, setActiveHelperAlert] = useState<ActiveHelperAlert | null>(null);

  // Helper intent role metadata for AAC classroom education
  const HELPER_META: Record<string, { role: string; roleKn: string; colorClass: string }> = {
    p1: { role: 'Raise virtual hand to answer', roleKn: 'ಉತ್ತರಿಸಲು ಕೈ ಎತ್ತಿ', colorClass: 'btn-3d-helper-sky' },
    p2: { role: 'Pause lesson to ask question', roleKn: 'ಪ್ರಶ್ನೆ ಕೇಳಲು ತರಗತಿ ನಿಲ್ಲಿಸಿ', colorClass: 'btn-3d-helper-rose' },
    p3: { role: 'Request repetition without shame', roleKn: 'ಮತ್ತೆ ಹೇಳಲು ವಿನಂತಿಸಿ', colorClass: 'btn-3d-helper-emerald' },
    p4: { role: 'Signal aide or teacher for help', roleKn: 'ಸಹಾಯಕ್ಕಾಗಿ ಶಿಕ್ಷಕರನ್ನು ಕರೆಯಿರಿ', colorClass: 'btn-3d-helper-amber' },
    p5: { role: 'Instant comprehension check', roleKn: 'ಅರ್ಥವಾಗಿದೆ ಎಂದು ದೃಢೀಕರಿಸಿ', colorClass: 'btn-3d-helper-lime' },
    p6: { role: 'Share personal thought/story', roleKn: 'ಸ್ವಂತ ಆಲೋಚನೆ ಹಂಚಿಕೊಳ್ಳಿ', colorClass: 'btn-3d-helper-indigo' },
  };

  // Direct speech synthesis helper
  const speakText = (text: string, onEnd?: () => void) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        if (language === 'KN') {
          utterance.lang = 'kn-IN';
        }

        setIsSpeakingAnimation(true);
        utterance.onend = () => {
          setIsSpeakingAnimation(false);
          if (onEnd) onEnd();
        };
        utterance.onerror = () => {
          setIsSpeakingAnimation(false);
          setSpeechAvailable(false);
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
        setSpeechAvailable(true);
      } catch {
        setSpeechAvailable(false);
        setIsSpeakingAnimation(false);
        if (onEnd) onEnd();
      }
    } else {
      setSpeechAvailable(false);
      if (onEnd) onEnd();
    }
  };

  // Handle single science concept card click: instant audio + add to interactive 3D sentence tray
  const handleConceptCardClick = (token: SentenceToken) => {
    const textToSpeak = language === 'KN' ? (token.kannadaLabel || token.label) : token.label;
    setLastSpoken(textToSpeak);
    sounds.playPop();

    if (onPhraseClick) {
      onPhraseClick(textToSpeak);
    }

    // Add to interactive sentence queue
    setSentenceQueue((prev) => [...prev, token]);

    // Speak single item
    speakText(textToSpeak);
  };

  // Handle Classroom Helper click: speaks audio, announces prompt, logs to offline storage, and opens action
  const handleHelperClick = (phrase: CommunicationPhrase) => {
    const textToSpeak = language === 'KN' ? phrase.kannadaText : phrase.text;
    setLastSpoken(textToSpeak);
    sounds.playSuccessChime();

    if (onPhraseClick) {
      onPhraseClick(textToSpeak);
    }

    // Speak audio
    speakText(textToSpeak);

    // Build specific alert notification based on helper id
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let alert: ActiveHelperAlert;

    switch (phrase.id) {
      case 'p1': // I know the answer
        alert = {
          id: phrase.id,
          symbol: '✋',
          title: language === 'KN' ? 'ವರ್ಚುವಲ್ ಕೈ ಎತ್ತಲಾಗಿದೆ!' : 'Virtual Hand Raised!',
          description: language === 'KN'
            ? 'ಉತ್ತರಿಸಲು ನಿಮ್ಮ ಸಿದ್ಧತೆಯನ್ನು ಶಿಕ್ಷಕರಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.'
            : 'Teacher notified: Student Ananya is ready to volunteer an answer.',
          type: 'hand',
          timestamp: timeNow,
        };
        break;
      case 'p2': // I have a question
        alert = {
          id: phrase.id,
          symbol: '❓',
          title: language === 'KN' ? 'ಪ್ರಶ್ನೆ ಕೇಳುವ ಸಿಗ್ನಲ್ ಕಳುಹಿಸಲಾಗಿದೆ!' : 'Question Signal Sent!',
          description: language === 'KN'
            ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಶಿಕ್ಷಕರಿಗೆ ತಿಳಿಸಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ಅಥವಾ ಶಿಕ್ಷಕರನ್ನು ಕಾಯಿರಿ.'
            : 'Teacher signaled to pause. You can open the doubt box to ask or type your question.',
          type: 'question',
          timestamp: timeNow,
        };
        break;
      case 'p3': // Explain again
        alert = {
          id: phrase.id,
          symbol: '🔁',
          title: language === 'KN' ? 'ಮತ್ತೊಮ್ಮೆ ವಿವರಿಸಲು ವಿನಂತಿಸಲಾಗಿದೆ!' : 'Repetition Requested!',
          description: language === 'KN'
            ? 'ಶಿಕ್ಷಕರಿಗೆ ತಿಳಿಸಲಾಗಿದೆ. ಸರಳೀಕೃತ ಹಂತ-ಹಂತದ ವಿವರಣೆಯನ್ನು ಸಹ ನೀವು ವೀಕ್ಷಿಸಬಹುದು.'
            : 'Teacher signaled to repeat pacing. You can also view the simplified visual explanation.',
          type: 'repeat',
          timestamp: timeNow,
        };
        break;
      case 'p4': // I need help
        alert = {
          id: phrase.id,
          symbol: '🚨',
          title: language === 'KN' ? 'ಸಹಾಯದ ಸಿಗ್ನಲ್ ರವಾನಿಸಲಾಗಿದೆ!' : 'Help Alert Broadcasted!',
          description: language === 'KN'
            ? 'ಶಿಕ್ಷಕರು ಮತ್ತು ಸಹಾಯಕರಿಗೆ ತಕ್ಷಣದ ಸಹಾಯಕ್ಕಾಗಿ ಸಂದೇಶ ಕಳುಹಿಸಲಾಗಿದೆ.'
            : 'Teacher and classroom aide alerted to provide immediate hands-on support.',
          type: 'help',
          timestamp: timeNow,
        };
        break;
      case 'p5': // I understand
        alert = {
          id: phrase.id,
          symbol: '🌟',
          title: language === 'KN' ? 'ಅರ್ಥವಾಗಿದೆ ಎಂದು ದಾಖಲಾಗಿದೆ!' : 'Comprehension Confirmed!',
          description: language === 'KN'
            ? 'ಅದ್ಭುತ! ನಿಮ್ಮ ತಿಳುವಳಿಕೆಯನ್ನು ಕಲಿಕೆಯ ದಾಖಲೆಯಲ್ಲಿ ನಮೂದಿಸಲಾಗಿದೆ.'
            : 'Great job! Comprehension check confirmed and logged in your learning record.',
          type: 'understand',
          timestamp: timeNow,
        };
        break;
      case 'p6': // I want to say something
      default:
        alert = {
          id: phrase.id,
          symbol: '🎙️',
          title: language === 'KN' ? 'ಮಾತನಾಡಲು ಅವಕಾಶ ಕೇಳಲಾಗಿದೆ!' : 'Speaking Turn Requested!',
          description: language === 'KN'
            ? 'ಶಿಕ್ಷಕರಿಗೆ ಮೈಕ್ರೊಫೋನ್ ನೀಡಲು ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ.'
            : 'Teacher signaled to pass speaking turn for your thought or story.',
          type: 'speak',
          timestamp: timeNow,
        };
        break;
    }

    setActiveHelperAlert(alert);

    // Save event to offline student activity log
    try {
      const logs = offlineStorage.loadStudentActivities();
      if (logs && logs.length > 0) {
        const ananyaLog = logs.find((l) => l.studentId === 's-ananya') || logs[0];
        const eventText = `[${timeNow}] ${phrase.symbol} Classroom Helper: "${phrase.text}"`;
        ananyaLog.events = [eventText, ...ananyaLog.events.filter((e) => e !== eventText)];
        offlineStorage.saveStudentActivities(logs);
      }
    } catch {
      // Offline fallback safe
    }
  };

  // Speak the entire sentence sequentially
  const handleSpeakFullSentence = () => {
    if (sentenceQueue.length === 0) return;

    sounds.playPop();
    const fullSentence = sentenceQueue
      .map((t) => (language === 'KN' ? (t.kannadaLabel || t.label) : t.label))
      .join(' ');

    setLastSpoken(fullSentence);

    // Speak with progressive index animation
    let index = 0;
    const speakNext = () => {
      if (index >= sentenceQueue.length) {
        setActiveTokenIndex(null);
        setIsSpeakingAnimation(false);
        return;
      }
      setActiveTokenIndex(index);
      const curText = language === 'KN'
        ? (sentenceQueue[index].kannadaLabel || sentenceQueue[index].label)
        : sentenceQueue[index].label;
      index++;
      speakText(curText, speakNext);
    };

    speakNext();
  };

  // Remove single token from sentence tray
  const handleRemoveToken = (indexToRemove: number) => {
    sounds.playPop();
    setSentenceQueue((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Clear entire sentence tray
  const handleClearSentence = () => {
    sounds.playPop();
    setSentenceQueue([]);
    setActiveTokenIndex(null);
  };

  return (
    <div className="bg-slate-50/80 rounded-3xl border-2 border-slate-200/90 shadow-xl p-5 sm:p-8 space-y-7 relative">
      {/* Top Header & Live Speech Waveform Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 rounded-xl text-indigo-700 inline-flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              </span>
              {language === 'KN' ? 'ಇಂದಿನ 3D ಸಂವಹನ ಮಂಡಳಿ' : "Today's 3D Communication Board"}
            </h2>
            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 rounded-full border border-blue-200">
              Tactile 3D
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
            {language === 'KN'
              ? 'ಮಾತನಾಡಲು ಕಾರ್ಡ್ ಒತ್ತಿ ಅಥವಾ ವಾಕ್ಯ ಕಟ್ಟಲು ಪದಗಳನ್ನು ಜೋಡಿಸಿ'
              : 'Press 3D cards to speak instantly, or compose multi-word sentences in the speech tray'}
          </p>
        </div>

        {/* Live Audio Status & Bouncing Waveform */}
        <div className="flex items-center gap-3">
          {isSpeakingAnimation && (
            <div className="flex items-end gap-1 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-2xl h-10 shadow-inner" title="Speech Audio Waveform">
              <span className="w-1.5 bg-indigo-600 rounded-full waveform-bar-1" />
              <span className="w-1.5 bg-indigo-500 rounded-full waveform-bar-2" />
              <span className="w-1.5 bg-indigo-600 rounded-full waveform-bar-3" />
              <span className="w-1.5 bg-indigo-400 rounded-full waveform-bar-4" />
              <span className="w-1.5 bg-indigo-600 rounded-full waveform-bar-5" />
            </div>
          )}

          {lastSpoken && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black shadow-xs animate-in fade-in" aria-live="polite">
              <Volume2 className={`w-4 h-4 text-emerald-600 ${isSpeakingAnimation ? 'animate-bounce' : ''}`} />
              <span className="max-w-[180px] sm:max-w-[280px] truncate">
                {language === 'KN' ? 'ಧ್ವನಿ:' : 'Spoken:'} “{lastSpoken}”
              </span>
            </div>
          )}

          {!speechAvailable && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
              <VolumeX className="w-4 h-4 shrink-0" />
              <span>Voice offline (visual mode)</span>
            </div>
          )}
        </div>
      </div>

      {/* 3D INTERACTIVE SENTENCE BUILDER TRAY */}
      <div className="tray-3d-groove p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span>🗂️</span>
              {language === 'KN' ? '3D ವಾಕ್ಯ ಫಲಕ (Interactive Sentence Tray)' : '3D Sentence Builder Tray'}
            </span>
            <span className="text-[11px] font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
              {sentenceQueue.length} {sentenceQueue.length === 1 ? 'word' : 'words'}
            </span>
          </div>

          {/* Action buttons on Sentence Tray */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleSpeakFullSentence}
              disabled={sentenceQueue.length === 0}
              type="button"
              className={`flex-1 sm:flex-initial min-h-[48px] px-5 py-2.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer ${
                sentenceQueue.length > 0 ? 'btn-3d-action-primary' : 'bg-slate-200 text-slate-400 border border-slate-300 rounded-2xl cursor-not-allowed opacity-60'
              }`}
              aria-label="Speak entire sentence"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'KN' ? 'ಪೂರ್ಣ ವಾಕ್ಯ ಓದಿ' : 'Speak Full Sentence'}</span>
            </button>

            <button
              onClick={() => handleRemoveToken(sentenceQueue.length - 1)}
              disabled={sentenceQueue.length === 0}
              type="button"
              className={`min-h-[48px] px-3.5 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                sentenceQueue.length > 0 ? 'btn-3d-action-secondary' : 'bg-slate-200 text-slate-400 border border-slate-300 rounded-2xl cursor-not-allowed opacity-60'
              }`}
              title="Remove last word"
              aria-label="Remove last word"
            >
              <Delete className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">{language === 'KN' ? 'ಹಿಂದಕ್ಕೆ' : 'Backspace'}</span>
            </button>

            <button
              onClick={handleClearSentence}
              disabled={sentenceQueue.length === 0}
              type="button"
              className={`min-h-[48px] px-3.5 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                sentenceQueue.length > 0 ? 'btn-3d-action-secondary text-rose-700 hover:text-rose-800' : 'bg-slate-200 text-slate-400 border border-slate-300 rounded-2xl cursor-not-allowed opacity-60'
              }`}
              title="Clear sentence"
              aria-label="Clear sentence"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'KN' ? 'ತೆರವುಗೊಳಿಸಿ' : 'Clear'}</span>
            </button>
          </div>
        </div>

        {/* Chips container inside the tray */}
        <div className="min-h-[68px] p-2.5 bg-white/70 rounded-2xl border border-slate-300/80 flex items-center gap-2.5 flex-wrap overflow-x-auto">
          {sentenceQueue.length === 0 ? (
            <p className="text-xs sm:text-sm text-slate-400 font-bold italic px-3 py-2 flex items-center gap-2">
              <span>👉</span>
              {language === 'KN'
                ? 'ಕೆಳಗಿನ ಯಾವುದೇ ಪರಿಕಲ್ಪನೆಯನ್ನು ಒತ್ತಿ ಇಲ್ಲಿ ವಾಕ್ಯವನ್ನು ರಚಿಸಿ...'
                : 'Tap any concept card below to add words and build your sentence here...'}
            </p>
          ) : (
            sentenceQueue.map((token, idx) => {
              const isCurrentlySpeaking = activeTokenIndex === idx;
              const displayText = language === 'KN' ? (token.kannadaLabel || token.label) : token.label;

              return (
                <div
                  key={`${token.id}-${idx}`}
                  className={`chip-3d px-3.5 py-2 flex items-center gap-2 font-black text-sm text-slate-900 ${
                    isCurrentlySpeaking ? 'ring-4 ring-indigo-400 bg-indigo-50 border-indigo-400 scale-105' : ''
                  }`}
                >
                  <span className="text-xl" aria-hidden="true">{token.symbol}</span>
                  <span className="font-extrabold">{displayText}</span>
                  <button
                    onClick={() => handleRemoveToken(idx)}
                    type="button"
                    className="w-5 h-5 ml-1 rounded-full bg-slate-200 hover:bg-rose-200 hover:text-rose-800 text-slate-600 flex items-center justify-center text-xs font-black transition-colors"
                    aria-label={`Remove ${displayText} from sentence`}
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3D CORE SCIENCE CONCEPTS (3x3 Grid with elevated physical depth) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>🔬</span>
            {language === 'KN' ? 'ಮುಖ್ಯ ವಿಜ್ಞಾನ ಪರಿಕಲ್ಪನೆಗಳು (3D Core Science Concepts)' : '3D Core Science Concepts'}
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            {language === 'KN' ? '9 ಸ್ಪರ್ಶ ಕಾರ್ಡ್‌ಗಳು' : '9 Tactile Cards'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {boardConcepts.map((item) => {
            const primaryLabel = language === 'KN' ? (item.kannadaLabel || item.label) : item.label;
            const secondaryLabel = language === 'KN' ? item.label : item.kannadaLabel;

            return (
              <button
                key={item.id}
                onClick={() =>
                  handleConceptCardClick({
                    id: item.id,
                    label: item.label,
                    symbol: item.symbol,
                    kannadaLabel: item.kannadaLabel,
                  })
                }
                type="button"
                className="btn-3d-concept min-h-[118px] min-w-[48px] p-4 flex flex-col items-center justify-center text-center cursor-pointer group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                aria-label={`Select and speak concept: ${primaryLabel}`}
              >
                <span
                  className="text-4xl group-hover:scale-120 transition-transform mb-1.5 filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.18)]"
                  aria-hidden="true"
                >
                  {item.symbol}
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                  {primaryLabel}
                </span>
                {secondaryLabel && (
                  <span className="text-[11px] text-indigo-700 font-extrabold mt-0.5 tracking-normal">
                    {secondaryLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D CLASSROOM HELPERS SECTION */}
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🤝</span>
              {language === 'KN' ? '3D ತರಗತಿ ಸಹಾಯಕಗಳು (3D Classroom Helpers)' : '3D Classroom Helpers'}
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              {language === 'KN'
                ? 'ಭಾಗವಹಿಸಲು, ಪ್ರಶ್ನೆ ಕೇಳಲು ಮತ್ತು ಸಹಾಯ ಪಡೆಯಲು 6 ತ್ವರಿತ ಬಟನ್‌ಗಳು'
                : '6 interactive participation buttons. Tap any helper to announce and trigger classroom support.'}
            </p>
          </div>

          {/* Interactive Info Toggle: What is the work of Classroom Helpers? */}
          <button
            onClick={() => setShowHelperExplanation(!showHelperExplanation)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black hover:bg-indigo-100 transition-colors cursor-pointer self-start sm:self-auto"
            aria-expanded={showHelperExplanation}
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>{language === 'KN' ? 'ಸಹಾಯಕಗಳ ಕೆಲಸವೇನು? (Info)' : 'What do Classroom Helpers do?'}</span>
            {showHelperExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* PROMINENT LIVE INTERACTIVE HELPER BROADCAST BANNER */}
        {activeHelperAlert && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 ${
              activeHelperAlert.type === 'help'
                ? 'bg-amber-50 border-amber-400 text-amber-950'
                : activeHelperAlert.type === 'question'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : activeHelperAlert.type === 'repeat'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : activeHelperAlert.type === 'hand'
                ? 'bg-sky-50 border-sky-300 text-sky-950'
                : 'bg-indigo-50 border-indigo-300 text-indigo-950'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3.5">
              <span className="text-3xl shrink-0 p-2 bg-white/80 rounded-2xl shadow-xs" aria-hidden="true">
                {activeHelperAlert.symbol}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black tracking-tight">
                    {activeHelperAlert.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/90 border border-current opacity-80">
                    {activeHelperAlert.timestamp}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold mt-0.5 opacity-90">
                  {activeHelperAlert.description}
                </p>
              </div>
            </div>

            {/* Direct Contextual Interactive Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {activeHelperAlert.type === 'question' && onOpenAskDoubt && (
                <button
                  onClick={() => {
                    sounds.playPop();
                    onOpenAskDoubt();
                  }}
                  type="button"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30 transition-transform active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'KN' ? 'ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ / ಕೇಳಿ' : 'Open Ask Question Box'}</span>
                </button>
              )}

              {activeHelperAlert.type === 'repeat' && onOpenExplainSimply && (
                <button
                  onClick={() => {
                    sounds.playPop();
                    onOpenExplainSimply();
                  }}
                  type="button"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30 transition-transform active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'KN' ? 'ಸರಳ ವಿವರಣೆ ವೀಕ್ಷಿಸಿ' : 'View Simple Explanation'}</span>
                </button>
              )}

              {activeHelperAlert.type === 'help' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/80 text-amber-900 text-xs font-black border border-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>{language === 'KN' ? 'ಶಿಕ್ಷಕರಿಗೆ ಅಲರ್ಟ್ ನೀಡಲಾಗಿದೆ' : 'Aide Dispatched'}</span>
                </div>
              )}

              <button
                onClick={() => setActiveHelperAlert(null)}
                type="button"
                className="w-8 h-8 rounded-xl bg-white/70 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                title="Dismiss"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Accessible Explanatory Panel for Judges, Teachers & AAC Specialists */}
        {showHelperExplanation && (
          <div className="p-5 bg-gradient-to-br from-indigo-50/90 to-blue-50/90 rounded-2xl border-2 border-indigo-200 shadow-md text-xs sm:text-sm text-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>
                {language === 'KN'
                  ? 'ತರಗತಿ ಸಹಾಯಕಗಳ ಉದ್ದೇಶ ಮತ್ತು ಪಾತ್ರ (Purpose of Classroom Helpers)'
                  : 'Purpose & Role of Classroom Helpers in Inclusive AAC Classrooms'}
              </span>
            </div>

            <p className="leading-relaxed">
              In inclusive classrooms, non-speaking students, children with cerebral palsy, autism, or speech motor delays cannot quickly shout out answers or type sentences during rapid classroom discourse.
              <strong> Classroom Helpers</strong> provide <strong>1-tap pragmatic communication intents</strong> so every child can participate equally alongside speaking peers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 bg-white/90 rounded-xl border border-sky-200">
                <span className="font-black text-sky-900 block mb-0.5">💬 1. Turn-Taking / Answering</span>
                <span className="text-[11px] text-slate-600">Raises a virtual hand so the teacher knows the child is ready to volunteer without being talked over.</span>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-rose-200">
                <span className="font-black text-rose-900 block mb-0.5">❓ 2. Asking Questions</span>
                <span className="text-[11px] text-slate-600">Politely halts instruction so the teacher can pause and clarify a confusing concept in real time.</span>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-emerald-200">
                <span className="font-black text-emerald-900 block mb-0.5">🔁 3. Self-Advocacy</span>
                <span className="text-[11px] text-slate-600">Empowers the student to request repetition or slower pacing without anxiety, fear, or stigma.</span>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-amber-200">
                <span className="font-black text-amber-900 block mb-0.5">🙋 4. Assistance & Support</span>
                <span className="text-[11px] text-slate-600">Immediate distress/help signal for physical adjustments, sensory regulation, or teacher aide guidance.</span>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-lime-200">
                <span className="font-black text-lime-900 block mb-0.5">✅ 5. Choral Comprehension</span>
                <span className="text-[11px] text-slate-600">Allows non-speaking students to join whole-class choral checks (&quot;Did everyone follow that?&quot;).</span>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-indigo-200">
                <span className="font-black text-indigo-900 block mb-0.5">🗣️ 6. Personal Expression</span>
                <span className="text-[11px] text-slate-600">Enables autonomous storytelling, sharing personal observations, and authentic self-expression.</span>
              </div>
            </div>

            <p className="text-[11px] text-indigo-950 font-bold bg-indigo-100/70 p-2.5 rounded-xl border border-indigo-200">
              💡 <strong>Teacher Intelligence Impact:</strong> When a child taps a helper, SAMBHAV logs the communicative event so teachers see who needed repetition and who volunteered answers, turning silent participation into actionable classroom support.
            </p>
          </div>
        )}

        {/* 6 Tactile 3D Helper Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMUNICATION_PHRASES.map((phrase) => {
            const displayText = language === 'KN' ? phrase.kannadaText : phrase.text;
            const meta = HELPER_META[phrase.id] || {
              role: 'Classroom participation intent',
              roleKn: 'ತರಗತಿ ಸಂವಹನ ಉದ್ದೇಶ',
              colorClass: 'btn-3d-helper-sky',
            };
            const roleSubtext = language === 'KN' ? meta.roleKn : meta.role;
            const isActive = activeHelperAlert?.id === phrase.id;

            return (
              <button
                key={phrase.id}
                onClick={() => handleHelperClick(phrase)}
                type="button"
                className={`min-h-[76px] min-w-[48px] px-5 py-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer font-black text-sm text-left group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 transition-all ${
                  meta.colorClass
                } ${isActive ? 'ring-4 ring-indigo-500 scale-[1.02]' : ''}`}
                aria-label={`Classroom Helper: ${displayText} (${roleSubtext})`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className="text-3xl shrink-0 group-hover:scale-115 transition-transform filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
                    aria-hidden="true"
                  >
                    {phrase.symbol}
                  </span>
                  <div className="flex flex-col">
                    <span className="leading-snug font-extrabold">{displayText}</span>
                    <span className="text-[11px] opacity-80 font-bold mt-0.5">
                      {roleSubtext}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <span className="p-1 rounded-full bg-indigo-600 text-white shrink-0 shadow-xs" title="Currently Active">
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
