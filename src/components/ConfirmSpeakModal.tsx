import React from 'react';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface ConfirmSpeakModalProps {
  phrase: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  speechAvailable: boolean;
}

export const ConfirmSpeakModal: React.FC<ConfirmSpeakModalProps> = ({
  phrase,
  onConfirm,
  onCancel,
  speechAvailable
}) => {
  if (!phrase) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-speak-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs tracking-wider uppercase rounded-full mb-3">
            Confirm-Before-Speak
          </span>
          <h2 id="confirm-speak-title" className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
            Did you mean?
          </h2>
          <div className="my-6 p-4 bg-slate-50 border-2 border-indigo-200 rounded-xl">
            <p className="text-2xl font-bold text-indigo-950 tracking-tight">
              “{phrase}”
            </p>
          </div>

          {!speechAvailable && (
            <div className="mb-4 flex items-center justify-center gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-sm">
              <VolumeX className="w-4 h-4 shrink-0" />
              <span>Speech unavailable on this device</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={onCancel}
              type="button"
              className="min-h-[48px] px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 active:scale-95 transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
              aria-label="Change phrase"
            >
              <RefreshCw className="w-5 h-5 text-slate-500" />
              ← Change
            </button>
            <button
              onClick={onConfirm}
              type="button"
              className="min-h-[48px] px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95 shadow-md shadow-indigo-600/20 transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
              aria-label="Yes, speak phrase"
            >
              <Volume2 className="w-5 h-5" />
              ✓ Yes, speak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
