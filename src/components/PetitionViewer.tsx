import React, { useState } from 'react';
import type { DualPetition, DisputeDetails, StatutoryClaim } from '../types';
import { Printer, Copy, Share2, Check, FileCheck } from 'lucide-react';

interface PetitionViewerProps {
  petition: DualPetition;
  dispute: DisputeDetails;
  claim: StatutoryClaim;
  hostStateName: string;
}

export const PetitionViewer: React.FC<PetitionViewerProps> = ({
  petition,
  dispute,
  claim,
  hostStateName,
}) => {
  const [activeTab, setActiveTab] = useState<'host' | 'english'>('host');
  const [copied, setCopied] = useState<boolean>(false);

  const activeContent =
    activeTab === 'host' ? petition.petitionInHostLanguage : petition.petitionInEnglish;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppMessage = () => {
    const text = `🚨 *PRAVASIMITRA MIGRANT WORKER GRIEVANCE NOTICE* 🚨
-----------------------------------------
*Worker:* ${dispute.workerName} (${dispute.workerTrade || 'Labor'})
*Native State:* ${dispute.workerHomeState}
*Host Worksite:* ${dispute.worksiteLocation}, ${hostStateName}
*Contractor:* ${dispute.contractorName} (${dispute.contractorPhone})
*Principal Employer:* ${dispute.principalEmployer}

💰 *TOTAL UNPAID STATUTORY CLAIM:* ₹${claim.totalStatutoryClaim.toLocaleString('en-IN')}/-
• Unpaid Days: ${claim.daysWorked} days
• Agreed Rate: ₹${claim.agreedDailyWage}/day
• Food Advances Paid: ₹${claim.advancesPaid}
• Mandatory ISMW Displacement & Travel Dues: ₹${(claim.displacementAllowance + claim.journeyAllowance).toLocaleString('en-IN')}

⚖️ *Statutory Citations:*
- Sec 5 & 15, Payment of Wages Act, 1936
- Sec 14, 15 & 21, Inter-State Migrant Workmen Act, 1979
- Sec 12, Minimum Wages Act, 1948

Formal grievance filed before:
${petition.addressedTo}

Dial National Helpline: 14434`;
    return encodeURIComponent(text);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-emerald-400" />
            <span>Dual Administrative Legal Grievance Petition</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Host-State official administrative script with parallel National English legal draft
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${generateWhatsAppMessage()}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>WhatsApp Dispatch</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex items-center gap-2 border-b border-slate-800 no-print">
        <button
          onClick={() => setActiveTab('host')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'host'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Host Script ({petition.hostLanguageName})</span>
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300">
            Official
          </span>
        </button>

        <button
          onClick={() => setActiveTab('english')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'english'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>National English Petition</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
            DLSA / Tribunal
          </span>
        </button>
      </div>

      {/* Petition Content Container */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto selection:bg-amber-500 selection:text-slate-950">
        {activeContent}
      </div>

      {/* Printable Hidden Element for window.print() */}
      <div id="printable-petition" className="hidden print:block font-serif text-black p-8">
        <div className="border-b-2 border-black pb-4 mb-4 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wider">
            FORMAL GRIEVANCE PETITION FOR LABOUR WAGE RECOVERY
          </h1>
          <p className="text-xs italic">
            Filed under Payment of Wages Act, 1936 & Inter-State Migrant Workmen (RECS) Act, 1979
          </p>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {petition.petitionInHostLanguage}
        </div>
        <div className="page-break-before my-8 border-t-2 border-dashed border-gray-400 pt-6">
          <h2 className="text-base font-bold uppercase mb-2">
            Parallel English Record (For DLSA / Judicial Reference)
          </h2>
          <div className="whitespace-pre-wrap text-xs leading-relaxed">
            {petition.petitionInEnglish}
          </div>
        </div>
      </div>
    </div>
  );
};
