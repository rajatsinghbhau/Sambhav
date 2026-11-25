import React, { useState } from 'react';
import { ConceptGraph, ConceptNode } from '../../types/conceptGraph';
import { CheckCircle2, ArrowRight, ArrowLeft, Volume2 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ConceptGraphScreenProps {
  graph: ConceptGraph;
  language?: 'EN' | 'KN';
  onNext: () => void;
  onBack: () => void;
}

export const ConceptGraphScreen: React.FC<ConceptGraphScreenProps> = ({
  graph,
  language = 'EN',
  onNext,
  onBack,
}) => {
  const [selectedNode, setSelectedNode] = useState<ConceptNode>(
    graph.nodes.find(n => n.id === 'condensation') || graph.nodes[0]
  );
  const [speechError, setSpeechError] = useState<string | null>(null);

  const speakNode = (node: ConceptNode) => {
    setSpeechError(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const textToSpeak = language === 'KN' 
          ? `${node.kannadaLabel}. ${node.explanation}`
          : `${node.label}. ${node.explanation}`;

        const u = new SpeechSynthesisUtterance(textToSpeak);
        u.rate = 0.9;
        if (language === 'KN') {
          u.lang = 'kn-IN';
        }

        u.onerror = () => {
          // Graceful fallback: show text, continue normally, do not crash
          setSpeechError('Speech synthesis unavailable for this voice; displaying text visually.');
        };

        window.speechSynthesis.speak(u);
      } catch (err) {
        // Fallback without crashing
        console.warn('SpeechSynthesis error caught:', err);
        setSpeechError('Speech synthesis unavailable; continuing visually.');
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
      {/* Teacher Approved Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-600 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20">
          <CheckCircle2 className="w-5 h-5 fill-white text-emerald-600 shrink-0" />
          <span>{language === 'KN' ? 'ಶಿಕ್ಷಕರು ಅನುಮೋದಿಸಿದ ಪಾಠದ ನಕ್ಷೆ' : 'Teacher Approved Lesson Map'}</span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'KN' ? 'ಜಲಚಕ್ರ (The Water Cycle)' : 'The Water Cycle Map'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
          {language === 'KN'
            ? 'ಪ್ರಕೃತಿಯಲ್ಲಿ ನೀರು ಹೇಗೆ ಚಲಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ತೋರಿಸುವ ಚಿತ್ರಗಳು'
            : 'Step-by-step pictures showing how water moves in nature'}
        </p>
      </div>

      {/* 7 Pill Node Cards in a row */}
      <div className="overflow-x-auto pb-3 pt-1">
        <div className="flex items-center justify-center gap-3 min-w-max px-2">
          {graph.nodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            const primaryLabel = language === 'KN' ? node.kannadaLabel : node.label;
            const secondaryLabel = language === 'KN' ? node.label : node.kannadaLabel;

            return (
              <button
                key={node.id}
                onClick={() => {
                  sounds.playPop();
                  setSelectedNode(node);
                }}
                type="button"
                aria-label={`Select concept: ${primaryLabel}`}
                className={`min-h-[116px] min-w-[96px] sm:min-w-[112px] w-auto max-w-[130px] p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 btn-tactile ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-md ring-4 ring-blue-100 scale-105'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                }`}
              >
                <span className="text-3xl my-1.5 shrink-0" aria-hidden="true">
                  {node.symbol}
                </span>
                <span className="text-xs font-black text-slate-900 leading-tight break-words w-full">
                  {primaryLabel}
                </span>
                <span className="text-[10px] sm:text-[11px] text-blue-700 font-bold mt-0.5 leading-tight break-words w-full">
                  {secondaryLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Focus Highlight Card with Cloud/Nature visual block */}
      <div className="bg-gradient-to-r from-blue-50/90 via-sky-50 to-indigo-50/70 border-2 border-blue-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="text-6xl p-4 bg-white rounded-2xl border-2 border-blue-200 shadow-xs shrink-0 animate-gentle">
            {selectedNode.symbol}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {language === 'KN' ? selectedNode.kannadaLabel : selectedNode.label}
              </h3>
              <button
                onClick={() => speakNode(selectedNode)}
                type="button"
                className="min-h-[48px] min-w-[48px] p-2.5 rounded-xl bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer shadow-2xs flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label={`Listen to ${selectedNode.label}`}
                title="Listen to explanation"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm font-bold text-blue-800">
              {language === 'KN' ? selectedNode.label : selectedNode.kannadaLabel}
            </p>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed pt-2 max-w-lg font-medium">
              “{selectedNode.explanation}”
            </p>
            {speechError && (
              <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
                {speechError}
              </p>
            )}
          </div>
        </div>

        {/* Visual Nature Photo/Graphic Box */}
        <div className="w-full md:w-60 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-sky-600 flex flex-col items-center justify-center text-white p-4 shadow-md relative">
          <span className="text-5xl filter drop-shadow">☁️🌧️</span>
          <span className="text-xs font-black uppercase tracking-widest text-blue-100 mt-2">
            Classroom Anchor
          </span>
          <span className="text-xs font-bold text-center text-white/95">
            {language === 'KN' ? selectedNode.kannadaLabel : selectedNode.label} in Nature
          </span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => {
            sounds.playPop();
            onBack();
          }}
          type="button"
          aria-label="Go back"
          className="min-h-[48px] px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 flex items-center gap-2 cursor-pointer btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'KN' ? 'ಹಿಂದೆ (Back)' : 'Back'}</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            onNext();
          }}
          type="button"
          aria-label="Proceed to communication board"
          className="min-h-[48px] px-7 py-2.5 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/25 btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span>{language === 'KN' ? 'ಮುಂದೆ: ಸಂವಹನ ಮಂಡಳಿ' : 'Next: Communication'}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};