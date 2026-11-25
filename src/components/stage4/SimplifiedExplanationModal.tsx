import React, { useState } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { SIMPLIFIED_EXPLANATIONS } from '../../data/stage4Data';
import { generateAiExplanation } from '../../services/aiAssistantService';
import { Sparkles, Volume2, HelpCircle, X, Loader2, Hand, Eye, Lightbulb } from 'lucide-react';
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
  const [activeTier, setActiveTier] = useState<'sensory' | 'visual' | 'science'>('sensory');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiExplanationsMap, setAiExplanationsMap] = useState<Record<string, { sensory: string; visual: string; science: string; realLifeExample: string }>>({});

  if (!isOpen) return null;

  const selectedNode = graph.nodes.find(n => n.id === selectedConceptId) || graph.nodes[0];
  const staticExplanation = SIMPLIFIED_EXPLANATIONS[selectedConceptId] || {
    conceptId: selectedNode.id,
    conceptSymbol: selectedNode.symbol,
    conceptLabel: selectedNode.label,
    simpleExplanation: selectedNode.explanation,
    realLifeExample: 'Water cycles continuously through nature around us.',
    visualPrompt: `${selectedNode.label} visual illustration`
  };

  const aiData = aiExplanationsMap[selectedConceptId];

  // Multi-tier descriptions:
  const sensoryText = aiData?.sensory || `Touch a cold soda can: you feel tiny water drops forming on the outside from the invisible air. That cold feeling is ${selectedNode.label}!`;
  const visualText = aiData?.visual || `Imagine tiny invisible water vapor particles floating like floating balloons. When they touch a cool mirror, they hold hands and turn back into little water drops.`;
  const scienceText = aiData?.science || `${selectedNode.explanation} Water changes state as its temperature cools down.`;
  const homeExampleText = aiData?.realLifeExample || staticExplanation.realLifeExample;

  // Speak active explanation tier
  const handleSpeak = () => {
    sounds.playPop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        let textToSpeak = '';
        if (activeTier === 'sensory') textToSpeak = `${selectedNode.label}. Sensory feel: ${sensoryText}`;
        else if (activeTier === 'visual') textToSpeak = `${selectedNode.label}. Picture story: ${visualText}`;
        else textToSpeak = `${selectedNode.label}. Science fact: ${scienceText}`;

        const u = new SpeechSynthesisUtterance(textToSpeak);
        u.rate = 0.88;
        setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      } catch {
        setIsSpeaking(false);
      }
    }
  };

  // Generate fresh AI analogies with Gemini 2.5 Flash
  const handleGenerateAiMetaphor = async () => {
    sounds.playPop();
    setIsGeneratingAi(true);

    const result = await generateAiExplanation(selectedNode.label, selectedNode.explanation);
    setIsGeneratingAi(false);

    if (result && result.sensory && result.visual && result.science) {
      sounds.playSuccessChime();
      setAiExplanationsMap(prev => ({
        ...prev,
        [selectedConceptId]: {
          sensory: result.sensory,
          visual: result.visual,
          science: result.science,
          realLifeExample: result.realLifeExample
        }
      }));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 p-5 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Explain Simply (Multi-Tier)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sensory, visual, and gentle science analogies for every child
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
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

        {/* 3 Cognitive Tiered Selectors */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            onClick={() => {
              sounds.playPop();
              setActiveTier('sensory');
            }}
            type="button"
            className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTier === 'sensory'
                ? 'bg-white text-emerald-800 shadow-xs ring-2 ring-emerald-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hand className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Sensory</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setActiveTier('visual');
            }}
            type="button"
            className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTier === 'visual'
                ? 'bg-white text-blue-800 shadow-xs ring-2 ring-blue-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Story</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setActiveTier('science');
            }}
            type="button"
            className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTier === 'science'
                ? 'bg-white text-indigo-800 shadow-xs ring-2 ring-indigo-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
            <span>3. Science</span>
          </button>
        </div>

        {/* Big Concept Card Displaying Active Tier */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-center space-y-3">
          <span className="text-5xl mx-auto block animate-float filter drop-shadow-xs">
            {selectedNode.symbol}
          </span>
          <h4 className="text-xl sm:text-2xl font-bold text-slate-900">
            {selectedNode.label}
          </h4>

          {/* Tier 1: Sensory */}
          {activeTier === 'sensory' && (
            <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1.5 text-left animate-in fade-in">
              <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider flex items-center gap-1">
                <Hand className="w-3 h-3" />
                <span>Tier 1: Sensory Feel & Everyday Experience</span>
              </span>
              <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                “{sensoryText}”
              </p>
            </div>
          )}

          {/* Tier 2: Visual Metaphor Story */}
          {activeTier === 'visual' && (
            <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-1.5 text-left animate-in fade-in">
              <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Tier 2: Fun Visual Picture Story</span>
              </span>
              <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                “{visualText}”
              </p>
            </div>
          )}

          {/* Tier 3: Gentle Science Fact */}
          {activeTier === 'science' && (
            <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-1.5 text-left animate-in fade-in">
              <span className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                <span>Tier 3: Simple Science Fact</span>
              </span>
              <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                “{scienceText}”
              </p>
            </div>
          )}

          {/* Familiar Home Example */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-left text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-0.5">🏠 Real-Life Home Example:</span>
            <span>{homeExampleText}</span>
          </div>
        </div>

        {/* Actions: AI Generate, Speak Audio, Ask Doubt */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={handleGenerateAiMetaphor}
            disabled={isGeneratingAi}
            type="button"
            className="min-h-[44px] px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            {isGeneratingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>AI New Analogy</span>
              </>
            )}
          </button>

          <button
            onClick={handleSpeak}
            type="button"
            className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <Volume2 className={`w-4 h-4 text-emerald-700 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>Read Aloud</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              onClose();
              if (onOpenAskDoubt) onOpenAskDoubt();
            }}
            type="button"
            className="min-h-[44px] px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-sky-700" />
            <span>Ask a Doubt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
