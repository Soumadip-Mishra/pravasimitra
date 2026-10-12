import React, { useState } from 'react';
import type { StatutoryClaim } from '../types';
import { Calculator, ShieldAlert, ChevronDown, ChevronUp, Scale } from 'lucide-react';

interface WageReckonerCardProps {
  claim: StatutoryClaim;
  legalAnalysis: string;
  isAnalyzing: boolean;
}

export const WageReckonerCard: React.FC<WageReckonerCardProps> = ({
  claim,
  legalAnalysis,
  isAnalyzing,
}) => {
  const [showStatutes, setShowStatutes] = useState<boolean>(true);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-400" />
            <span>Statutory Wage Reckoner & Legal Violation Audit</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated calculations under Inter-State Migrant Workmen Act, 1979 & Payment of Wages Act, 1936
          </p>
        </div>

        {/* Total Claim Highlight */}
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 px-4 py-2">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Total Statutory Claim</div>
            <div className="text-xl font-extrabold text-amber-300">
              ₹{claim.totalStatutoryClaim.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Reckoner Breakdown Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Statutory Component</th>
              <th className="px-4 py-3">Statutory Basis / Formula</th>
              <th className="px-4 py-3 text-right">Claim Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
            <tr>
              <td className="px-4 py-3 font-semibold text-white">
                Unpaid Principal Wages
              </td>
              <td className="px-4 py-3 text-slate-400">
                {claim.daysWorked} days × ₹{claim.agreedDailyWage}/day − ₹{claim.advancesPaid} (advances)
              </td>
              <td className="px-4 py-3 text-right font-bold text-amber-300">
                ₹{claim.unpaidPrincipal.toLocaleString('en-IN')}
              </td>
            </tr>

            {claim.minWageShortfall > 0 && (
              <tr className="bg-amber-950/20">
                <td className="px-4 py-3 font-semibold text-amber-300">
                  Minimum Wage Deficit Arrears
                </td>
                <td className="px-4 py-3 text-amber-400/80">
                  Sec 12, Minimum Wages Act (Floor: ₹{claim.statutoryMinWage}/day)
                </td>
                <td className="px-4 py-3 text-right font-bold text-amber-300">
                  + ₹{claim.minWageShortfall.toLocaleString('en-IN')}
                </td>
              </tr>
            )}

            {claim.overtimePay > 0 && (
              <tr>
                <td className="px-4 py-3 font-semibold text-white">
                  Overtime Compensation
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {claim.overtimeHours} overtime hours @ 2× double rate (BOCW Act / Factories Act)
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-200">
                  + ₹{claim.overtimePay.toLocaleString('en-IN')}
                </td>
              </tr>
            )}

            <tr>
              <td className="px-4 py-3 font-semibold text-sky-300">
                Mandatory Displacement Allowance
              </td>
              <td className="px-4 py-3 text-slate-400">
                Sec 14, ISMW Act (50% monthly wage, non-refundable)
              </td>
              <td className="px-4 py-3 text-right font-bold text-sky-300">
                + ₹{claim.displacementAllowance.toLocaleString('en-IN')}
              </td>
            </tr>

            <tr>
              <td className="px-4 py-3 font-semibold text-sky-300">
                Mandatory Journey & Transit Allowance
              </td>
              <td className="px-4 py-3 text-slate-400">
                Sec 15, ISMW Act (Transit travel fare + wages during journey)
              </td>
              <td className="px-4 py-3 text-right font-bold text-sky-300">
                + ₹{claim.journeyAllowance.toLocaleString('en-IN')}
              </td>
            </tr>

            <tr className="bg-slate-900 font-bold text-white text-sm">
              <td className="px-4 py-3" colSpan={2}>
                TOTAL LEGALLY ENFORCEABLE CLAIM BEFORE LABOUR OFFICER
              </td>
              <td className="px-4 py-3 text-right text-amber-400">
                ₹{claim.totalStatutoryClaim.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Violated Statutory Clauses Section */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowStatutes(!showStatutes)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white transition-colors py-1"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-amber-400">
            <Scale className="h-4 w-4" />
            <span>Statutory Contraventions Identified ({claim.violatedActs.length} Clauses)</span>
          </span>
          {showStatutes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showStatutes && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {claim.violatedActs.map((act, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{act.act}</span>
                    <span className="rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 text-[10px] font-mono">
                      {act.section}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sarvam-105B Indic Legal Reasoning Memo */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Sarvam-105B Indic Legal Reasoning Memorandum
          </h4>
        </div>
        <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans bg-slate-900/50 rounded-lg p-3 border border-slate-800/80">
          {isAnalyzing ? (
            <div className="py-6 text-center text-amber-400 font-semibold animate-pulse">
              Synthesizing Indian labor legal grounds with Sarvam-105B...
            </div>
          ) : (
            legalAnalysis
          )}
        </div>
      </div>
    </div>
  );
};
