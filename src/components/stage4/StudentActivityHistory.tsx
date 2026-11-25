import React, { useState } from 'react';
import { offlineStorage } from '../../utils/offlinePersistence';
import { StudentActivityLog } from '../../types/stage4';
import { User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface StudentActivityHistoryProps {
  language?: 'EN' | 'KN';
}

export const StudentActivityHistory: React.FC<StudentActivityHistoryProps> = ({ language = 'EN' }) => {
  const [logs] = useState<StudentActivityLog[]>(() => offlineStorage.loadStudentActivities());
  const [selectedStudentId, setSelectedStudentId] = useState<string>(logs[0]?.studentId || 's-ananya');

  const activeLog = logs.find(l => l.studentId === selectedStudentId) || logs[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
            <User className="w-3.5 h-3.5" />
            <span>{language === 'KN' ? 'ಕಲಿಕಾ ಪ್ರಯಾಣದ ದಾಖಲೆ' : 'Learning Journey Record'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'KN' ? 'ವಿದ್ಯಾರ್ಥಿ ಚಟುವಟಿಕೆ ಇತಿಹಾಸ' : 'Student Activity History'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {language === 'KN'
              ? 'ಸಂವಹನ ಮತ್ತು ಪಾಠದ ಹಂತಗಳ ಕಾಲಾನುಕ್ರಮದ ಸಾಕ್ಷ್ಯಾಧಾರ ದಾಖಲೆಗಳು.'
              : 'Chronological evidence of interaction, communication, and milestone attempts.'}
          </p>
        </div>

        <div className="bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-xl text-xs font-bold self-start sm:self-center">
          {language === 'KN' ? 'ವಸ್ತುನಿಷ್ಠ ಸಾಕ್ಷ್ಯ ದಾಖಲೆ' : 'Objective Evidence Log'}
        </div>
      </div>

      {/* Student Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {logs.map(l => (
          <button
            key={l.studentId}
            onClick={() => {
              sounds.playPop();
              setSelectedStudentId(l.studentId);
            }}
            type="button"
            className={`min-h-[44px] px-4 py-2 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
              selectedStudentId === l.studentId
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>👧</span>
            <span>{l.studentName}</span>
          </button>
        ))}
      </div>

      {/* Active Student Activity Timeline Card */}
      {activeLog && (
        <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
            <div>
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Current Lesson: {activeLog.lessonTitle}
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-0.5">
                {activeLog.studentName}'s Demonstrated Journey
              </h4>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200">
                Next: {activeLog.nextConcept ? `🌧️ ${activeLog.nextConcept}` : 'Synthesis'}
              </span>
            </div>
          </div>

          {/* Chronological Event Trail */}
          <div className="space-y-2.5">
            {activeLog.events.map((evt, idx) => {
              const isGreen = evt.includes('🟢');
              const isYellow = evt.includes('🟡');

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-xs sm:text-sm font-bold transition-all ${
                    isGreen
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : isYellow
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center shrink-0 font-extrabold">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{evt}</span>
                  {isGreen && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {isYellow && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium italic">
            Objective activity log. Does not grade ability or rank students.
          </div>
        </div>
      )}
    </div>
  );
};
