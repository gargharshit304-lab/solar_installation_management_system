import React from 'react';
import { Sun } from 'lucide-react';
import { DotGrid } from './DotGrid';

export const AuthInitializingScreen: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-sand-100 overflow-hidden select-none" style={{ fontFamily: 'Cambria, Georgia, serif' }}>
      <DotGrid
        baseColor="#D8D0C4"
        activeColor="#183153"
        dotSize={1.5}
        gap={18}
        proximity={110}
        glow={0.45}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sand-50/90 via-sand-100/45 to-sand/70" />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Logo */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber text-charcoal shadow-card mb-4 animate-pulse">
          <Sun className="h-7 w-7 fill-current" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-charcoal">
          SolarOS
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber mt-0.5 mb-6">
          Enterprise • SunPower Solutions
        </p>

        {/* Loading Spinner */}
        <div className="flex items-center space-x-2.5 px-4 py-2 bg-white/80 rounded-xl border border-warmGrey shadow-card backdrop-blur-sm">
          <svg className="animate-spin h-4 w-4 text-navy" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs font-semibold text-charcoal tracking-wide">
            Restoring authenticated session...
          </span>
        </div>

        <p className="text-[11px] text-mutedGrey mt-4">
          Verifying credentials & role authorization
        </p>
      </div>
    </div>
  );
};
