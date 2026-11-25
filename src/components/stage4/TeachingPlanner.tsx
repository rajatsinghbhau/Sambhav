import React, { useState } from 'react';
import { TeachingPlan } from '../../types/stage4';
import { createDefaultTeachingPlan } from '../../engine/stage4Engine';
import { offlineStorage } from '../../utils/offlinePersistence';
import { Clock, Check, Edit3, RotateCcw, Calendar, Save, Info } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface TeachingPlannerProps {
  onPlanSaved?: (plan: TeachingPlan) => void;
  planTrigger?: number;
}

export const TeachingPlanner: React.FC<TeachingPlannerProps> = ({ onPlanSaved, planTrigger }) => {
  const [plan, setPlan] = useState<TeachingPlan>(() => {
    return offlineStorage.loadTeachingPlan() || createDefaultTeachingPlan('Water Cycle', 'condensation');
  });

  React.useEffect(() => {
    const loaded = offlineStorage.loadTeachingPlan();
    if (loaded) {
      setPlan(loaded);
    }
  }, [planTrigger]);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const totalTime = plan.items.reduce((sum, item) => sum + item.duration, 0);

  const handleDurationChange = (index: number, delta: number) => {
    sounds.playPop();
    const updatedItems = [...plan.items];
    const newDuration = Math.max(1, updatedItems[index].duration + delta);
    updatedItems[index] = { ...updatedItems[index], duration: newDuration };
    const newPlan: TeachingPlan = {
      ...plan,
      items: updatedItems,
      totalDuration: updatedItems.reduce((acc, it) => acc + it.duration, 0),
      updatedAt: new Date().toISOString()
    };
    setPlan(newPlan);
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    const updatedItems = [...plan.items];
    updatedItems[index] = { ...updatedItems[index], title: newTitle };
    setPlan({ ...plan, items: updatedItems });
  };

  const handleDescriptionChange = (index: number, newDesc: string) => {
    const updatedItems = [...plan.items];
    updatedItems[index] = { ...updatedItems[index], description: newDesc };
    setPlan({ ...plan, items: updatedItems });
  };

  const handleSavePlan = () => {
    sounds.playSuccessChime();
    offlineStorage.saveTeachingPlan(plan);
    setSaveSuccess(true);
    setIsEditing(false);
    if (onPlanSaved) {
      onPlanSaved(plan);
    }
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    sounds.playWhoosh();
    const defaultPlan = createDefaultTeachingPlan('Water Cycle', 'condensation');
    setPlan(defaultPlan);
    offlineStorage.saveTeachingPlan(defaultPlan);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>45-Minute Lesson Architect</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Today's Teaching Plan
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Structured 6-phase inclusive classroom timetable. Editable by teacher.
          </p>
        </div>

        {/* Suggested plan. Teacher decides. Notice */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Suggested plan. Teacher decides.</span>
          </div>

          <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
            totalTime === 45
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-indigo-50 text-indigo-900 border-indigo-200'
          }`}>
            Total: {totalTime} min
          </span>
        </div>
      </div>

      {/* Plan Timeline Items */}
      <div className="space-y-3">
        {plan.items.map((item, index) => {
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {item.phase}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-1.5 pt-1">
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => handleTitleChange(index, e.target.value)}
                        className="w-full text-xs font-bold p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => handleDescriptionChange(index, e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg text-slate-600"
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Control Controls */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {isEditing && (
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => handleDurationChange(index, -1)}
                      type="button"
                      aria-label="Decrease time by 1 minute"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-xs font-black px-2 text-slate-900">{item.duration}m</span>
                    <button
                      onClick={() => handleDurationChange(index, 1)}
                      type="button"
                      aria-label="Increase time by 1 minute"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                )}

                {!isEditing && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.duration} min</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            type="button"
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Done Editing' : 'Edit Plan'}</span>
          </button>

          <button
            onClick={handleResetToDefault}
            type="button"
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default (45m)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Today's plan saved offline!</span>
            </span>
          )}

          <button
            onClick={handleSavePlan}
            type="button"
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer btn-tactile"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Today's Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
