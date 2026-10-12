import React from 'react';
import { X, BookOpen, ShieldCheck, Scale, FileText, Phone } from 'lucide-react';

interface LegalReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalReferenceModal: React.FC<LegalReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between pb-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Statutory Labor Rights Reference</h3>
              <p className="text-xs text-slate-400">Protections under Indian Labor & Migrant Statutes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-sm text-slate-300">
          {/* Act 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              <BookOpen className="h-4 w-4" />
              <h4>1. Inter-State Migrant Workmen (RECS) Act, 1979</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-slate-100">Section 14 (Displacement Allowance):</strong> The contractor is statutorily required to pay a non-refundable displacement allowance equal to 50% of the monthly wages or Rs. 75, whichever is higher, at the time of recruitment in the home state.
              </li>
              <li>
                <strong className="text-slate-100">Section 15 (Journey Allowance):</strong> The contractor must pay train/bus travel fare from the worker's home residence to the worksite and back, plus full wages during the transit period.
              </li>
              <li>
                <strong className="text-slate-100">Section 16 (Welfare Amenities):</strong> Mandates suitable residential accommodation, crèches, first-aid, and protective clothing.
              </li>
              <li>
                <strong className="text-amber-400">Section 21 (Principal Employer Joint Liability):</strong> If the contractor fails to pay wages within the prescribed period, the Principal Employer is liable to pay all unpaid wages in full and recover them from contractor bills.
              </li>
            </ul>
          </div>

          {/* Act 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
              <ShieldCheck className="h-4 w-4" />
              <h4>2. Payment of Wages Act, 1936</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-slate-100">Section 5 (Time of Payment):</strong> Wages must be disbursed within 7 days (establishments under 1,000 workers) or 10 days of wage period expiration.
              </li>
              <li>
                <strong className="text-slate-100">Section 7 & 13 (Unauthorized Deductions):</strong> Arbitrary cuts for tools, room rent, or contractor commission without statutory authorization are illegal.
              </li>
              <li>
                <strong className="text-emerald-400">Section 15(3) (Compensation Award):</strong> Authority may award up to 10 times the unpaid wage amount as penalty against the contractor/employer for deliberate withholding.
              </li>
            </ul>
          </div>

          {/* Act 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-sky-400 font-semibold mb-2">
              <FileText className="h-4 w-4" />
              <h4>3. Minimum Wages Act, 1948</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-slate-100">Section 12 (Minimum Rates of Wages):</strong> Employer must pay every worker not less than the statutory floor wage prescribed for scheduled employment by the host state government.
              </li>
              <li>
                <strong className="text-sky-400">Section 25 (Contracting Out Void):</strong> Any verbal agreement or waiver where a worker agrees to work below statutory minimum wage is null and void under law.
              </li>
            </ul>
          </div>

          {/* Act 4 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
              <Scale className="h-4 w-4" />
              <h4>4. Building & Other Construction Workers (BOCW) Act, 1996</h4>
            </div>
            <p className="text-xs text-slate-300">
              Guarantees 2x double overtime rates for construction labor beyond 8 hours a day, safety standards, accident compensation, and welfare cess benefits for registered workers.
            </p>
          </div>

          {/* Emergency Helplines */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              <Phone className="h-4 w-4" />
              <h4>Statutory Free Legal Aid & Helplines</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <strong className="text-white">National Shramik Helpline:</strong>
                <p className="text-amber-300 text-base font-bold">14434</p>
                <p className="text-slate-400">Toll-free 24x7 Ministry of Labour & Employment</p>
              </div>
              <div>
                <strong className="text-white">National Legal Services (NALSA):</strong>
                <p className="text-emerald-300 text-base font-bold">15100</p>
                <p className="text-slate-400">Free DLSA lawyer appointment for court/labor tribunals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
