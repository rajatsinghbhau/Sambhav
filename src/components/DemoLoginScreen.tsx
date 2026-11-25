import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface DemoLoginScreenProps {
  onSelectRole: (role: 'student' | 'teacher') => void;
  language?: 'EN' | 'KN';
}

export const DemoLoginScreen: React.FC<DemoLoginScreenProps> = ({
  onSelectRole,
  language = 'EN'
}) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="max-w-3xl w-full space-y-8 text-center">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>SAMBHAV 2.0 • Role-Separated Demo Portal</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Select Your Classroom Role
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mx-auto">
            {language === 'KN'
              ? 'ಪ್ರತಿಯೊಂದು ಮಗುವಿಗೂ ತರಗತಿಯಲ್ಲಿ ಧ್ವನಿ ನೀಡಲು ನಿಮ್ಮ ಡೆಮೊ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
              : 'Choose a role below to access either the child-friendly Student Experience or the Teacher Intelligence Dashboard.'}
          </p>
        </div>

        {/* 2 Big Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-2">
          {/* Card 1: Student (Ananya) */}
          <div
            onClick={() => {
              sounds.playSuccessChime();
              onSelectRole('student');
            }}
            className="group relative bg-white hover:bg-gradient-to-b hover:from-white hover:to-indigo-50/50 rounded-3xl border-2 border-slate-200 hover:border-indigo-400 p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-6 active:scale-98"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
                👧
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  Student Persona (Ananya)
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Student Dashboard
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Touch-first AAC communication, confirm-before-speak protection, milestone Teach-Back, and asking doubts.
                </p>
              </div>

              {/* Student Features List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600">💬</span>
                  <span>Communication Board with Audio Speech</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600">🧩</span>
                  <span>Teach-Back Concept Chain Builder</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600">🔎</span>
                  <span>Explain Simply & Real-Life Examples</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600">🙋</span>
                  <span>Ask a Doubt directly to your teacher</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full min-h-[50px] rounded-2xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
            >
              <span>Login as Student (Ananya)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Teacher (Educator) */}
          <div
            onClick={() => {
              sounds.playSuccessChime();
              onSelectRole('teacher');
            }}
            className="group relative bg-white hover:bg-gradient-to-b hover:from-white hover:to-amber-50/50 rounded-3xl border-2 border-slate-200 hover:border-amber-400 p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-6 active:scale-98"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
                🧑‍🏫
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Educator Persona
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Teacher Intelligence
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Turn classroom evidence into the next teaching action with structured 45-min planning and doubt management.
                </p>
              </div>

              {/* Teacher Features List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">💡</span>
                  <span>Pre-Class Teaching Suggestions (Hands-on, Visual, Movement)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">⏱️</span>
                  <span>Editable 45-Minute Lesson Planner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">📊</span>
                  <span>Class Evidence Snapshot & Reinforcement Opportunity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">📥</span>
                  <span>Student Doubt Inbox & Spaced Revision Planner</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full min-h-[50px] rounded-2xl bg-amber-500 group-hover:bg-amber-600 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 transition-all"
            >
              <span>Login as Teacher (Educator)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trust badge */}
        <div className="pt-4 text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-restricted navigation: Teachers access teaching tools; Students access communication and learning tools.</span>
        </div>
      </div>
    </div>
  );
};
