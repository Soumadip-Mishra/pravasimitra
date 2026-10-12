export interface LanguageOption {
  code: string; // e.g. "hi-IN", "bn-IN"
  sarvamCode: string; // Sarvam language code
  name: string; // e.g. "Hindi (हिंदी / भोजपुरी)"
  nativeName: string;
  defaultState?: string;
}

export interface HostStateOption {
  id: string; // e.g. "kerala"
  name: string; // "Kerala (കേരളം)"
  languageCode: string; // "ml-IN"
  languageName: string; // "Malayalam"
  laborDepartmentOffice: string;
  statutoryMinWagePerDay: number; // in INR
}

export interface DisputeDetails {
  workerName: string;
  workerPhone: string;
  workerHomeState: string;
  workerTrade: string; // e.g. "Mason / Rajmistri", "Tile Layer", "Textile Worker"
  
  contractorName: string;
  contractorPhone: string;
  principalEmployer: string;
  worksiteLocation: string;
  hostState: string;
  
  startDate: string;
  endDate: string;
  daysWorked: number;
  agreedDailyWage: number;
  advancesReceived: number;
  overtimeHours: number;
  
  withholdingReason: string; // e.g. "Contractor absconded upon site completion"
  evidenceType: 'attendance_slip' | 'gate_pass' | 'cash_memo' | 'verbal_only';
}

export interface StatutoryClaim {
  daysWorked: number;
  agreedDailyWage: number;
  totalAgreedWages: number;
  advancesPaid: number;
  unpaidPrincipal: number;
  
  statutoryMinWage: number;
  minWageShortfall: number; // Section 12 Minimum Wages Act
  
  overtimeHours: number;
  overtimePay: number; // 2x hourly under BOCW / Factories Act
  
  displacementAllowance: number; // Section 14 ISMW Act (50% monthly wage)
  journeyAllowance: number; // Section 15 ISMW Act (travel fare + transit wages)
  
  statutoryCompensationMultiplier: number; // Section 15(3) Payment of Wages Act (up to 10x)
  totalStatutoryClaim: number;
  
  violatedActs: {
    act: string;
    section: string;
    description: string;
  }[];
}

export interface DualPetition {
  hostLanguageCode: string;
  hostLanguageName: string;
  petitionInHostLanguage: string;
  petitionInEnglish: string;
  subjectLine: string;
  addressedTo: string;
  prayerForRelief: string[];
}

export interface AudioAdvisory {
  languageCode: string;
  languageName: string;
  audioBase64?: string; // from Bulbul TTS
  transcriptVernacular: string;
  transcriptEnglish: string;
  keyInstructions: string[];
}

export interface DemoPreset {
  id: string;
  title: string;
  workerName: string;
  originLanguage: string;
  hostState: string;
  trade: string;
  unpaidAmount: number;
  audioDuration: string;
  sampleTranscript: string;
  sampleEvidenceImageDescription: string;
  evidenceData: Partial<DisputeDetails>;
  statutoryClaim: StatutoryClaim;
}
