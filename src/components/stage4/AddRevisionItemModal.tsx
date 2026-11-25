import React, { useState, useEffect } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { RevisionItem, RevisionQueueSection } from '../../types/stage4';
import { X, Calendar, Clock, RotateCcw, Target, Sparkles, Plus } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface AddRevisionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: RevisionItem) => void;
  graph: ConceptGraph;
  initialSection?: RevisionQueueSection;
  language?: 'EN' | 'KN';
}

export const AddRevisionItemModal: React.FC<AddRevisionItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  graph,
  initialSection = 'due_today',
  language = 'EN'
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    graph.nodes[0]?.id || 'condensation'
  );
  const [section, setSection] = useState<RevisionQueueSection>(initialSection);
  const [dueDate, setDueDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculateDefaultDate = (targetSection: RevisionQueueSection): string => {
    const now = new Date();
    if (targetSection === 'due_today') {
      return now.toISOString().split('T')[0];
    } else if (targetSection === 'coming_up') {
      const d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return d.toISOString().split('T')[0];
    } else {
      const d = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
      return d.toISOString().split('T')[0];
    }
  };

  const calculateDefaultReason = (conceptLabel: string, targetSection: RevisionQueueSection): string => {
    if (language === 'KN') {
      if (targetSection === 'due_today') {
        return `${conceptLabel} ಪರಿಕಲ್ಪನೆಯ ತಕ್ಷಣದ ಬಲವರ್ಧನೆ ಮತ್ತು ತ್ವರಿತ ಮೌಲ್ಯಮಾಪನ.`;
      } else if (targetSection === 'coming_up') {
        return `ಧಾರಣಾ ಶಕ್ತಿ ಪರೀಕ್ಷೆಗೆ +7 ದಿನಗಳ ಮಧ್ಯಂತರ ಪರಿಶೀಲನೆ.`;
      } else {
        return `ಪರೀಕ್ಷೆಗೆ ಮುಂಚಿನ ದೀರ್ಘಾವಧಿ ಪುನರಾವರ್ತನಾ ಪರಿಶೀಲನೆ (+21 ದಿನಗಳು).`;
      }
    } else {
      if (targetSection === 'due_today') {
        return `Immediate reinforcement and quick checkpoint for ${conceptLabel}.`;
      } else if (targetSection === 'coming_up') {
        return `Mid-interval spaced review (+7 days) to solidify long-term retention.`;
      } else {
        return `Pre-exam mastery check (+21 days) to ensure comprehensive exam readiness.`;
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const node = graph.nodes[0] || { id: 'condensation', label: 'Condensation', kannadaLabel: 'ಸಾಂದ್ರೀಕರಣ' };
      const cLabel = language === 'KN' ? (node.kannadaLabel || node.label) : node.label;
      setSelectedConceptId(node.id);
      setSection(initialSection);
      setDueDate(calculateDefaultDate(initialSection));
      setReason(calculateDefaultReason(cLabel, initialSection));
      setErrorMsg(null);
    }
  }, [isOpen, initialSection, graph, language]);

  if (!isOpen) return null;

  const handleSectionChange = (newSec: RevisionQueueSection) => {
    sounds.playPop();
    setSection(newSec);
    setDueDate(calculateDefaultDate(newSec));
    const node = graph.nodes.find(n => n.id === selectedConceptId);
    const cLabel = node ? (language === 'KN' ? (node.kannadaLabel || node.label) : node.label) : 'Concept';
    setReason(calculateDefaultReason(cLabel, newSec));
  };

  const handleConceptChange = (cId: string) => {
    sounds.playPop();
    setSelectedConceptId(cId);
    const node = graph.nodes.find(n => n.id === cId);
    const cLabel = node ? (language === 'KN' ? (node.kannadaLabel || node.label) : node.label) : 'Concept';
    setReason(calculateDefaultReason(cLabel, section));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const node = graph.nodes.find(n => n.id === selectedConceptId);
    const conceptLabel = node ? (language === 'KN' ? (node.kannadaLabel || node.label) : node.label) : selectedConceptId;
    const conceptSymbol = node?.symbol || '💧';

    const newItem: RevisionItem = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conceptId: selectedConceptId,
      conceptSymbol,
      conceptLabel,
      lessonId: 'water-cycle-curriculum',
      dueDate: dueDate || calculateDefaultDate(section),
      reason: reason.trim() || calculateDefaultReason(conceptLabel, section),
      section,
      status: 'pending'
    };

    sounds.playSuccessChime();
    onAddItem(newItem);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-queue-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-full mb-0.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{language === 'KN' ? 'ಅಂತರದ ಪುನರಾವರ್ತನೆ' : 'Spaced Repetition'}</span>
              </div>
              <h3 id="add-queue-title" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {language === 'KN' ? 'ಪುನರಾವರ್ತನಾ ಸರದಿಗೆ ಪರಿಕಲ್ಪನೆ ಸೇರಿಸಿ' : 'Add Concept to Revision Queue'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            type="button"
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl animate-in fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Concept Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'KN' ? 'ಪರಿಕಲ್ಪನೆ ಆಯ್ಕೆಮಾಡಿ' : 'Select Curriculum Concept'}</span>
            </label>
            <select
              value={selectedConceptId}
              onChange={e => handleConceptChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs sm:text-sm cursor-pointer shadow-2xs"
            >
              {graph.nodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.symbol ? `${node.symbol} ` : ''}
                  {language === 'KN' ? (node.kannadaLabel || node.label) : node.label}
                  {node.kannadaLabel && language !== 'KN' ? ` (${node.kannadaLabel})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Target Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'KN' ? 'ಪುನರಾವರ್ತನಾ ಹಂತ / ವಿಭಾಗ' : 'Revision Interval / Target Section'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'due_today', label: language === 'KN' ? 'ಇಂದು ಬಾಕಿ' : 'Due Today', sub: '+0d' },
                { id: 'coming_up', label: language === 'KN' ? 'ಮುಂದೆ ಬರಲಿರುವುದು' : 'Coming Up', sub: '+7d' },
                { id: 'before_exam', label: language === 'KN' ? 'ಪರೀಕ್ಷೆಯ ಮೊದಲು' : 'Before Exam', sub: '+21d' },
              ].map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSectionChange(sec.id as RevisionQueueSection)}
                  className={`min-h-[46px] p-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
                    section === sec.id
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{sec.label}</span>
                  <span className={`text-[10px] font-bold ${section === sec.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {sec.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'KN' ? 'ಗಡುವು ದಿನಾಂಕ' : 'Scheduled Due Date'}</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {/* Reason / Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'KN' ? 'ಪುನರಾವರ್ತನೆಗೆ ಕಾರಣ / ಗುರಿ' : 'Reason for Spaced Scheduling'}
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={language === 'KN' ? 'ಈ ಪರಿಕಲ್ಪನೆಯನ್ನು ಪುನರಾವರ್ತಿಸಲು ಕಾರಣ...' : 'Reason for scheduling revision...'}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onClose();
              }}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
            >
              {language === 'KN' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="min-h-[42px] px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'KN' ? 'ಸರದಿಗೆ ಸೇರಿಸಿ' : 'Add to Queue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
