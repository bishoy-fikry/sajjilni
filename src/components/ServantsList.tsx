import React, { useState, useMemo } from 'react';
import { Servant, ServiceStage, AttendanceRecord, CurrentServant, ServantRole } from '../types';
import {
  UserCheck,
  UserPlus,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  ShieldAlert,
  X,
} from 'lucide-react';

interface ServantsListProps {
  stage: ServiceStage;
  servants: Servant[];
  attendance: AttendanceRecord[];
  onAddServant: (servant: Servant) => void;
  onUpdateServant: (servant: Servant) => void;
  onDeleteServant: (servantId: string) => void;
  onSaveAttendance: (updatedRecords: AttendanceRecord[]) => void;
  currentServant: CurrentServant | null;
  gpsVerified: boolean;
}

export const ServantsList: React.FC<ServantsListProps> = ({
  stage,
  servants,
  attendance,
  onAddServant,
  onUpdateServant,
  onDeleteServant,
  onSaveAttendance,
  currentServant,
  gpsVerified,
}) => {
  const isSupervisorOrAdmin =
    currentServant?.role === 'general_admin' || currentServant?.role === 'stage_supervisor';

  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'attendance'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingServant, setEditingServant] = useState<Servant | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);
  const [sessionType, setSessionType] = useState<AttendanceRecord['sessionType']>('اجتماع خدام');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    birthDate: '',
    role: 'servant' as ServantRole,
    roleTitle: '',
    notes: '',
  });

  const stageServants = useMemo(
    () => servants.filter((s) => s.stageId === stage.id || s.role === 'general_admin'),
    [servants, stage.id]
  );

  const servantAttendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    const recs = attendance.filter(
      (a) => a.stageId === stage.id && a.date === attendanceDate && a.targetType === 'servant'
    );
    recs.forEach((r) => map.set(r.targetId, r));
    return map;
  }, [attendance, stage.id, attendanceDate]);

  if (!isSupervisorOrAdmin) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4 text-center">
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-8 max-w-md text-white">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">سجل الخدام سري ومحمي</h3>
          <p className="text-xs text-slate-400">
            هذا القسم مخصص لأمناء الخدمة ومسؤولي القطاع فقط للاطلاع على بيانات الخدام وحضورهم.
          </p>
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingServant(null);
    setFormData({
      name: '',
      phone: '',
      whatsapp: '',
      address: '',
      birthDate: '',
      role: 'servant',
      roleTitle: 'خادم فصل',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Servant) => {
    setEditingServant(s);
    setFormData({
      name: s.name,
      phone: s.phone,
      whatsapp: s.whatsapp || '',
      address: s.address,
      birthDate: s.birthDate,
      role: s.role,
      roleTitle: s.roleTitle,
      notes: s.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveServant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingServant) {
      const updated: Servant = {
        ...editingServant,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        address: formData.address.trim(),
        birthDate: formData.birthDate,
        role: formData.role,
        roleTitle: formData.roleTitle.trim() || 'خادم',
        notes: formData.notes.trim(),
      };
      onUpdateServant(updated);
    } else {
      const newServant: Servant = {
        id: `srv_${Date.now()}`,
        code: `SRV-${stageServants.length + 1}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        address: formData.address.trim(),
        birthDate: formData.birthDate,
        role: formData.role,
        roleTitle: formData.roleTitle.trim() || 'خادم',
        categoryId: stage.category,
        stageId: stage.id,
        notes: formData.notes.trim(),
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddServant(newServant);
    }

    setIsAddModalOpen(false);
  };

  const handleSetServantAttendance = (servantId: string, status: 'present' | 'absent' | 'excused') => {
    const existing = servantAttendanceMap.get(servantId);
    const newRecord: AttendanceRecord = {
      id: existing?.id || `att_srv_${servantId}_${attendanceDate}_${Date.now()}`,
      targetId: servantId,
      targetType: 'servant',
      stageId: stage.id,
      date: attendanceDate,
      sessionType,
      status,
      verifiedInChurch: status === 'present' ? gpsVerified : false,
      verificationMethod: status === 'present' && gpsVerified ? 'gps' : 'manual',
      recordedByServantName: currentServant?.name || 'الأمين المسؤول',
      timestamp: new Date().toISOString(),
    };

    const otherRecords = attendance.filter(
      (a) => !(a.stageId === stage.id && a.date === attendanceDate && a.targetId === servantId && a.targetType === 'servant')
    );

    onSaveAttendance([...otherRecords, newRecord]);
  };

  const filteredServants = useMemo(() => {
    return stageServants.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        s.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [stageServants, searchQuery]);

  return (
    <div className="space-y-6 text-white">
      {/* Top Header */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              خدام وخادمات مرحلة {stage.name} (خاص بالأمناء)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-bold border border-rose-800/40">
              {stageServants.length} خادم
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل خاص بالأمناء لمتابعة الخدام وتسكينهم وحضورهم.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-black/40 border border-white/10 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveSubTab('roster')}
              className={`py-1.5 px-3 rounded-lg transition cursor-pointer ${
                activeSubTab === 'roster'
                  ? 'bg-rose-700 text-white font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👥 الدليل
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('attendance')}
              className={`py-1.5 px-3 rounded-lg transition cursor-pointer ${
                activeSubTab === 'attendance'
                  ? 'bg-rose-700 text-white font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 حضور الخدام
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-950/50 transition flex items-center gap-2 cursor-pointer border border-rose-500/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة خادم</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'roster' ? (
        <>
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في أسماء الخدام، الهواتف، المسؤوليات..."
                className="w-full pl-3 pr-9 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {stageServants.length === 0 ? (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-12 text-center shadow-xl">
              <UserCheck className="w-10 h-10 text-rose-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-1">
                لا يوجد خدام مسجلين في مرحلة {stage.name}
              </h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
                سجل الخدام المسندة إليهم الخدمة لمتابعة الحضور وتوزيع الفصول.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="py-2.5 px-5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer border border-rose-500/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة أول خادم</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServants.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl hover:border-rose-500/40 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-800 to-black text-white font-bold flex items-center justify-center text-base shadow-sm shrink-0 border border-rose-700/30">
                        {srv.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">
                          {srv.name}
                        </h4>
                        <div className="text-xs text-rose-300 font-bold mt-0.5">
                          {srv.roleTitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(srv)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف الخادم (${srv.name})؟`)) {
                            onDeleteServant(srv.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>الهاتف: <strong className="text-white">{srv.phone}</strong></span>
                    </div>

                    {srv.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">العنوان: {srv.address}</span>
                      </div>
                    )}

                    {srv.birthDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>تاريخ الميلاد: {srv.birthDate}</span>
                      </div>
                    )}

                    {srv.notes && (
                      <div className="p-2 bg-rose-950/20 border border-rose-900/30 rounded-lg text-[11px] text-rose-200 mt-2">
                        {srv.notes}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">
                      {srv.role === 'general_admin' ? 'أمين عام' : srv.role === 'stage_supervisor' ? 'أمين مرحلة' : 'خادم بالمرحلة'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${srv.phone}`}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/2${(srv.whatsapp || srv.phone).replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 rounded-lg transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="font-black text-white text-lg">
                كشف حضور وغياب الخدام
              </h3>
              <p className="text-xs text-slate-400">
                متابعة حضور الخدام في القداس والخدمة واجتماع الخدام الأسبوعي.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white"
              />

              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as any)}
                className="px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white"
              >
                <option value="اجتماع خدام" className="bg-slate-900 text-white">اجتماع خدام</option>
                <option value="قداس إلهي" className="bg-slate-900 text-white">قداس إلهي</option>
                <option value="درس خدمة" className="bg-slate-900 text-white">درس خدمة</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {stageServants.map((srv) => {
              const rec = servantAttendanceMap.get(srv.id);
              const status = rec?.status;

              return (
                <div
                  key={srv.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center text-sm border border-white/10">
                      {srv.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{srv.name}</div>
                      <div className="text-xs text-slate-400">{srv.roleTitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetServantAttendance(srv.id, 'present')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/5 hover:bg-emerald-950/40 text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>حاضر</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetServantAttendance(srv.id, 'absent')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        status === 'absent'
                          ? 'bg-rose-700 text-white'
                          : 'bg-white/5 hover:bg-rose-950/40 text-slate-300'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>غائب</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetServantAttendance(srv.id, 'excused')}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        status === 'excused'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white/5 hover:bg-amber-950/40 text-slate-300'
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
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-white backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 text-rose-400 flex items-center justify-center border border-rose-800/40">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {editingServant ? 'تعديل بيانات الخادم' : 'تسجيل خادم جديد'}
                  </h3>
                  <p className="text-xs text-slate-400">مرحلة {stage.name}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveServant} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  اسم الخادم / الخادمة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: الخادم بيشوي نبيل"
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم الهاتف <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01223456789"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم الواتساب
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="01223456789"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    المسؤولية / المسمى في الخدمة
                  </label>
                  <input
                    type="text"
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="مثال: خادم فصل، أمين أسرة"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الصلاحية
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white"
                  >
                    <option value="servant" className="bg-slate-900 text-white">خادم بالمرحلة</option>
                    <option value="stage_supervisor" className="bg-slate-900 text-white">أمين مرحلة</option>
                    <option value="general_admin" className="bg-slate-900 text-white">أمين عام</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  العنوان السكني
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="الشارع، المنطقة..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ بيانات الخادم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
