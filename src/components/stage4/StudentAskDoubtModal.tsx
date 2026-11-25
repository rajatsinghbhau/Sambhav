import React, { useState } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { Doubt } from '../../types/stage4';
import { offlineStorage } from '../../utils/offlinePersistence';
import { MessageSquarePlus, Send, CheckCircle2, X } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface StudentAskDoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
  graph: ConceptGraph;
  studentName?: string;
}

export const StudentAskDoubtModal: React.FC<StudentAskDoubtModalProps> = ({
  isOpen,
  onClose,
  graph,
  studentName = 'Ananya'
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('condensation');
  const [questionText, setQuestionText] = useState<string>('Why does water vapour become drops on the cold glass?');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [myDoubts, setMyDoubts] = useState<Doubt[]>(() => offlineStorage.loadDoubts());

  if (!isOpen) return null;

  const selectedNode = graph.nodes.find(n => n.id === selectedConceptId) || graph.nodes[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    sounds.playSuccessChime();
    const newDoubt: Doubt = {
      id: `doubt-${Date.now()}`,
      studentId: 's-ananya',
      studentName,
      conceptId: selectedNode.id,
      conceptSymbol: selectedNode.symbol,
      conceptLabel: selectedNode.label,
      question: questionText.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const existing = offlineStorage.loadDoubts();
    const updated = [newDoubt, ...existing];
    offlineStorage.saveDoubts(updated);
    setMyDoubts(updated);
    setSubmittedSuccess(true);

    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1800);
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
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Ask a Doubt
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Send your question directly to your teacher
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

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-black text-slate-900">
              Doubt sent to your teacher.
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your teacher will see your question and reply during today's lesson.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Concept Picker */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1. Which picture do you have a question about?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {graph.nodes.map(node => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setSelectedConceptId(node.id);
                    }}
                    className={`min-h-[48px] p-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      selectedConceptId === node.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{node.symbol}</span>
                    <span className="truncate">{node.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Input */}
            <div>
              <label htmlFor="doubt-input" className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                2. Enter your question:
              </label>
              <textarea
                id="doubt-input"
                rows={3}
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="e.g. Why does water vapour become drops on cold glass?"
                className="w-full p-3 rounded-2xl border-2 border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
                required
              />
            </div>

            {/* Quick helper prompts */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Why does water vapour become drops?',
                'Where does the cold air come from?',
                'What happens to the cloud next?'
              ].map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuestionText(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700"
                >
                  "{prompt}"
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full min-h-[50px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 btn-tactile"
              >
                <Send className="w-4 h-4" />
                <span>Send to Teacher</span>
              </button>
            </div>
          </form>
        )}

        {/* Existing Doubts / Teacher Answers */}
        {myDoubts.length > 0 && !submittedSuccess && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              Previous Questions & Teacher Answers:
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {myDoubts.map(d => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800">
                      {d.conceptSymbol} {d.conceptLabel}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {d.status === 'resolved' ? 'Answered' : 'Sent'}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">"{d.question}"</p>
                  {d.answer && (
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 font-bold mt-1">
                      <span>Teacher's explanation: {d.answer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
