import React from 'react';
import { CurrentServant, ServiceStage } from '../types';
import { ShieldAlert, ArrowRight, LockKeyhole, UserCheck } from 'lucide-react';
import { getStageById } from '../data/servicesData';

interface AccessDeniedProps {
  currentServant: CurrentServant;
  attemptedStage: ServiceStage;
  onReturnToMyStage: () => void;
  onSwitchServant: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  currentServant,
  attemptedStage,
  onReturnToMyStage,
  onSwitchServant,
}) => {
  const myStage = getStageById(currentServant.assignedStageId);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-950/90 rounded-3xl border border-rose-900/50 shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200 text-white backdrop-blur-xl">
        <div className="w-20 h-20 bg-rose-950/80 text-rose-400 rounded-3xl mx-auto flex items-center justify-center mb-5 border border-rose-600/40 shadow-inner">
          <LockKeyhole className="w-10 h-10 animate-bounce" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 text-rose-300 text-xs font-bold mb-3 border border-rose-800/40">
          <ShieldAlert className="w-3.5 h-3.5" />
          حماية الخصوصية والسرية
        </div>

        <h3 className="text-xl font-black text-white mb-2">
          هذه المرحلة مغلقة وغير مصرح لك بالدخول
        </h3>

        <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
          عفواً يا <span className="font-bold text-white">{currentServant.name}</span>، أنت مسجل حالياً ومسند إليك خدمة{' '}
          <span className="font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/40">
            {myStage?.name || currentServant.assignedStageId}
          </span>{' '}
          فقط.
          <br />
          مرحلة <span className="font-bold text-rose-400">({attemptedStage.name})</span> مخصصة لخدامها حصرياً، ولا يمكن الاطلاع على مخدوميها أو سجلات حضورها.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onReturnToMyStage}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-950/60 transition flex items-center justify-center gap-2 cursor-pointer border border-rose-500/30 text-xs sm:text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى مرحلتي ({myStage?.name || 'مرحلتي'})</span>
          </button>

          <button
            type="button"
            onClick={onSwitchServant}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-xs border border-white/10"
          >
            <UserCheck className="w-4 h-4" />
            <span>تبديل الحساب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
