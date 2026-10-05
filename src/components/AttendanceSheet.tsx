import React, { useState, useMemo } from 'react';
import {
  Member,
  AttendanceRecord,
  ServiceStage,
  CurrentServant,
  ChurchLocationConfig,
  AttendanceStatus,
} from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  QrCode,
  Search,
  Download,
  RotateCcw,
  KeyRound,
  Check,
} from 'lucide-react';
import { exportAttendanceToCSV } from '../services/storage';
import confetti from 'canvas-confetti';

interface AttendanceSheetProps {
  stage: ServiceStage;
  members: Member[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (updatedRecords: AttendanceRecord[]) => void;
  currentServant: CurrentServant | null;
  churchConfig: ChurchLocationConfig;
  gpsVerified: boolean;
  churchDistanceMeters: number | null;
  onVerifyGps: () => void;
}

export const AttendanceSheet: React.FC<AttendanceSheetProps> = ({
  stage,
  members,
  attendance,
  onSaveAttendance,
  currentServant,
  churchConfig,
  gpsVerified,
  churchDistanceMeters,
  onVerifyGps,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [sessionType, setSessionType] = useState<AttendanceRecord['sessionType']>('درس خدمة');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'excused' | 'unrecorded'>('all');
  const [fastCodeInput, setFastCodeInput] = useState('');
  const [fastCodeMsg, setFastCodeMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);

  const stageMembers = useMemo(
    () => members.filter((m) => m.stageId === stage.id),
    [members, stage.id]
  );

  const currentSessionRecords = useMemo(() => {
    return attendance.filter(
      (a) => a.stageId === stage.id && a.date === selectedDate && a.targetType === 'member'
    );
  }, [attendance, stage.id, selectedDate]);

  const recordMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    currentSessionRecords.forEach((rec) => {
      map.set(rec.targetId, rec);
    });
    return map;
  }, [currentSessionRecords]);

  // Statistics
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let excused = 0;
    let verifiedInChurchCount = 0;

    stageMembers.forEach((m) => {
      const rec = recordMap.get(m.id);
      if (rec) {
        if (rec.status === 'present') present++;
        else if (rec.status === 'absent') absent++;
        else if (rec.status === 'excused') excused++;

        if (rec.verifiedInChurch) verifiedInChurchCount++;
      }
    });

    const recorded = present + absent + excused;
    const unrecorded = stageMembers.length - recorded;
    const percent = stageMembers.length > 0 ? Math.round((present / stageMembers.length) * 100) : 0;

