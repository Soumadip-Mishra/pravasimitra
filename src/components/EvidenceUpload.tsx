import React, { useState } from 'react';
import type { DisputeDetails } from '../types';
import { FileText, Upload, ZoomIn, ZoomOut, RotateCw, Image as ImageIcon, Sparkles } from 'lucide-react';

interface EvidenceUploadProps {
  dispute: DisputeDetails;
  onDisputeChange: (updated: Partial<DisputeDetails>) => void;
  onLoadPresetEvidence?: () => void;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  dispute,
  onDisputeChange,
  onLoadPresetEvidence,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessingDoc, setIsProcessingDoc] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setZoomLevel(1);
      setRotation(0);
      setIsProcessingDoc(true);

      // Simulate Sarvam Document AI OCR scanning
      setTimeout(() => {
        setIsProcessingDoc(false);
      }, 800);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" />
            <span>Documentary Evidence & Attendance Slip Scanner</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Photographs of handwritten attendance slips (Hajiri Khata), gate passes, or cash vouchers
          </p>
        </div>

        {onLoadPresetEvidence && (
          <button
            onClick={() => {
              onLoadPresetEvidence();
              // Create SVG mock Hajiri Khata card preview
              setImagePreview('preset-hajiri-slip');
            }}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Sample Hajiri Slip</span>
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Document Viewer Column */}
        <div className="lg:col-span-5 flex flex-col">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-amber-400" />
            <span>Document Preview & Visual Inspector</span>
          </label>

          <div className="relative flex-1 min-h-[260px] rounded-xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-3 overflow-hidden">
            {imagePreview ? (
              <>
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {imagePreview === 'preset-hajiri-slip' ? (
                    // Synthetic realistic Hajiri Khata card
                    <div
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="w-full max-w-xs rounded-lg border-2 border-dashed border-amber-500/40 bg-amber-950/20 p-4 text-xs font-mono text-amber-200 shadow-inner"
                    >
                      <div className="text-center font-bold text-sm text-amber-400 border-b border-amber-500/30 pb-2 mb-2">
                        ★ हाजिरी खाता (HAJIRI REGISTER) ★
                      </div>
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        <div><strong className="text-white">कामगार:</strong> {dispute.workerName || 'रमेश कुमार'}</div>
                        <div><strong className="text-white">ठेकेदार:</strong> {dispute.contractorName || 'सूरज यादव'}</div>
                        <div><strong className="text-white">साइट:</strong> {dispute.worksiteLocation || 'Ernakulam Project'}</div>
                        <div><strong className="text-white">दैनिक मजदूरी:</strong> ₹{dispute.agreedDailyWage || 750}/दिन</div>
                        <div><strong className="text-white">कुल हाजिरी:</strong> {dispute.daysWorked || 45} दिन (हाजिर P)</div>
                        <div><strong className="text-white">खोराकी खर्च:</strong> ₹{dispute.advancesReceived || 6000} (नकद)</div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-amber-500/30 flex items-center justify-between text-[10px] text-amber-400">
                        <span>सील: SKYLINE BUILDTECH</span>
                        <span>पर्यवेक्षक हस्ताक्षर: S.Yadav</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={imagePreview}
                      alt="Uploaded Attendance Evidence"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-h-56 max-w-full rounded object-contain"
                    />
                  )}
                </div>

                {/* Canvas Controls */}
                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1 text-xs">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 text-slate-300 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 text-slate-300 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-1 text-slate-300 hover:text-white"
                    title="Rotate 90°"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono ml-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 text-center cursor-pointer">
                <Upload className="h-8 w-8 text-slate-500 mb-2" />
                <span className="text-xs font-semibold text-slate-300">
                  Click to Upload or Drag Photo
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Supports JPG, PNG, WebP of attendance slips
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}

            {isProcessingDoc && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Scanning via Sarvam Document AI...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Structured Evidence Data Fields (Editable) */}
        <div className="lg:col-span-7 space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Extracted Case Parameters & Legal Parties
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Worker Name */}
            <div>
              <span className="text-slate-400 mb-1 block">Worker Full Name</span>
              <input
                type="text"
                value={dispute.workerName}
                onChange={(e) => onDisputeChange({ workerName: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Worker Mobile */}
            <div>
              <span className="text-slate-400 mb-1 block">Worker Mobile Phone</span>
              <input
                type="text"
                value={dispute.workerPhone}
                onChange={(e) => onDisputeChange({ workerPhone: e.target.value })}
                placeholder="+91 94312 87654"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Contractor Name */}
            <div>
              <span className="text-slate-400 mb-1 block">Contractor / Thekedar Name</span>
              <input
                type="text"
                value={dispute.contractorName}
                onChange={(e) => onDisputeChange({ contractorName: e.target.value })}
                placeholder="e.g. Suraj Yadav"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Contractor Mobile */}
            <div>
              <span className="text-slate-400 mb-1 block">Contractor Mobile Phone</span>
              <input
                type="text"
                value={dispute.contractorPhone}
                onChange={(e) => onDisputeChange({ contractorPhone: e.target.value })}
                placeholder="+91 98351 22891"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Principal Employer */}
            <div className="sm:col-span-2">
              <span className="text-slate-400 mb-1 block">Principal Employer / Construction Firm (Sec. 21 Liable)</span>
              <input
                type="text"
                value={dispute.principalEmployer}
                onChange={(e) => onDisputeChange({ principalEmployer: e.target.value })}
                placeholder="e.g. Skyline BuildTech Infrastructure Pvt Ltd"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Worksite Location */}
            <div className="sm:col-span-2">
              <span className="text-slate-400 mb-1 block">Worksite Physical Address</span>
              <input
                type="text"
                value={dispute.worksiteLocation}
                onChange={(e) => onDisputeChange({ worksiteLocation: e.target.value })}
                placeholder="e.g. Infopark Phase-2 Site, Kakkanad, Ernakulam"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Days Worked */}
            <div>
              <span className="text-slate-400 mb-1 block">Total Days Worked (हाजिरी)</span>
              <input
                type="number"
                value={dispute.daysWorked || ''}
                onChange={(e) => onDisputeChange({ daysWorked: parseInt(e.target.value) || 0 })}
                placeholder="45"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Daily Wage Agreed */}
            <div>
              <span className="text-slate-400 mb-1 block">Agreed Daily Wage Rate (₹/day)</span>
              <input
                type="number"
                value={dispute.agreedDailyWage || ''}
                onChange={(e) => onDisputeChange({ agreedDailyWage: parseInt(e.target.value) || 0 })}
                placeholder="750"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-amber-300 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Advances Received */}
            <div>
              <span className="text-slate-400 mb-1 block">Advances Paid for Food / Kharcha (₹)</span>
              <input
                type="number"
                value={dispute.advancesReceived || ''}
                onChange={(e) => onDisputeChange({ advancesReceived: parseInt(e.target.value) || 0 })}
                placeholder="6000"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Overtime Hours */}
            <div>
              <span className="text-slate-400 mb-1 block">Overtime Hours Worked</span>
              <input
                type="number"
                value={dispute.overtimeHours || ''}
                onChange={(e) => onDisputeChange({ overtimeHours: parseInt(e.target.value) || 0 })}
                placeholder="32"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
