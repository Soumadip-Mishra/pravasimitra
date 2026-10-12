import React from 'react';
import { WORKER_LANGUAGES, HOST_STATES } from '../constants/languages';
import { ArrowRight, Languages, Building2, Coins } from 'lucide-react';

interface RouteSelectorProps {
  selectedLanguage: string;
  selectedHostState: string;
  onLanguageChange: (langCode: string) => void;
  onHostStateChange: (stateId: string) => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  selectedLanguage,
  selectedHostState,
  onLanguageChange,
  onHostStateChange,
}) => {
  const currentLang = WORKER_LANGUAGES.find((l) => l.code === selectedLanguage) || WORKER_LANGUAGES[0];
  const currentHost = HOST_STATES.find((s) => s.id === selectedHostState) || HOST_STATES[0];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Languages className="h-5 w-5 text-amber-400" />
            <span>Origin-to-Host Migration Route</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the worker's native spoken language and the host worksite jurisdiction
          </p>
        </div>

        {/* Floor Wage Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs">
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="text-slate-400">{currentHost.name} Min. Wage:</span>
          <span className="font-bold text-amber-300">₹{currentHost.statutoryMinWagePerDay}/day</span>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin Language */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">1</span>
            <span>Worker Native Mother Tongue (Voice Origin)</span>
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white font-medium focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
          >
            {WORKER_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} - {lang.defaultState}
              </option>
            ))}
          </select>
        </div>

        {/* Destination State */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">2</span>
            <span>Worksite Host State (Petition Jurisdiction)</span>
          </label>
          <select
            value={selectedHostState}
            onChange={(e) => onHostStateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white font-medium focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
          >
            {HOST_STATES.map((host) => (
              <option key={host.id} value={host.id}>
                {host.name} - Admin Script: {host.languageName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Migration Corridor & Linguistic Barrier Banner */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-200">
            <span className="rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1">
              {currentLang.name.split(' ')[0]} Spoken Voice
            </span>
            <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1">
              {currentHost.languageName.split(' ')[0]} Official Legal Petition
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="truncate max-w-xs">{currentHost.laborDepartmentOffice.split(',')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
