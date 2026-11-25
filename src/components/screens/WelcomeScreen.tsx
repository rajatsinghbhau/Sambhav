import React from 'react';
import { ArrowRight, Play, Sparkles, BookOpen } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { JudgeLandingFlow } from './JudgeLandingFlow';

interface WelcomeScreenProps {
  language?: 'EN' | 'KN';
  onStartLearning: () => void;
  onWatchDemo: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language = 'EN',
  onStartLearning,
  onWatchDemo,
}) => {
  return (
    <div className="w-full space-y-8 animate-in fade-in">
      {/* HERO BANNER: Apple-inspired elegant typography & soft card depth */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/50 via-sky-50/30 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-4 max-w-xl text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Inclusive Learning Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'KN' ? 'ಜಲಚಕ್ರ (The Water Cycle)' : 'The Water Cycle'}
          </h2>

          <p className="text-lg sm:text-xl font-bold text-indigo-950">
            {language === 'KN'
              ? '“ಪ್ರತಿಯೊಂದು ಮಗುವೂ ತರಗತಿಯಲ್ಲಿ ಧ್ವನಿಯನ್ನು ಹೊಂದಲು ಅರ್ಹವಾಗಿದೆ.”'
              : '“Every child deserves a voice in the classroom.”'}
          </p>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            {language === 'KN'
              ? 'ಶಿಕ್ಷಕರು ಅನುಮೋದಿಸಿದ ಪರಿಕಲ್ಪನಾ ಗ್ರಾಫ್‌ಗಳ ಮೂಲಕ AAC ಸಂವಹನ ಸಾಧನಗಳನ್ನು ತರಗತಿಯ ಪಠ್ಯಕ್ರಮದ ಮೈಲಿಗಲ್ಲುಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸುವುದು.'
              : 'Connecting AAC communication devices directly with classroom curriculum milestones through teacher-approved Concept Graphs.'}
          </p>

          {/* Action Buttons with min 48px target */}
          <div className="flex flex-wrap items-center gap-4 pt-3 justify-center md:justify-start">
            <button
              onClick={() => {
                sounds.playPop();
                onStartLearning();
              }}
              type="button"
              aria-label="Start Learning session"
              className="min-h-[52px] min-w-[48px] px-8 py-3.5 rounded-2xl btn-primary-action font-extrabold text-base flex items-center gap-2.5 cursor-pointer shadow-md classy-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>{language === 'KN' ? 'ಕಲಿಕೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ' : 'Start Learning'}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={() => {
                sounds.playSuccessChime();
                onWatchDemo();
              }}
              type="button"
              aria-label="Start One-Click Demo Mode"
              className="min-h-[52px] min-w-[48px] px-8 py-3.5 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-800 font-bold text-base shadow-xs flex items-center gap-2 cursor-pointer transition-all classy-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              <span>{language === 'KN' ? 'ಡೆಮೊ ವೀಕ್ಷಿಸಿ (Start Demo)' : 'Start One-Click Demo'}</span>
            </button>
          </div>
        </div>

        {/* Elegant Hero Visual Card */}
        <div className="w-full md:w-80 h-72 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 p-8 text-white flex flex-col items-center justify-center text-center shadow-lg relative z-10">
          <span className="text-7xl mb-3 animate-float filter drop-shadow">💧</span>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-100">
            Teacher Approved
          </span>
          <span className="text-xs text-white/90 font-semibold mt-1">
            Deterministic Milestone Verification
          </span>
        </div>
      </div>

      {/* FULL-WIDTH MILESTONE FLOW */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>{language === 'KN' ? 'ಮೈಲಿಗಲ್ಲು ಪರಿಕಲ್ಪನಾ ಸರಪಳಿ' : 'Milestone Concept Chain'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Sequence: Sun → Heat → Water → Evaporation → Vapour → Condensation → Rain
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            7 Sequential Steps
          </span>
        </div>

        {/* 7 Milestone Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {[
            { id: 'sun', symbol: '☀️', label: 'Sun', kannada: 'ಸೂರ್ಯ' },
            { id: 'heat', symbol: '🔥', label: 'Heat', kannada: 'ಶಾಖ' },
            { id: 'water', symbol: '💧', label: 'Water', kannada: 'ನೀರು' },
            { id: 'evaporation', symbol: '⬆️', label: 'Evaporation', kannada: 'ಆವಿಯಾಗುವಿಕೆ' },
            { id: 'vapour', symbol: '💨', label: 'Vapour', kannada: 'ನೀರಾವಿ' },
            { id: 'condensation', symbol: '☁️', label: 'Condensation', kannada: 'ಘನೀಕರಣ' },
            { id: 'rain', symbol: '🌧️', label: 'Rain', kannada: 'ಮಳೆ' },
          ].map((node, i) => (
            <div
              key={node.id}
              onClick={() => sounds.playPop()}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all shadow-2xs classy-btn"
            >
              <span className="text-3xl mb-1.5">{node.symbol}</span>
              <span className="text-xs font-black text-slate-900 leading-tight">
                {language === 'KN' ? node.kannada : node.label}
              </span>
              <span className="text-[10px] text-indigo-600 font-bold mt-0.5">
                {language === 'KN' ? node.label : node.kannada}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase mt-1">Step {i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 8: Judge-Friendly Vertical Landing Screen Flow */}
      <JudgeLandingFlow
        onStartDemo={onWatchDemo}
        onExploreFreely={onStartLearning}
      />
    </div>
  );
};