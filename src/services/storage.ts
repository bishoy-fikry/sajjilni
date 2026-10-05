import { AppDatabase, CurrentServant, Member, Servant, AttendanceRecord, PastoralCareRecord, ChurchLocationConfig } from '../types';
import { INITIAL_EMPTY_DATABASE, SAMPLE_CHURCH_DATABASE } from '../data/sampleData';
import { NEXT_STAGE_MAP, getStageById } from '../data/servicesData';

const STORAGE_KEY = 'segelny_church_database_v2_clean';

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize completely empty so every servant enters their own data cleanly
      saveDatabase(INITIAL_EMPTY_DATABASE);
      return INITIAL_EMPTY_DATABASE;
    }
    const parsed = JSON.parse(raw);
    return {
      churchConfig: parsed.churchConfig || INITIAL_EMPTY_DATABASE.churchConfig,
      currentServiceYear: parsed.currentServiceYear || '2026 - 2027 (السنة الكنسية)',
      members: parsed.members || [],
      servants: parsed.servants || [],
      attendance: parsed.attendance || [],
      pastoralRecords: parsed.pastoralRecords || [],
      activeServantSession: parsed.activeServantSession || null,
      nayrouzRollovers: parsed.nayrouzRollovers || [],
    };
  } catch (err) {
    console.error('Error loading database from localStorage:', err);
    return INITIAL_EMPTY_DATABASE;
  }
}

export function saveDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Error saving database to localStorage:', err);
  }
}

export function resetDatabaseToEmpty(): AppDatabase {
  saveDatabase(INITIAL_EMPTY_DATABASE);
  return INITIAL_EMPTY_DATABASE;
}

export function loadSampleDatabase(): AppDatabase {
  saveDatabase(SAMPLE_CHURCH_DATABASE);
  return SAMPLE_CHURCH_DATABASE;
}

/**
 * معالج ترقية عيد النيروز السنوية (بداية السنة الكنسية الجديدة):
 * 1. تصعيد كل مخدوم للمرحلة التالية تلقائياً (حضانة تصعد إلى ابتدائي، ابتدائي إلى إعدادي، إلخ).
 * 2. إعادة توزيع الخدام على المراحل الجديدة حسب قرار الكنيسة.
 * 3. بدء سنة كنسية جديدة مع تصفير سجلات الحضور الأسبوعية للعام الجديد وحفظ التاريخ.
 */
export function performNayrouzRollover(
  db: AppDatabase,
  nextYearTitle: string,
  updatedServantsList?: Servant[],
  resetAttendanceForNewYear = true
): { updatedDb: AppDatabase; upgradedMembersCount: number; reallocatedServantsCount: number } {
  let upgradedMembersCount = 0;

  // 1. تصعيد المخدومين للمرحلة الأعلى
  const upgradedMembers: Member[] = db.members.map((member) => {
    const nextStageId = NEXT_STAGE_MAP[member.stageId];
    if (nextStageId) {
      upgradedMembersCount++;
      const nextStage = getStageById(nextStageId);
      return {
        ...member,
        stageId: nextStageId,
        categoryId: nextStage ? nextStage.category : member.categoryId,
        notes: member.notes ? `${member.notes} [تم التصعيد في عيد النيروز إلى ${nextStage?.name || nextStageId}]` : `[تم التصعيد في عيد النيروز إلى ${nextStage?.name || nextStageId}]`,
      };
    }
    // If no next stage (e.g. general meeting), keeps current
    return member;
  });

  // 2. تحديث توزيع الخدام الجديد
  const finalServants: Servant[] = updatedServantsList || db.servants;
  const reallocatedServantsCount = updatedServantsList ? updatedServantsList.length : 0;

  // 3. تحديث جلسة الخادم الحالي إذا تغيرت مرحلته
  let updatedSession = db.activeServantSession;
  if (updatedSession && updatedSession.assignedStageId !== 'all') {
    const matchedServant = finalServants.find((s) => s.id === updatedSession?.id || s.phone === updatedSession?.phone);
    if (matchedServant) {
      updatedSession = {
        ...updatedSession,
        assignedStageId: matchedServant.stageId,
        assignedCategory: matchedServant.categoryId,
      };
    }
  }

  // 4. السجلات
  const rolloverLog = {
    fromYear: db.currentServiceYear,
    toYear: nextYearTitle,
    date: new Date().toISOString().split('T')[0],
    membersUpgraded: upgradedMembersCount,
    servantsReallocated: reallocatedServantsCount,
  };

  const updatedDb: AppDatabase = {
    ...db,
    currentServiceYear: nextYearTitle,
    members: upgradedMembers,
    servants: finalServants,
    attendance: resetAttendanceForNewYear ? [] : db.attendance,
    activeServantSession: updatedSession,
    nayrouzRollovers: [...(db.nayrouzRollovers || []), rolloverLog],
  };

  saveDatabase(updatedDb);
  return { updatedDb, upgradedMembersCount, reallocatedServantsCount };
}


export function exportDatabaseToJson(db: AppDatabase): void {
  const jsonStr = JSON.stringify(db, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `segelny_church_backup_${now}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportMembersToCSV(members: Member[], stageName: string): void {
  const headers = ['الكود', 'الاسم بالكامل', 'رقم الهاتف', 'هاتف ولي الأمر', 'العنوان', 'تاريخ الميلاد', 'النوع', 'أب الاعتراف', 'الملاحظات'];
  const rows = members.map((m) => [
    `"${m.code}"`,
    `"${m.name}"`,
    `"${m.phone}"`,
    `"${m.parentPhone}"`,
    `"${m.address.replace(/"/g, '""')}"`,
    `"${m.birthDate}"`,
    `"${m.gender === 'male' ? 'ذكر' : 'أنثى'}"`,
    `"${m.confessionFather || ''}"`,
    `"${(m.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `مخدومين_${stageName.replace(/\s+/g, '_')}_${now}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAttendanceToCSV(records: AttendanceRecord[], membersMap: Map<string, Member>, stageName: string, date: string): void {
  const headers = ['التاريخ', 'اسم المخدوم', 'كود المخدوم', 'نوع الخدمة', 'الحالة', 'التحقق في الكنيسة', 'طريقة التحقق', 'الخادم المسجل', 'ملاحظات'];
  const rows = records.map((r) => {
    const mem = membersMap.get(r.targetId);
    const statusText = r.status === 'present' ? 'حاضر' : r.status === 'absent' ? 'غائب' : 'بعذر';
    const verifiedText = r.verifiedInChurch ? 'نعم (حقيقي بالكنيسة)' : 'لا';
    return [
      `"${r.date}"`,
      `"${mem ? mem.name : 'غير معروف'}"`,
      `"${mem ? mem.code : ''}"`,
      `"${r.sessionType}"`,
      `"${statusText}"`,
      `"${verifiedText}"`,
      `"${r.verificationMethod || ''}"`,
      `"${r.recordedByServantName || ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `كشف_حضور_${stageName.replace(/\s+/g, '_')}_${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Distance calculation between GPS coordinates (Haversine formula in meters)
export function calculateGpsDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
