import React, { useState, useEffect, useRef } from 'react';
import { ConceptGraph, ConceptNode } from '../../types/conceptGraph';
import { AiSimulation, AiSimulationStep } from '../../types/simulation';
import {
  RotateCcw,
  Play,
  Volume2,
  Sparkles,
  Trash2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sliders
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { offlineStorage } from '../../utils/offlinePersistence';
import { COMMUNICATION_PHRASES } from '../../data/communicationData';
import { generateAiSandboxSimulation } from '../../services/aiAssistantService';

interface ScienceSandboxScreenProps {
  graph: ConceptGraph;
  language?: 'EN' | 'KN';
  onNext?: () => void;
  onBack?: () => void;
  onOpenAskDoubt?: () => void;
  onOpenExplainSimply?: () => void;
}

interface SentenceToken {
  id: string;
  label: string;
  symbol: string;
  kannadaLabel?: string;
}

export const ScienceSandboxScreen: React.FC<ScienceSandboxScreenProps> = ({
  graph,
  language = 'EN',
  onNext,
  onBack,
  onOpenAskDoubt,
  onOpenExplainSimply,
}) => {
  // AI Simulation State (Dynamic for ANY teacher question)
  const [aiSimulation, setAiSimulation] = useState<AiSimulation | null>(null);
  const [customQuestionInput, setCustomQuestionInput] = useState<string>('');
  const [isGeneratingAiSim, setIsGeneratingAiSim] = useState<boolean>(false);
  const [currentAiStepIndex, setCurrentAiStepIndex] = useState<number>(0);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [experimentEnergy, setExperimentEnergy] = useState<number>(1.0); // 0.8: Gentle, 1.0: Normal, 1.3: Max

  // Pip feedback
  const [pipFeedback, setPipFeedback] = useState<string>('');
  const [pipFeedbackKn, setPipFeedbackKn] = useState<string>('');

  // AAC Sentence Tray
  const [sentenceQueue, setSentenceQueue] = useState<SentenceToken[]>([]);

  // Track if initial generation has run
  const hasInitializedRef = useRef<string>('');

  // Ambient floating particles helper
  const getAmbientParticles = (step: AiSimulationStep | null, question?: string) => {
    const text = `${step?.name || ''} ${step?.symbol || ''} ${step?.visualState?.stageAtmosphere || ''} ${question || ''}`.toLowerCase();
    if (text.includes('ice') || text.includes('freeze') || text.includes('cold') || text.includes('snow')) {
      return ['❄️', '🧊', '✨', '💨', '❄️'];
    }
    if (text.includes('heat') || text.includes('fire') || text.includes('sun') || text.includes('steam') || text.includes('boil')) {
      return ['🔥', '💨', '⚡', '✨', '☀️'];
    }
    if (text.includes('plant') || text.includes('seed') || text.includes('leaf') || text.includes('grow')) {
      return ['🌱', '🍃', '☀️', '💧', '🌸'];
    }
    return ['💧', '🫧', '🌊', '✨', '💧'];
  };

  // Helper to build instant local simulation from graph so user NEVER waits
  const buildInstantGraphSimulation = (topicTitle: string, nodes?: ConceptNode[]): AiSimulation => {
    const defaultSteps = [
      { id: 'step-1', label: 'Setup Materials', kannadaLabel: 'ಸಾಮಗ್ರಿಗಳ ಸಿದ್ಧತೆ', symbol: '🔍', explanation: `Observing the starting materials for "${topicTitle}".` },
      { id: 'step-2', label: 'Trigger Reaction', kannadaLabel: 'ಕ್ರಿಯೆಯ ಪ್ರಚೋದನೆ', symbol: '⚡', explanation: `Applying the experimental force or action.` },
      { id: 'step-3', label: 'State Transformation', kannadaLabel: 'ಸ್ಥಿತಿ ಬದಲಾವಣೆ', symbol: '🔄', explanation: `The physical or chemical reaction takes place.` },
      { id: 'step-4', label: 'Final Result', kannadaLabel: 'ಅಂತಿಮ ಫಲಿತಾಂಶ', symbol: '🌟', explanation: `The process completes with observable scientific effects.` }
    ];

    const stepNodes = nodes && nodes.length > 0 ? nodes : defaultSteps;

    const steps: AiSimulationStep[] = stepNodes.map((node, idx, arr) => {
      const colors = [
        'from-amber-200 via-yellow-100 to-sky-200',
        'from-sky-300 via-blue-100 to-indigo-200',
        'from-indigo-300 via-purple-100 to-blue-200',
        'from-blue-400 via-sky-200 to-indigo-300',
        'from-teal-300 via-emerald-100 to-sky-200',
        'from-emerald-300 via-teal-100 to-sky-200',
        'from-purple-300 via-pink-100 to-blue-200'
      ];

      return {
        stepNumber: idx + 1,
        id: node.id || `step-${idx + 1}`,
        name: node.label,
        nameKn: node.kannadaLabel || node.label,
        symbol: node.symbol || '🔬',
        actionButtonLabel: `Trigger ${node.label}`,
        actionButtonLabelKn: `${node.kannadaLabel || node.label} ಸಕ್ರಿಯಗೊಳಿಸಿ`,
        pipExplanation: node.explanation || `Look at how ${node.label} causes the reaction!`,
        pipExplanationKn: node.kannadaLabel ? `${node.kannadaLabel}: ${node.explanation}` : `${node.label} ಕ್ರಿಯೆಯನ್ನು ಗಮನಿಸಿ!`,
        visualState: {
          skyGradient: colors[idx % colors.length],
          stageAtmosphere: `${node.label} in action (${node.explanation.slice(0, 40)}...)`,
          activeVisualEmoji: node.symbol || '🔬',
          animationType: idx === arr.length - 1 ? 'sparkle' : 'bounce',
          gaugeLabel: 'Simulation Progress',
          gaugeValue: `${Math.round(((idx + 1) / arr.length) * 100)}%`,
          gaugePercent: Math.round(((idx + 1) / arr.length) * 100)
        },
        causeAndEffect: {
          cause: `Activating ${node.label}`,
          effect: node.explanation
        },
        sensoryClues: {
          sight: `Observable shift in ${node.label}`,
          sightKn: `${node.kannadaLabel || node.label} ನಲ್ಲಿ ಬದಲಾವಣೆ`,
          touch: `Noticeable temperature or state change in ${node.label}`,
          touchKn: `ತಾಪಮಾನ ಅಥವಾ ಸ್ಥಿತಿ ಬದಲಾವಣೆ`,
          sound: `Reaction sound during ${node.label}`,
          soundKn: `ಪ್ರಕ್ರಿಯೆಯ ಸದ್ದು`
        },
        aacReactionPhrase: `I see ${node.label}!`,
        aacReactionPhraseKn: `ನಾನು ${node.kannadaLabel || node.label} ನೋಡುತ್ತಿದ್ದೇನೆ!`
      };
    });

    return {
      topic: topicTitle,
      topicKn: graph.titleKn || topicTitle,
      inquiryQuestion: `How does the process of ${topicTitle} work step by step?`,
      inquiryQuestionKn: `"${graph.titleKn || topicTitle}" ಪ್ರಕ್ರಿಯೆಯು ಹಂತ-ಹಂತವಾಗಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?`,
      introMessage: `Welcome to the ${topicTitle} simulation! Tap Next Step to see what happens!`,
      introMessageKn: `${graph.titleKn || topicTitle} ಪ್ರಯೋಗಕ್ಕೆ ಸುಸ್ವಾಗತ! ಮುಂದಿನ ಹಂತವನ್ನು ಮುಟ್ಟಿ!`,
      themeType: 'general',
      steps,
      celebrationMessage: `Hurray! You completed the full experiment for "${topicTitle}"!`,
      celebrationMessageKn: `ಅದ್ಭುತ! ನೀವು "${graph.titleKn || topicTitle}" ಪ್ರಯೋಗವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮುಗಿಸಿದ್ದೀರಿ!`,
      isAiGenerated: false
    };
  };

  // On mount or graph change: immediately load simulation so user never sees empty state
  useEffect(() => {
    const currentId = `${graph.id}-${graph.title}`;
    if (hasInitializedRef.current === currentId) return;
    hasInitializedRef.current = currentId;

    // 1. Immediately provide instant graph simulation (0ms wait)
    const instantSim = buildInstantGraphSimulation(graph.title, graph.nodes);
    setAiSimulation(instantSim);
    setCurrentAiStepIndex(0);
    setPipFeedback(instantSim.steps[0].pipExplanation);
    setPipFeedbackKn(instantSim.steps[0].pipExplanationKn);
    setIsAutoSimulating(false);

    // 2. Fetch fresh Groq AI simulation in background
    const autoQuestion = `How does the cause and effect process of ${graph.title} work step by step?`;
    generateAiSandboxSimulation(autoQuestion, graph.title, graph.nodes).then((aiResult) => {
      if (aiResult && aiResult.steps && aiResult.steps.length > 0) {
        setAiSimulation(aiResult);
        setCurrentAiStepIndex(0);
        setPipFeedback(aiResult.steps[0].pipExplanation);
        setPipFeedbackKn(aiResult.steps[0].pipExplanationKn);
        setAiNotice(
          language === 'KN'
            ? '✨ Groq AI ಮೂಲಕ ನೈಜ ಸಿಮ್ಯುಲೇಶನ್ ಲೋಡ್ ಆಗಿದೆ!'
            : '✨ Live simulation powered by Groq AI (Llama 3.3 70B)!'
        );
      }
    }).catch(() => {});
  }, [graph.id, graph.title]);

  // Voice speech synthesis
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        if (language === 'KN') u.lang = 'kn-IN';
        window.speechSynthesis.speak(u);
      } catch {}
    }
  };

  // Log experiment activity for teacher
  const logActivity = (actionLabel: string) => {
    try {
      const logs = offlineStorage.loadStudentActivities();
      if (logs && logs.length > 0) {
        const student = logs.find((l) => l.studentId === 's-ananya') || logs[0];
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const eventText = `[${timeNow}] 🧪 Sandbox Reaction in "${graph.title}": ${actionLabel}`;
        student.events = [eventText, ...student.events.filter((e) => e !== eventText)];
        offlineStorage.saveStudentActivities(logs);
      }
    } catch {}
  };

  // Helper to resolve vivid Tailwind gradients reliably based on simulation state
  const resolveStageGradient = (skyGradient?: string, step?: AiSimulationStep | null) => {
    const text = `${skyGradient || ''} ${step?.name || ''} ${step?.symbol || ''} ${step?.visualState?.stageAtmosphere || ''} ${aiSimulation?.inquiryQuestion || ''}`.toLowerCase();
    if (text.includes('ice') || text.includes('freeze') || text.includes('cold') || text.includes('snow') || text.includes('❄️') || text.includes('🧊')) {
      return 'from-sky-300 via-cyan-100 to-blue-200 border-cyan-400';
    }
    if (text.includes('heat') || text.includes('fire') || text.includes('sun') || text.includes('steam') || text.includes('boil') || text.includes('🔥') || text.includes('☀️')) {
      return 'from-amber-300 via-orange-100 to-yellow-100 border-amber-400';
    }
    if (text.includes('plant') || text.includes('seed') || text.includes('leaf') || text.includes('grow') || text.includes('soil') || text.includes('🌱') || text.includes('🌿')) {
      return 'from-emerald-300 via-green-100 to-teal-100 border-emerald-400';
    }
    if (text.includes('rain') || text.includes('cloud') || text.includes('storm') || text.includes('water') || text.includes('💧') || text.includes('🌧️')) {
      return 'from-blue-300 via-sky-100 to-indigo-200 border-blue-400';
    }
    return 'from-purple-200 via-indigo-100 to-sky-200 border-purple-400';
  };

  // Handle AI Simulation generation for any question
  const handleGenerateAiSimulation = async (questionToSimulate?: string) => {
    const q = (questionToSimulate || customQuestionInput).trim();
    if (!q) return;

    sounds.playPop();
    setIsGeneratingAiSim(true);
    setAiNotice(null);

    // Only attach current graph lesson concepts if question is directly relevant to this lesson
    const isAboutCurrentLesson =
      q.toLowerCase().includes(graph.title.toLowerCase()) ||
      graph.nodes.some((n) => q.toLowerCase().includes(n.label.toLowerCase()));

    const contextTopic = isAboutCurrentLesson ? graph.title : q;
    const contextNodes = isAboutCurrentLesson ? graph.nodes : undefined;

    try {
      const result = await generateAiSandboxSimulation(q, contextTopic, contextNodes);
      setIsGeneratingAiSim(false);

      if (result && result.steps && result.steps.length > 0) {
        sounds.playSuccessChime();
        setAiSimulation(result);
        setCurrentAiStepIndex(0);
        const firstStep = result.steps[0];
        setPipFeedback(firstStep.pipExplanation);
        setPipFeedbackKn(firstStep.pipExplanationKn);
        setAiNotice(
          language === 'KN'
            ? `✨ "${q}" ಪ್ರಶ್ನೆಗಾಗಿ ನೈಜ AI ಸಿಮ್ಯುಲೇಶನ್ ಲೋಡ್ ಆಗಿದೆ!`
            : `✨ Live Simulation ready for: "${q}"`
        );
        logActivity(`AI Simulation for question: "${q}"`);
      } else {
        // Fallback instant generation if server returned empty
        const fallback = buildInstantGraphSimulation(isAboutCurrentLesson ? graph.title : q, contextNodes);
        fallback.inquiryQuestion = q;
        fallback.inquiryQuestionKn = q;
        setAiSimulation(fallback);
        setCurrentAiStepIndex(0);
        setAiNotice(`✨ Simulation generated for: "${q}"`);
      }
    } catch {
      setIsGeneratingAiSim(false);
      const fallback = buildInstantGraphSimulation(isAboutCurrentLesson ? graph.title : q, contextNodes);
      fallback.inquiryQuestion = q;
      fallback.inquiryQuestionKn = q;
      setAiSimulation(fallback);
      setCurrentAiStepIndex(0);
      setAiNotice(`✨ Simulation generated for: "${q}"`);
    }
  };

  // Step selection in AI simulation
  const handleSelectAiStep = (step: AiSimulationStep, idx: number) => {
    sounds.playPop();
    setCurrentAiStepIndex(idx);
    const textEn = step.pipExplanation;
    const textKn = step.pipExplanationKn;
    setPipFeedback(textEn);
    setPipFeedbackKn(textKn);
    logActivity(`AI Sim Step ${idx + 1}: ${step.name}`);
  };

  // Next step handler inside the simulation (Silent on progression - no unwanted auto-speaking)
  const handleNextStep = () => {
    if (!aiSimulation || aiSimulation.steps.length === 0) return;
    const nextIdx = currentAiStepIndex + 1;
    if (nextIdx < aiSimulation.steps.length) {
      handleSelectAiStep(aiSimulation.steps[nextIdx], nextIdx);
    } else {
      // Reached the end, celebrate chime only
      sounds.playSuccessChime();
    }
  };

  // Previous step handler inside the simulation
  const handlePrevStep = () => {
    if (!aiSimulation || currentAiStepIndex <= 0) return;
    const prevIdx = currentAiStepIndex - 1;
    handleSelectAiStep(aiSimulation.steps[prevIdx], prevIdx);
  };

  // Auto-play the entire cycle sequentially
  const handleAutoSimulate = () => {
    if (isAutoSimulating || !aiSimulation) return;
    setIsAutoSimulating(true);
    sounds.playSuccessChime();

    let i = 0;
    const stepAi = () => {
      if (!aiSimulation || i >= aiSimulation.steps.length) {
        setIsAutoSimulating(false);
        return;
      }
      handleSelectAiStep(aiSimulation.steps[i], i);
      i++;
      setTimeout(stepAi, 3400);
    };
    stepAi();
  };

  const handleReset = () => {
    sounds.playPop();
    setIsAutoSimulating(false);
    const defaultSim = buildInstantGraphSimulation(graph.title, graph.nodes);
    setAiSimulation(defaultSim);
    setCurrentAiStepIndex(0);
    setAiNotice(null);
    setPipFeedback(
      language === 'KN'
        ? `ಲ್ಯಾಬ್ ಮರುಹೊಂದಿಸಲಾಗಿದೆ. "${graph.titleKn || graph.title}" ಮೊದಲ ಹಂತದಿಂದ ಪ್ರಾರಂಭಿಸಿ!`
        : `Sandbox reset. Ready to explore "${graph.title}" step 1!`
    );
  };

  // AAC token handlers
  const handleAddToken = (node: ConceptNode) => {
    sounds.playPop();
    setSentenceQueue((prev) => [
      ...prev,
      {
        id: `${node.id}-${Date.now()}`,
        label: node.label,
        symbol: node.symbol,
        kannadaLabel: node.kannadaLabel,
      },
    ]);
  };

  const handleSpeakSentence = () => {
    if (sentenceQueue.length === 0) return;
    sounds.playPop();
    const sentence = sentenceQueue
      .map((t) => (language === 'KN' ? (t.kannadaLabel || t.label) : t.label))
      .join(' ');
    speakText(sentence);
  };

  const handleClearSentence = () => {
    sounds.playPop();
    setSentenceQueue([]);
  };

  const currentStep: AiSimulationStep | null =
    aiSimulation && aiSimulation.steps.length > 0
      ? aiSimulation.steps[currentAiStepIndex] || aiSimulation.steps[0]
      : null;

  return (
    <div className="w-full space-y-6 animate-in fade-in select-none">
      {/* 1. TOP LAB STATION COMMAND CENTER & CONTROLS */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Soft background ambient gradient glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md shadow-indigo-500/25 shrink-0 ring-4 ring-indigo-50">
            {graph.nodes[0]?.symbol || '🧪'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Lab Station</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>AI Simulation</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {language === 'KN'
                ? `${graph.titleKn || graph.title} - ವಿಜ್ಞಾನ ಪ್ರಯೋಗಾಲಯ`
                : `${graph.title} Science Lab`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold truncate max-w-md sm:max-w-xl">
              {aiSimulation
                ? (language === 'KN' ? `ಪ್ರಶ್ನೆ: "${aiSimulation.inquiryQuestionKn || aiSimulation.inquiryQuestion}"` : `Active Inquiry: "${aiSimulation.inquiryQuestion}"`)
                : (graph.subtitle || (language === 'KN' ? 'ಶಿಕ್ಷಕರ ಪಾಠದ ನೇರ ಕ್ರಿಯೆ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ!' : 'Interactive cause-and-effect science experiments!'))}
            </p>
          </div>
        </div>

        {/* Action Controls Dock */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {onOpenExplainSimply && (
            <button
              onClick={() => {
                sounds.playPop();
                onOpenExplainSimply();
              }}
              type="button"
              className="px-3.5 py-2 rounded-2xl bg-sky-50/90 hover:bg-sky-100 border border-sky-200/80 text-sky-800 text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <Lightbulb className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === 'KN' ? 'ಸರಳ ವಿವರಣೆ' : 'Explain Simply'}</span>
            </button>
          )}

          {onOpenAskDoubt && (
            <button
              onClick={() => {
                sounds.playPop();
                onOpenAskDoubt();
              }}
              type="button"
              className="px-3.5 py-2 rounded-2xl bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-800 text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'KN' ? 'ಸಂಶಯ ಕೇಳಿ' : 'Ask Doubt'}</span>
            </button>
          )}

          <button
            onClick={handleAutoSimulate}
            disabled={isAutoSimulating}
            type="button"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-indigo-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isAutoSimulating ? 'animate-spin' : ''}`} />
            <span>
              {isAutoSimulating
                ? (language === 'KN' ? 'ಚಲಿಸುತ್ತಿದೆ...' : 'Simulating...')
                : (language === 'KN' ? 'ಸ್ವಯಂಚಾಲಿತ ಚಕ್ರ' : 'Auto-Play')}
            </span>
          </button>

          <button
            onClick={handleReset}
            type="button"
            title="Reset Sandbox"
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. ✨ AI QUESTION SIMULATOR OMNIBAR */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-50/90 via-indigo-50/90 to-sky-50/90 backdrop-blur-xl rounded-3xl border border-indigo-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">
              ✨
            </span>
            <h3 className="text-xs sm:text-sm font-black text-indigo-950">
              {language === 'KN'
                ? 'AI ಪ್ರಶ್ನೆ ಸಿಮ್ಯುಲೇಟರ್ (ಯಾವುದೇ ವಿಜ್ಞಾನ ಪ್ರಶ್ನೆ ಕೇಳಿ)'
                : 'AI Question Simulator (Ask any science question to simulate)'}
            </h3>
          </div>
          <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200">
            Powered by Groq High-Speed AI
          </span>
        </div>

        {/* Input & Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={customQuestionInput}
            onChange={(e) => setCustomQuestionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateAiSimulation();
            }}
            placeholder={
              language === 'KN'
                ? 'ಉದಾ: ಸೂರ್ಯನ ಶಾಖ ಹೆಚ್ಚಾದರೆ ಜಲಚಕ್ರಕ್ಕೆ ಏನಾಗುತ್ತದೆ?'
                : `Type any question (e.g. What happens when you mix baking soda and vinegar?)`
            }
            className="w-full px-4 py-2.5 bg-white/95 rounded-2xl border border-indigo-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs transition-all"
          />

          <button
            onClick={() => handleGenerateAiSimulation()}
            disabled={isGeneratingAiSim || !customQuestionInput.trim()}
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            {isGeneratingAiSim ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'KN' ? 'ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'Generating...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{language === 'KN' ? 'ಪ್ರಯೋಗ ರಚಿಸಿ' : 'Generate Simulation'}</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Quick Question Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-500">
            {language === 'KN' ? 'ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು:' : 'Quick Questions:'}
          </span>
          {[
            'What happens when water freezes into ice?',
            'What happens if a seed gets no sunlight?',
            'Why does iron rust in open air?',
            'What happens when baking soda mixes with vinegar?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomQuestionInput(prompt);
                handleGenerateAiSimulation(prompt);
              }}
              type="button"
              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white/90 hover:bg-white px-3 py-1 rounded-xl border border-indigo-200/80 transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {aiNotice && (
          <div className="p-2.5 rounded-xl bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
            <span>{aiNotice}</span>
          </div>
        )}
      </div>

      {/* 3. MAIN INTERACTIVE 3D SIMULATION STAGE WITH GLASSMORPHISM */}
      {currentStep && aiSimulation && (
        <div
          className={`relative w-full rounded-3xl border-2 shadow-xl overflow-hidden bg-gradient-to-b ${resolveStageGradient(
            currentStep.visualState?.skyGradient,
            currentStep
          )} transition-all duration-700 p-6 sm:p-8 space-y-5`}
        >
          {/* Prominent Active Inquiry Question Banner on Stage */}
          <div className="w-full bg-slate-900/90 backdrop-blur-md text-white rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-md border border-white/20 z-10">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-8 h-8 rounded-xl bg-purple-600/80 flex items-center justify-center text-base shrink-0 shadow-xs">
                🧪
              </span>
              <div className="truncate">
                <div className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                  {language === 'KN' ? 'ಪ್ರಸ್ತುತ ಸಿಮ್ಯುಲೇಶನ್ ಪ್ರಶ್ನೆ' : 'Simulating Live Question'}
                </div>
                <div className="text-xs sm:text-sm font-black text-amber-200 truncate">
                  "{aiSimulation.inquiryQuestion}"
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-300 animate-spin" />
                <span>{aiSimulation.isAiGenerated ? 'Groq AI Live' : 'Dynamic Lab'}</span>
              </span>
            </div>
          </div>

          {/* Top Bar on Stage with Animated Gauge Bar */}
          <div className="flex items-center justify-between z-10 flex-wrap gap-2">
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-xs flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="text-xs sm:text-sm font-black text-purple-950">
                {language === 'KN' ? `ಹಂತ ${currentStep.stepNumber} / ${aiSimulation.steps.length}: ` : `Step ${currentStep.stepNumber} of ${aiSimulation.steps.length}: `}
                <span className="text-indigo-600">{language === 'KN' ? currentStep.nameKn : currentStep.name}</span>
              </span>
            </div>

            {/* Dynamic Gauge Meter with Visual Progress Bar */}
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-purple-200 shadow-xs flex flex-col justify-center min-w-[150px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  {currentStep.visualState?.gaugeLabel || 'Reaction Meter'}
                </span>
                <span className="text-xs sm:text-sm font-black text-indigo-700">
                  {currentStep.visualState?.gaugeValue || '100%'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(12, (currentStep.visualState?.gaugePercent || 60) * experimentEnergy))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Reaction Energy Controller */}
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 border border-purple-200 shadow-2xs z-10 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-black text-slate-700">
                {language === 'KN' ? 'ಪ್ರಯೋಗದ ಶಕ್ತಿ ನಿಯಂತ್ರಕ:' : 'Reaction Energy Controller:'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Gentle', labelKn: 'ಶಾಂತ', val: 0.85 },
                { label: 'Normal', labelKn: 'ಸಾಮಾನ್ಯ', val: 1.0 },
                { label: 'Max Power', labelKn: 'ಗರಿಷ್ಠ', val: 1.25 }
              ].map(m => (
                <button
                  key={m.label}
                  onClick={() => {
                    sounds.playPop();
                    setExperimentEnergy(m.val);
                  }}
                  type="button"
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    experimentEnergy === m.val
                      ? 'bg-purple-600 text-white shadow-xs scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'KN' ? m.labelKn : m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center 3D Animated Hero Visual Canvas with Ambient Particle Field */}
          <div className="relative min-h-[230px] flex flex-col items-center justify-center my-auto z-10 space-y-4">
            {/* Ambient Background Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
              {getAmbientParticles(currentStep, aiSimulation.inquiryQuestion).map((p, pIdx) => (
                <span
                  key={pIdx}
                  className="absolute text-2xl sm:text-3xl opacity-35 select-none animate-pulse"
                  style={{
                    top: `${12 + (pIdx * 20) % 72}%`,
                    left: `${8 + (pIdx * 22) % 82}%`,
                    animationDuration: `${2.2 + (pIdx % 3)}s`
                  }}
                >
                  {p}
                </span>
              ))}
            </div>

            <div
              className="text-8xl sm:text-9xl filter drop-shadow-2xl select-none transition-transform duration-500"
              style={{
                transform: `scale(${experimentEnergy})`,
                animation: experimentEnergy > 1.1 ? 'pulse 0.9s infinite' : 'bounce 1.6s infinite'
              }}
            >
              {currentStep.visualState?.activeVisualEmoji || currentStep.symbol || '🔬'}
            </div>
            <div className="px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-purple-200 shadow-md text-xs sm:text-sm font-black text-slate-800 text-center max-w-md">
              {currentStep.visualState?.stageAtmosphere || currentStep.name}
            </div>
          </div>

          {/* Multi-Sensory Observation Checklist (Sight, Touch, Sound) */}
          {currentStep.sensoryClues && (
            <div className="z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div
                onClick={() => {
                  sounds.playPop();
                  speakText(language === 'KN' ? currentStep.sensoryClues?.sightKn || currentStep.sensoryClues?.sight || '' : currentStep.sensoryClues?.sight || '');
                }}
                className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-sky-200 shadow-2xs cursor-pointer hover:bg-white active:scale-98 transition-all flex items-start gap-2.5"
                title="Tap to listen"
              >
                <span className="text-xl">👀</span>
                <div>
                  <div className="text-[10px] font-black uppercase text-sky-700">
                    {language === 'KN' ? 'ನೀವು ನೋಡುವುದು' : 'What You See'}
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {language === 'KN' ? currentStep.sensoryClues.sightKn || currentStep.sensoryClues.sight : currentStep.sensoryClues.sight}
                  </div>
                </div>
              </div>
              <div
                onClick={() => {
                  sounds.playPop();
                  speakText(language === 'KN' ? currentStep.sensoryClues?.touchKn || currentStep.sensoryClues?.touch || '' : currentStep.sensoryClues?.touch || '');
                }}
                className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-amber-200 shadow-2xs cursor-pointer hover:bg-white active:scale-98 transition-all flex items-start gap-2.5"
                title="Tap to listen"
              >
                <span className="text-xl">✋</span>
                <div>
                  <div className="text-[10px] font-black uppercase text-amber-700">
                    {language === 'KN' ? 'ನೀವು ಅನುಭವಿಸುವುದು' : 'What You Feel'}
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {language === 'KN' ? currentStep.sensoryClues.touchKn || currentStep.sensoryClues.touch : currentStep.sensoryClues.touch}
                  </div>
                </div>
              </div>
              <div
                onClick={() => {
                  sounds.playPop();
                  speakText(language === 'KN' ? currentStep.sensoryClues?.soundKn || currentStep.sensoryClues?.sound || '' : currentStep.sensoryClues?.sound || '');
                }}
                className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-purple-200 shadow-2xs cursor-pointer hover:bg-white active:scale-98 transition-all flex items-start gap-2.5"
                title="Tap to listen"
              >
                <span className="text-xl">👂</span>
                <div>
                  <div className="text-[10px] font-black uppercase text-purple-700">
                    {language === 'KN' ? 'ನೀವು ಕೇಳುವುದು' : 'What You Hear'}
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {language === 'KN' ? currentStep.sensoryClues.soundKn || currentStep.sensoryClues.sound : currentStep.sensoryClues.sound}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cause & Effect Summary Box */}
          <div className="z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-purple-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-blue-100 text-blue-800 uppercase tracking-wider">
                Cause
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800">
                {currentStep.causeAndEffect?.cause || `Activating ${currentStep.name}`}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-purple-500 shrink-0 hidden sm:block" />
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Effect
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800">
                {currentStep.causeAndEffect?.effect || currentStep.pipExplanation}
              </span>
            </div>
          </div>

          {/* IN-SIMULATION STEP NAVIGATION (Previous Step / Next Step Buttons) */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-purple-200/60 z-10">
            <button
              onClick={handlePrevStep}
              disabled={currentAiStepIndex === 0}
              type="button"
              className="min-h-[48px] px-5 sm:px-6 py-2.5 rounded-2xl bg-white/95 hover:bg-white disabled:opacity-30 border border-purple-200 text-slate-700 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>{language === 'KN' ? 'ಹಿಂದಿನ ಹಂತ' : 'Previous Step'}</span>
            </button>

            {/* Visual Step Dots */}
            <div className="flex items-center gap-1.5">
              {aiSimulation.steps.map((st, sIdx) => (
                <button
                  key={st.id}
                  onClick={() => handleSelectAiStep(st, sIdx)}
                  type="button"
                  className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                    currentAiStepIndex === sIdx
                      ? 'bg-purple-600 scale-125 ring-2 ring-purple-300'
                      : 'bg-white/80 hover:bg-white border border-purple-300'
                  }`}
                  title={`Go to step ${sIdx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNextStep}
              type="button"
              className="min-h-[48px] px-6 sm:px-8 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <span>
                {currentAiStepIndex < aiSimulation.steps.length - 1
                  ? (language === 'KN' ? 'ಮುಂದಿನ ಹಂತ' : 'Next Step')
                  : (language === 'KN' ? 'ಪೂರ್ಣಗೊಳಿಸಿ!' : 'Complete!')}
              </span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* 4. PIP'S LABORATORY COMMENTARY & OBSERVATION NOTE */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-50/90 via-blue-50/80 to-indigo-50/90 backdrop-blur-xl rounded-3xl border border-sky-200/80 p-5 sm:p-6 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-2xl bg-white text-blue-700 flex items-center justify-center text-base shadow-2xs border border-sky-200">
              🐦
            </span>
            <div>
              <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                Pip's Lab Commentary
              </span>
              <span className="text-[10px] text-sky-600 font-extrabold block">
                {language === 'KN' ? 'ಲೈವ್ ವಿಜ್ಞಾನ ಮಾರ್ಗದರ್ಶಿ' : 'Live Science Companion'}
              </span>
            </div>
          </div>
          <button
            onClick={() => speakText(language === 'KN' ? pipFeedbackKn : pipFeedback)}
            type="button"
            className="w-9 h-9 rounded-2xl bg-white hover:bg-sky-100 text-sky-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs border border-sky-200"
            title="Read Pip's Note aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-2xs">
          "{language === 'KN' ? pipFeedbackKn : pipFeedback}"
        </p>
      </div>

      {/* 5. TACTILE ACTION TRIGGER CHIPS (Direct Step Jumpers) */}
      {aiSimulation && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>
                {language === 'KN' ? '✨ ಸಿಮ್ಯುಲೇಶನ್ ಹಂತಗಳು' : 'Interactive Simulation Steps'}
              </span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {language === 'KN' ? 'ಮುಟ್ಟಿ ಮತ್ತು ವೀಕ್ಷಿಸಿ' : 'Tap to jump to step'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {aiSimulation.steps.map((step, idx) => {
              const isSelected = currentAiStepIndex === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => handleSelectAiStep(step, idx)}
                  type="button"
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-between text-center cursor-pointer active:scale-95 transition-all shadow-2xs ${
                    isSelected
                      ? 'bg-purple-100/90 border-purple-600 ring-4 ring-purple-200/70 scale-102 font-black shadow-sm'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-purple-50/50 hover:border-purple-300'
                  }`}
                >
                  <span className="text-3xl mb-1 filter drop-shadow-xs">{step.symbol}</span>
                  <span className="text-xs font-black text-slate-900 leading-tight">
                    {language === 'KN' ? step.actionButtonLabelKn : step.actionButtonLabel}
                  </span>
                  <span className="text-[10px] text-purple-700 font-extrabold mt-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200/60">
                    Step {step.stepNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. INTEGRATED AAC EXPRESSION TRAY & SENTENCE SOUNDBOARD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>🗣️</span>
              <span>
                {language === 'KN' ? 'ಸಂವಹನ ಮತ್ತು ಅಭಿವ್ಯಕ್ತಿ ಮಂಡಳಿ' : 'AAC Expression & Sentence Tray'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {language === 'KN'
                ? 'ಕಾರ್ಡ್‌ಗಳನ್ನು ಜೋಡಿಸಿ ನಿಮ್ಮ ವಾಕ್ಯವನ್ನು ತಯಾರಿಸಿ ಮತ್ತು ಧ್ವನಿ ಮೂಲಕ ಹೇಳಿ!'
                : 'Tap concepts below to assemble into your sentence strip and speak out loud!'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakSentence}
              disabled={sentenceQueue.length === 0}
              type="button"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{language === 'KN' ? 'ವಾಕ್ಯ ಹೇಳಿ' : 'Speak Sentence'}</span>
            </button>

            <button
              onClick={handleClearSentence}
              disabled={sentenceQueue.length === 0}
              type="button"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors active:scale-95 disabled:opacity-30"
              title="Clear Sentence"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sentence Strip Tray */}
        <div className="min-h-[60px] p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center gap-2 overflow-x-auto">
          {sentenceQueue.length === 0 ? (
            <span className="text-xs font-bold text-slate-400 mx-auto">
              {language === 'KN'
                ? 'ವಾಕ್ಯ ರಚಿಸಲು ಕೆಳಗಿನ ಕಾರ್ಡ್‌ಗಳನ್ನು ಒತ್ತಿ...'
                : 'Sentence strip is empty. Tap concepts below to express your thoughts...'}
            </span>
          ) : (
            sentenceQueue.map((item, idx) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-xs shadow-2xs shrink-0"
              >
                <span>{item.symbol}</span>
                <span>{language === 'KN' ? (item.kannadaLabel || item.label) : item.label}</span>
                {idx < sentenceQueue.length - 1 && (
                  <span className="text-slate-400 font-bold ml-1">+</span>
                )}
              </span>
            ))
          )}
        </div>

        {/* Dynamic Concept Buttons for the active topic */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {graph.nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => handleAddToken(node)}
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 text-xs font-black flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-lg">{node.symbol}</span>
              <span>{language === 'KN' ? (node.kannadaLabel || node.label) : node.label}</span>
            </button>
          ))}
        </div>

        {/* Classroom Quick Phrases */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {COMMUNICATION_PHRASES.map((phrase) => (
            <button
              key={phrase.id}
              onClick={() => {
                sounds.playPop();
                speakText(language === 'KN' ? phrase.kannadaText : phrase.text);
              }}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <span>{phrase.symbol}</span>
              <span>{language === 'KN' ? phrase.kannadaText : phrase.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. BOTTOM STAGE NAVIGATION (Back to Lesson Map / Proceed to Teach-Back) */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        {onBack ? (
          <button
            onClick={() => {
              sounds.playPop();
              onBack();
            }}
            type="button"
            className="min-h-[48px] px-6 py-2.5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-sm flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>{language === 'KN' ? 'ಹಿಂದೆ: ಪಾಠದ ನಕ್ಷೆ' : 'Back: Lesson Map'}</span>
          </button>
        ) : <div />}

        {onNext ? (
          <button
            onClick={() => {
              sounds.playPop();
              onNext();
            }}
            type="button"
            className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/30 active:scale-95 transition-all"
          >
            <span>{language === 'KN' ? 'ಮುಂದೆ: ಕಥೆ ಹೇಳಿ (Teach-Back)' : 'Next: Tell the Story (Teach-Back)'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
};
