import React, { useState, useEffect } from 'react';
import { ExamRevisionCheckpoint } from '../../types/stage4';
import { REVISION_CHECKPOINTS } from '../../data/stage4Data';
import { generateAiExamCheckpoint } from '../../services/aiAssistantService';
import { CheckCircle2, Volume2, X, RefreshCw, Award } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface RevisionCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  conceptId: string;
  conceptLabel: string;
  conceptSymbol: string;
  conceptExplanation?: string;
  onMarkReviewed: (conceptId: string) => void;
  language?: 'EN' | 'KN';
}

export const RevisionCheckpointModal: React.FC<RevisionCheckpointModalProps> = ({
  isOpen,
  onClose,
  conceptId,
  conceptLabel,
  conceptSymbol,
  conceptExplanation = '',
  onMarkReviewed,
  language = 'EN'
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [checkpointData, setCheckpointData] = useState<ExamRevisionCheckpoint>(() => {
    return REVISION_CHECKPOINTS[conceptId] || {
      conceptId,
      conceptLabel,
      memoryHook: `Remember how ${conceptLabel} connects with nature around us.`,
      questions: [
        {
          id: `q-${conceptId}-1`,
          type: 'visual_symbol',
          prompt: `Which picture card represents ${conceptLabel}?`,
          options: [`${conceptSymbol} ${conceptLabel}`, '☀️ Sun', '💧 Water'],
          correctIndex: 0,
          explanation: `${conceptSymbol} is the visual symbol for ${conceptLabel}.`
        },
        {
          id: `q-${conceptId}-2`,
          type: 'real_life',
          prompt: `Where in daily life do you observe ${conceptLabel}?`,
          options: [
            `Everyday natural weather and outdoor observations`,
            'Only on deep ocean submarines',
            'Nowhere on planet Earth'
          ],
          correctIndex: 0,
          explanation: `${conceptLabel} is observed in everyday environment changes.`
        },
        {
          id: `q-${conceptId}-3`,
          type: 'cause_effect',
          prompt: `Why is ${conceptLabel} an essential milestone in this cycle?`,
          options: [
            `It connects the sequence of natural changes`,
            'It is completely unrelated to the topic',
            'It only happens in outer space'
          ],
          correctIndex: 0,
          explanation: `${conceptLabel} directly bridges this phase of the cycle.`
        },
        {
          id: `q-${conceptId}-4`,
          type: 'sensory_observation',
          prompt: `What sensory feeling or observation helps identify ${conceptLabel}?`,
          options: [
            `Noticeable changes in temperature, moisture, or appearance`,
            'Absolute darkness with freezing sparks',
            'Loud rock music playing'
          ],
          correctIndex: 0,
          explanation: `Sensory indicators like temperature and moisture signify ${conceptLabel}.`
        },
        {
          id: `q-${conceptId}-5`,
          type: 'curriculum_sequence',
          prompt: `In the lesson roadmap, what does ${conceptLabel} connect with?`,
          options: [
            `It links directly to the neighboring milestones in the sequence`,
            'It breaks away from the lesson completely',
            'It only connects backwards to yesterday'
          ],
          correctIndex: 0,
          explanation: `${conceptLabel} is a vital linked node in our structured curriculum.`
        },
        {
          id: `q-${conceptId}-6`,
          type: 'concept_check',
          prompt: `Why is mastering ${conceptLabel} important for your science exam?`,
          options: [
            `It demonstrates full understanding of nature's continuous cycle`,
            'It helps you forget the whole story',
            'It has no scientific purpose'
          ],
          correctIndex: 0,
          explanation: `Understanding ${conceptLabel} confirms your deep grasp of the concept roadmap!`
        }
      ]
    };
  });
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedAnswers({});
      const curated = REVISION_CHECKPOINTS[conceptId];
      if (curated) {
        setCheckpointData(curated);
        setIsAiGenerated(false);
      }
    }
  }, [isOpen, conceptId]);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: string, optionIndex: number, correctIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // Prevent changing after selected
    if (optionIndex === correctIndex) {
      sounds.playSuccessChime();
    } else {
      sounds.playPop();
    }
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSpeakText = (text: string) => {
    sounds.playPop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        if (language === 'KN') {
          u.lang = 'kn-IN';
        }
        window.speechSynthesis.speak(u);
      } catch {}
    }
  };

  const handleGenerateAiQuestions = async () => {
    sounds.playPop();
    setIsGeneratingAi(true);
    const result = await generateAiExamCheckpoint(conceptLabel, conceptExplanation);
    setIsGeneratingAi(false);

    if (result && result.questions && result.questions.length > 0) {
      sounds.playSuccessChime();
      setCheckpointData(result);
      setIsAiGenerated(true);
      setSelectedAnswers({});
    }
  };

  const totalQuestions = checkpointData.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = checkpointData.questions.filter(
    q => selectedAnswers[q.id] === q.correctIndex
  ).length;
  const isFinished = answeredCount === totalQuestions && totalQuestions > 0;

  const handleFinishAndSave = () => {
    sounds.playSuccessChime();
    onMarkReviewed(conceptId);
    onClose();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'visual_symbol':
        return {
          label: language === 'KN' ? 'ದೃಶ್ಯ ಚಿಹ್ನೆ ಪರಿಶೀಲನೆ' : 'Visual Symbol Check',
          icon: '🖼️',
          color: 'bg-sky-50 text-sky-800 border-sky-200'
        };
      case 'real_life':
        return {
          label: language === 'KN' ? 'ದೈನಂದಿನ ಜೀವನದ ವೀಕ್ಷಣೆ' : 'Everyday Life Observation',
          icon: '🏡',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'cause_effect':
        return {
          label: language === 'KN' ? 'ಕಾರಣ ಮತ್ತು ಪರಿಣಾಮ ಪ್ರಕ್ರಿಯೆ' : 'Cause & Effect Process',
          icon: '⚙️',
          color: 'bg-purple-50 text-purple-800 border-purple-200'
        };
      case 'sensory_observation':
        return {
          label: language === 'KN' ? 'ಸಂವೇದನಾ ವೀಕ್ಷಣೆ (ಸ್ಪರ್ಶ/ತಾಪಮಾನ)' : 'Sensory Observation',
          icon: '🖐️',
          color: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'curriculum_sequence':
        return {
          label: language === 'KN' ? 'ಪಠ್ಯಕ್ರಮ ಅನುಕ್ರಮ ಮತ್ತು ಪರಿವರ್ತನೆ' : 'Sequence & Transition',
          icon: '🔄',
          color: 'bg-teal-50 text-teal-800 border-teal-200'
        };
      case 'concept_check':
        return {
          label: language === 'KN' ? 'ಪರಿಕಲ್ಪನೆ ಅನ್ವಯ ಪರೀಕ್ಷೆ' : 'Concept Application Check',
          icon: '🎯',
          color: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      default:
        return {
          label: language === 'KN' ? 'ತ್ವರಿತ ಪರಿಶೀಲನೆ' : 'Quick Checkpoint',
          icon: '✨',
          color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
        };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkpoint-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-slate-200 p-5 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl p-2 bg-indigo-50 rounded-2xl shadow-xs shrink-0" aria-hidden="true">
              {conceptSymbol}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="checkpoint-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  {language === 'KN' ? `ಪುನರಾವರ್ತನಾ ಪರಿಶೀಲನೆ: ${conceptLabel}` : `Revision Checkpoint: ${conceptLabel}`}
                </h3>
                {isAiGenerated && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-indigo-500 to-purple-600 text-white shrink-0">
                    Gemini 2.5 Flash
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">
                {language === 'KN'
                  ? 'ಅಂತರದ ಸ್ಮರಣೆಗಾಗಿ ಸಂವಾದಾತ್ಮಕ 6-ಹಂತದ ಧಾರಣ ಪರಿಶೀಲನೆ.'
                  : 'Interactive 6-tier retention check for spaced retrieval.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Memory Hook Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 via-sky-50 to-amber-50 rounded-2xl border border-indigo-200/80 flex items-start justify-between gap-3 text-xs sm:text-sm text-indigo-950 font-bold">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                {language === 'KN' ? 'ನೆನಪಿನ ಸೂತ್ರ / ತ್ವರಿತ ಸಾರಾಂಶ:' : 'Memory Hook / Quick Recap:'}
              </span>
              <p className="font-extrabold text-slate-900 mt-0.5">
                {checkpointData.memoryHook}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSpeakText(checkpointData.memoryHook)}
            type="button"
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-indigo-700 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
            title="Listen to memory hook"
            aria-label="Listen to memory hook"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* AI Regenerate Questions Button */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {language === 'KN'
              ? `${answeredCount} / ${totalQuestions} ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಲಾಗಿದೆ`
              : `${answeredCount} of ${totalQuestions} questions answered`}
          </span>
          <button
            onClick={handleGenerateAiQuestions}
            disabled={isGeneratingAi}
            type="button"
            className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>
              {isGeneratingAi
                ? (language === 'KN' ? 'ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'Generating...')
                : (language === 'KN' ? '✨ AI 6 ಪ್ರಶ್ನೆಗಳನ್ನು ನವೀಕರಿಸಿ' : '✨ AI Refresh Checkpoint')}
            </span>
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {checkpointData.questions.map((q, qIndex) => {
            const userChoice = selectedAnswers[q.id];
            const hasAnswered = userChoice !== undefined;
            const isCorrect = userChoice === q.correctIndex;
            const typeInfo = getTypeLabel(q.type);

            return (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border ${typeInfo.color}`}>
                    <span>{typeInfo.icon}</span>
                    <span>{typeInfo.label}</span>
                  </span>

                  <button
                    onClick={() => handleSpeakText(`${q.prompt}. Options: ${q.options.join(', ')}`)}
                    type="button"
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    title="Read question aloud"
                    aria-label="Read question aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                  {qIndex + 1}. {q.prompt}
                </h4>

                {/* 3 Interactive Option Buttons */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    let optionStyle = 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800';

                    if (hasAnswered) {
                      if (optIdx === q.correctIndex) {
                        optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black ring-2 ring-emerald-200';
                      } else if (isSelected) {
                        optionStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-black line-through opacity-80';
                      } else {
                        optionStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={`${q.id}-opt-${optIdx}`}
                        onClick={() => handleSelectOption(q.id, optIdx, q.correctIndex)}
                        disabled={hasAnswered}
                        type="button"
                        className={`w-full p-3 rounded-xl border-2 text-xs sm:text-sm font-extrabold text-left transition-all flex items-center justify-between gap-3 ${optionStyle} ${
                          !hasAnswered ? 'cursor-pointer hover:shadow-xs active:scale-98' : 'cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="break-words">{opt}</span>
                        </div>

                        {hasAnswered && optIdx === q.correctIndex && (
                          <span className="text-emerald-700 font-black text-xs shrink-0 flex items-center gap-1">
                            {language === 'KN' ? '✓ ಸರಿ' : '✓ Correct'}
                          </span>
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <span className="text-rose-700 font-black text-xs shrink-0">
                            {language === 'KN' ? '✗ ತಪ್ಪು (ಮತ್ತೆ ನೋಡಿ)' : '✗ Incorrect'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Reveal */}
                {hasAnswered && (
                  <div className={`p-3 rounded-xl text-xs font-bold animate-in fade-in ${
                    isCorrect ? 'bg-emerald-100/70 text-emerald-900 border border-emerald-300' : 'bg-amber-100/70 text-amber-900 border border-amber-300'
                  }`}>
                    <p className="leading-relaxed">
                      💡 <strong>{language === 'KN' ? 'ಶಿಕ್ಷಕರ ಟಿಪ್ಪಣಿ:' : 'Teacher Note:'}</strong> {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Bar */}
        {isFinished && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-emerald-950">
                  {language === 'KN'
                    ? `ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ! ಅಂಕಗಳು: ${correctCount} / ${totalQuestions}`
                    : `Checkpoint Complete! Score: ${correctCount} / ${totalQuestions}`}
                </h4>
                <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                  {correctCount === totalQuestions
                    ? (language === 'KN' ? '🌟 ಅತ್ಯುತ್ತಮ ಸ್ಮರಣೆ! ಪರಿಪೂರ್ಣ ಧಾರಣ ಸಾಬೀತಾಗಿದೆ.' : '🌟 Excellent recall! High-retention achieved.')
                    : (language === 'KN' ? 'ಉತ್ತಮ ಅಭ್ಯಾಸ! ಈ ಪರಿಕಲ್ಪನೆಯನ್ನು ಬಲವರ್ಧನೆ ಮಾಡುವುದು ನೆನಪಿನಲ್ಲಿಡಲು ಸಹಾಯಕ.' : 'Good practice! Reinforcing this concept will cement it in memory.')}
                </p>
              </div>
            </div>

            <button
              onClick={handleFinishAndSave}
              type="button"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/30 active:scale-95 transition-all whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'KN' ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ ಮುಚ್ಚಿ' : 'Mark Reviewed & Close'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
