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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Teacher Approved Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{language === 'KN' ? 'ಶಿಕ್ಷಕರು ಅನುಮೋದಿಸಿದ ಪಾಠದ ನಕ್ಷೆ' : 'Teacher Approved Lesson Map'}</span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'KN'
            ? (graph.titleKn ? `${graph.titleKn} (${graph.title})` : graph.title)
            : `${graph.title} Map`}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
          {graph.subtitle || (language === 'KN'
            ? 'ಪ್ರಕೃತಿಯಲ್ಲಿ ಈ ಪರಿಕಲ್ಪನೆ ಹೇಗೆ ಚಲಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ತೋರಿಸುವ ಚಿತ್ರಗಳು'
            : 'Step-by-step concepts showing how nature connects')}
        </p>
      </div>

      {/* 7 Pill Node Cards in a row */}
      <div className="overflow-x-auto pb-3 pt-1 scrollbar-none">
        <div className="flex items-center justify-center gap-2.5 min-w-max px-2">
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
                className={`min-h-[110px] min-w-[96px] sm:min-w-[110px] w-auto max-w-[130px] p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-200 scale-102'
                    : 'border-slate-200/90 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="text-3xl my-1 shrink-0" aria-hidden="true">
                  {node.symbol}
                </span>
                <span className="text-xs font-black text-slate-900 leading-tight break-words w-full">
                  {primaryLabel}
                </span>
                <span className="text-[10px] text-indigo-700 font-bold mt-0.5 leading-tight break-words w-full">
                  {secondaryLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Focus Highlight Card with Cloud/Nature visual block */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="text-5xl p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs shrink-0">
            {selectedNode.symbol}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {language === 'KN' ? selectedNode.kannadaLabel : selectedNode.label}
              </h3>
              <button
                onClick={() => speakNode(selectedNode)}
                type="button"
                className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer shadow-2xs flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                aria-label={`Listen to ${selectedNode.label}`}
                title="Listen to explanation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-bold text-indigo-700">
              {language === 'KN' ? selectedNode.label : selectedNode.kannadaLabel}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 max-w-lg font-medium">
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
        <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-800 flex flex-col items-center justify-center text-white p-4 shadow-sm relative shrink-0">
          <span className="text-4xl filter drop-shadow">☁️🌧️</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mt-2">
            Classroom Anchor
          </span>
          <span className="text-xs font-bold text-center text-white/95 mt-0.5">
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
          className="min-h-[44px] px-5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
          className="min-h-[44px] px-6 py-2 rounded-xl bg-indigo-600 text-white font-extrabold text-xs sm:text-sm hover:bg-indigo-700 flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span>{language === 'KN' ? 'ಮುಂದೆ: ವಿಜ್ಞಾನ ಲ್ಯಾಬ್' : 'Next: Science Sandbox'}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};