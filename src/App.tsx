import { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { LegalReferenceModal } from './components/LegalReferenceModal';
import { RouteSelector } from './components/RouteSelector';
import { VoiceRecorder } from './components/VoiceRecorder';
import { EvidenceUpload } from './components/EvidenceUpload';
import { WageReckonerCard } from './components/WageReckonerCard';
import { PetitionViewer } from './components/PetitionViewer';
import { AudioBriefingPlayer } from './components/AudioBriefingPlayer';
import { DEMO_PRESETS } from './constants/demoCases';
import { WORKER_LANGUAGES, HOST_STATES } from './constants/languages';
import type { DisputeDetails, StatutoryClaim, DualPetition, AudioAdvisory } from './types';
import { calculateStatutoryClaim } from './utils/wageCalculator';
import {
  isLiveModeActive,
  transcribeAudioWithSarvam,
  analyzeLegalDisputeWithSarvam,
  generateDualPetitionsWithSarvam,
  synthesizeAudioBriefingWithSarvam,
  getSynchronousInitialOutputs,
} from './services/sarvam';
import { Scale, Sparkles, ArrowRight, CheckCircle2, Calculator } from 'lucide-react';

export function App() {
  const [isLive, setIsLive] = useState<boolean>(() => isLiveModeActive());
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);

  // Migration Route
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi-IN');
  const [selectedHostState, setSelectedHostState] = useState<string>('kerala');
  const [selectedDemoId, setSelectedDemoId] = useState<string>('ramesh-bihar-kerala');

  // Case & Dispute Details (init with Demo 1: Ramesh Kumar)
  const defaultDemo = DEMO_PRESETS[0];
  const initialOutputs = getSynchronousInitialOutputs(
    defaultDemo.evidenceData as DisputeDetails,
    defaultDemo.statutoryClaim,
    'kerala',
    'hi-IN'
  );

  const [dispute, setDispute] = useState<DisputeDetails>(defaultDemo.evidenceData as DisputeDetails);
  const [transcript, setTranscript] = useState<string>(defaultDemo.sampleTranscript);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Processing States
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isProcessingPipeline, setIsProcessingPipeline] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Generated Outputs (initialized immediately with complete statutory data)
  const [claim, setClaim] = useState<StatutoryClaim>(defaultDemo.statutoryClaim);
  const [legalAnalysis, setLegalAnalysis] = useState<string>(initialOutputs.legalAnalysis);
  const [dualPetition, setDualPetition] = useState<DualPetition | null>(initialOutputs.petition);
  const [audioAdvisory, setAudioAdvisory] = useState<AudioAdvisory | null>(initialOutputs.advisory);

  // Active step view
  const [activeStep, setActiveStep] = useState<number>(1);

  // Full Pipeline Execution: Sarvam-105B Reasoning + Mayura Translation + Bulbul Synthesis
  const generateFullDisputeOutputs = useCallback(
    async (
      currentDispute: DisputeDetails,
      currentTranscript: string,
      hostStateId: string,
      workerLang: string
    ) => {
      setIsProcessingPipeline(true);
      const updatedClaim = calculateStatutoryClaim(currentDispute);
      setClaim(updatedClaim);

      try {
        // 1. Legal Reasoning with Sarvam-105B
        const legalRes = await analyzeLegalDisputeWithSarvam(
          currentTranscript,
          `Contractor: ${currentDispute.contractorName}, Days: ${currentDispute.daysWorked}, Agreed Rate: ${currentDispute.agreedDailyWage}`,
          hostStateId,
          workerLang,
          updatedClaim
        );
        setLegalAnalysis(legalRes.legalAnalysis);

        // 2. Dual Petitions with Sarvam Translate (Mayura:v1)
        const petitionRes = await generateDualPetitionsWithSarvam(currentDispute, updatedClaim, hostStateId);
        setDualPetition(petitionRes.petition);

        // 3. Spoken Audio Advisory with Sarvam Bulbul (bulbul:v4-flash)
        const advisoryRes = await synthesizeAudioBriefingWithSarvam(workerLang, currentDispute, updatedClaim);
        setAudioAdvisory(advisoryRes.advisory);
      } catch (err) {
        console.error('Error generating dispute outputs:', err);
      } finally {
        setIsProcessingPipeline(false);
      }
    },
    []
  );

  const handleKeyUpdated = () => {
    setIsLive(isLiveModeActive());
  };

  // Switch demo preset
  const handleSelectDemo = (demoId: string) => {
    const found = DEMO_PRESETS.find((d) => d.id === demoId);
    if (!found) return;

    setSelectedDemoId(demoId);
    setSelectedLanguage(found.originLanguage);
    setSelectedHostState(found.hostState);
    setDispute(found.evidenceData as DisputeDetails);
    setTranscript(found.sampleTranscript);
    setClaim(found.statutoryClaim);

    generateFullDisputeOutputs(found.evidenceData as DisputeDetails, found.sampleTranscript, found.hostState, found.originLanguage);
  };

  const handleDisputeFieldUpdate = (updated: Partial<DisputeDetails>) => {
    setDispute((prev) => {
      const next = { ...prev, ...updated };
      const newClaim = calculateStatutoryClaim(next);
      setClaim(newClaim);
      return next;
    });
  };

  // Trigger manual speech transcription
  const handleTriggerTranscription = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    const res = await transcribeAudioWithSarvam(audioBlob, selectedLanguage, transcript);
    setTranscript(res.transcript);
    setIsTranscribing(false);
  };

  const handleAudioRecorded = async (blob: Blob) => {
    setAudioBlob(blob);
    setIsTranscribing(true);
    const res = await transcribeAudioWithSarvam(blob, selectedLanguage, transcript);
    setTranscript(res.transcript);
    setIsTranscribing(false);
  };

  const handleReSynthesizeAudio = async () => {
    setIsSynthesizing(true);
    const res = await synthesizeAudioBriefingWithSarvam(selectedLanguage, dispute, claim);
    setAudioAdvisory(res.advisory);
    setIsSynthesizing(false);
  };

  const currentHost = HOST_STATES.find((s) => s.id === selectedHostState) || HOST_STATES[0];
  const currentLang = WORKER_LANGUAGES.find((l) => l.code === selectedLanguage) || WORKER_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        isLive={isLive}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        onSelectDemo={handleSelectDemo}
        selectedDemoId={selectedDemoId}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Zero-Backend Pure Frontend • Sarvam AI Indic Stack</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Bridging the Linguistic Chasm for <span className="text-amber-400">100M+ Inter-State Migrant Workers</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Convert raw colloquial voice testimonies in rural dialects into legally enforceable administrative grievance petitions in the host state's official script within 60 seconds.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saaras v4 Dialect STT
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-sky-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sarvam-105B Labor Law Engine
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Bulbul v4 Native TTS
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-purple-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mayura Host Script Translation
              </span>
            </div>
          </div>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 no-print">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
              activeStep === 1
                ? 'border-amber-500 bg-amber-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-bold shrink-0">
              1
            </span>
            <div>
              <div className="text-xs font-bold">Origin Route</div>
              <div className="text-[10px] text-slate-400">Language & State</div>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
              activeStep === 2
                ? 'border-amber-500 bg-amber-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-bold shrink-0">
              2
            </span>
            <div>
              <div className="text-xs font-bold">Voice & Evidence</div>
              <div className="text-[10px] text-slate-400">Saaras & Hajiri Slip</div>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
              activeStep === 3
                ? 'border-amber-500 bg-amber-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-bold shrink-0">
              3
            </span>
            <div>
              <div className="text-xs font-bold">Wage Reckoner</div>
              <div className="text-[10px] text-slate-400">Statutory Computation</div>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(4)}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
              activeStep === 4
                ? 'border-amber-500 bg-amber-500/10 text-white'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-bold shrink-0">
              4
            </span>
            <div>
              <div className="text-xs font-bold">Legal Petition & Voice</div>
              <div className="text-[10px] text-slate-400">Dual Draft & Bulbul</div>
            </div>
          </button>
        </div>

        {/* Step 1 & 2: Route, Voice Recording & Evidence Upload */}
        {(activeStep === 1 || activeStep === 2) && (
          <div className="space-y-6">
            <RouteSelector
              selectedLanguage={selectedLanguage}
              selectedHostState={selectedHostState}
              onLanguageChange={(lang) => {
                setSelectedLanguage(lang);
                handleDisputeFieldUpdate({ hostState: selectedHostState });
              }}
              onHostStateChange={(host) => {
                setSelectedHostState(host);
                handleDisputeFieldUpdate({ hostState: host });
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VoiceRecorder
                onAudioRecorded={handleAudioRecorded}
                onTranscriptChanged={setTranscript}
                currentTranscript={transcript}
                isTranscribing={isTranscribing}
                onTriggerTranscription={handleTriggerTranscription}
                languageName={currentLang.name}
                onLoadPresetAudio={() => {
                  const preset = DEMO_PRESETS.find((d) => d.id === selectedDemoId) || DEMO_PRESETS[0];
                  setTranscript(preset.sampleTranscript);
                }}
              />

              <EvidenceUpload
                dispute={dispute}
                onDisputeChange={handleDisputeFieldUpdate}
                onLoadPresetEvidence={() => {
                  const preset = DEMO_PRESETS.find((d) => d.id === selectedDemoId) || DEMO_PRESETS[0];
                  setDispute(preset.evidenceData as DisputeDetails);
                }}
              />
            </div>

            {/* Run Complete AI Dispute Analysis Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  generateFullDisputeOutputs(dispute, transcript, selectedHostState, selectedLanguage);
                  setActiveStep(3);
                }}
                disabled={isProcessingPipeline}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Calculator className="h-5 w-5" />
                <span>
                  {isProcessingPipeline
                    ? 'Processing Sarvam AI Legal Pipeline...'
                    : 'Calculate Statutory Claims & Proceed to Reckoner →'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Statutory Wage Reckoner & Legal Violation Audit */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <WageReckonerCard
              claim={claim}
              legalAnalysis={legalAnalysis}
              isAnalyzing={isProcessingPipeline}
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                ← Back to Evidence & Voice
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-colors"
              >
                <span>View Dual Legal Petition & Voice Briefing →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Dual Petition & Spoken Audio Advisory */}
        {activeStep === 4 && dualPetition && (
          <div className="space-y-6">
            {/* Audio Briefing Player */}
            {audioAdvisory && (
              <AudioBriefingPlayer
                advisory={audioAdvisory}
                isSynthesizing={isSynthesizing}
                onReSynthesize={handleReSynthesizeAudio}
              />
            )}

            {/* Bilingual Petition Viewer */}
            <PetitionViewer
              petition={dualPetition}
              dispute={dispute}
              claim={claim}
              hostStateName={currentHost.name}
            />

            <div className="flex items-center justify-between pt-2 no-print">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                ← Back to Wage Reckoner
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-colors"
              >
                <span>Print Legal Filing Draft (PDF)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 no-print">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-amber-500" />
            <span className="text-slate-400">PravasiMitra • प्रवासी मित्र</span>
            <span>-</span>
            <span>Dedicated to the Dignity and Statutory Rights of Migrant Labor</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Sarvam AI Cloud</span>
            <span>•</span>
            <a href="tel:14434" className="hover:text-emerald-400">
              Shramik Helpline: 14434
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={handleKeyUpdated}
      />

      <LegalReferenceModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}

export default App;
