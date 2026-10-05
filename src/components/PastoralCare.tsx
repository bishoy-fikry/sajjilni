import React, { useState, useMemo } from 'react';
import { Member, ServiceStage, AttendanceRecord, PastoralCareRecord, CurrentServant } from '../types';
import {
  Heart,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  X,
  UserCheck,
} from 'lucide-react';

interface PastoralCareProps {
  stage: ServiceStage;
  members: Member[];
  attendance: AttendanceRecord[];
  pastoralRecords: PastoralCareRecord[];
  onAddPastoralRecord: (record: PastoralCareRecord) => void;
  currentServant: CurrentServant | null;
}

export const PastoralCare: React.FC<PastoralCareProps> = ({
  stage,
  members,
  attendance,
  pastoralRecords,
  onAddPastoralRecord,
  currentServant,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [careType, setCareType] = useState<PastoralCareRecord['type']>('اتصال هاتفي');
  const [careStatus, setCareStatus] = useState<PastoralCareRecord['status']>('تم التواصل');
  const [notes, setNotes] = useState('');

  const stageMembers = useMemo(() => members.filter((m) => m.stageId === stage.id), [members, stage.id]);
  const stagePastoral = useMemo(
    () => pastoralRecords.filter((p) => p.stageId === stage.id),
    [pastoralRecords, stage.id]
  );

  const absentOrCareMembers = useMemo(() => {
    return stageMembers.filter((m) => {
      if (m.status === 'needs_care') return true;
      const memRecords = attendance.filter((a) => a.targetId === m.id && a.targetType === 'member');
      const recent = memRecords.slice(-3);
      const absents = recent.filter((r) => r.status === 'absent');
      return absents.length >= 2;
    });
  }, [stageMembers, attendance]);

  const handleOpenLogForMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setCareType('اتصال هاتفي');
    setCareStatus('تم التواصل');
    setNotes('');
    setIsLogModalOpen(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !notes.trim()) return;

    const newRecord: PastoralCareRecord = {
      id: `past_${Date.now()}`,
      memberId: selectedMemberId,
      stageId: stage.id,
      date: new Date().toISOString().split('T')[0],
      servantName: currentServant?.name || 'الخادم',
      type: careType,
      status: careStatus,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddPastoralRecord(newRecord);
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              سجل الافتقاد والرعاية - {stage.name}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-bold border border-rose-800/40">
              {absentOrCareMembers.length} بحاجة لافتقاد
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            متابعة المخدومين الغائبين والمتعثرين بالتواصل الهاتفي والزيارات وتوثيق النتائج بسرية.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (stageMembers.length > 0) {
              handleOpenLogForMember(stageMembers[0].id);
            }
          }}
          className="py-2.5 px-4 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-950/50 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto border border-rose-500/30"
        >
          <Plus className="w-4 h-4" />
          <span>تدوين افتقاد</span>
        </button>
      </div>

      {/* Grid: Absent Alert Members & Pastoral Logs History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Urgent Attention Members */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-base border-b border-white/10 pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>بحاجة لافتقاد وتواصل</span>
          </div>

          {absentOrCareMembers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              جميع مخدومي هذه المرحلة منتظمون حالياً.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {absentOrCareMembers.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3.5 rounded-2xl border border-rose-900/40 bg-rose-950/20 space-y-2 hover:bg-rose-950/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{mem.name}</h4>
                      <div className="text-[11px] text-slate-400 font-mono">كود: {mem.code}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenLogForMember(mem.id)}
                      className="py-1 px-2.5 bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold rounded-lg transition"
                    >
                      تدوين
                    </button>
                  </div>

                  <div className="text-xs text-slate-300 space-y-0.5">
                    <div>هاتف: {mem.phone || mem.parentPhone}</div>
                    <div>العنوان: {mem.address || 'غير محدد'}</div>
                  </div>

                  <div className="pt-2 border-t border-rose-900/30 flex items-center justify-between text-xs">
                    <a
                      href={`tel:${mem.phone || mem.parentPhone}`}
                      className="text-rose-300 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3 h-3" /> اتصال
                    </a>

                    <a
                      href={`https://wa.me/2${(mem.phone || mem.parentPhone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `سلام ونعمة يا حبيبي، وحشتنا جداً في الكنيسة وبنطمن عليك من خدام مرحلة ${stage.name} ✝️❤️`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <MessageCircle className="w-3 h-3" /> واتساب
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 2 Cols: Pastoral Records Timeline */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-white text-base">
                سجل المتابعات والافتقادات ({stagePastoral.length})
              </h3>
            </div>
          </div>

          {stagePastoral.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              لم يتم تدوين ملاحظات افتقاد سابقة لمرحلة {stage.name} حتى الآن.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto pr-2">
              {stagePastoral.map((rec) => {
                const mem = stageMembers.find((m) => m.id === rec.memberId);
                return (
                  <div key={rec.id} className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {mem ? mem.name : 'مخدوم'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-950/60 text-rose-300 border border-rose-800/40">
                          {rec.type}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-slate-300">
                          {rec.status}
                        </span>
                      </div>

                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {rec.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">
                      {rec.notes}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <UserCheck className="w-3 h-3 text-rose-400" />
                      <span>الخادم: {rec.servantName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-white backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 text-rose-400 flex items-center justify-center border border-rose-800/40">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">تدوين افتقاد</h3>
                  <p className="text-xs text-slate-400">مرحلة {stage.name}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  اختر المخدوم <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm font-bold text-white focus:outline-hidden"
                >
                  <option value="" className="bg-slate-900 text-white">-- حدد المخدوم من القائمة --</option>
                  {stageMembers.map((m) => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    طريقة الافتقاد
                  </label>
                  <select
                    value={careType}
                    onChange={(e) => setCareType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white"
                  >
                    <option value="اتصال هاتفي" className="bg-slate-900 text-white">اتصال هاتفي</option>
                    <option value="زيارة منزلية" className="bg-slate-900 text-white">زيارة منزلية</option>
                    <option value="لقاء بالكنيسة" className="bg-slate-900 text-white">لقاء بالكنيسة</option>
                    <option value="رسالة واتساب" className="bg-slate-900 text-white">رسالة واتساب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    النتيجة
                  </label>
                  <select
                    value={careStatus}
                    onChange={(e) => setCareStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white"
                  >
                    <option value="تم التواصل" className="bg-slate-900 text-white">تم التواصل</option>
                    <option value="لم يرد" className="bg-slate-900 text-white">لم يرد</option>
                    <option value="مريض" className="bg-slate-900 text-white">مريض</option>
                    <option value="مسافر" className="bg-slate-900 text-white">مسافر</option>
                    <option value="متابعة لاحقة" className="bg-slate-900 text-white">متابعة لاحقة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الملاحظات والنتائج <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اكتب ما تم خلال الاتصال أو الزيارة..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ الافتقاد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
