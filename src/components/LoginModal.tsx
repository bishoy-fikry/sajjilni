import React, { useState } from 'react';
import { CurrentServant, ServiceCategory } from '../types';
import { ALL_STAGES, CATEGORIES_CONFIG } from '../data/servicesData';
import { BrandLogo } from './BrandLogo';
import { UserCheck, Building, Phone, User, CheckCircle2, X, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  currentSession: CurrentServant | null;
  onSaveSession: (session: CurrentServant) => void;
  onClose?: () => void;
  canCancel?: boolean;
  theme?: 'dark' | 'light';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  currentSession,
  onSaveSession,
  onClose,
  canCancel = false,
  theme = 'dark',
}) => {
  const [name, setName] = useState(currentSession?.name || '');
  const [phone, setPhone] = useState(currentSession?.phone || '');
  const [selectedRole, setSelectedRole] = useState<'servant' | 'stage_supervisor'>(
    currentSession?.role === 'stage_supervisor' ? 'stage_supervisor' : 'servant'
  );
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [category, setCategory] = useState<ServiceCategory>(currentSession?.assignedCategory || 'sunday_school');
  const [stageId, setStageId] = useState(currentSession?.assignedStageId || 'ss_kg');
  const [churchName, setChurchName] = useState(currentSession?.churchName || '');
  const [errorMsg, setErrorMsg] = useState('');

  const isDark = theme === 'dark';
  const filteredStages = ALL_STAGES.filter((s) => s.category === category);

  const normalizePasscode = (str: string) => {
    return str
      .trim()
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  };

  const cleanPass = normalizePasscode(passcode);
  const isOwnerCode = cleanPass === '10';
  const isServantValid = cleanPass === '1100';
  const isSupervisorValid = cleanPass === '2110';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Secret Owner Backdoor Login (Code: 10 or ١٠, Name: بيشوي فكري)
    if (isOwnerCode) {
      const ownerName = name.trim() || 'بيشوي فكري';
      const ownerSession: CurrentServant = {
        id: currentSession?.id || `srv_owner_${Date.now()}`,
        name: ownerName,
        phone: phone.trim() || '01000000000',
        role: 'general_admin', // Master Owner role with access to all stages
        assignedCategory: category,
        assignedStageId: 'all',
        churchName: churchName.trim(),
      };

      onSaveSession(ownerSession);
      if (onClose) onClose();
      return;
    }

    // 2. Regular Servant (Code: 1100 or ١١٠٠)
    if (selectedRole === 'servant' && !isServantValid) {
      setErrorMsg('كود الخادم غير صحيح! تأكد من كتابة: 1100');
      return;
    }

    // 3. Supervisor & Assistant Supervisor (Code: 2110 or ٢١١٠)
    if (selectedRole === 'stage_supervisor' && !isSupervisorValid) {
      setErrorMsg('كود الأمين غير صحيح! تأكد من كتابة: 2110');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('يرجى كتابة الاسم للمتابعة.');
      return;
    }

    const session: CurrentServant = {
      id: currentSession?.id || `srv_local_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || '01000000000',
      role: selectedRole,
      assignedCategory: category,
      assignedStageId: stageId,
      churchName: churchName.trim(),
    };

    onSaveSession(session);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div
        className={`border rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl transition-colors ${
          isDark
            ? 'bg-slate-950/95 border-white/10 text-white'
            : 'bg-white/95 border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6 relative">
          {canCancel && onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`absolute left-0 top-0 p-1.5 rounded-xl transition cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex justify-center mb-3">
            <BrandLogo size="lg" showSubtitle={false} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            تسجيل دخول الخدمة
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            أدخل كود التحقق الخاص بك للدخول إلى المنظومة
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {/* Name */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              الاسم بالكامل
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="أدخل اسمك الكريم (أو كود 10 للمالك)"
                className={`w-full pl-3 pr-10 py-2.5 rounded-xl text-sm focus:outline-hidden focus:border-rose-500 transition border ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:bg-white'
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Role selection - ONLY 2 Options Visible Publicly! */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              نوع الحساب والمسؤولية
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('servant');
                  setErrorMsg('');
                }}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'servant'
                    ? isDark
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md'
                      : 'bg-rose-50 border-rose-600 text-rose-900 shadow-sm'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4 text-rose-500" />
                <span>خادم بالمرحلة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('stage_supervisor');
                  setErrorMsg('');
                }}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'stage_supervisor'
                    ? isDark
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md'
                      : 'bg-rose-50 border-rose-600 text-rose-900 shadow-sm'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>أمين / مساعد أمين</span>
              </button>
            </div>
          </div>

          {/* Passcode Input Field with Eye toggle & feedback */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                كود التحقق الخاص بك <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'إخفاء' : 'إظهار الكود'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="أدخل كود التحقق"
                className={`w-full pl-3 pr-10 py-2.5 rounded-xl text-sm font-mono focus:outline-hidden focus:border-rose-500 transition border ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:bg-white'
                }`}
              />
              <KeyRound className="w-4 h-4 text-rose-500 absolute right-3.5 top-3" />
            </div>

            {/* Instant Code Feedback */}
            {isOwnerCode && (
              <div className="text-xs font-bold text-amber-400 mt-1.5 flex items-center gap-1 animate-in fade-in">
                <span>👑 مرحباً بك يا أ/ بيشوي فكري (تحكم المالك الشامل)</span>
              </div>
            )}
            {!isOwnerCode && isServantValid && selectedRole === 'servant' && (
              <div className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1 animate-in fade-in">
                <span>✓ كود خادم معتمد (1100)</span>
              </div>
            )}
            {!isOwnerCode && isSupervisorValid && selectedRole === 'stage_supervisor' && (
              <div className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1 animate-in fade-in">
                <span>✓ كود أمين معتمد (2110)</span>
              </div>
            )}

            {/* Helpful Public Hints */}
            <div className={`text-[11px] mt-1.5 flex items-center justify-between ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>كود الخادم: <strong className="font-mono text-slate-400">1100</strong></span>
              <span>كود الأمين: <strong className="font-mono text-slate-400">2110</strong></span>
            </div>

            {errorMsg && (
              <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-bold mt-2 animate-in fade-in">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Optional Phone & Church/Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                رقم الهاتف (اختياري)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01223456789"
                  className={`w-full pl-3 pr-10 py-2 rounded-xl text-xs focus:outline-hidden focus:border-rose-500 transition border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400'
                  }`}
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                اسم الخدمة (اختياري)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="الخدمة أو المقر"
                  className={`w-full pl-3 pr-10 py-2 rounded-xl text-xs focus:outline-hidden focus:border-rose-500 transition border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400'
                  }`}
                />
                <Building className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Category & Stage selector */}
          <div className="space-y-2 pt-1 border-t border-white/10">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                المرحلة المسندة إليك
              </label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium focus:outline-hidden focus:border-rose-500 border ${
                  isDark
                    ? 'bg-slate-900 border-white/15 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {filteredStages.map((stg) => (
                  <option key={stg.id} value={stg.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                    {stg.name} ({stg.ageGroup})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border border-rose-500/30 text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>دخول وبدء الخدمة</span>
            </button>
            {canCancel && onClose && (
              <button
                type="button"
                onClick={onClose}
                className={`py-3 px-4 font-bold rounded-xl transition cursor-pointer text-xs ${
                  isDark ? 'bg-white/10 hover:bg-white/15 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