    return {
      total: stageMembers.length,
      present,
      absent,
      excused,
      recorded,
      unrecorded,
      percent,
      verifiedInChurchCount,
    };
  }, [stageMembers, recordMap]);

  const handleSetStatus = (memberId: string, status: AttendanceStatus, verified = gpsVerified || pinVerified) => {
    const existing = recordMap.get(memberId);
    let method: AttendanceRecord['verificationMethod'] = 'manual';
    if (gpsVerified) method = 'gps';
    else if (pinVerified) method = 'church_pin';

    const newRecord: AttendanceRecord = {
      id: existing?.id || `att_${memberId}_${selectedDate}_${Date.now()}`,
      targetId: memberId,
      targetType: 'member',
      stageId: stage.id,
      date: selectedDate,
      sessionType,
      status,
      verifiedInChurch: status === 'present' ? verified : false,
      verificationMethod: status === 'present' ? method : 'manual',
      recordedByServantName: currentServant?.name || 'الخادم',
      notes: existing?.notes || '',
      timestamp: new Date().toISOString(),
    };

    const otherRecords = attendance.filter(
      (a) => !(a.stageId === stage.id && a.date === selectedDate && a.targetId === memberId && a.targetType === 'member')
    );

    onSaveAttendance([...otherRecords, newRecord]);
  };

  const handleMarkAllPresent = () => {
    const newRecords: AttendanceRecord[] = stageMembers.map((m) => {
      const existing = recordMap.get(m.id);
      return {
        id: existing?.id || `att_${m.id}_${selectedDate}_${Date.now()}`,
        targetId: m.id,
        targetType: 'member',
        stageId: stage.id,
        date: selectedDate,
        sessionType,
        status: 'present',
        verifiedInChurch: gpsVerified || pinVerified,
        verificationMethod: gpsVerified ? 'gps' : pinVerified ? 'church_pin' : 'manual',
        recordedByServantName: currentServant?.name || 'الخادم',
        notes: existing?.notes || '',
        timestamp: new Date().toISOString(),
      };
    });

    const otherRecords = attendance.filter(
      (a) => !(a.stageId === stage.id && a.date === selectedDate && a.targetType === 'member')
    );

    onSaveAttendance([...otherRecords, ...newRecords]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  const handleResetSession = () => {
    if (window.confirm('هل أنت متأكد من مسح كشف الحضور لهذا اليوم للبدء من جديد؟')) {
      const filtered = attendance.filter(
        (a) => !(a.stageId === stage.id && a.date === selectedDate && a.targetType === 'member')
      );
      onSaveAttendance(filtered);
    }
  };

  const handleFastCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = fastCodeInput.trim().toUpperCase();
    if (!code) return;

    const found = stageMembers.find(
      (m) =>
        m.code.toUpperCase() === code ||
        m.phone === code ||
        m.parentPhone === code ||
        m.name.trim().toLowerCase() === code.toLowerCase()
    );

    if (found) {
      handleSetStatus(found.id, 'present', true);
      setFastCodeMsg({
        text: `تم تحضير: ${found.name} (${found.code}) بنجاح! ✓`,
        success: true,
      });
      setFastCodeInput('');
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.85 } });
    } else {
      setFastCodeMsg({
        text: `لم يتم العثور على مخدوم بالكود: "${code}" في مرحلة ${stage.name}!`,
        success: false,
      });
    }

    setTimeout(() => {
      setFastCodeMsg(null);
    }, 4000);
  };

  const handleVerifyPin = () => {
    if (enteredPin.trim() === churchConfig.dailyPinCode) {
      setPinVerified(true);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } else {
      alert(`كود القاعة غير صحيح!`);
    }
  };

  const filteredMembers = useMemo(() => {
    return stageMembers.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery) ||
        m.parentPhone.includes(searchQuery);

      if (!matchSearch) return false;

      const rec = recordMap.get(m.id);
      if (filterStatus === 'all') return true;
      if (filterStatus === 'unrecorded') return !rec;
      return rec?.status === filterStatus;
    });
  }, [stageMembers, searchQuery, filterStatus, recordMap]);

  const handleExportCSV = () => {
    const membersMap = new Map<string, Member>();
    stageMembers.forEach((m) => membersMap.set(m.id, m));
    exportAttendanceToCSV(currentSessionRecords, membersMap, stage.name, selectedDate);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Controls Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                تسجيل الحضور والغياب - {stage.name}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-bold border border-rose-800/40">
                {stage.categoryName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              تسجيل أسبوعي سريع مع توثيق التواجد الفعلي داخل الكنيسة.
            </p>
          </div>

          {/* Date & Quick Sessions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold">
              <span className="text-slate-400">التاريخ:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold">
              <span className="text-slate-400">الخدمة:</span>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as any)}
                className="bg-transparent text-white font-bold focus:outline-hidden"
              >
                <option value="درس خدمة" className="bg-slate-900 text-white">درس خدمة</option>
                <option value="قداس إلهي" className="bg-slate-900 text-white">قداس إلهي</option>
                <option value="مدرسة شمامسة" className="bg-slate-900 text-white">مدرسة شمامسة</option>
                <option value="تسبحة كنسية" className="bg-slate-900 text-white">تسبحة كنسية</option>
                <option value="نشاط / رحلة" className="bg-slate-900 text-white">نشاط / رحلة</option>
                <option value="اجتماع خدام" className="bg-slate-900 text-white">اجتماع خدام</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real Church Presence Verification Toolbar */}
        <div className="bg-black/40 rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${gpsVerified || pinVerified ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' : 'bg-rose-950/50 text-rose-400 border-rose-800/40'}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">
                  توثيق الحضور داخل حرم الكنيسة:
                </span>
                {gpsVerified ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> تم التحقق الجغرافي ({churchDistanceMeters ?? 0}م)
                  </span>
                ) : pinVerified ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> تم التحقق بكود القاعة
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-400 font-bold">
                    غير مفعل حالياً
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تأكيد التواجد داخل {churchConfig.name} لمنع التحضير عن بُعد.
              </p>
            </div>
          </div>

          {/* Verification Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {!gpsVerified && (
              <button
                type="button"
                onClick={onVerifyGps}
                className="py-1.5 px-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>فحص الـ GPS</span>
              </button>
            )}

            {!pinVerified ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="كود القاعة اليومي"
                  className="w-28 px-2 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs font-mono text-center text-white focus:outline-hidden focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyPin}
                  className="py-1.5 px-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>تأكيد</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPinVerified(false)}
                className="text-[11px] text-slate-400 hover:text-slate-300 underline"
              >
                إلغاء التوثيق
              </button>
            )}
          </div>
        </div>

        {/* Fast Scanner / QR Entry Bar (Dark Glass & Soft Red) */}
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-4">
          <form onSubmit={handleFastCodeSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-rose-200 text-xs font-black shrink-0">
              <QrCode className="w-4 h-4 text-rose-400" />
              <span>تسجيل فوري بكود المخدوم أو الـ QR:</span>
            </div>
            <div className="flex-1 w-full relative">
              <input
                type="text"
                value={fastCodeInput}
                onChange={(e) => setFastCodeInput(e.target.value)}
                placeholder="اكتب كود المخدوم مثل: KG-101 أو رقم الهاتف واضغط Enter..."
                className="w-full px-3 py-2 bg-black/60 border border-rose-900/50 rounded-xl text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:border-rose-500 shadow-sm placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto py-2 px-4 bg-rose-700 hover:bg-rose-800 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تحضير الآن</span>
            </button>
          </form>

          {fastCodeMsg && (
            <div
              className={`mt-2.5 p-2 rounded-xl text-xs font-bold text-center ${
                fastCodeMsg.success
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-600/50'
                  : 'bg-rose-950/70 text-rose-300 border border-rose-600/50'
              }`}
            >
              {fastCodeMsg.text}
            </div>
          )}
        </div>

        {/* Stats Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-300 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                حاضر: {stats.present} ({stats.percent}%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                غائب: {stats.absent}
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                بعذر: {stats.excused}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                لم يرصد: {stats.unrecorded}
              </span>
            </div>

            <div className="text-slate-400 font-medium text-[11px]">
              إجمالي مخدومي المرحلة: {stats.total}
            </div>
          </div>

          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden flex border border-white/10">
            <div
              style={{ width: `${(stats.present / (stats.total || 1)) * 100}%` }}
              className="bg-emerald-500 transition-all duration-300"
            />
            <div
              style={{ width: `${(stats.excused / (stats.total || 1)) * 100}%` }}
              className="bg-amber-400 transition-all duration-300"
            />
            <div
              style={{ width: `${(stats.absent / (stats.total || 1)) * 100}%` }}
              className="bg-rose-600 transition-all duration-300"
            />
          </div>
        </div>

        {/* Toolbar: Search, Filters & Bulk Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الكود أو الهاتف..."
                className="w-full pl-3 pr-9 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
            </div>

            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl text-xs border border-white/10">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterStatus === 'all' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل ({stageMembers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('present')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterStatus === 'present' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                حاضر ({stats.present})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('absent')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterStatus === 'absent' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                غائب ({stats.absent})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('unrecorded')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterStatus === 'unrecorded' ? 'bg-white/20 text-white' : 'text-slate-400'
                }`}
              >
                لم يرصد ({stats.unrecorded})
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="py-1.5 px-3 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>تحضير الكل</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>تصدير إكسيل</span>
            </button>

            <button
              type="button"
              onClick={handleResetSession}
              className="p-2 bg-white/5 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-white/10 rounded-xl transition cursor-pointer"
              title="مسح كشف اليوم للبدء من جديد"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Members Attendance List */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        {stageMembers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 text-rose-300 mx-auto flex items-center justify-center mb-3 border border-white/10">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              لا يوجد مخدومين مسجلين بعد في مرحلة {stage.name}
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
              انتقل لتبويب "سجل المخدومين" لإدخال أول مخدوم في الخدمة.
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            لا توجد نتائج تطابق معايير البحث.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredMembers.map((member, idx) => {
              const rec = recordMap.get(member.id);
              const status = rec?.status;

              return (
                <div
                  key={member.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                    status === 'present'
                      ? 'bg-emerald-950/20'
                      : status === 'absent'
                      ? 'bg-rose-950/20'
                      : status === 'excused'
                      ? 'bg-amber-950/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="text-slate-500 text-xs font-mono w-6 text-center shrink-0">
                      {idx + 1}
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-800 to-black text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0 border border-rose-700/30">
                      {member.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base">
                          {member.name}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold border border-white/10">
                          {member.code}
                        </span>
                        {rec?.verifiedInChurch && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 font-bold flex items-center gap-0.5 border border-emerald-700/40">
                            <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                            حقيقي بالكنيسة
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                        <span>هاتف: {member.phone || member.parentPhone}</span>
                        {member.confessionFather && (
                          <span>أب الاعتراف: {member.confessionFather}</span>
                        )}
                        {member.notes && (
                          <span className="text-rose-300 bg-rose-950/50 px-1.5 py-0.2 rounded text-[11px] border border-rose-900/40">
                            {member.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Actions: Present / Absent / Excused */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleSetStatus(member.id, 'present')}
                      className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white shadow-emerald-950/50'
                          : 'bg-white/5 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-white/10'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حاضر</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetStatus(member.id, 'absent')}
                      className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        status === 'absent'
                          ? 'bg-rose-700 text-white shadow-rose-950/50'
                          : 'bg-white/5 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-white/10'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>غائب</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetStatus(member.id, 'excused')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-sm ${
                        status === 'excused'
                          ? 'bg-amber-600 text-white shadow-amber-950/50'
                          : 'bg-white/5 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-white/10'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>بعذر</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
