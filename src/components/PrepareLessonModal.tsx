import React, { useState } from 'react';
import { ConceptGraph } from '../types/conceptGraph';
import { generateLessonGraphWithFallback } from '../services/geminiService';
import { Sparkles, Check, Loader2, Info } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface PrepareLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproveGraph: (approvedGraph: ConceptGraph) => void;
  language?: 'EN' | 'KN';
}

export const PrepareLessonModal: React.FC<PrepareLessonModalProps> = ({
  isOpen,
  onClose,
  onApproveGraph,
  language = 'EN',
}) => {
  const defaultLessonText =
    'The Sun heats water on Earth. The water becomes water vapour through evaporation. The vapour rises and cools. During condensation, water droplets form clouds. When the droplets become heavy, rain falls.';

  const [lessonText, setLessonText] = useState<string>(defaultLessonText);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [candidateGraph, setCandidateGraph] = useState<ConceptGraph | null>(null);
  const [nonBlockingNotice, setNonBlockingNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    sounds.playPop();
    setIsLoading(true);
    setNonBlockingNotice(null);

    const result = await generateLessonGraphWithFallback(lessonText);
    setIsLoading(false);

    setCandidateGraph(result.graph);
    if (result.isFallback && result.message) {
      setNonBlockingNotice(result.message);
    }
  };

  const handleEditLabel = (nodeId: string, newLabel: string) => {
    if (!candidateGraph) return;
    setCandidateGraph({
      ...candidateGraph,
      nodes: candidateGraph.nodes.map(n =>
        n.id === nodeId ? { ...n, label: newLabel } : n
      )
    });
  };

  const handleApprove = () => {
    if (!candidateGraph) return;
    sounds.playSuccessChime();
    onApproveGraph(candidateGraph);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prepare-lesson-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <h2 id="prepare-lesson-title" className="text-xl sm:text-2xl font-black text-slate-900">
                {language === 'KN' ? 'ಇಂದಿನ ಪಾಠ ಸಿದ್ಧಪಡಿಸಿ' : "Prepare Today's Lesson"}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                {language === 'KN'
                  ? 'AI ರಚನೆ ಸೂಚಿಸುತ್ತದೆ • ಕಠಿಣ ಮೌಲ್ಯೀಕರಣ • ಶಿಕ್ಷಕರು ಅನುಮೋದಿಸುತ್ತಾರೆ'
                  : 'AI suggests candidate structure • Strict validation • Teacher approves'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <label htmlFor="lesson-input" className="text-xs font-black uppercase tracking-wider text-slate-600">
            {language === 'KN' ? 'ಪಾಠದ ವಿಷಯ / ಪಠ್ಯಕ್ರಮದ ವಿಷಯ' : 'Lesson Content / Curriculum Topic'}
          </label>
          <textarea
            id="lesson-input"
            rows={4}
            value={lessonText}
            onChange={(e) => setLessonText(e.target.value)}
            className="w-full text-sm p-4 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        {nonBlockingNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{nonBlockingNotice}</span>
          </div>
        )}

        <div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !lessonText.trim()}
            type="button"
            className="min-h-[50px] px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'KN' ? 'ಪರಿಕಲ್ಪನಾ ನಕ್ಷೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'Generating & Validating Candidate Graph...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>{language === 'KN' ? '✨ ಪರಿಕಲ್ಪನಾ ನಕ್ಷೆ ರಚಿಸಿ' : 'Generate Concept Graph'}</span>
              </>
            )}
          </button>
        </div>

        {candidateGraph && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'KN' ? 'ನಕ್ಷೆ ಪರಿಶೀಲನೆ' : 'Review Graph'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {language === 'KN'
                    ? 'ಶಿಕ್ಷಕರು ಹಂತದ ಹೆಸರುಗಳನ್ನು ಮಾತ್ರ ಸಂಪಾದಿಸಬಹುದು.'
                    : 'Teacher may edit node labels only. Graph relationships and order are locked.'}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                {language === 'KN' ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Validated'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                {language === 'KN'
                  ? `ದೃಢೀಕೃತ ರೇಖೀಯ ಮೈಲಿಗಲ್ಲುಗಳು (${candidateGraph.nodes.length})`
                  : `Validated Linear Milestone Nodes (${candidateGraph.nodes.length})`}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                {candidateGraph.nodes.map((node, i) => (
                  <div key={node.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <span className="text-2xl">{node.symbol}</span>
                    <div className="flex-1 min-w-0">
                      <label htmlFor={`edit-node-${node.id}`} className="text-[10px] text-slate-400 block font-bold">
                        {language === 'KN' ? `ಹಂತ ${i + 1} ಹೆಸರು:` : `Step ${i + 1} Label:`}
                      </label>
                      <input
                        id={`edit-node-${node.id}`}
                        type="text"
                        value={node.label}
                        onChange={(e) => handleEditLabel(node.id, e.target.value)}
                        className="text-xs font-black text-slate-900 border-b border-slate-300 focus:border-indigo-500 focus:outline-none w-full bg-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                type="button"
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                {language === 'KN' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                onClick={handleApprove}
                type="button"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/25"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{language === 'KN' ? 'ಪರಿಕಲ್ಪನಾ ನಕ್ಷೆ ಅನುಮೋದಿಸಿ' : 'Approve Concept Graph'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
