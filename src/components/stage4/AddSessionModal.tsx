import React, { useState, useEffect } from 'react';
import { ConceptGraph } from '../../types/conceptGraph';
import { ExamRevisionSession } from '../../types/stage4';
import { X, Calendar, Clock, BookOpen, Target, Sparkles, Plus, Check } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession: (session: ExamRevisionSession) => void;
  graph: ConceptGraph;
  defaultDayNumber: number;
  language?: 'EN' | 'KN';
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  onAddSession,
  graph,
  defaultDayNumber,
  language = 'EN'
}) => {
  const [dayNumber, setDayNumber] = useState<number>(defaultDayNumber);
  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    graph.nodes[0]?.id || 'condensation'
  );
  const [dayTitle, setDayTitle] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [description, setDescription] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update defaults whenever the modal opens or defaultDayNumber changes
  useEffect(() => {
    if (isOpen) {
      setDayNumber(defaultDayNumber);
      const defaultNode = graph.nodes[0] || { id: 'condensation', label: 'Condensation', kannadaLabel: 'ಸಾಂದ್ರೀಕರಣ' };
      const conceptName = language === 'KN' ? (defaultNode.kannadaLabel || defaultNode.label) : defaultNode.label;
      
      setSelectedConceptId(defaultNode.id);
      setDayTitle(language === 'KN' 
        ? `ದಿನ ${defaultDayNumber} — ಉದ್ದೇಶಿತ ಪುನರಾವರ್ತನೆ` 
        : `Day ${defaultDayNumber} — Targeted Review`
      );
      setTopic(conceptName);
      setDescription(language === 'KN'
        ? `${conceptName} ಪರಿಕಲ್ಪನೆಯ ಹಂತ-ಹಂತದ ಪುನರಾವಲೋಕನ ಮತ್ತು ಸ್ಪರ್ಶಾನುಭವ ಪ್ರಯೋಗಗಳು.`
        : `Review ${conceptName} transitions, sensory observations, and key milestone connections.`
      );
      setErrorMsg(null);
    }
  }, [isOpen, defaultDayNumber, graph, language]);

  if (!isOpen) return null;

  const handleConceptSelect = (conceptId: string) => {
    sounds.playPop();
    setSelectedConceptId(conceptId);

    if (conceptId === 'all_synthesis') {
      const synTitle = language === 'KN' ? 'ಸಂಪೂರ್ಣ ಪರಿಕಲ್ಪನಾ ಸಂಶ್ಲೇಷಣೆ' : 'Full Unit Synthesis & Concept Flow';
      setTopic(synTitle);
      setDescription(language === 'KN'
        ? 'ಎಲ್ಲಾ ಹಂತಗಳ ನಡುವಿನ ಪರಸ್ಪರ ಸಂಬಂಧಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ ಸಮಗ್ರ ಪರೀಕ್ಷಾ ಅಭ್ಯಾಸ.'
        : 'Integrate the complete cycle sequence, verify all transitions, and practice multi-step reasoning.'
      );
    } else if (conceptId === 'custom') {
      setTopic('');
      setDescription('');
    } else {
      const node = graph.nodes.find(n => n.id === conceptId);
      if (node) {
        const cName = language === 'KN' ? (node.kannadaLabel || node.label) : node.label;
        setTopic(cName);
        setDescription(language === 'KN'
          ? `${cName} ಪರಿಕಲ್ಪನೆಯ ಪ್ರಮುಖ ಅಂಶಗಳು, ಕಾರಣ-ಪರಿಣಾಮ ಸಂಬಂಧಗಳು ಮತ್ತು ಮಾದರಿ ಪ್ರಶ್ನೆಗಳ ಪುನರಾವರ್ತನೆ.`
          : `Review ${cName} mechanisms, cause-and-effect transitions, and practice mock questions.`
        );
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayTitle.trim()) {
      setErrorMsg(language === 'KN' ? 'ದಯವಿಟ್ಟು ಅವಧಿಯ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ.' : 'Please enter a session title.');
      return;
    }
    if (!topic.trim()) {
      setErrorMsg(language === 'KN' ? 'ದಯವಿಟ್ಟು ಪರಿಶೀಲನಾ ವಿಷಯವನ್ನು ನಮೂದಿಸಿ.' : 'Please enter a focus topic.');
      return;
    }

    const newSession: ExamRevisionSession = {
      dayNumber: Number(dayNumber) || defaultDayNumber,
      dayTitle: dayTitle.trim(),
      topic: topic.trim(),
      conceptIds: selectedConceptId === 'custom' || selectedConceptId === 'all_synthesis'
        ? graph.nodes.map(n => n.id)
        : [selectedConceptId],
      description: description.trim() || (language === 'KN' ? 'ಉದ್ದೇಶಿತ ಪುನರಾವರ್ತನಾ ಅವಧಿ.' : 'Targeted revision session.'),
      duration: Number(duration) || 30
    };

    sounds.playSuccessChime();
    onAddSession(newSession);
    onClose();
  };

  const durationOptions = [15, 30, 45, 60];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-session-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-full mb-0.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{language === 'KN' ? 'ಹೊಸ ಅವಧಿ ಸೇರಿಸಿ' : 'Strategic Roadmap'}</span>
              </div>
              <h3 id="add-session-title" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {language === 'KN' ? 'ಹೊಸ ಪುನರಾವರ್ತನಾ ಅವಧಿ ಸೇರಿಸಿ' : 'Add Revision Session'}
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
          {/* Day Number and Title */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'KN' ? 'ದಿನ #' : 'Day #'}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={dayNumber}
                onChange={e => setDayNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'KN' ? 'ಅವಧಿಯ ಶೀರ್ಷಿಕೆ' : 'Session Title'}
              </label>
              <input
                type="text"
                required
                value={dayTitle}
                onChange={e => setDayTitle(e.target.value)}
                placeholder={language === 'KN' ? 'ಉದಾ. ದಿನ 8 — ಉದ್ದೇಶಿತ ಪುನರಾವರ್ತನೆ' : 'e.g. Day 8 — Targeted Review'}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
            </div>
          </div>

          {/* Focus Concept Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'KN' ? 'ಪರಿಕಲ್ಪನೆ / ಗುರಿ ಆಯ್ಕೆಮಾಡಿ' : 'Select Core Concept / Focus'}</span>
            </label>

            <select
              value={selectedConceptId}
              onChange={e => handleConceptSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs sm:text-sm cursor-pointer shadow-2xs"
            >
              {graph.nodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.symbol ? `${node.symbol} ` : ''}
                  {language === 'KN' ? (node.kannadaLabel || node.label) : node.label}
                  {node.kannadaLabel && language !== 'KN' ? ` (${node.kannadaLabel})` : ''}
                </option>
              ))}
              <option value="all_synthesis">
                🔄 {language === 'KN' ? 'ಸಂಪೂರ್ಣ ಘಟಕ ಸಂಶ್ಲೇಷಣೆ (ಎಲ್ಲಾ ಹಂತಗಳು)' : 'Full Unit Synthesis (All Transitions)'}
              </option>
              <option value="custom">
                ✏️ {language === 'KN' ? 'ಕಸ್ಟಮ್ ವಿಷಯ ನಮೂದಿಸಿ' : 'Custom Topic / Free Text'}
              </option>
            </select>
          </div>

          {/* Topic Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'KN' ? 'ವಿಷಯದ ಹೆಸರು' : 'Focus Topic'}</span>
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={language === 'KN' ? 'ವಿಷಯದ ಹೆಸರು' : 'Focus Topic Name'}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'KN' ? 'ಅವಧಿಯ ಸಮಯ (ನಿಮಿಷಗಳಲ್ಲಿ)' : 'Duration'}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {durationOptions.map(dur => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setDuration(dur);
                  }}
                  className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    duration === dur
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {duration === dur && <Check className="w-3 h-3" />}
                  <span>{dur} min</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description & Objectives */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'KN' ? 'ಕಲಿಕಾ ಉದ್ದೇಶಗಳು ಮತ್ತು ವಿವರಣೆ' : 'Learning Objectives & Key Activities'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={language === 'KN' ? 'ಈ ಅವಧಿಯ ಕಲಿಕಾ ಗುರಿಗಳನ್ನು ವಿವರಿಸಿ...' : 'Describe revision activities, checkpoint questions, or tactile experiments for this session...'}
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
              <span>{language === 'KN' ? 'ಅವಧಿಯನ್ನು ಸೇರಿಸಿ' : 'Add Session to Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
