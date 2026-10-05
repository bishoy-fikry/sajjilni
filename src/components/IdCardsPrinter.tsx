import React, { useMemo } from 'react';
import { Member, ServiceStage, ChurchLocationConfig } from '../types';
import { QRCodeView } from './QRCodeView';
import { Printer, Church } from 'lucide-react';

interface IdCardsPrinterProps {
  stage: ServiceStage;
  members: Member[];
  churchConfig: ChurchLocationConfig;
}

export const IdCardsPrinter: React.FC<IdCardsPrinterProps> = ({
  stage,
  members,
  churchConfig,
}) => {
  const stageMembers = useMemo(() => members.filter((m) => m.stageId === stage.id), [members, stage.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بطاقات وكروت التعريف الذكية (QR)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-bold border border-rose-800/40">
              {stageMembers.length} كارت
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            طباعة كروت المخدومين لمسح الـ QR وتسجيل الحضور فوراً.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="py-2.5 px-5 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-950/50 transition flex items-center justify-center gap-2 cursor-pointer border border-rose-500/30"
        >
          <Printer className="w-4 h-4 text-white" />
          <span>طباعة الكروت</span>
        </button>
      </div>

      {stageMembers.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-12 text-center text-slate-500 text-xs no-print">
          لا يوجد مخدومين مسجلين في مرحلة {stage.name} لتوليد بطاقات لهم.
        </div>
      ) : (
        /* Printable Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stageMembers.map((mem) => (
            <div
              key={mem.id}
              className="bg-slate-950 border border-rose-900/40 p-5 shadow-md flex flex-col justify-between print-break-inside-avoid relative overflow-hidden rounded-3xl print:bg-white print:border-2 print:border-black print:text-black"
              style={{ minHeight: '250px' }}
            >
              {/* Decorative top stripe */}
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-rose-700 to-rose-950 print:bg-black" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 print:border-black pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-950/60 text-rose-300 flex items-center justify-center print:bg-slate-100 print:text-black">
                    <Church className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white print:text-black leading-tight">
                      {churchConfig.name}
                    </div>
                    <div className="text-[10px] text-rose-300 print:text-black font-bold">
                      {stage.categoryName} • {stage.name}
                    </div>
                  </div>
                </div>

                <span className="font-mono text-xs font-black bg-white/10 print:bg-slate-100 text-slate-200 print:text-black px-2 py-0.5 rounded-md border border-white/10 print:border-black">
                  {mem.code}
                </span>
              </div>

              {/* Card Body */}
              <div className="my-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-black text-white print:text-black text-base leading-snug">
                    {mem.name}
                  </h3>
                  <div className="text-xs text-slate-400 print:text-black">
                    {mem.birthDate && <span>الميلاد: {mem.birthDate}</span>}
                  </div>
                  {mem.parentPhone && (
                    <div className="text-[11px] font-bold text-rose-200 print:text-black">
                      ولي الأمر: {mem.parentPhone}
                    </div>
                  )}
                  {mem.confessionFather && (
                    <div className="text-[10px] text-slate-400 print:text-black">
                      أب الاعتراف: {mem.confessionFather}
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div className="shrink-0 bg-white p-1 rounded-xl">
                  <QRCodeView
                    value={JSON.stringify({
                      id: mem.id,
                      code: mem.code,
                      name: mem.name,
                      stageId: mem.stageId,
                    })}
                    size={84}
                  />
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-white/10 print:border-black flex items-center justify-between text-[10px] text-slate-500 print:text-black font-medium">
                <span>Segelny</span>
                <span className="font-bold text-slate-400 print:text-black">بطاقة حضور كنسي رسمية</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
