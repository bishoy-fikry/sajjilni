import React, { useState } from 'react';
import { AppDatabase, Servant, ServiceStage } from '../types';
import { ALL_STAGES, NEXT_STAGE_MAP, getStageById } from '../data/servicesData';
import { performNayrouzRollover } from '../services/storage';
import {
  Sparkles,
  ArrowLeft,
  UserCheck,
  Calendar,
  CheckCircle2,
  X,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NayrouzRolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: AppDatabase;
  onSuccess: (updatedDb: AppDatabase) => void;
}

export const NayrouzRolloverModal: React.FC<NayrouzRolloverModalProps> = ({
  isOpen,
  onClose,
  database,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nextYearName, setNextYearName] = useState(() => {
    const current = database.currentServiceYear || '2026 - 2027';
    const match = current.match(/(\d{4})/);
    if (match) {
      const yearNum = parseInt(match[1], 10);
      return `${yearNum + 1} - ${yearNum + 2} (السنة الكنسية الجديدة)`;
    }
    return 'السنة الكنسية الجديدة (النيروز)';
  });

  const [servantsAllocation, setServantsAllocation] = useState<Servant[]>(() => {
    return JSON.parse(JSON.stringify(database.servants || []));
  });

  const [resetAttendance, setResetAttendance] = useState(true);

  if (!isOpen) return null;

  const stageStats: {
    stage: ServiceStage;
    count: number;
    nextStageName: string;
  }[] = [];

  ALL_STAGES.forEach((stg) => {
    const memsInStage = database.members.filter((m) => m.stageId === stg.id);
    if (memsInStage.length > 0) {
      const nextId = NEXT_STAGE_MAP[stg.id];
      const nextStg = nextId ? getStageById(nextId) : undefined;
      stageStats.push({
        stage: stg,
        count: memsInStage.length,
        nextStageName: nextStg ? nextStg.name : 'تخرج / مستمر بالاجتماع',
      });
    }
  });

  const totalMembersToUpgrade = database.members.filter((m) => !!NEXT_STAGE_MAP[m.stageId]).length;

  const handleUpdateServantStage = (servantId: string, newStageId: string) => {
    const targetStage = getStageById(newStageId);
    setServantsAllocation((prev) =>
      prev.map((s) => {
        if (s.id === servantId) {
          return {
            ...s,
            stageId: newStageId,
            categoryId: targetStage ? targetStage.category : s.categoryId,
            roleTitle: targetStage ? `خادم مرحلة ${targetStage.name}` : s.roleTitle,
          };
        }
        return s;
      })
    );
  };

  const handleExecuteRollover = () => {
    const { updatedDb, upgradedMembersCount, reallocatedServantsCount } = performNayrouzRollover(
      database,
      nextYearName.trim(),
      servantsAllocation,
      resetAttendance
    );

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    onSuccess(updatedDb);
    onClose();

    alert(
      `كل سنة وأنتم طيبين بمناسبة عيد النيروز المبارك! ✝️🎉\n\n` +
        `• تم تصعيد (${upgradedMembersCount}) مخدوماً للمراحل الكنسية الجديدة.\n` +
        `• تم تثبيت حركة توزيع (${reallocatedServantsCount}) خادماً وخادمة.\n` +
        `• بدأت السنة الكنسية الجديدة: ${nextYearName}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-right text-white backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-700 to-rose-900 text-white flex items-center justify-center shadow-lg shadow-rose-950/50 border border-rose-600/40">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-xl">
                  ترقية عيد النيروز وتسكين الخدام
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-bold border border-rose-800/40">
                  ١ توت
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تصعيد المخدومين للمراحل الأعلى تلقائياً وتوزيع الخدام بسرية تامة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between gap-2 mb-6 bg-black/40 p-2 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              step === 1 ? 'bg-rose-700 text-white shadow-sm font-black' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>١. السنة وتصعيد المخدومين</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              step === 2 ? 'bg-rose-700 text-white shadow-sm font-black' : 'text-slate-400'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>٢. توزيع الخدام</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              step === 3 ? 'bg-rose-700 text-white shadow-sm font-black' : 'text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>٣. التأكيد النهائي</span>
          </button>
        </div>

        {/* Step 1: Year title and members progression preview */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-4 text-xs text-rose-200 leading-relaxed">
              <strong>حركة عيد النيروز:</strong>
              <br />
              في عيد النيروز، يكبر كل مخدوم سنة وينتقل للمرحلة التالية تلقائياً (حضانة إلى ابتدائي، إعدادي إلى ثانوي، إلخ).
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم وعنوان السنة الكنسية الجديدة <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={nextYearName}
                onChange={(e) => setNextYearName(e.target.value)}
                placeholder="2027 - 2028 (السنة الكنسية الجديدة)"
                className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm font-bold text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Stages Promotion Preview Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>معاينة حركة تصعيد مخدومي المراحل:</span>
                <span className="text-rose-400 font-black">
                  إجمالي {totalMembersToUpgrade} مخدوم
                </span>
              </div>

              {stageStats.length === 0 ? (
                <div className="text-center py-8 bg-black/40 rounded-2xl text-slate-500 text-xs border border-white/10">
                  لا يوجد مخدومين مسجلين حالياً ليتم تصعيدهم.
                </div>
              ) : (
                <div className="divide-y divide-white/5 max-h-56 overflow-y-auto border border-white/10 rounded-2xl bg-black/40">
                  {stageStats.map((stg) => (
                    <div key={stg.stage.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{stg.stage.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-bold text-slate-300">
                          {stg.count} مخدوم
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 font-bold">
                        <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-300">{stg.nextStageName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-6 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer border border-rose-500/30"
              >
                <span>متابعة: توزيع الخدام للسنة الجديدة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Servants Re-allocation */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-slate-300">
              <strong>حركة توزيع الخدام (خاصة بالأمناء):</strong>
              <br />
              تعديل المرحلة المسندة لكل خادم للسنة الجديدة.
            </div>

            {servantsAllocation.length === 0 ? (
              <div className="text-center py-8 bg-black/40 rounded-2xl text-slate-500 text-xs border border-white/10">
                لا يوجد خدام مسجلين بعد.
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-64 overflow-y-auto border border-white/10 rounded-2xl p-2 bg-black/40">
                {servantsAllocation.map((srv) => (
                  <div key={srv.id} className="py-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-sm">{srv.name}</div>
                      <div className="text-xs text-slate-400">{srv.phone}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">المرحلة المسندة:</span>
                      <select
                        value={srv.stageId}
                        onChange={(e) => handleUpdateServantStage(srv.id, e.target.value)}
                        className="px-3 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-xs font-bold text-white focus:outline-hidden"
                      >
                        {ALL_STAGES.map((stg) => (
                          <option key={stg.id} value={stg.id} className="bg-slate-900 text-white">
                            {stg.name} ({stg.categoryName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                رجوع
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-2.5 px-6 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer border border-rose-500/30"
              >
                <span>متابعة للمراجعة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-300 font-black text-sm">
                <Award className="w-5 h-5 text-rose-400" />
                <span>ملخص إجراءات ترقية عيد النيروز:</span>
              </div>

              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>
                  السنة الكنسية الجديدة: <strong className="text-white">{nextYearName}</strong>
                </li>
                <li>
                  سيتم تصعيد <strong className="text-rose-400 font-bold">{totalMembersToUpgrade}</strong> مخدوماً إلى مراحلهم الكنسية الأعلى.
                </li>
                <li>
                  سيتم تثبيت حركة التوزيع لـ <strong className="text-white font-bold">{servantsAllocation.length}</strong> خادماً وخادمة.
                </li>
              </ul>

              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetAttendance}
                    onChange={(e) => setResetAttendance(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>
                    بدء سجلات حضور أسبوعية جديدة للسنة الكنسية الجديدة (نظيفة وجاهزة)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                رجوع
              </button>

              <button
                type="button"
                onClick={handleExecuteRollover}
                className="py-3 px-6 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-950/60 transition flex items-center gap-2 cursor-pointer border border-rose-500/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>اعتماد وبدء السنة الجديدة الآن</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
