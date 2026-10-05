import React from 'react';
import { Member, Servant, AttendanceRecord, ServiceStage, CurrentServant, ChurchLocationConfig } from '../types';
import {
  Users,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Cake,
  Sparkles,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardProps {
  stage: ServiceStage;
  members: Member[];
  servants: Servant[];
  attendance: AttendanceRecord[];
  currentServant: CurrentServant | null;
  churchConfig: ChurchLocationConfig;
  gpsVerified: boolean;
  onNavigateTab: (tab: string) => void;
  onOpenAddMember: () => void;
  onOpenAddServant: () => void;
  onVerifyGps: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stage,
  members,
  servants,
  attendance,
  currentServant,
  churchConfig,
  gpsVerified,
  onNavigateTab,
  onOpenAddMember,
  onOpenAddServant,
  onVerifyGps,
}) => {
  // Filter for current stage
  const stageMembers = members.filter((m) => m.stageId === stage.id);
  const stageServants = servants.filter((s) => s.stageId === stage.id);

  // Latest session date
  const stageAttendance = attendance.filter((a) => a.stageId === stage.id && a.targetType === 'member');
  const uniqueDates = Array.from(new Set(stageAttendance.map((a) => a.date))).sort().reverse();
  const latestDate = uniqueDates[0];

  let latestAttendanceRate = 0;
  let presentCount = 0;
  let absentCount = 0;

  if (latestDate && stageMembers.length > 0) {
    const latestRecords = stageAttendance.filter((a) => a.date === latestDate);
    presentCount = latestRecords.filter((a) => a.status === 'present').length;
    absentCount = latestRecords.filter((a) => a.status === 'absent').length;
    latestAttendanceRate = Math.round((presentCount / stageMembers.length) * 100);
  }

  // Members needing pastoral care
  const needsCareMembers = stageMembers.filter((m) => m.status === 'needs_care');

  // Birthdays this month
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const birthdayMembers = stageMembers.filter((m) => {
    if (!m.birthDate) return false;
    const bMonth = parseInt(m.birthDate.split('-')[1], 10);
    return bMonth === currentMonth;
  });

  const isSupervisorOrAdmin =
    currentServant?.role === 'general_admin' || currentServant?.role === 'stage_supervisor';

  const triggerCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-white">
      {/* Stage Welcome Header Banner (Obsidian Black & Soft Red Velvet Glass) */}
      <div className="bg-gradient-to-l from-black via-slate-950 to-rose-950/70 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-900/40 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>{stage.categoryName}</span>
              <span>•</span>
              <span>الفئة: {stage.ageGroup}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {stage.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {stage.description}
            </p>
            {currentServant && (
              <div className="text-xs text-rose-200/90 pt-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>الخادم الحالي: <strong className="text-white">{currentServant.name}</strong></span>
              </div>
            )}
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('attendance')}
              className="py-3 px-5 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-black rounded-2xl shadow-lg shadow-rose-950/60 transition flex items-center gap-2 cursor-pointer text-xs sm:text-sm border border-rose-500/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل حضور الخدمة</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddMember}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/15 transition flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              <Users className="w-4 h-4 text-rose-300" />
              <span>إضافة مخدوم</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards (Glassmorphism & Soft Red Highlight) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div
          onClick={() => onNavigateTab('members')}
          className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-rose-500/40 shadow-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">مخدومي المرحلة</span>
            <div className="w-10 h-10 rounded-xl bg-white/5 text-rose-300 flex items-center justify-center group-hover:scale-110 transition border border-white/10">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-white">{stageMembers.length}</div>
            <span className="text-xs font-bold text-rose-400 flex items-center gap-0.5">
              الدليل <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            مسجلين في {stage.name}
          </div>
        </div>

        {/* Latest Attendance Rate */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-rose-500/40 shadow-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">نسبة آخر حضور</span>
            <div className="w-10 h-10 rounded-xl bg-white/5 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition border border-white/10">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-white">
              {latestDate ? `${latestAttendanceRate}%` : '—'}
            </div>
            {latestDate && (
              <span className="text-xs font-bold text-emerald-400">
                {presentCount} حاضر
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {latestDate ? `بتاريخ: ${latestDate}` : 'لم يرصد بعد'}
          </div>
        </div>

        {/* Total Servants (Only for supervisor/admin, or displays count without names) */}
        <div
          onClick={() => {
            if (isSupervisorOrAdmin) onNavigateTab('servants');
          }}
          className={`bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl transition ${
            isSupervisorOrAdmin ? 'hover:border-rose-500/40 cursor-pointer group' : 'opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">خدام المرحلة</span>
            <div className="w-10 h-10 rounded-xl bg-white/5 text-rose-300 flex items-center justify-center border border-white/10">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-white">{stageServants.length}</div>
            {isSupervisorOrAdmin && (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-0.5">
                إدارة <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            مسؤولين عن خدمة المرحلة
          </div>
        </div>

        {/* Needs Pastoral Care */}
        <div
          onClick={() => onNavigateTab('pastoral')}
          className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-rose-500/40 shadow-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">بحاجة لافتقاد</span>
            <div className="w-10 h-10 rounded-xl bg-rose-950/50 text-rose-400 flex items-center justify-center border border-rose-800/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-400">{needsCareMembers.length}</div>
            <span className="text-xs font-bold text-rose-400 flex items-center gap-0.5">
              متابعة <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            مخدومين منقطعين أو غائبين
          </div>
        </div>
      </div>

      {/* In-Church Presence Check Banner (Dark Glass & Soft Red) */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${gpsVerified ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' : 'bg-rose-950/50 text-rose-400 border-rose-800/40'}`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base">
                نظام التحقق من التواجد الفعلي داخل الكنيسة (حضور حقيقي)
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${gpsVerified ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border border-rose-800/40'}`}>
                {gpsVerified ? 'مفعل ومؤكد 📍' : 'جاهز للتحقق'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              يضمن النظام ألا يسجل المخدوم أو الخادم حضوره من المنزل، بل يكون متواجداً داخل حرم الكنيسة ({churchConfig.name}) عبر فحص الـ GPS وكود القاعة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onVerifyGps}
            className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer border border-white/15 shadow-sm"
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>فحص موقعي الآن (GPS)</span>
          </button>
        </div>
      </div>

      {/* Row: Birthdays & Pastoral Follow-up (Glass & Dark) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Birthdays this month */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-950/60 text-rose-400 flex items-center justify-center border border-rose-800/40">
                <Cake className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">
                أعياد ميلاد هذا الشهر ({birthdayMembers.length})
              </h3>
            </div>
            {birthdayMembers.length > 0 && (
              <button
                type="button"
                onClick={triggerCelebration}
                className="text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/50 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                🎉 تهنئة
              </button>
            )}
          </div>

          {birthdayMembers.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              لا توجد أعياد ميلاد مسجلة لمخدومي هذه المرحلة هذا الشهر.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto pr-1">
              {birthdayMembers.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-sm">{m.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>الميلاد: {m.birthDate}</span>
                      <span>•</span>
                      <span>الكود: {m.code}</span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/2${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `كل سنة وأنت طيب وبألف خير وسلام يا ${m.name}، عيد ميلاد سعيد من خدامك في كنيسة ${churchConfig.name} 🎂💐`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-950/50 text-emerald-300 border border-emerald-700/40 hover:bg-emerald-900/60 transition flex items-center gap-1 text-xs font-bold"
                    title="واتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Pastoral Care */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-950/60 text-rose-400 flex items-center justify-center border border-rose-800/40">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">
                سجل الافتقاد العاجل ({needsCareMembers.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('pastoral')}
              className="text-xs font-bold text-rose-400 hover:text-rose-300"
            >
              عرض السجل بالكامل ←
            </button>
          </div>

          {needsCareMembers.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              جميع مخدومي هذه المرحلة منتظمون حالياً.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto pr-1">
              {needsCareMembers.slice(0, 5).map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-sm">{m.name}</div>
                    <div className="text-xs text-rose-400 font-medium">
                      {m.notes || 'يحتاج افتقاد وتواصل من الخادم المسؤول'}
                    </div>
                  </div>

                  <a
                    href={`tel:${m.phone || m.parentPhone}`}
                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>اتصال</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
