import React, { useState } from 'react';
import { Doubt } from '../../types/stage4';
import { offlineStorage } from '../../utils/offlinePersistence';
import { MessageSquare, Check, Send } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface TeacherDoubtInboxProps {
  onDoubtAnswered?: () => void;
}

export const TeacherDoubtInbox: React.FC<TeacherDoubtInboxProps> = ({ onDoubtAnswered }) => {
  const [doubts, setDoubts] = useState<Doubt[]>(() => offlineStorage.loadDoubts());
  const [answeringDoubtId, setAnsweringDoubtId] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState<string>('');

  const handleStartAnswer = (doubt: Doubt) => {
    sounds.playPop();
    setAnsweringDoubtId(doubt.id);
    setAnswerDraft(doubt.answer || 'When warm invisible water vapour touches cold glass, it cools down and turns back into liquid droplets.');
  };

  const handleSendAnswer = (doubtId: string) => {
    if (!answerDraft.trim()) return;
    sounds.playSuccessChime();

    const updated = doubts.map(d => {
      if (d.id === doubtId) {
        return {
          ...d,
          answer: answerDraft.trim(),
          status: 'resolved' as const,
          answeredAt: new Date().toISOString()
        };
      }
      return d;
    });

    offlineStorage.saveDoubts(updated);
    setDoubts(updated);
    setAnsweringDoubtId(null);
    setAnswerDraft('');

    if (onDoubtAnswered) {
      onDoubtAnswered();
    }
  };

  const handleMarkResolved = (doubtId: string) => {
    sounds.playSuccessChime();
    const updated = doubts.map(d => {
      if (d.id === doubtId) {
        return {
          ...d,
          status: 'resolved' as const,
          answeredAt: new Date().toISOString()
        };
      }
      return d;
    });
    offlineStorage.saveDoubts(updated);
    setDoubts(updated);
    if (onDoubtAnswered) {
      onDoubtAnswered();
    }
  };

  const pendingDoubts = doubts.filter(d => d.status === 'pending');
  const resolvedDoubts = doubts.filter(d => d.status === 'resolved');

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Classroom Doubt Inbox</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Doubts & Questions
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review questions submitted by children during communication and teach-back.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black">
            {pendingDoubts.length} Pending
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-black">
            {resolvedDoubts.length} Resolved
          </span>
        </div>
      </div>

      {/* Doubts List */}
      <div className="space-y-3">
        {doubts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
            No active student doubts at this moment.
          </div>
        ) : (
          doubts.map(d => {
            const isAnswering = answeringDoubtId === d.id;
            const isPending = d.status === 'pending';

            return (
              <div
                key={d.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isPending
                    ? 'bg-amber-50/50 border-amber-200/90 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 bg-white rounded-xl shadow-2xs">
                      {d.conceptSymbol}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                        {d.conceptLabel} • Student: {d.studentName}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        "{d.question}"
                      </h4>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                    isPending
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {isPending ? 'Pending Response' : 'Answered'}
                  </span>
                </div>

                {/* Answer Display */}
                {d.answer && !isAnswering && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold space-y-1">
                    <span className="text-[10px] uppercase font-black text-emerald-700 block">
                      Teacher's Explanation Delivered to Student:
                    </span>
                    <p className="leading-relaxed">{d.answer}</p>
                  </div>
                )}

                {/* Answering Form */}
                {isAnswering ? (
                  <div className="space-y-3 pt-2">
                    <label htmlFor={`answer-input-${d.id}`} className="text-xs font-bold text-slate-700 block">
                      Enter Teacher's Explanation for {d.studentName}:
                    </label>
                    <textarea
                      id={`answer-input-${d.id}`}
                      rows={2}
                      value={answerDraft}
                      onChange={e => setAnswerDraft(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-indigo-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendAnswer(d.id)}
                        type="button"
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Explanation</span>
                      </button>
                      <button
                        onClick={() => setAnsweringDoubtId(null)}
                        type="button"
                        className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => handleStartAnswer(d)}
                      type="button"
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{d.answer ? 'Edit Explanation' : 'Answer Doubt'}</span>
                    </button>

                    {isPending && (
                      <button
                        onClick={() => handleMarkResolved(d.id)}
                        type="button"
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
