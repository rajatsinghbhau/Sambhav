import React, { useState } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { SIMPLIFIED_EXPLANATIONS } from '../../data/stage4Data';
import { Sparkles, BookOpen, Volume2, HelpCircle, X } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface SimplifiedExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  graph: ConceptGraph;
  initialConceptId?: string;
  onOpenAskDoubt?: () => void;
}

export const SimplifiedExplanationModal: React.FC<SimplifiedExplanationModalProps> = ({
  isOpen,
  onClose,
  graph,
  initialConceptId = 'condensation',
  onOpenAskDoubt
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(initialConceptId);
  const [activeView, setActiveView] = useState<'simple' | 'example' | 'visual'>('simple');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedNode = graph.nodes.find(n => n.id === selectedConceptId) || graph.nodes[0];
  const explanation = SIMPLIFIED_EXPLANATIONS[selectedConceptId] || {
    conceptId: selectedNode.id,
    conceptSymbol: selectedNode.symbol,
    conceptLabel: selectedNode.label,
    simpleExplanation: selectedNode.explanation,
    realLifeExample: 'Water cycles continuously through nature around us.',
    visualPrompt: `${selectedNode.label} visual illustration`
  };

  const handleSpeak = () => {
    sounds.playPop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const text = `${explanation.conceptLabel}. ${explanation.simpleExplanation}. For example: ${explanation.realLifeExample}`;
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.85;
        setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      } catch {
        setIsSpeaking(false);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-2 border-slate-200 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Explain Simply
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Child-friendly explanation and real-life concrete examples
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Concept Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {graph.nodes.map(node => (
            <button
              key={node.id}
              onClick={() => {
                sounds.playPop();
                setSelectedConceptId(node.id);
              }}
              type="button"
              className={`min-h-[44px] px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                selectedConceptId === node.id
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{node.symbol}</span>
              <span>{node.label}</span>
            </button>
          ))}
        </div>

        {/* Big Concept Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-50 via-blue-50/50 to-indigo-50 border-2 border-sky-200 text-center space-y-3">
          <span className="text-6xl mx-auto block animate-float filter drop-shadow">
            {explanation.conceptSymbol}
          </span>
          <h4 className="text-2xl font-black text-slate-900">
            {explanation.conceptLabel}
          </h4>

          {/* Simple Explanation View */}
          {activeView === 'simple' && (
            <div className="p-4 bg-white/90 rounded-2xl border border-sky-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-sky-700 tracking-wider block">
                Simple Explanation
              </span>
              <p className="text-base font-bold text-slate-800 leading-relaxed">
                “{explanation.simpleExplanation}”
              </p>
            </div>
          )}

          {/* Real-Life Example View */}
          {activeView === 'example' && (
            <div className="p-4 bg-white/90 rounded-2xl border border-sky-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block">
                Real-Life Example
              </span>
              <p className="text-base font-bold text-slate-800 leading-relaxed">
                “{explanation.realLifeExample}”
              </p>
            </div>
          )}

          {/* Visual Diagram View */}
          {activeView === 'visual' && (
            <div className="p-4 bg-white/90 rounded-2xl border border-sky-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">
                Visual Scene
              </span>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                {explanation.visualPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons: See Visual, See Example, Ask a Doubt, Explain Again */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => {
              sounds.playPop();
              setActiveView('simple');
            }}
            type="button"
            className={`min-h-[48px] px-3 py-2 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
              activeView === 'simple'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Simple Words</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setActiveView('example');
            }}
            type="button"
            className={`min-h-[48px] px-3 py-2 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
              activeView === 'example'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>See Example</span>
          </button>

          <button
            onClick={handleSpeak}
            type="button"
            className="min-h-[48px] px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 text-emerald-700 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>Explain Again (Audio)</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              onClose();
              if (onOpenAskDoubt) onOpenAskDoubt();
            }}
            type="button"
            className="min-h-[48px] px-3 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-900 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-700" />
            <span>Ask a Doubt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
