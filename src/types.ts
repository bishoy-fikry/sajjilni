export type ServiceCategory = 'sunday_school' | 'deacons' | 'general_meetings';

export interface ServiceStage {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryName: string;
  shortCode: string;
  description: string;
  ageGroup: string;
}

export type ServantRole = 'general_admin' | 'stage_supervisor' | 'servant';

export interface CurrentServant {
  id: string;
  name: string;
  phone: string;
  role: ServantRole;
  assignedCategory: ServiceCategory;
  assignedStageId: string; // 'all' for general_admin, or specific stage id
  churchName?: string;
}

export interface Member {
  id: string;
  code: string; // e.g. SS-KG-101
  name: string;
  phone: string;
  parentPhone: string;
  address: string;
  birthDate: string;
  gender: 'male' | 'female';
  categoryId: ServiceCategory;
  stageId: string;
  confessionFather?: string;
  notes: string;
  status: 'active' | 'needs_care' | 'inactive';
  photoUrl?: string;
  createdAt: string;
}

export interface Servant {
  id: string;
  code: string;
  name: string;
  phone: string;
  whatsapp?: string;
  address: string;
  birthDate: string;
  role: ServantRole;
  roleTitle: string; // e.g. خادم فصل، أمين أسرة، مسؤول غياب
  categoryId: ServiceCategory;
  stageId: string;
  notes: string;
  active: boolean;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface AttendanceRecord {
  id: string;
  targetId: string; // memberId or servantId
  targetType: 'member' | 'servant';
  stageId: string;
  date: string; // YYYY-MM-DD
  sessionType: 'درس خدمة' | 'قداس إلهي' | 'تسبحة كنسية' | 'مدرسة شمامسة' | 'نشاط / رحلة' | 'اجتماع خدام';
  status: AttendanceStatus;
  verifiedInChurch: boolean;
  verificationMethod?: 'gps' | 'church_pin' | 'qr_scanner' | 'manual';
  recordedByServantName?: string;
  notes?: string;
  timestamp: string;
}

export interface PastoralCareRecord {
  id: string;
  memberId: string;
  stageId: string;
  date: string;
  servantName: string;
  type: 'اتصال هاتفي' | 'زيارة منزلية' | 'لقاء بالكنيسة' | 'رسالة واتساب';
  status: 'تم التواصل' | 'لم يرد' | 'مريض' | 'مسافر' | 'متابعة لاحقة';
  notes: string;
  createdAt: string;
}

export interface ChurchLocationConfig {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  dailyPinCode: string; // e.g. "7741"
}

export interface AppDatabase {
  churchConfig: ChurchLocationConfig;
  currentServiceYear: string; // e.g. "2026 - 2027 (سنة كنسية)"
  members: Member[];
  servants: Servant[];
  attendance: AttendanceRecord[];
  pastoralRecords: PastoralCareRecord[];
  activeServantSession: CurrentServant | null;
  nayrouzRollovers?: {
    fromYear: string;
    toYear: string;
    date: string;
    membersUpgraded: number;
    servantsReallocated: number;
  }[];
}
