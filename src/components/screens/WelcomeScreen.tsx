import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  Volume2,
  Gift,
  Award,
  Smile,
  BookOpen
} from 'lucide-react';
import { ConceptGraph } from '../../types/conceptGraph';
import { sounds } from '../../utils/soundEffects';
import { JudgeLandingFlow } from './JudgeLandingFlow';

interface WelcomeScreenProps {
  graph?: ConceptGraph;
  language?: 'EN' | 'KN';
  onStartLearning: () => void;
  onWatchDemo: () => void;
  onNavigateToTab?: (tab: 'graph' | 'communication' | 'teach_back' | 'evidence') => void;
  onOpenRevisionLibrary?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  graph,
  language = 'EN',
  onStartLearning,
  onWatchDemo,
  onNavigateToTab,
  onOpenRevisionLibrary,
}) => {
  // Interactive Buddy mascot state
  const [buddyBounce, setBuddyBounce] = useState(false);
  const [buddySpeechIndex, setBuddySpeechIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>('happy');
  const [isTreasureOpen, setIsTreasureOpen] = useState(false);

  const buddyMessages = [
    {
      en: "Hi Ananya! 👋 I'm Pip, your science explorer buddy! Ready for an amazing adventure?",
      kn: "ನಮಸ್ಕಾರ ಅನನ್ಯಾ! 👋 ನಾನು ಪಿಪ್, ನಿಮ್ಮ ವಿಜ್ಞಾನ ಸ್ನೇಹಿತ! ಇಂದಿನ ಸಾಹಸಕ್ಕೆ ಸಿದ್ಧರಿದ್ದೀರಾ?"
    },
    {
      en: "You are doing super awesome! Tap any card to hear its sound! 🎵",
      kn: "ನೀವು ಅದ್ಭುತವಾಗಿ ಕಲಿಯುತ್ತಿದ್ದೀರಿ! ಯಾವುದೇ ಕಾರ್ಡ್ ಒತ್ತಿ ಅದರ ಧ್ವನಿ ಕೇಳಿ! 🎵"
    },
    {
      en: "Did you know water travels from rivers all the way to the clouds? ☁️💧",
      kn: "ನದಿಯ ನೀರು ಆಕಾಶದ ಮೋಡಗಳವರೆಗೂ ಪ್ರಯಾಣಿಸುತ್ತದೆ ಎಂದು ನಿಮಗೆ ತಿಳಿದಿದೆಯೇ? ☁️💧"
    },
    {
      en: "High five! ✋ You are a certified young scientist!",
      kn: "ಹೈ-ಫೈವ್! ✋ ನೀವು ನಿಜವಾದ ಬಾಲ ವಿಜ್ಞಾನಿ!"
    }
  ];

  const scienceSurprises = [
    {
      en: "Water on Earth today is the very same water dinosaurs drank millions of years ago! 🦕💧",
      kn: "ಇಂದು ಭೂಮಿಯ ಮೇಲಿರುವ ನೀರು ಲಕ್ಷಾಂತರ ವರ್ಷಗಳ ಹಿಂದೆ ಡೈನೋಸಾರ್‌ಗಳು ಕುಡಿದ ಅದೇ ನೀರು! 🦕💧"
    },
    {
      en: "A single fluffy white cloud can weigh as much as 100 big elephants! 🐘☁️",
      kn: "ಆಕಾಶದಲ್ಲಿ ತೇಲುವ ಒಂದು ಮುದ್ದಾದ ಬಿಳಿ ಮೋಡವು 100 ಆನೆಗಳಷ್ಟು ತೂಕವಿರುತ್ತದೆ! 🐘☁️"
    },
    {
      en: "Raindrops fall at speeds up to 30 kilometers per hour! Zoom! 🌧️💨",
      kn: "ಮಳೆಯ ಹನಿಗಳು ಗಂಟೆಗೆ 30 ಕಿಲೋಮೀಟರ್ ವೇಗದಲ್ಲಿ ಕೆಳಗೆ ಬೀಳುತ್ತವೆ! 🌧️💨"
    }
  ];
  const [surpriseIndex, setSurpriseIndex] = useState(0);

  const handleBuddyClick = () => {
    sounds.playSuccessChime();
    setBuddyBounce(true);
    setShowConfetti(true);
    setBuddySpeechIndex((prev) => (prev + 1) % buddyMessages.length);

    setTimeout(() => setBuddyBounce(false), 800);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleSpeakBuddy = () => {
    sounds.playPop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const text = language === 'KN'
          ? buddyMessages[buddySpeechIndex].kn
          : buddyMessages[buddySpeechIndex].en;
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        if (language === 'KN') u.lang = 'kn-IN';
        window.speechSynthesis.speak(u);
      } catch {}
    }
  };

  const handleSpeakWord = (wordEn: string, wordKn: string) => {
    sounds.playPop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const text = language === 'KN' ? wordKn : wordEn;
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        if (language === 'KN') u.lang = 'kn-IN';
        window.speechSynthesis.speak(u);
      } catch {}
    }
  };

  const handleOpenTreasure = () => {
    sounds.playSuccessChime();
    setIsTreasureOpen(true);
    setShowConfetti(true);
    setSurpriseIndex((prev) => (prev + 1) % scienceSurprises.length);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const currentTopicTitle = language === 'KN'
    ? (graph?.titleKn || graph?.title || 'ಜಲಚಕ್ರ')
    : (graph?.title || 'The Water Cycle');

  return (
    <div className="w-full space-y-8 animate-in fade-in select-none">
      {/* CONFETTI BURST OVERLAY */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          <div className="text-4xl animate-bounce space-x-4">
            <span>✨</span>
            <span>🎉</span>
            <span>🌟</span>
            <span>🎊</span>
            <span>💫</span>
          </div>
        </div>
      )}

      {/* 1. HERO BANNER: 3D CARTOON BUDDY + CHEERFUL GREETING */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100 border-2 border-sky-200/90 p-6 sm:p-10 shadow-md">
        {/* Decorative soft glowing blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Greeting & Mission */}
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            {/* Cheerful Explorer Badge */}
            <div className="inline-flex items-center gap-2 bg-white/95 px-4 py-1.5 rounded-full border border-sky-300 shadow-2xs">
              <span className="text-base animate-pulse">🚀</span>
              <span className="text-xs font-black text-sky-800 uppercase tracking-wider">
                {language === 'KN' ? 'ವಿಜ್ಞಾನ ಸಾಹಸ ಮೈದಾನ' : 'Science Adventure Playground'}
              </span>
            </div>

            {/* Dynamic Child Greeting */}
            <div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight flex items-center justify-center lg:justify-start gap-2.5 flex-wrap">
                <span>{language === 'KN' ? 'ಶುಭೋದಯ, ಅನನ್ಯಾ!' : 'Good Morning, Ananya!'}</span>
                <span className="text-3xl sm:text-4xl animate-bounce">👋</span>
              </h2>
              <p className="text-base sm:text-lg font-extrabold text-blue-900 mt-1">
                {language === 'KN'
                  ? `ಇಂದು ನಾವು "${currentTopicTitle}" ಕಲಿಯಲು ಸಿದ್ಧರಾಗಿದ್ದೇವೆ!`
                  : `Today we are exploring "${currentTopicTitle}"!`}
              </p>
            </div>

            {/* PIP THE MASCOT'S INTERACTIVE SPEECH BUBBLE */}
            <div className="relative bg-white/95 border-2 border-sky-200 rounded-3xl p-4 sm:p-5 shadow-sm text-slate-800 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-base">
                    🐦
                  </span>
                  <span className="text-xs font-black text-sky-900">
                    Pip the Explorer
                  </span>
                </div>
                <button
                  onClick={handleSpeakBuddy}
                  type="button"
                  title="Listen to Pip"
                  className="w-8 h-8 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-700 leading-snug">
                "{language === 'KN'
                  ? buddyMessages[buddySpeechIndex].kn
                  : buddyMessages[buddySpeechIndex].en}"
              </p>

              <div className="text-[11px] font-extrabold text-sky-600 flex items-center gap-1">
                <span>👆</span>
                <span>{language === 'KN' ? 'ಪಿಪ್ ಅನ್ನು ಮುಟ್ಟಿ ಹೈ-ಫೈವ್ ನೀಡಿ!' : 'Tap Pip on the right to say Hi!'}</span>
              </div>
            </div>

            {/* Action Buttons: Big, Chunky & Kid-Friendly */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 justify-center lg:justify-start">
              <button
                onClick={() => {
                  sounds.playPop();
                  onStartLearning();
                }}
                type="button"
                className="min-h-[52px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base flex items-center gap-2.5 shadow-lg shadow-blue-500/30 active:scale-95 transition-all cursor-pointer"
              >
                <span>{language === 'KN' ? 'ಸಾಹಸ ಪ್ರಾರಂಭಿಸಿ' : 'Start Adventure'}</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>

              <button
                onClick={() => {
                  sounds.playSuccessChime();
                  onWatchDemo();
                }}
                type="button"
                className="min-h-[52px] px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-black text-sm flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span>{language === 'KN' ? 'ಡೆಮೊ ವೀಕ್ಷಿಸಿ' : 'Watch 1-Click Demo'}</span>
              </button>

              {onOpenRevisionLibrary && (
                <button
                  onClick={() => {
                    sounds.playPop();
                    onOpenRevisionLibrary();
                  }}
                  type="button"
                  className="min-h-[52px] px-5 py-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-black text-sm flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-sky-700" />
                  <span>{language === 'KN' ? 'ಹಿಂದಿನ ಪಾಠಗಳು' : 'Past Lessons'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: THE 3D CARTOON MASCOT CHARACTER (Pip on the Rock) */}
          <div className="relative shrink-0 flex flex-col items-center">
            {/* Tap Me Hint */}
            <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[11px] font-black text-amber-900 shadow-xs animate-bounce">
              <span>⭐</span>
              <span>{language === 'KN' ? 'ಪಿಪ್ ಮೇಲೆ ಒತ್ತಿ!' : 'Tap on me!'}</span>
            </div>

            {/* Interactive Cartoon Mascot */}
            <button
              onClick={handleBuddyClick}
              type="button"
              className={`relative cursor-pointer transition-transform duration-300 focus:outline-none ${
                buddyBounce ? 'scale-115 rotate-3' : 'hover:scale-105 active:scale-95'
              }`}
            >
              <img
                src="/mascot_bird.png"
                alt="3D Animated Aviator Bird Mascot"
                className="w-72 sm:w-80 md:w-92 h-auto object-contain drop-shadow-xl rounded-3xl"
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. "HOW ARE YOU FEELING TODAY?" CHEER CHECK-IN */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {language === 'KN' ? 'ಇಂದು ನಿಮ್ಮ ಮನಸ್ಥಿತಿ ಹೇಗಿದೆ?' : 'How are you feeling today, Explorer?'}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {language === 'KN' ? 'ಒಂದನ್ನು ಆರಿಸಿ!' : 'Pick your mood!'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'happy', emoji: '😄', label: 'Happy', kn: 'ಖುಷಿ', cheer: 'Keep smiling and shining bright! ☀️', bg: 'hover:bg-amber-50 border-amber-200' },
            { id: 'curious', emoji: '🌟', label: 'Curious', kn: 'ಕುತೂಹಲ', cheer: 'Curiosity is the key to all science! 🔍', bg: 'hover:bg-sky-50 border-sky-200' },
            { id: 'excited', emoji: '🚀', label: 'Excited', kn: 'ಉತ್ಸಾಹಿ', cheer: 'Buckle up, adventure awaits! 🛸', bg: 'hover:bg-purple-50 border-purple-200' },
            { id: 'brave', emoji: '🦁', label: 'Brave', kn: 'ಧೈರ್ಯಶಾಲಿ', cheer: 'You are fearless! Nothing stops you! 👑', bg: 'hover:bg-emerald-50 border-emerald-200' },
          ].map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => {
                  sounds.playPop();
                  setSelectedMood(mood.id);
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 1200);
                }}
                type="button"
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-amber-100/70 border-amber-400 shadow-sm ring-3 ring-amber-200/50 scale-102'
                    : `bg-slate-50/70 border-slate-200 ${mood.bg}`
                }`}
              >
                <span className="text-3xl shrink-0" aria-hidden="true">{mood.emoji}</span>
                <div className="text-left min-w-0">
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {language === 'KN' ? mood.kn : mood.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold truncate">
                    {language === 'KN' ? mood.label : mood.kn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DAILY WONDER TREASURE / MYSTERY BOX 🎁 */}
      <div className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 rounded-3xl border-2 border-purple-200 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-3xl bg-white p-2 shadow-sm flex items-center justify-center shrink-0 border border-purple-200">
              <img
                src="/mystery_gift.png"
                alt="Mystery Gift Box"
                className="w-12 h-12 object-contain animate-bounce"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-600 text-white">
                  {language === 'KN' ? 'ದೈನಂದಿನ ರಹಸ್ಯ ಪೆಟ್ಟಿಗೆ' : 'Daily Wonder Star'}
                </span>
                <span className="text-xs font-bold text-purple-700">🎁 Free Daily Surprise</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-purple-950 mt-1">
                {isTreasureOpen
                  ? (language === 'KN' ? 'ಇಂದಿನ ವಿಜ್ಞಾನ ರಹಸ್ಯ ಬಿಚ್ಚಿದೆ!' : "Today's Science Surprise Unlocked!")
                  : (language === 'KN' ? 'ಇಂದಿನ ರಹಸ್ಯ ಉಡುಗೊರೆ ತೆರೆಯಿರಿ!' : "Open Today's Wonder Gift!")}
              </h3>
              <p className="text-xs sm:text-sm text-purple-900/80 font-bold mt-0.5 max-w-md">
                {isTreasureOpen
                  ? (language === 'KN' ? scienceSurprises[surpriseIndex].kn : scienceSurprises[surpriseIndex].en)
                  : (language === 'KN'
                    ? 'ಆಶ್ಚರ್ಯಕರ ವಿಜ್ಞಾನ ರಹಸ್ಯ ತಿಳಿಯಲು ಪೆಟ್ಟಿಗೆಯನ್ನು ಮುಟ್ಟಿ!'
                    : 'Tap the button to discover an amazing fact about our planet!')}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenTreasure}
            type="button"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>
              {isTreasureOpen
                ? (language === 'KN' ? 'ಮತ್ತೊಂದು ಆಶ್ಚರ್ಯ ನೋಡಿ' : 'Another Surprise')
                : (language === 'KN' ? 'ಉಡುಗೊರೆ ತೆರೆಯಿರಿ' : 'Open Mystery Gift')}
            </span>
          </button>
        </div>
      </div>

      {/* 4. ADVENTURE STEPPING STONES: THE 7 CONCEPT MILESTONES */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <span>{language === 'KN' ? 'ನಿಮ್ಮ ವಿಜ್ಞಾನ ಸಾಹಸ ಪಥ' : 'Your Science Adventure Path'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              {language === 'KN'
                ? 'ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯೂ ನಿಮ್ಮನ್ನು ವಿಜ್ಞಾನ ನಾಯಕರನ್ನಾಗಿ ಮಾಡುತ್ತದೆ! ಧ್ವನಿ ಕೇಳಲು ಮುಟ್ಟಿ.'
                : 'Each stepping stone powers your learning journey! Tap any milestone to hear it.'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 w-fit">
            <span>🌟</span>
            <span>7 Wonder Steps</span>
          </span>
        </div>

        {/* The 7 Interactive Adventure Island Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {[
            { id: 'sun', symbol: '☀️', label: 'Sun', kannada: 'ಸೂರ್ಯ', color: 'from-amber-400 to-orange-400', border: 'hover:border-amber-400' },
            { id: 'heat', symbol: '🔥', label: 'Heat', kannada: 'ಶಾಖ', color: 'from-orange-500 to-rose-500', border: 'hover:border-rose-400' },
            { id: 'water', symbol: '💧', label: 'Water', kannada: 'ನೀರು', color: 'from-sky-400 to-blue-500', border: 'hover:border-blue-400' },
            { id: 'evaporation', symbol: '⬆️', label: 'Evaporation', kannada: 'ಆವಿಯಾಗುವಿಕೆ', color: 'from-teal-400 to-emerald-500', border: 'hover:border-teal-400' },
            { id: 'vapour', symbol: '💨', label: 'Vapour', kannada: 'ನೀರಾವಿ', color: 'from-indigo-400 to-purple-500', border: 'hover:border-indigo-400' },
            { id: 'condensation', symbol: '☁️', label: 'Condensation', kannada: 'ಘನೀಕರಣ', color: 'from-blue-400 to-indigo-500', border: 'hover:border-blue-400' },
            { id: 'rain', symbol: '🌧️', label: 'Rain', kannada: 'ಮಳೆ', color: 'from-cyan-400 to-blue-600', border: 'hover:border-cyan-400' },
          ].map((node, i) => (
            <button
              key={node.id}
              onClick={() => handleSpeakWord(node.label, node.kannada)}
              type="button"
              className={`p-4 rounded-3xl bg-slate-50 border-2 border-slate-200 ${node.border} hover:bg-white flex flex-col items-center justify-between text-center cursor-pointer active:scale-95 transition-all shadow-xs group`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {node.symbol}
              </div>

              <div className="my-2">
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  {language === 'KN' ? node.kannada : node.label}
                </span>
                <span className="text-[10px] text-blue-600 font-extrabold block mt-0.5">
                  {language === 'KN' ? node.label : node.kannada}
                </span>
              </div>

              <div className="w-full flex items-center justify-between pt-1 border-t border-slate-200/60 text-[9px] font-black text-slate-400">
                <span>Step {i + 1}</span>
                <Volume2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. CHILD STAR BADGES & WONDER REWARDS */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {language === 'KN' ? 'ನಿಮ್ಮ ಸಾಧನೆಯ ನಕ್ಷತ್ರಗಳು' : 'Your Star Badges & Trophies'}
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {language === 'KN' ? '೪ ನಕ್ಷತ್ರಗಳು ಸಂಪಾದಿಸಲಾಗಿದೆ' : '4 Stars Earned!'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: 'Water Hero', kn: 'ಜಲ ನಾಯಕ', icon: '💧', desc: 'Mastered 7 Water Steps', color: 'bg-blue-50 border-blue-200 text-blue-900', tab: 'graph' as const },
            { title: 'Lab Scientist', kn: 'ವಿಜ್ಞಾನ ತಜ್ಞ', icon: '🧪', desc: 'Simulated 3D Sandbox', color: 'bg-emerald-50 border-emerald-200 text-emerald-900', tab: 'communication' as const },
            { title: 'Storyteller', kn: 'ಕಥಾ ನಾಯಕ', icon: '🧩', desc: 'Built Teach-Back Story', color: 'bg-amber-50 border-amber-200 text-amber-900', tab: 'teach_back' as const },
            { title: '4-Day Streak', kn: '೪ ದಿನಗಳ ಸರಣಿ', icon: '🔥', desc: 'Super Learner Streak', color: 'bg-orange-50 border-orange-200 text-orange-900', tab: 'evidence' as const },
          ].map((badge, idx) => (
            <button
              key={idx}
              onClick={() => {
                sounds.playPop();
                if (onNavigateToTab) onNavigateToTab(badge.tab);
                else onStartLearning();
              }}
              type="button"
              className={`p-3.5 rounded-2xl border ${badge.color} flex items-center gap-3 shadow-2xs hover:scale-102 transition-all cursor-pointer text-left active:scale-95`}
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-xl shrink-0">
                {badge.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black truncate">
                  {language === 'KN' ? badge.kn : badge.title}
                </div>
                <div className="text-[10px] text-slate-500 font-bold truncate">
                  {badge.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. JUDGE-FRIENDLY ARCHITECTURE & DEMO FLOW (Preserved for review) */}
      <JudgeLandingFlow
        onStartDemo={onWatchDemo}
        onExploreFreely={onStartLearning}
      />
    </div>
  );
};
