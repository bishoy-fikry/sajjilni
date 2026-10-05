import { ServiceCategory, ServiceStage } from '../types';

export interface CategoryInfo {
  id: ServiceCategory;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  badgeColor: string;
  stages: ServiceStage[];
}

export const ALL_STAGES: ServiceStage[] = [
  // 1. التربية الكنسية
  {
    id: 'ss_kg',
    name: 'حضانة (KG)',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: 'حض',
    description: 'مرحلة الطفولة المبكرة والتمهيدي (حضانة صغرى وكبرى)',
    ageGroup: '3 - 5 سنوات',
  },
  {
    id: 'ss_prim_1_2',
    name: 'أولى وثانية ابتدائي',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: '1-2 ب',
    description: 'الصف الأول والثاني الابتدائي',
    ageGroup: '6 - 7 سنوات',
  },
  {
    id: 'ss_prim_3_4',
    name: 'ثالثة ورابعة ابتدائي',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: '3-4 ب',
    description: 'الصف الثالث والرابع الابتدائي',
    ageGroup: '8 - 9 سنوات',
  },
  {
    id: 'ss_prim_5_6',
    name: 'خامسة وسادسة ابتدائي',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: '5-6 ب',
    description: 'الصف الخامس والسادس الابتدائي',
    ageGroup: '10 - 11 سنة',
  },
  {
    id: 'ss_prep_1',
    name: 'أولى إعدادي',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: '1 ع',
    description: 'الصف الأول الإعدادي',
    ageGroup: '12 سنة',
  },
  {
    id: 'ss_prep_2',
    name: 'ثانية إعدادي',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: '2 ع',
    description: 'الصف الثاني الإعدادي',
    ageGroup: '13 سنة',
  },
  {
    id: 'ss_prep_3',
    name: 'ثالثة إعدادي',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: '3 ع',
    description: 'الصف الثالث الإعدادي والشهادة الإعدادية',
    ageGroup: '14 سنة',
  },
  {
    id: 'ss_sec_1',
    name: 'أولى ثانوي',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: '1 ث',
    description: 'الصف الأول الثانوي',
    ageGroup: '15 سنة',
  },
  {
    id: 'ss_sec_2',
    name: 'ثانية ثانوي',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: '2 ث',
    description: 'الصف الثاني الثانوي',
    ageGroup: '16 سنة',
  },
  {
    id: 'ss_sec_3',
    name: 'ثالثة ثانوي',
    category: 'sunday_school',
    categoryName: 'التربية الكنسية',
    shortCode: '3 ث',
    description: 'الصف الثالث الثانوي والشهادة الثانوية العامة',
    ageGroup: '17 - 18 سنة',
  },

  // 2. مدرسة الشمامسة
  {
    id: 'deacon_kg',
    name: 'حضانة (شمامسة)',
    category: 'deacons',
    categoryName: 'مدرسة الشمامسة',
    shortCode: 'شم-حض',
    description: 'تعليم مردات وألحان الطفولة المبكرة وطقس الكنيسة',
    ageGroup: '3 - 5 سنوات',
  },
  {
    id: 'deacon_prim_1_2',
    name: 'أولى وثانية ابتدائي (شمامسة)',
    category: 'deacons',
    categoryName: 'مدرسة الشمامسة',
    shortCode: 'شم 1-2ب',
    description: 'مردات القداس الباسيلي والألحان الأساسية واللغة القبطية',
    ageGroup: '6 - 7 سنوات',
  },
  {
    id: 'deacon_prim_3_4',
    name: 'ثالثة ورابعة ابتدائي (شمامسة)',
    category: 'deacons',
    categoryName: 'مدرسة الشمامسة',
    shortCode: 'شم 3-4ب',
    description: 'ألحان الأعياد والصلوات الطقسية والقبطي المتوسط',
    ageGroup: '8 - 9 سنوات',
  },
  {
    id: 'deacon_prim_5_6',
    name: 'خامسة وسادسة ابتدائي (شمامسة)',
    category: 'deacons',
    categoryName: 'مدرسة الشمامسة',
    shortCode: 'شم 5-6ب',
    description: 'طقس رفع بخور عشية وباكر ورتبة إبصلتس وأناغنوسطيس',
    ageGroup: '10 - 11 سنة',
  },
  {
    id: 'deacon_prep_1_2_3',
    name: 'مرحلة إعدادي (أولى - ثانية - ثالثة)',
    category: 'deacons',
    categoryName: 'مدرسة الشمامسة',
    shortCode: 'شم-إعدادي',
    description: 'الألحان الطويلة والأسباسموسات وطقوس المناسبات والأسبوع المقدس',
    ageGroup: '12 - 14 سنة',
  },
  {
    id: 'deacon_sec_1_2_3',
    name: 'مرحلة ثانوي (أولى - ثانية - ثالثة)',
    category: 'deacons',
    categoryName: 'مدرسة الشمامسة',
    shortCode: 'شم-ثانوي',
    description: 'ألحان المناسبات الكبرى والتسبحة السنوية والكيهكية ورتبة الإبودياكون',
    ageGroup: '15 - 18 سنة',
  },

  // 3. الاجتماعات والأنشطة العامة
  {
    id: 'gm_youth',
    name: 'اجتماع الشباب',
    category: 'general_meetings',
    categoryName: 'الاجتماعات العامة والأنشطة',
    shortCode: 'شباب',
    description: 'اجتماع شباب الجامعة والخريجين والمقبلين على العمل',
    ageGroup: '18 - 30 سنة',
  },
  {
    id: 'gm_general',
    name: 'الاجتماع العام',
    category: 'general_meetings',
    categoryName: 'الاجتماعات العامة والأنشطة',
    shortCode: 'عام',
    description: 'اجتماع دراسة الكتاب المقدس والوعظة الأسبوعية للأسرة',
    ageGroup: 'جميع الأعمار',
  },
  {
    id: 'gm_women',
    name: 'اجتماع السيدات',
    category: 'general_meetings',
    categoryName: 'الاجتماعات العامة والأنشطة',
    shortCode: 'سيدات',
    description: 'اجتماع الأمهات وربات البيوت والسيدات',
    ageGroup: 'سيدات الأسرة',
  },
  {
    id: 'gm_men',
    name: 'اجتماع الرجالة',
    category: 'general_meetings',
    categoryName: 'الاجتماعات العامة والأنشطة',
    shortCode: 'رجال',
    description: 'اجتماع الآباء وأرباب الأسر والرجال',
    ageGroup: 'رجال الأسرة',
  },
  {
    id: 'gm_scouts',
    name: 'الكشافة الكنسية',
    category: 'general_meetings',
    categoryName: 'الاجتماعات العامة والأنشطة',
    shortCode: 'كشافة',
    description: 'فريق الكشافة والمرشدات والأنشطة الميدانية والمعسكرات',
    ageGroup: 'أشبال - كشافة - جوالة',
  },
  {
    id: 'gm_servants',
    name: 'اجتماع الخدام',
    category: 'general_meetings',
    categoryName: 'الاجتماعات العامة والأنشطة',
    shortCode: 'خدام',
    description: 'الاجتماع الروحي والتنسيقي لخدام وخادمات الكنيسة والأمناء',
    ageGroup: 'خدام وخادمات',
  },
];

