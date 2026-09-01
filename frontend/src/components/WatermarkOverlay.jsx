import React from 'react';
import { useAuth } from '../context/AuthContext';

export const WatermarkOverlay = ({ watermark }) => {
  const { user } = useAuth();
  
  if (!user && !watermark) return null;

  const displayText = watermark?.display_text || `B.Tech Learner: ${user?.email || 'Student'} [SECURED]`;
  const signature = watermark?.signature || 'LIVE_TOKEN';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 select-none">
      {/* Subtle Repeating Diagonal Background Watermark */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-around opacity-[0.06] text-xs font-mono tracking-widest text-slate-300 transform -rotate-12 scale-125">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="p-8">
            {displayText} • {signature}
          </div>
        ))}
      </div>

      {/* Floating Animated Deterrent Stamp */}
      <div className="absolute top-1/4 left-1/4 watermark-animated">
        <div className="px-3 py-1.5 rounded bg-black/40 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-slate-400/60 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{displayText}</span>
        </div>
      </div>
    </div>
  );
};
