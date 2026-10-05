import React from 'react';
import { CurrentServant, ServiceStage } from '../types';
import { ALL_STAGES, CATEGORIES_CONFIG } from '../data/servicesData';
import { BrandLogo } from './BrandLogo';
import {
  ShieldCheck,
  User,
  LogOut,
  MapPin,
  Lock,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface HeaderProps {
  currentServant: CurrentServant | null;
  activeStage: ServiceStage;
  onSelectStage: (stage: ServiceStage) => void;
  onOpenLoginModal: () => void;
  onOpenNayrouzModal?: () => void;
  onLogout: () => void;
  gpsVerified: boolean;
  churchDistanceMeters: number | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentServiceYear?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentServant,
  activeStage,
  onSelectStage,
  onOpenLoginModal,
  onOpenNayrouzModal,
  onLogout,
  gpsVerified,
  churchDistanceMeters,
  activeTab,
  setActiveTab,
  currentServiceYear,
  theme,
  onToggleTheme,
  isOnline = true,
}) => {
  const isGeneralAdmin = currentServant?.role === 'general_admin';
  const isSupervisor = currentServant?.role === 'stage_supervisor';
  const canViewServants = isGeneralAdmin || isSupervisor;
  const isDark = theme === 'dark';

  return (
    <header
      className={`shadow-xl sticky top-0 z-40 transition-colors duration-300 ${
        isDark
          ? 'bg-black/90 backdrop-blur-xl text-white border-b border-white/10'
          : 'bg-white/90 backdrop-blur-xl text-slate-800 border-b border-slate-200'
      }`}
    >
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Creative Logo without Church Icon */}
          <div className="flex items-center gap-2">
            <BrandLogo size="md" showSubtitle={true} />
            {currentServiceYear && currentServant && (
              <span
                className={`hidden xl:inline-block text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  isDark
                    ? 'bg-white/5 text-slate-300 border border-white/10'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {currentServiceYear}
              </span>
            )}
          </div>

          {/* Center: Stage quick selector / indicator (Only if logged in) */}
          {currentServant ? (
            <div className="flex items-center gap-2">
              <div className="relative group">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm transition ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-rose-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-slate-400 text-xs hidden md:inline">المرحلة:</span>
                  <span className="font-black flex items-center gap-1.5">
                    {activeStage.name}
                    {!isGeneralAdmin && currentServant?.assignedStageId !== activeStage.id && (
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </span>
                  {isGeneralAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-rose-500/20 text-rose-400 font-bold">
                      مسؤول
                    </span>
                  )}
                  {isGeneralAdmin && <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>

                {/* General Admin Dropdown Switcher */}
                {isGeneralAdmin && (
                  <div
                    className={`absolute left-0 sm:right-0 mt-2 w-72 rounded-2xl shadow-2xl p-2 hidden group-hover:block max-h-96 overflow-y-auto z-50 border ${
                      isDark
                        ? 'bg-slate-950/95 backdrop-blur-xl border-white/10 text-white'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-400 px-3 py-1 border-b border-white/10 mb-1">
                      تنقل سريع بين المراحل:
                    </div>
                    {CATEGORIES_CONFIG.map((cat) => (
                      <div key={cat.id} className="mb-2">
                        <div className="text-[11px] font-bold text-rose-400 px-2 py-1">
                          {cat.name}
                        </div>
                        <div className="space-y-0.5">
                          {cat.stages.map((stg) => (
                            <button
                              key={stg.id}
                              type="button"
                              onClick={() => onSelectStage(stg)}
                              className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                                activeStage.id === stg.id
                                  ? 'bg-rose-700 text-white font-bold'
                                  : isDark
                                  ? 'text-slate-300 hover:bg-white/10'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{stg.name}</span>
                              <span className="text-[10px] opacity-70">{stg.shortCode}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GPS Location badge */}
              <div
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  gpsVerified
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-slate-300'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${gpsVerified ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>
                  {gpsVerified
                    ? `داخل النطاق (${churchDistanceMeters ?? 0}م)`
                    : 'التحقق المكاني'}
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>نظام محمي ومشفر بالكامل</span>
            </div>
          )}

          {/* Left Actions: Offline badge, Dark/Light Switcher & Servant Profile */}
          <div className="flex items-center gap-2">
            {/* Offline-ready indicator */}
            <div
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title="يعمل التطبيق بدون اتصال بالإنترنت وحفظ البيانات محلياً"
            >
              {isOnline ? (
                <Wifi className="w-3 h-3 text-emerald-400" />
              ) : (
                <WifiOff className="w-3 h-3 text-amber-400" />
              )}
              <span>{isOnline ? 'أوفلاين جاهز' : 'بدون نت'}</span>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
              aria-label="تبديل المظهر"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Nayrouz promotion button (Supervisors only) */}
            {canViewServants && onOpenNayrouzModal && (
              <button
                type="button"
                onClick={onOpenNayrouzModal}
                className="py-1.5 px-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/50 text-rose-200 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
                title="معالج تصعيد المراحل السنوي"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">ترقية النيروز</span>
              </button>
            )}

            {currentServant ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                  title="بيانات الحساب"
                >
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  <span className="max-w-[120px] truncate">{currentServant.name}</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-rose-950/80 hover:text-rose-400 border-white/10 text-slate-400'
                      : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border-slate-200 text-slate-500'
                  }`}
                  title="تسجيل خروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer border border-rose-500/30"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>تسجيل خادم</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories & Stages Bar (Rendered only if logged in) */}
      {currentServant && (
        <div
          className={`border-t px-4 sm:px-6 lg:px-8 py-2 ${
            isDark ? 'bg-black/95 border-white/5' : 'bg-slate-100/90 border-slate-200'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
            {/* Main 3 Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES_CONFIG.map((cat) => {
                const isSelected = activeStage.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      const first = cat.stages[0];
                      if (first) onSelectStage(first);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-700 text-white shadow-md font-black border border-rose-500/50'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-black/30 text-rose-200'
                          : isDark
                          ? 'bg-white/10 text-slate-400'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat.stages.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stages of the selected Category */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {ALL_STAGES.filter((s) => s.category === activeStage.category).map((stg) => {
                const isCurrent = activeStage.id === stg.id;
                const hasAccess = isGeneralAdmin || currentServant?.assignedStageId === stg.id;

                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => onSelectStage(stg)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                      isCurrent
                        ? isDark
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50 font-black'
                          : 'bg-rose-100 text-rose-900 border border-rose-300 font-black'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-transparent'
                    }`}
                  >
                    {!hasAccess && <Lock className="w-3 h-3 text-slate-400" />}
                    <span>{stg.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      {currentServant && (
        <div
          className={`border-b px-4 sm:px-6 lg:px-8 ${
            isDark
              ? 'bg-slate-950/80 backdrop-blur-md border-white/5 text-slate-300'
              : 'bg-white/80 backdrop-blur-md border-slate-200 text-slate-700'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? isDark
                    ? 'bg-rose-950/50 text-white border-b-2 border-rose-500 font-black'
                    : 'bg-rose-50 text-rose-900 border-b-2 border-rose-600 font-black'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              📊 المؤشرات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'attendance'
                  ? isDark
                    ? 'bg-rose-950/50 text-white border-b-2 border-rose-500 font-black'
                    : 'bg-rose-50 text-rose-900 border-b-2 border-rose-600 font-black'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              📋 الحضور والغياب
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'members'
                  ? isDark
                    ? 'bg-rose-950/50 text-white border-b-2 border-rose-500 font-black'
                    : 'bg-rose-50 text-rose-900 border-b-2 border-rose-600 font-black'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              👥 سجل المخدومين
            </button>

            {canViewServants && (
              <button
                type="button"
                onClick={() => setActiveTab('servants')}
                className={`py-2 px-3 sm:px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'servants'
                    ? isDark
                      ? 'bg-rose-950/50 text-white border-b-2 border-rose-500 font-black'
                      : 'bg-rose-50 text-rose-900 border-b-2 border-rose-600 font-black'
                    : 'hover:bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                🔒 سجل الخدام
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('pastoral')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'pastoral'
                  ? isDark
                    ? 'bg-rose-950/50 text-white border-b-2 border-rose-500 font-black'
                    : 'bg-rose-50 text-rose-900 border-b-2 border-rose-600 font-black'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              ❤️ الافتقاد والمتابعة
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'cards'
                  ? isDark
                    ? 'bg-rose-950/50 text-white border-b-2 border-rose-500 font-black'
                    : 'bg-rose-50 text-rose-900 border-b-2 border-rose-600 font-black'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              🪪 بطاقات التعريف والـ QR
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'reports'
                  ? isDark
                    ? 'bg-rose-950/50 text-white border-b-2 border-rose-500 font-black'
                    : 'bg-rose-50 text-rose-900 border-b-2 border-rose-600 font-black'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              ⚙️ الإعدادات والنسخ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
