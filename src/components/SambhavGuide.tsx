import React from 'react';
import { SAMBHAV_GUIDE_PROMPTS } from '../data/communicationData';
import { MessageSquareQuote, Sparkles } from 'lucide-react';

interface SambhavGuideProps {
  onSelectPrompt?: (prompt: string) => void;
}

export const SambhavGuide: React.FC<SambhavGuideProps> = ({ onSelectPrompt }) => {
  return (
    <section aria-labelledby="guide-title" className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-md">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">
          Scripted & Graph-Grounded
        </span>
      </div>
      <h2 id="guide-title" className="text-2xl font-bold tracking-tight text-white mb-2">
        Sambhav Classroom Guide
      </h2>
      <p className="text-slate-300 text-sm max-w-2xl mb-6 leading-relaxed">
        Safe, scripted discussion prompts anchored directly to the Water Cycle Concept Graph. Not an unrestricted AI chatbot.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SAMBHAV_GUIDE_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
            type="button"
            className="min-h-[52px] p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-left text-sm font-medium text-slate-100 flex items-start gap-3 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-[0.98] cursor-pointer"
            aria-label={`Prompt: ${prompt}`}
          >
            <MessageSquareQuote className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
            <span className="leading-snug">{prompt}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
