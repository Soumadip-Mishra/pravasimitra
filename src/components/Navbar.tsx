import React from 'react';
import { Scale, Key, BookOpen, PhoneCall, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  isLive: boolean;
  onOpenApiKeyModal: () => void;
  onOpenLegalModal: () => void;
  onSelectDemo: (demoId: string) => void;
  selectedDemoId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLive,
  onOpenApiKeyModal,
  onOpenLegalModal,
  onSelectDemo,
  selectedDemoId,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Pravasi<span className="text-amber-400">Mitra</span>
              </span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
                প্রবাসী মিত্র
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Inter-State Migrant Labor Rights & Wage Dispute Companion
            </p>
          </div>
        </div>

        {/* Quick Demo Cases */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Quick Test Cases:</span>
          <button
            onClick={() => onSelectDemo('ramesh-bihar-kerala')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              selectedDemoId === 'ramesh-bihar-kerala'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Bihar → Kerala (Bhojpuri)
          </button>
          <button
            onClick={() => onSelectDemo('subhash-bengal-karnataka')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              selectedDemoId === 'subhash-bengal-karnataka'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            WB → Bengaluru (Bengali)
          </button>
          <button
            onClick={() => onSelectDemo('pravat-odisha-gujarat')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              selectedDemoId === 'pravat-odisha-gujarat'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Odisha → Surat (Odia)
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Shramik Helpline */}
          <a
            href="tel:14434"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-900/50 transition-colors"
            title="Toll-Free National Migrant Workers Helpline"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Helpline: 14434</span>
          </a>

          {/* Legal Acts Reference */}
          <button
            onClick={onOpenLegalModal}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Labor Statutes</span>
          </button>

          {/* Sarvam AI Status & Key Config */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              isLive
                ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {isLive ? 'Sarvam AI: Live' : 'Sarvam Key: Demo'}
            </span>
            {isLive ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            ) : (
              <AlertCircle className="h-3 w-3 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
