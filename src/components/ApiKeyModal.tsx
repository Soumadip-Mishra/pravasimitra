import React, { useState } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Loader2, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { getStoredApiKey, saveStoredApiKey, testSarvamApiKey } from '../services/sarvam';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [keyInput, setKeyInput] = useState<string>(getStoredApiKey());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!keyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter a Sarvam API key to test.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testSarvamApiKey(keyInput.trim());
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    saveStoredApiKey(keyInput.trim());
    onKeyUpdated();
    onClose();
  };

  const handleClear = () => {
    saveStoredApiKey('');
    setKeyInput('');
    setTestResult(null);
    onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Sarvam AI API Configuration</h3>
              <p className="text-xs text-slate-400">Direct Client-Side HTTPS Integration</p>
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
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Sarvam AI Subscription Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Enter your Sarvam API subscription key..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
              <span>Get your API key at:</span>
              <a
                href="https://dashboard.sarvam.ai"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline inline-flex items-center gap-0.5"
              >
                dashboard.sarvam.ai
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`rounded-xl border p-3 text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                  : 'border-rose-500/30 bg-rose-950/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-rose-400" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Privacy & Pure Frontend Architecture Callout */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 font-medium text-amber-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Zero-Backend Client-Side Security</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Your API key is saved exclusively in your local browser storage (<code className="text-slate-300">localStorage</code>).
              All requests to Sarvam Cloud (Saaras STT, Sarvam-105B, Bulbul TTS, Mayura Translate) are dispatched directly from your browser with zero intermediate proxy servers.
            </p>
            <p className="text-slate-400 leading-relaxed">
              If left blank, PravasiMitra seamlessly runs in high-fidelity <strong>Smart Simulation / Demo Mode</strong> with realistic voice datasets.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Key</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testing || !keyInput.trim()}
              onClick={handleTest}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Test Connection</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-colors"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
