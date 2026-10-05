import React, { useState } from 'react';
import {
  AppDatabase,
  ServiceStage,
  ChurchLocationConfig,
  CurrentServant,
} from '../types';
import {
  exportDatabaseToJson,
  resetDatabaseToEmpty,
  saveDatabase,
} from '../services/storage';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  MapPin,
  Building,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportsAndBackupProps {
  database: AppDatabase;
  currentStage: ServiceStage;
  currentServant: CurrentServant | null;
  onDatabaseChange: (newDb: AppDatabase) => void;
  onOpenNayrouzModal?: () => void;
}

export const ReportsAndBackup: React.FC<ReportsAndBackupProps> = ({
  database,
  currentStage,
  currentServant,
  onDatabaseChange,
  onOpenNayrouzModal,
}) => {
  const isSupervisorOrAdmin =
    currentServant?.role === 'general_admin' || currentServant?.role === 'stage_supervisor';

  const [churchName, setChurchName] = useState(database.churchConfig.name);
  const [latitude, setLatitude] = useState(database.churchConfig.latitude.toString());
  const [longitude, setLongitude] = useState(database.churchConfig.longitude.toString());
  const [radiusMeters, setRadiusMeters] = useState(database.churchConfig.radiusMeters.toString());
  const [dailyPin, setDailyPin] = useState(database.churchConfig.dailyPinCode);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const totalMembersAll = database.members.length;
  const totalAttendanceAll = database.attendance.length;

  const handleSaveChurchConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: ChurchLocationConfig = {
      name: churchName.trim(),
      latitude: parseFloat(latitude) || 30.0444,
      longitude: parseFloat(longitude) || 31.2357,
      radiusMeters: parseInt(radiusMeters, 10) || 150,
      dailyPinCode: dailyPin.trim() || '2026',
    };

    const updatedDb: AppDatabase = {
      ...database,
      churchConfig: updatedConfig,
    };

    saveDatabase(updatedDb);
    onDatabaseChange(updatedDb);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
        },
        (err) => {
          alert(`تعذر جلب الموقع الجغرافي: ${err.message}`);
        }
      );
    } else {
      alert('المتصفح لا يدعم تحديد الموقع الجغرافي');
    }
  };

  const handleExportJson = () => {
    exportDatabaseToJson(database);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && parsed.attendance) {
          saveDatabase(parsed);
          onDatabaseChange(parsed);
          alert('تم استيراد قاعدة البيانات بنجاح!');
          confetti({ particleCount: 60, spread: 60 });
        } else {
          alert('الملف المحدد ليس ملف نسخة احتياطية صالح لنظام سجلني!');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToEmpty = () => {
    if (
      window.confirm(
        'تحذير هام: هل أنت متأكد من تفريغ كافة البيانات للبدء على نظيف؟ يُنصح بتصدير نسخة احتياطية أولاً.'
      )
    ) {
      const emptyDb = resetDatabaseToEmpty();
      onDatabaseChange(emptyDb);
      alert('تم تفريغ السجلات بنجاح وبدء قاعدة بيانات فارغة!');
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            الإعدادات والنسخ الاحتياطي
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إعدادات التواجد المكاني وحفظ واسترجاع البيانات بأمان.
          </p>
        </div>
      </div>

      {/* Global Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
          <div className="text-xs font-bold text-slate-400 mb-1">إجمالي المخدومين المسجلين</div>
          <div className="text-3xl font-black text-white">{totalMembersAll}</div>
          <div className="text-[11px] text-slate-500 mt-1">عبر المراحل والاجتماعات</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
          <div className="text-xs font-bold text-slate-400 mb-1">إجمالي عمليات رصد الحضور</div>
          <div className="text-3xl font-black text-white">{totalAttendanceAll}</div>
          <div className="text-[11px] text-slate-500 mt-1">سجلات حضور تاريخية موثقة</div>
        </div>
      </div>

      {/* Nayrouz & Coptic New Year Progression (Confidential for Supervisors & Admins Only!) */}
      {isSupervisorOrAdmin && onOpenNayrouzModal && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-950 to-black text-white rounded-3xl p-6 shadow-2xl border border-rose-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>السنة الكنسية: {database.currentServiceYear || '2026 - 2027'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              ترقية عيد النيروز وتسكين الخدام (سري للأمناء) ✝️
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              تصعيد المخدومين سنة للمرحلة التالية وتسكين الخدام على المراحل الجديدة بضغطة واحدة.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNayrouzModal}
            className="py-3 px-5 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-950/60 transition flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-rose-500/30"
          >
            <Sparkles className="w-4 h-4 text-rose-300" />
            <span>معالج ترقية النيروز</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Church & Presence Settings Form */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Building className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-base">
              إعدادات الكنيسة ونظام التحقق المكاني (GPS & PIN)
            </h3>
          </div>

          <form onSubmit={handleSaveChurchConfig} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم الكنيسة
              </label>
              <input
                type="text"
                required
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                placeholder="كنيسة الشهيد العظيم مارجرجس"
                className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs sm:text-sm font-medium text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  خط العرض (Latitude)
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="30.0444"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  خط الطول (Longitude)
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="31.2357"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  نصف قطر الكنيسة (بالمتر)
                </label>
                <input
                  type="number"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(e.target.value)}
                  placeholder="150"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  كود الحضور اليومي (PIN)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={dailyPin}
                  onChange={(e) => setDailyPin(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-mono text-center font-bold text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="py-2 px-3 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>تعيين موقعي الحالي كإحداثيات</span>
              </button>

              <button
                type="submit"
                className="py-2 px-4 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ الإعدادات</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-300 text-xs font-bold border border-emerald-600/40 text-center animate-in fade-in">
                تم حفظ إعدادات الكنيسة بنجاح!
              </div>
            )}
          </form>
        </div>

        {/* Backup & Reset Controls */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Database className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-base">
              النسخ الاحتياطي وإدارة البيانات
            </h3>
          </div>

          <div className="space-y-3">
            {/* Export JSON */}
            <div className="p-4 rounded-2xl border border-white/10 bg-black/40 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  تصدير نسخة احتياطية (JSON)
                </h4>
                <p className="text-[11px] text-slate-400">
                  تنزيل ملف مشفر يحفظ كافة السجلات بأمان.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportJson}
                className="py-2 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-400" />
                <span>تنزيل</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="p-4 rounded-2xl border border-white/10 bg-black/40 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  استيراد نسخة احتياطية (JSON)
                </h4>
                <p className="text-[11px] text-slate-400">
                  استرجاع بيانات سابقة محفوظة على جهازك.
                </p>
              </div>

              <label className="py-2 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>اختيار ملف</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset to empty */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetToEmpty}
                className="w-full py-3 px-4 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>تفريغ كل البيانات لبدء الخدمة على نظيف</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