export const CATEGORIES_CONFIG: CategoryInfo[] = [
  {
    id: 'sunday_school',
    name: 'التربية الكنسية',
    shortName: 'مدارس الأحد',
    icon: 'GraduationCap',
    description: 'من مرحلة حضانة حتى ثالثة ثانوي مقسمة حسب الفصول السنية',
    badgeColor: 'bg-blue-600 text-white',
    stages: ALL_STAGES.filter((s) => s.category === 'sunday_school'),
  },
  {
    id: 'deacons',
    name: 'مدرسة الشمامسة',
    shortName: 'ألحان وطقس',
    icon: 'Music',
    description: 'تعليم الألحان القبطية، الطقوس، والتسبحة الكنسية من حضانة لثانوي',
    badgeColor: 'bg-amber-600 text-white',
    stages: ALL_STAGES.filter((s) => s.category === 'deacons'),
  },
  {
    id: 'general_meetings',
    name: 'الاجتماعات والأنشطة',
    shortName: 'اجتماعات عامة',
    icon: 'Users',
    description: 'اجتماع الشباب، العام، السيدات، الرجال، الكشافة، واجتماع الخدام',
    badgeColor: 'bg-emerald-600 text-white',
    stages: ALL_STAGES.filter((s) => s.category === 'general_meetings'),
  },
];

export function getStageById(id: string): ServiceStage | undefined {
  return ALL_STAGES.find((s) => s.id === id);
}

export function getCategoryById(id: ServiceCategory): CategoryInfo | undefined {
  return CATEGORIES_CONFIG.find((c) => c.id === id);
}

/**
 * خريطة تصعيد وترقية المراحل في عيد النيروز (بداية السنة الكنسية الجديدة)
 * المخدومين بيكبروا سنة ويتنقلوا للمرحلة التالية تلقائياً
 */
export const NEXT_STAGE_MAP: Record<string, string> = {
  // التربية الكنسية (مدارس الأحد)
  ss_kg: 'ss_prim_1_2', // حضانة تصعد إلى أولى وثانية ابتدائي
  ss_prim_1_2: 'ss_prim_3_4', // أولى وثانية تصعد إلى ثالثة ورابعة
  ss_prim_3_4: 'ss_prim_5_6', // ثالثة ورابعة تصعد إلى خامسة وسادسة
  ss_prim_5_6: 'ss_prep_1', // خامسة وسادسة تصعد إلى أولى إعدادي
  ss_prep_1: 'ss_prep_2', // أولى إعدادي تصعد إلى ثانية إعدادي
  ss_prep_2: 'ss_prep_3', // ثانية إعدادي تصعد إلى ثالثة إعدادي
  ss_prep_3: 'ss_sec_1', // ثالثة إعدادي تصعد إلى أولى ثانوي
  ss_sec_1: 'ss_sec_2', // أولى ثانوي تصعد إلى ثانية ثانوي
  ss_sec_2: 'ss_sec_3', // ثانية ثانوي تصعد إلى ثالثة ثانوي
  ss_sec_3: 'gm_youth', // خريجو ثالثة ثانوي يتنقلون لاجتماع الشباب

  // مدرسة الشمامسة
  deacon_kg: 'deacon_prim_1_2',
  deacon_prim_1_2: 'deacon_prim_3_4',
  deacon_prim_3_4: 'deacon_prim_5_6',
  deacon_prim_5_6: 'deacon_prep_1_2_3',
  deacon_prep_1_2_3: 'deacon_sec_1_2_3',
  deacon_sec_1_2_3: 'gm_youth',
};

export function getNextStage(currentStageId: string): ServiceStage | undefined {
  const nextId = NEXT_STAGE_MAP[currentStageId];
  if (!nextId) return undefined;
  return ALL_STAGES.find((s) => s.id === nextId);
}

