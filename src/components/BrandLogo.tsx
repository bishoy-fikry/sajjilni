import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconDimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Creative Monogram Icon */}
      <div
        className={`${iconDimensions} rounded-2xl bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-900 flex items-center justify-center shadow-lg shadow-rose-950/40 border border-rose-500/40 shrink-0 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white relative z-10"
        >
          {/* Creative S Ribbon + Check */}
          <path d="M16 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H8" />
          <path d="M12 19l2 2 4-4" strokeWidth="2.8" stroke="#fecdd3" />
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className={`${titleSize} font-black tracking-tight font-mono`}>
            Segelny
          </span>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
            سجلني
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            منظومة إدارة الخدمات وتسجيل الحضور الذكية
          </p>
        )}
      </div>
    </div>
  );
};
