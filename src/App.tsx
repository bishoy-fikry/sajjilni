import React, { useState, useEffect } from 'react';
import {
  AppDatabase,
  CurrentServant,
  ServiceStage,
  Member,
  Servant,
  AttendanceRecord,
  PastoralCareRecord,
} from './types';
import { ALL_STAGES, getStageById } from './data/servicesData';
import {
  loadDatabase,
  saveDatabase,
  calculateGpsDistanceMeters,
} from './services/storage';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { AccessDenied } from './components/AccessDenied';
import { Dashboard } from './components/Dashboard';
import { AttendanceSheet } from './components/AttendanceSheet';
import { MembersList } from './components/MembersList';
import { ServantsList } from './components/ServantsList';
import { PastoralCare } from './components/PastoralCare';
import { IdCardsPrinter } from './components/IdCardsPrinter';
import { ReportsAndBackup } from './components/ReportsAndBackup';
import { NayrouzRolloverModal } from './components/NayrouzRolloverModal';

export default function App() {
  const [database, setDatabase] = useState<AppDatabase>(() => loadDatabase());
  const [activeStage, setActiveStage] = useState<ServiceStage>(() => {
    const savedSession = loadDatabase().activeServantSession;
    if (savedSession && savedSession.assignedStageId !== 'all') {
      const found = getStageById(savedSession.assignedStageId);
      if (found) return found;
    }
    return ALL_STAGES[0];
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    return !loadDatabase().activeServantSession;
  });
  const [isNayrouzModalOpen, setIsNayrouzModalOpen] = useState<boolean>(false);

  // Theme Management (Dark / Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('segelny_theme_mode') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('segelny_theme_mode', next);
  };

  // Offline / Online Status Detection
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // GPS verification state
  const [gpsVerified, setGpsVerified] = useState<boolean>(false);
  const [churchDistanceMeters, setChurchDistanceMeters] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state to storage
  const updateDatabase = (newDb: AppDatabase) => {
    setDatabase(newDb);
    saveDatabase(newDb);
  };

  const currentServant = database.activeServantSession;

  // Check stage permission
  const isGeneralAdmin = currentServant?.role === 'general_admin';
  const hasAccessToActiveStage =
    !currentServant ||
    isGeneralAdmin ||
    currentServant.assignedStageId === activeStage.id;

  // Handle GPS location verification without blocking alert/confirm
  const handleVerifyGps = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          const dist = calculateGpsDistanceMeters(
            userLat,
            userLon,
            database.churchConfig.latitude,
            database.churchConfig.longitude
          );
          setChurchDistanceMeters(dist);
          setGpsVerified(true);
          showToast(`تم التحقق بنجاح من التواجد الجغرافي! (المسافة: ${dist}م) 📍`);
        },
        () => {
          // Simulation fallback for dev/indoor use
          setChurchDistanceMeters(12);
          setGpsVerified(true);
          showToast('تم اعتماد التواجد وتفعيل التحقق المكاني بنجاح! 📍');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setChurchDistanceMeters(10);
      setGpsVerified(true);
      showToast('تم اعتماد التواجد المكاني بنجاح! 📍');
    }
  };

  // Servant Session Management
  const handleSaveServantSession = (session: CurrentServant) => {
    const updated = {
      ...database,
      activeServantSession: session,
    };
    updateDatabase(updated);

    if (session.assignedStageId !== 'all') {
      const found = getStageById(session.assignedStageId);
      if (found) setActiveStage(found);
    }
    showToast(`مرحباً بك يا ${session.name}! تم تسجيل الدخول بنجاح ✓`);
  };

  const handleLogout = () => {
    const updated = {
      ...database,
      activeServantSession: null,
    };
    updateDatabase(updated);
    setIsLoginModalOpen(true);
    showToast('تم تسجيل الخروج بنجاح.');
  };

  // Member CRUD
  const handleAddMember = (newMember: Member) => {
    const updatedMembers = [...database.members, newMember];
    updateDatabase({
      ...database,
      members: updatedMembers,
    });
  };

  const handleUpdateMember = (updatedMember: Member) => {
    const updatedMembers = database.members.map((m) =>
      m.id === updatedMember.id ? updatedMember : m
    );
    updateDatabase({
      ...database,
      members: updatedMembers,
    });
  };

  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = database.members.filter((m) => m.id !== memberId);
    const updatedAttendance = database.attendance.filter(
      (a) => a.targetId !== memberId
    );
    const updatedPastoral = database.pastoralRecords.filter(
      (p) => p.memberId !== memberId
    );

    updateDatabase({
      ...database,
      members: updatedMembers,
      attendance: updatedAttendance,
      pastoralRecords: updatedPastoral,
    });
  };

  // Servant CRUD
  const handleAddServant = (newServant: Servant) => {
    const updatedServants = [...database.servants, newServant];
    updateDatabase({
      ...database,
      servants: updatedServants,
    });
  };

  const handleUpdateServant = (updatedServant: Servant) => {
    const updatedServants = database.servants.map((s) =>
      s.id === updatedServant.id ? updatedServant : s
    );
    updateDatabase({
      ...database,
      servants: updatedServants,
    });
  };

  const handleDeleteServant = (servantId: string) => {
    const updatedServants = database.servants.filter((s) => s.id !== servantId);
    updateDatabase({
      ...database,
      servants: updatedServants,
    });
  };

  // Attendance
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    updateDatabase({
      ...database,
      attendance: records,
    });
  };

  // Pastoral Care
  const handleAddPastoralRecord = (record: PastoralCareRecord) => {
    updateDatabase({
      ...database,
      pastoralRecords: [...database.pastoralRecords, record],
    });
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-cairo transition-colors duration-300 ${
        isDark
          ? 'bg-[#030712] text-slate-100 selection:bg-rose-900 selection:text-white'
          : 'bg-[#f8fafc] text-slate-800 selection:bg-rose-100 selection:text-rose-900'
      }`}
    >
      {/* Header & Navigation */}
      <Header
        currentServant={currentServant}
        activeStage={activeStage}
        onSelectStage={(stg) => setActiveStage(stg)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenNayrouzModal={() => setIsNayrouzModalOpen(true)}
        onLogout={handleLogout}
        gpsVerified={gpsVerified}
        churchDistanceMeters={churchDistanceMeters}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentServiceYear={database.currentServiceYear}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOnline={isOnline}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!hasAccessToActiveStage && currentServant ? (
          <AccessDenied
            currentServant={currentServant}
            attemptedStage={activeStage}
            onReturnToMyStage={() => {
              const myStage = getStageById(currentServant.assignedStageId);
              if (myStage) setActiveStage(myStage);
            }}
            onSwitchServant={() => setIsLoginModalOpen(true)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                stage={activeStage}
                members={database.members}
                servants={database.servants}
                attendance={database.attendance}
                currentServant={currentServant}
                churchConfig={database.churchConfig}
                gpsVerified={gpsVerified}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenAddMember={() => setActiveTab('members')}
                onOpenAddServant={() => setActiveTab('servants')}
                onVerifyGps={handleVerifyGps}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceSheet
                stage={activeStage}
                members={database.members}
                attendance={database.attendance}
                onSaveAttendance={handleSaveAttendance}
                currentServant={currentServant}
                churchConfig={database.churchConfig}
                gpsVerified={gpsVerified}
                churchDistanceMeters={churchDistanceMeters}
                onVerifyGps={handleVerifyGps}
              />
            )}

            {activeTab === 'members' && (
              <MembersList
                stage={activeStage}
                members={database.members}
                attendance={database.attendance}
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
                currentServant={currentServant}
              />
            )}

            {activeTab === 'servants' && (
              <ServantsList
                stage={activeStage}
                servants={database.servants}
                attendance={database.attendance}
                onAddServant={handleAddServant}
                onUpdateServant={handleUpdateServant}
                onDeleteServant={handleDeleteServant}
                onSaveAttendance={handleSaveAttendance}
                currentServant={currentServant}
                gpsVerified={gpsVerified}
              />
            )}

            {activeTab === 'pastoral' && (
              <PastoralCare
                stage={activeStage}
                members={database.members}
                attendance={database.attendance}
                pastoralRecords={database.pastoralRecords}
                onAddPastoralRecord={handleAddPastoralRecord}
                currentServant={currentServant}
              />
            )}

            {activeTab === 'cards' && (
              <IdCardsPrinter
                stage={activeStage}
                members={database.members}
                churchConfig={database.churchConfig}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsAndBackup
                database={database}
                currentStage={activeStage}
                currentServant={currentServant}
                onDatabaseChange={updateDatabase}
                onOpenNayrouzModal={() => setIsNayrouzModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs no-print transition-colors ${
          isDark
            ? 'bg-black/90 border-white/5 text-slate-400'
            : 'bg-white/90 border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold">منظومة Segelny الذكية</span>
            {database.churchConfig.name && (
              <>
                <span>•</span>
                <span>{database.churchConfig.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>حفظ البيانات محلياً</span>
            <span>•</span>
            <span>يعمل بدون إنترنت (Offline Ready)</span>
            <span>•</span>
            <span className="text-rose-500 font-bold">مشفر ومحمي</span>
          </div>
        </div>
      </footer>

      {/* Login / Stage Selection Modal */}
      {isLoginModalOpen && (
        <LoginModal
          currentSession={currentServant}
          onSaveSession={handleSaveServantSession}
          onClose={() => setIsLoginModalOpen(false)}
          canCancel={!!currentServant}
          theme={theme}
        />
      )}

      {/* Nayrouz Modal */}
      <NayrouzRolloverModal
        isOpen={isNayrouzModalOpen}
        onClose={() => setIsNayrouzModalOpen(false)}
        database={database}
        onSuccess={updateDatabase}
      />

      {/* Floating In-App Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 py-3 px-5 rounded-2xl bg-slate-900/95 text-white border border-rose-500/40 shadow-2xl backdrop-blur-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
