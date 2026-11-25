import React from 'react';
import { Volume2, VolumeX, RefreshCw, Check, Info } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ConfirmBeforeSpeakScreenProps {
  phrase: string;
  onConfirm: () => void;
  onChange: () => void;
  speechAvailable?: boolean;
}

export const ConfirmBeforeSpeakScreen: React.FC<ConfirmBeforeSpeakScreenProps> = ({
  phrase,
  onConfirm,
  onChange,
  speechAvailable = true,
}) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-lg p-6 sm:p-10 max-w-xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
      {/* Icon & Title */}
      <div className="flex flex-col items-center text-center">
        <div className="w-18 h-18 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-xs animate-gentle">
          <Volume2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full mb-2">
          Safety & Agency
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Did you mean?
        </h2>
      </div>

      {/* Light blue statement card */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-300 rounded-3xl text-center shadow-xs">
        <p className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight leading-snug">
          “{phrase || 'The water vapour rises and cools.'}”
        </p>
      </div>

      {!speechAvailable && (
        <div className="flex items-center justify-center gap-2 text-amber-800 bg-amber-50 p-3 rounded-2xl border border-amber-300 text-xs font-bold">
          <VolumeX className="w-4 h-4 shrink-0" />
          <span>Speech unavailable on this device</span>
        </div>
      )}

      {/* Action Buttons: Yes, speak (green) & Change */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <button
          onClick={() => {
            sounds.playSuccessChime();
            onConfirm();
          }}
          type="button"
          className="min-h-[58px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer transition-all btn-tactile"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>Yes, speak</span>
        </button>

        <button
          onClick={() => {
            sounds.playWhoosh();
            onChange();
          }}
          type="button"
          className="min-h-[58px] px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 active:scale-95 text-slate-800 font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-all btn-tactile"
        >
          <RefreshCw className="w-5 h-5 text-slate-500" />
          <span>← Change</span>
        </button>
      </div>

      {/* Helper message */}
      <div className="flex items-center justify-center gap-2 text-slate-500 text-xs sm:text-sm font-semibold pt-1">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span>You can change before we speak.</span>
      </div>

      {/* Soundwave animation graphic */}
      <div className="flex items-center justify-center gap-2 pt-2 text-blue-600 text-xs font-black uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-blue-400 rounded-full animate-pulse"></span>
          <span className="w-1.5 h-6 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="w-1.5 h-9 bg-blue-600 rounded-full animate-pulse"></span>
          <span className="w-1.5 h-5 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="w-1.5 h-8 bg-blue-600 rounded-full animate-pulse"></span>
          <span className="w-1.5 h-3 bg-blue-400 rounded-full animate-pulse"></span>
        </div>
        <span className="ml-2 text-slate-400">Audio ready...</span>
      </div>
    </div>
  );
};
