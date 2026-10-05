import React, { useState, useMemo } from 'react';
import { Member, ServiceStage, AttendanceRecord, CurrentServant } from '../types';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Heart,
  Edit2,
  Trash2,
  Download,
  QrCode,
  CheckCircle2,
  X,
  Printer,
} from 'lucide-react';
import { exportMembersToCSV } from '../services/storage';
import { QRCodeView } from './QRCodeView';

interface MembersListProps {
  stage: ServiceStage;
  members: Member[];
  attendance: AttendanceRecord[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  currentServant: CurrentServant | null;
  onSelectMemberForAttendance?: (memberId: string) => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  stage,
  members,
  attendance,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  currentServant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'needs_care'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedProfileMember, setSelectedProfileMember] = useState<Member | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    parentPhone: '',
    address: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    confessionFather: '',
    notes: '',
    status: 'active' as 'active' | 'needs_care' | 'inactive',
  });

  const stageMembers = useMemo(
    () => members.filter((m) => m.stageId === stage.id),
    [members, stage.id]
  );

  const filteredMembers = useMemo(() => {
    return stageMembers.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery) ||
        m.parentPhone.includes(searchQuery) ||
        m.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.confessionFather && m.confessionFather.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;
      if (filterGender !== 'all' && m.gender !== filterGender) return false;
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;

      return true;
    });
  }, [stageMembers, searchQuery, filterGender, filterStatus]);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      phone: '',
      parentPhone: '',
      address: '',
      birthDate: '',
      gender: 'male',
      confessionFather: '',
      notes: '',
      status: 'active',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      phone: m.phone,
      parentPhone: m.parentPhone,
      address: m.address,
      birthDate: m.birthDate,
      gender: m.gender,
      confessionFather: m.confessionFather || '',
      notes: m.notes || '',
      status: m.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingMember) {
      const updated: Member = {
        ...editingMember,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        parentPhone: formData.parentPhone.trim(),
        address: formData.address.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        confessionFather: formData.confessionFather.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
      };
      onUpdateMember(updated);
    } else {
      const count = stageMembers.length + 1;
      const shortPrefix = stage.shortCode.replace(/[^a-zA-Z0-9]/g, '') || 'M';
      const autoCode = `${shortPrefix}-${100 + count}`;

      const newMember: Member = {
        id: `mem_${Date.now()}`,
        code: autoCode,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        parentPhone: formData.parentPhone.trim(),
        address: formData.address.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        categoryId: stage.category,
        stageId: stage.id,
        confessionFather: formData.confessionFather.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddMember(newMember);
    }

    setIsAddModalOpen(false);
  };

  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return null;
    const bDate = new Date(birthDateStr);
    const diffMs = Date.now() - bDate.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const handleExport = () => {
    exportMembersToCSV(stageMembers, stage.name);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Header Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              دليل مخدومي مرحلة {stage.name}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-bold border border-rose-800/40">
              {stageMembers.length} مخدوم مسجل
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل خاص ومحمي بمرحلتك، مسجل فيه بيانات التواصل والعناوين وتواريخ الميلاد.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="py-2.5 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-950/50 transition flex items-center gap-2 cursor-pointer border border-rose-500/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مخدوم جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الكود، رقم الهاتف، العنوان..."
            className="w-full pl-3 pr-9 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value as any)}
            className="px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-slate-300 focus:outline-hidden"
          >
            <option value="all" className="bg-slate-900 text-white">جميع الفئات</option>
            <option value="male" className="bg-slate-900 text-white">بنين (ذكور)</option>
            <option value="female" className="bg-slate-900 text-white">بنات (إناث)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-slate-300 focus:outline-hidden"
          >
            <option value="all" className="bg-slate-900 text-white">جميع الحالات</option>
            <option value="active" className="bg-slate-900 text-white">منتظمون</option>
            <option value="needs_care" className="bg-slate-900 text-white">يحتاجون افتقاد</option>
          </select>
        </div>
      </div>

      {/* Members Cards Grid */}
      {stageMembers.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-12 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 text-rose-300 mx-auto flex items-center justify-center mb-3 border border-white/10">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            لا يوجد مخدومين مسجلين في مرحلة {stage.name}
          </h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-5">
            ابدأ بتسجيل أول مخدوم في الخدمة الآن لحفظ بياناته ورصد حضوره.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer border border-rose-500/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل أول مخدوم الآن</span>
          </button>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-10 text-center text-slate-500 text-xs">
          لا توجد نتائج مطابقة لبحثك.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const age = calculateAge(member.birthDate);
            const memberRecords = attendance.filter((a) => a.targetId === member.id && a.targetType === 'member');
            const totalRecorded = memberRecords.length;
            const presents = memberRecords.filter((a) => a.status === 'present').length;
            const rate = totalRecorded > 0 ? Math.round((presents / totalRecorded) * 100) : null;

            return (
              <div
                key={member.id}
                className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 hover:border-rose-500/40 p-5 shadow-xl transition space-y-4 group relative"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-800 to-black text-white font-black flex items-center justify-center text-base shadow-sm shrink-0 border border-rose-700/30">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-rose-300 transition">
                        {member.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono font-bold bg-white/10 text-slate-300 px-1.5 py-0.2 rounded border border-white/10">
                          {member.code}
                        </span>
                        {age !== null && <span>• {age} سنة</span>}
                        <span>• {member.gender === 'male' ? 'ولد' : 'بنت'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedProfileMember(member)}
                      className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-white/5 rounded-lg transition"
                      title="عرض بطاقة المخدوم"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف المخدوم (${member.name})؟`)) {
                          onDeleteMember(member.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>رقم الهاتف: <strong className="text-white">{member.phone || 'غير مسجل'}</strong></span>
                  </div>

                  {member.parentPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>ولي الأمر: <strong className="text-white">{member.parentPhone}</strong></span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">العنوان: {member.address || 'غير محدد'}</span>
                  </div>

                  {member.confessionFather && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span>أب الاعتراف: {member.confessionFather}</span>
                    </div>
                  )}

                  {member.birthDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>تاريخ الميلاد: {member.birthDate}</span>
                    </div>
                  )}

                  {member.notes && (
                    <div className="p-2 bg-rose-950/30 border border-rose-900/40 rounded-xl text-[11px] text-rose-200 mt-2">
                      <strong>ملاحظات:</strong> {member.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Bar: Attendance Badge & Direct WhatsApp/Call */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {rate !== null ? (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${rate >= 75 ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40' : rate >= 50 ? 'bg-amber-950/60 text-amber-300 border-amber-700/40' : 'bg-rose-950/60 text-rose-300 border-rose-700/40'}`}>
                        حضور: {rate}% ({presents}/{totalRecorded})
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">لا يوجد حضور</span>
                    )}

                    {member.status === 'needs_care' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-950/80 text-rose-300 font-bold border border-rose-800/50">
                        يحتاج افتقاد
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {(member.phone || member.parentPhone) && (
                      <>
                        <a
                          href={`tel:${member.phone || member.parentPhone}`}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition"
                          title="اتصال هاتفي"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={`https://wa.me/2${(member.phone || member.parentPhone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `سلام ونعمة يا فلان، بنطمن عليك وبنفكرك بميعاد خدمتنا في مرحلة ${stage.name} بكنيستنا ✝️`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 rounded-lg transition"
                          title="واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-white backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 text-rose-400 flex items-center justify-center border border-rose-800/40">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {editingMember ? 'تعديل بيانات المخدوم' : 'تسجيل مخدوم جديد'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    مرحلة {stage.name} ({stage.categoryName})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الاسم بالكامل <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: كيرلس مينا سمير"
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم الهاتف الشخصي
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01223456789"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم هاتف ولي الأمر (للطوارئ)
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  العنوان السكني بالتفصيل
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="الشارع، المنطقة، الدور..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    تاريخ الميلاد
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    النوع
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white focus:outline-hidden"
                  >
                    <option value="male" className="bg-slate-900 text-white">ولد (ذكر)</option>
                    <option value="female" className="bg-slate-900 text-white">بنت (أنثى)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    أب الاعتراف
                  </label>
                  <input
                    type="text"
                    value={formData.confessionFather}
                    onChange={(e) => setFormData({ ...formData, confessionFather: e.target.value })}
                    placeholder="أبونا بولا"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    حالة المخدوم
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white focus:outline-hidden"
                  >
                    <option value="active" className="bg-slate-900 text-white">منتظم ونشط</option>
                    <option value="needs_care" className="bg-slate-900 text-white">يحتاج افتقاد ومتابعة</option>
                    <option value="inactive" className="bg-slate-900 text-white">منقطع / غير نشط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ملاحظات خاصة
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="موهوب في الألحان، إلخ"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingMember ? 'حفظ التعديلات' : 'تسجيل وحفظ المخدوم'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      {selectedProfileMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-950/95 border border-white/15 rounded-3xl shadow-2xl max-w-md w-full p-6 text-center text-white backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800/40">
                بطاقة المخدوم الذكية
              </span>
              <button
                type="button"
                onClick={() => setSelectedProfileMember(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-white/10 space-y-3">
              <div className="text-xs text-rose-300 font-bold">
                {stage.categoryName} • {stage.name}
              </div>

              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-700 to-rose-900 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-md border border-rose-600/40">
                {selectedProfileMember.name.charAt(0)}
              </div>

              <div>
                <h3 className="font-black text-white text-lg">
                  {selectedProfileMember.name}
                </h3>
                <div className="text-xs font-mono font-bold text-slate-400 mt-0.5">
                  الكود: {selectedProfileMember.code}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center my-2">
                <QRCodeView
                  value={JSON.stringify({
                    id: selectedProfileMember.id,
                    code: selectedProfileMember.code,
                    name: selectedProfileMember.name,
                    stageId: selectedProfileMember.stageId,
                  })}
                  size={140}
                />
              </div>

              <div className="text-slate-300 text-xs space-y-1 text-right bg-white/5 p-3 rounded-xl border border-white/10">
                <div>📞 هاتف: {selectedProfileMember.phone || 'غير مسجل'}</div>
                {selectedProfileMember.parentPhone && (
                  <div>👨‍👩‍👦 ولي الأمر: {selectedProfileMember.parentPhone}</div>
                )}
                <div>📍 العنوان: {selectedProfileMember.address || '—'}</div>
                {selectedProfileMember.confessionFather && (
                  <div>✝️ أب الاعتراف: {selectedProfileMember.confessionFather}</div>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/15"
              >
                <Printer className="w-4 h-4 text-rose-400" />
                <span>طباعة البطاقة</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedProfileMember(null)}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
