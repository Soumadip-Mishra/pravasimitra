import type { DisputeDetails, DualPetition, AudioAdvisory, StatutoryClaim } from '../types';
import { HOST_STATES, WORKER_LANGUAGES } from '../constants/languages';
import { generateDemoAudioBase64 } from '../utils/audioHelper';

const STORAGE_KEY = 'PRAVASIMITRA_SARVAM_API_KEY';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  const localKey = localStorage.getItem(STORAGE_KEY);
  if (localKey && localKey.trim()) return localKey.trim();
  const envKey = (import.meta.env.VITE_SARVAM_API_KEY as string) || '';
  return envKey.trim();
}

export function saveStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function isLiveModeActive(): boolean {
  return Boolean(getStoredApiKey());
}

// Ping Sarvam AI to test if the provided API key is valid
export async function testSarvamApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Please provide a non-empty API subscription key.' };
  }

  try {
    const res = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: 'Test legal connection',
        source_language_code: 'en-IN',
        target_language_code: 'hi-IN',
      }),
    });

    if (res.ok) {
      return { success: true, message: 'Sarvam AI API key authenticated successfully!' };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errData.message || `Sarvam API error: HTTP ${res.status} ${res.statusText}`,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error communicating with Sarvam AI API',
    };
  }
}

// 1. Transcribe audio using Sarvam Saaras (saaras:v4)
export async function transcribeAudioWithSarvam(
  audioBlob: Blob,
  languageCode: string,
  fallbackTranscript?: string
): Promise<{ transcript: string; isLive: boolean; error?: string }> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'worker_testimony.wav');
      formData.append('model', 'saaras:v4');
      if (languageCode) {
        formData.append('language_code', languageCode);
      }

      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const transcript = data.transcript || data.text || '';
        if (transcript) {
          return { transcript, isLive: true };
        }
      } else {
        const errorText = await response.text();
        console.warn('Sarvam STT failed, using smart fallback:', errorText);
      }
    } catch (err) {
      console.warn('Network error calling Sarvam STT, using fallback:', err);
    }
  }

  // Fallback to simulated transcript if offline or error
  return {
    transcript: fallbackTranscript || 'नमस्ते, मैं बिहार से आया हूँ और एर्नाकुलम में निर्माण कार्य कर रहा था। ठेकेदार ने 45 दिन का वेतन रोक लिया है।',
    isLive: false,
  };
}

// 2. Legal Reasoning and Fact Extraction using Sarvam-105B
export async function analyzeLegalDisputeWithSarvam(
  transcript: string,
  evidenceNotes: string,
  hostStateId: string,
  workerLangCode: string,
  claim: StatutoryClaim
): Promise<{
  legalAnalysis: string;
  isLive: boolean;
}> {
  const apiKey = getStoredApiKey();
  const hostState = HOST_STATES.find(s => s.id === hostStateId) || HOST_STATES[0];

  const systemPrompt = `You are an expert Indian Labor Law and Inter-State Migrant Rights Legal Assistant.
Your task is to analyze the worker's vernacular testimony and evidence under:
1. Inter-State Migrant Workmen (Regulation of Employment and Conditions of Service) Act, 1979 (Sections 12, 14, 15, 16, 21)
2. Payment of Wages Act, 1936 (Sections 5 & 15)
3. Minimum Wages Act, 1948 (Sections 12 & 20)
4. Building and Other Construction Workers (BOCW) Act, 1996

Worker Origin Language: ${workerLangCode}.
Host State: ${hostState.name} (Statutory floor minimum wage: Rs. ${hostState.statutoryMinWagePerDay}/day).
Statutory claim amount: Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}.

Provide a clear, authoritative, formal legal analysis summarizing:
1. Primary statutory violations committed by the contractor and principal employer.
2. Direct joint liability of the principal employer under Section 21 of the ISMW Act 1979.
3. Recommended administrative recovery process before the District Labour Officer / Deputy Labour Commissioner.
Write concise, professional legal paragraphs without markdown tables.`;

  if (apiKey) {
    try {
      const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sarvam-105b',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Worker Testimony: "${transcript}"\nEvidence Details: "${evidenceNotes}"\nTotal Unpaid Claim: Rs. ${claim.totalStatutoryClaim}`,
            },
          ],
          temperature: 0.2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return { legalAnalysis: content, isLive: true };
        }
      }
    } catch (err) {
      console.warn('Sarvam-105B call failed, falling back to rule engine:', err);
    }
  }

  // Pre-compiled statutory legal analysis grounded in Indian statutes
  const fallbackAnalysis = `1. PRIMA FACIE STATUTORY CONTRAVENTION:
The withholding of earned wages for ${claim.daysWorked} days of completed physical labor directly violates Section 5 read with Section 15(2) of the Payment of Wages Act, 1936, which mandates wage disbursement within 7 to 10 days of the wage period termination without unauthorized deductions.

2. INTER-STATE MIGRANT WORKMEN (RECS) ACT, 1979 VIOLATIONS:
As an inter-state worker deployed in ${hostState.name}, the complainant is statutorily entitled to Displacement Allowance (Section 14: Rs. ${claim.displacementAllowance.toLocaleString('en-IN')}) and Journey Allowance with travel wages (Section 15: Rs. ${claim.journeyAllowance.toLocaleString('en-IN')}). Crucially, under Section 21(1) of the Act, if the labor contractor fails or absconds, the Principal Employer is statutorily bound to disburse the entire unpaid wages and recover the amount from the contractor.

3. MINIMUM WAGE UNDERPAYMENT:
Under Section 12 of the Minimum Wages Act, 1948, no contract or verbal agreement can supersede the host state floor wage of Rs. ${claim.statutoryMinWage}/day. The shortfall represents actionable underpayment.

4. ADMINISTRATIVE PRAYER FOR RECOVERY:
The competent Authority under the Payment of Wages Act and the District Labour Officer are urged to issue immediate summons to the Principal Employer and Contractor, attach unpaid worksite contractor bills, and issue a Revenue Recovery Certificate for Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}.`;

  return { legalAnalysis: fallbackAnalysis, isLive: false };
}

// 3. Draft bilingual formal legal petitions using Sarvam Translate (mayura:v1)
export async function generateDualPetitionsWithSarvam(
  dispute: DisputeDetails,
  claim: StatutoryClaim,
  hostStateId: string
): Promise<{
  petition: DualPetition;
  isLive: boolean;
}> {
  const hostState = HOST_STATES.find(s => s.id === hostStateId) || HOST_STATES[0];
  const apiKey = getStoredApiKey();

  // English Base Petition
  const englishPetition = `BEFORE THE DISTRICT LABOUR OFFICER & COMPETENT AUTHORITY
UNDER THE PAYMENT OF WAGES ACT, 1936 & THE INTER-STATE MIGRANT WORKMEN ACT, 1979
${hostState.laborDepartmentOffice}

IN THE MATTER OF:
GRIEVANCE PETITION FOR IMMEDIATE RECOVERY OF UNPAID STATUTORY WAGES & DISPLACEMENT ALLOWANCES

COMPLAINANT:
${dispute.workerName}, S/o Complainant,
Native Resident of: ${dispute.workerHomeState},
Occupation / Trade: ${dispute.workerTrade},
Contact Mobile: ${dispute.workerPhone}

VERSUS

RESPONDENT 1 (Contractor / Thekedar):
${dispute.contractorName},
Contact Mobile: ${dispute.contractorPhone}

RESPONDENT 2 (Principal Employer / Site Owner):
${dispute.principalEmployer},
Worksite Location: ${dispute.worksiteLocation}, ${hostState.name}

MOST RESPECTFULLY SHOWETH:
1. That the Complainant is an inter-state migrant worker recruited from ${dispute.workerHomeState} to perform labor at the worksite situated at ${dispute.worksiteLocation} under the supervision of Respondent 1 for the project of Respondent 2.
2. That the Complainant worked diligently for a total of ${claim.daysWorked} days during the period from ${dispute.startDate || 'August 2026'} to ${dispute.endDate || 'September 2026'} at an agreed daily wage rate of Rs. ${claim.agreedDailyWage}/- per day.
3. That out of the total earned principal wage of Rs. ${claim.totalAgreedWages.toLocaleString('en-IN')}/-, the Complainant was provided only Rs. ${claim.advancesPaid.toLocaleString('en-IN')}/- as subsistence food allowance. The balance principal wage of Rs. ${claim.unpaidPrincipal.toLocaleString('en-IN')}/- remains unlawfully withheld.
4. That following completion of work, Respondent 1 absconded and switched off telephonic communication.
5. That under Section 21 of the Inter-State Migrant Workmen (Regulation of Employment and Conditions of Service) Act, 1979, Respondent 2 (Principal Employer) is strictly liable to disburse all unpaid wages in full.
6. That the Complainant is also entitled to statutory Displacement Allowance (Rs. ${claim.displacementAllowance.toLocaleString('en-IN')}) under Section 14 and Journey Allowance (Rs. ${claim.journeyAllowance.toLocaleString('en-IN')}) under Section 15 of the Act, bringing the total legal claim to Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/-.

SCHEDULE OF STATUTORY CLAIM:
- Unpaid Principal Wages (${claim.daysWorked} days): Rs. ${claim.unpaidPrincipal.toLocaleString('en-IN')}
- Minimum Wage Deficit (Sec 12, Minimum Wages Act): Rs. ${claim.minWageShortfall.toLocaleString('en-IN')}
- Overtime Arrears (${claim.overtimeHours} hrs @ 2x rate): Rs. ${claim.overtimePay.toLocaleString('en-IN')}
- Mandatory Displacement Allowance (Sec 14, ISMW Act): Rs. ${claim.displacementAllowance.toLocaleString('en-IN')}
- Mandatory Journey Allowance (Sec 15, ISMW Act): Rs. ${claim.journeyAllowance.toLocaleString('en-IN')}
TOTAL STATUTORY AMOUNT CLAIMED: Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}

PRAYER FOR RELIEF:
The Complainant respectfully prays that this Hon'ble Authority may be pleased to:
a) Issue urgent conciliation notice and summons to Respondent 1 and Respondent 2;
b) Direct Respondent 2 to immediately deposit Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/- before this Authority under Section 21 of the ISMW Act;
c) Award compensation up to 10 times under Section 15(3) of the Payment of Wages Act for deliberate wage theft;
d) Provide emergency shelter, transit assistance, and free legal aid through the District Legal Services Authority (DLSA).

Place: ${hostState.name}
Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

(Verification: The statements made above are true to the best of my knowledge and belief.)

_______________________
Thumb Impression / Signature of Complainant
${dispute.workerName}`;

  let hostLangPetition = '';
  let isLive = false;

  // Try live translation with Sarvam Translate (mayura:v1)
  if (apiKey && hostState.languageCode !== 'en-IN') {
    try {
      const promptSnippet = `LEGAL PETITION FOR LABOUR OFFICER:\nComplainant: ${dispute.workerName}\nContractor: ${dispute.contractorName}\nClaim: Rs. ${claim.totalStatutoryClaim}\nDays Worked: ${claim.daysWorked}\nSite: ${dispute.worksiteLocation}\nPlease grant immediate wage recovery under Payment of Wages Act and Inter-State Migrant Workmen Act.`;

      const response = await fetch('https://api.sarvam.ai/translate', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: promptSnippet,
          source_language_code: 'en-IN',
          target_language_code: hostState.languageCode,
          mode: 'formal',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translated_text) {
          hostLangPetition = formatOfficialPetitionInHostScript(
            hostState.id,
            dispute,
            claim,
            data.translated_text
          );
          isLive = true;
        }
      }
    } catch (err) {
      console.warn('Sarvam translation error, using pre-translated template:', err);
    }
  }

  // Pre-translated high-fidelity legal petition if offline
  if (!hostLangPetition) {
    hostLangPetition = getFallbackHostPetition(hostState.id, dispute, claim);
  }

  return {
    petition: {
      hostLanguageCode: hostState.languageCode,
      hostLanguageName: hostState.languageName,
      petitionInHostLanguage: hostLangPetition,
      petitionInEnglish: englishPetition,
      subjectLine: `Grievance Petition under ISMW Act 1979 & Payment of Wages Act 1936 for Recovery of Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/-`,
      addressedTo: hostState.laborDepartmentOffice,
      prayerForRelief: [
        `Immediate recovery of Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/- from Principal Employer (${dispute.principalEmployer})`,
        `Summons to absconding contractor (${dispute.contractorName})`,
        `Compensation under Section 15(3) of Payment of Wages Act, 1936`,
        `Transit and legal aid support via District Legal Services Authority (DLSA)`,
      ],
    },
    isLive,
  };
}

// 4. Synthesize native spoken audio briefing using Sarvam Bulbul (bulbul:v4-flash)
export async function synthesizeAudioBriefingWithSarvam(
  workerLangCode: string,
  dispute: DisputeDetails,
  claim: StatutoryClaim
): Promise<{ advisory: AudioAdvisory; isLive: boolean }> {
  const apiKey = getStoredApiKey();
  const workerLang = WORKER_LANGUAGES.find(l => l.code === workerLangCode) || WORKER_LANGUAGES[0];

  const vernacularText = getWorkerAdvisoryText(workerLang.code, dispute, claim);
  const englishText = `Brother ${dispute.workerName}, your legal grievance petition has been prepared. We have claimed Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')} covering your unpaid wages, overtime, and mandatory travel and displacement allowances under the law. Take this printed copy to the District Labour Officer or the free Legal Aid (DLSA) desk. If the contractor calls, do not take cash advances without signed vouchers. You can dial 14434 anytime for help.`;

  let audioBase64 = '';
  let isLive = false;

  if (apiKey) {
    try {
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: vernacularText.slice(0, 480), // Bulbul chunk
          language_code: workerLang.code,
          model: 'bulbul:v4-flash',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audios && data.audios.length > 0) {
          audioBase64 = data.audios[0];
          isLive = true;
        }
      }
    } catch (err) {
      console.warn('Bulbul TTS error, using synthesized carrier audio:', err);
    }
  }

  // Generate pleasant fallback synthetic tone sequence if offline
  if (!audioBase64) {
    audioBase64 = generateDemoAudioBase64();
  }

  return {
    advisory: {
      languageCode: workerLang.code,
      languageName: workerLang.name,
      audioBase64,
      transcriptVernacular: vernacularText,
      transcriptEnglish: englishText,
      keyInstructions: [
        `Take this printed petition to the District Labour Office (DLSA free legal cell).`,
        `Total legal claim under statute: Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/-.`,
        `Call Toll-Free Shramik Helpline: 14434 if contractor intimidates or threatens.`,
        `Do not sign blank vouchers or accept partial settlements without a formal receipt.`,
      ],
    },
    isLive,
  };
}

// Helper: Vernacular Audio Advisory Texts
function getWorkerAdvisoryText(langCode: string, dispute: DisputeDetails, claim: StatutoryClaim): string {
  const formattedClaim = claim.totalStatutoryClaim.toLocaleString('en-IN');
  const days = claim.daysWorked;
  const name = dispute.workerName || 'साथी';

  switch (langCode) {
    case 'hi-IN':
      return `${name} भाई, आपका कानूनी आवेदन तैयार हो चुका है। कानून के तहत हमने आपके ${days} दिन के काम का मूल वेतन, ओवरटाइम, और विस्थापन भत्ता मिलाकर कुल ${formattedClaim} रुपये का दावा किया है। यह कागज़ लेकर जिला श्रम अधिकारी या मुफ्त कानूनी सहायता (DLSA) के पास जाएं। ठेकेदार के धमकाने पर तुरंत 14434 पर कॉल करें।`;
    case 'bn-IN':
      return `${name} দা, আপনার আইনি অভিযোগপত্র প্রস্তুত করা হয়েছে। আইনের আওতায় আপনার ${days} দিনের বকেয়া বেতন, ওভারটাইম এবং যাতায়াত ভাতা সহ সর্বমোট ${formattedClaim} টাকার দাবি পেশ করা হয়েছে। এই কাগজটি জেলা শ্রম দফতরে অথবা ডিএলএসএ আইনি সাহায্য কেন্দ্রে জমা দিন। কোনো বিপদে পড়লে ১৪৪৩৪ নম্বরে ফোন করুন।`;
    case 'od-IN':
      return `${name} ଭାଇ, ଆପଣଙ୍କ ଆଇନଗତ ଆବେଦନ ପତ୍ର ପ୍ରସ୍ତୁତ ହୋଇସାରିଛି। ଆଇନ ଅନୁସାରେ ଆପଣଙ୍କ ${days} ଦିନର ବକେୟା ମଜୁରୀ ଓ ଯାତ୍ରା ଭତ୍ତା ମିଶାଇ ସମୁଦାୟ ${formattedClaim} ଟଙ୍କାର ଦାବି କରାଯାଇଛି। ଏହି କାଗଜକୁ ଜିଲ୍ଲା ଶ୍ରମ ଅଧିକାରୀ କିମ୍ବା ଡିଏଲଏସଏ କାର୍ଯ୍ୟାଳୟରେ ଦାଖଲ କରନ୍ତୁ। ଜରୁରୀ ସାହାଯ୍ୟ ପାଇଁ ୧୪୪୩୪ କଲ୍ କରନ୍ତୁ।`;
    case 'te-IN':
      return `${name} గారు, మీ చట్టపరమైన పిటిషన్ సిద్ధమైంది. చట్టం ప్రకారం మీ ${days} రోజుల వేతనం, అలవెన్సులు కలుపుకొని మొత్తం ${formattedClaim} రూపాయల క్లెయిమ్ చేశాము. ఈ పత్రాన్ని జిల్లా కార్మిక కార్యాలయంలో సమర్పించండి. సహాయం కోసం 14434 కు డయల్ చేయండి.`;
    case 'ta-IN':
      return `${name} அவர்களே, உங்கள் சட்டப்பூர்வ மனு தயாராக உள்ளது. சட்டத்தின் கீழ் உங்கள் ${days} நாள் சம்பளம் மற்றும் படிகள் சேர்த்து மொத்தம் ${formattedClaim} ரூபாய் கோரப்பட்டுள்ளது. இந்த ஆவணத்தை மாவட்ட தொழிலாளர் அலுவலகத்தில் சமர்ப்பிக்கவும். அவசர உதவிக்கு 14434 அழைக்கவும்.`;
    default:
      return `${name}, your legal grievance petition has been prepared. We have claimed Rs. ${formattedClaim} covering your ${days} days unpaid wages, overtime, and mandatory travel and displacement allowances. Submit this petition to the District Labour Office. Dial 14434 for helpline assistance.`;
  }
}

// Helper: Formatted Official Petitions in Host Scripts
function getFallbackHostPetition(hostStateId: string, dispute: DisputeDetails, claim: StatutoryClaim): string {
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const total = claim.totalStatutoryClaim.toLocaleString('en-IN');
  const principal = claim.unpaidPrincipal.toLocaleString('en-IN');
  const host = HOST_STATES.find(s => s.id === hostStateId) || HOST_STATES[0];

  if (hostStateId === 'kerala') {
    return `ജില്ലാ ലേബർ ഓഫീസർ മുൻപാകെ സമർപ്പിക്കുന്ന പരാതി
(1936 ലെ വേതനം നൽകൽ നിയമം & 1979 ലെ അന്തർസംസ്ഥാന കുടിയേറ്റ തൊഴിലാളി നിയമം പ്രകാരം)
${host.laborDepartmentOffice}

പരാതിക്കാരൻ:
${dispute.workerName}, സ്വദേശി: ${dispute.workerHomeState}, ജോലി: ${dispute.workerTrade}, ഫോൺ: ${dispute.workerPhone}

എതിർകക്ഷികൾ:
1. കരാറുകാരൻ (കോൺട്രാക്ടർ): ${dispute.contractorName}, ഫോൺ: ${dispute.contractorPhone}
2. പ്രധാന തൊഴിലുടമ (പ്രിൻസിപ്പൽ എംപ്ലോയർ): ${dispute.principalEmployer}, ജോലിസ്ഥലം: ${dispute.worksiteLocation}

വിഷയം: കുടിശ്ശികയായ വേതനവും മറ്റ് നിയമപരമായ ആനുകൂല്യങ്ങളും (${total}/- രൂപ) അടിയന്തരമായി ഈടാക്കി നൽകുന്നത് സംബന്ധിച്ച്.

ബോധിപ്പിക്കുന്നത്:
1. പരാതിക്കാരൻ ${dispute.workerHomeState} സംസ്ഥാനത്ത് നിന്ന് കേരളത്തിൽ തൊഴിലിനായി എത്തിയ അന്തർസംസ്ഥാന കുടിയേറ്റ തൊഴിലാളിയാണ്.
2. എതിർകക്ഷികളുടെ മേൽനോട്ടത്തിൽ ${dispute.worksiteLocation} സൈറ്റിൽ ${claim.daysWorked} ദിവസം തുടർച്ചയായി ജോലി ചെയ്തു. ദിവസം ${claim.agreedDailyWage}/- രൂപ നിരക്കിലായിരുന്നു വേതനം നിശ്ചയിച്ചിരുന്നത്.
3. ഇതിൽ ഭക്ഷണച്ചിലവിനായി നൽകിയ തുക കഴിച്ച് ${principal}/- രൂപ കരാറുകാരൻ നൽകാതെ വഞ്ചിച്ചു കടന്നുകളഞ്ഞു.
4. 1979-ലെ അന്തർസംസ്ഥാന കുടിയേറ്റ തൊഴിലാളി നിയമത്തിലെ സെക്ഷൻ 21 പ്രകാരം കരാറുകാരൻ പണം നൽകാതിരുന്നാൽ പ്രധാന തൊഴിലുടമ (Respondent 2) തുക നൽകാൻ പൂർണ്ണ ബാധ്യസ്ഥനാണ്.
5. ഇതുകൂടാതെ സെക്ഷൻ 14 പ്രകാരമുള്ള ഡിസ്പ്ലേസ്മെന്റ് അലവൻസും യാത്രാപ്പടിയും ചേർത്ത് ആകെ ${total}/- രൂപ ലഭ്യമാക്കാൻ ഉത്തരവുണ്ടാകണമെന്ന് അപേക്ഷിക്കുന്നു.

ആവശ്യങ്ങൾ:
a) എതിർകക്ഷികൾക്ക് അടിയന്തര സമൻസ് അയക്കുക.
b) കുടിശ്ശികയായ ${total}/- രൂപ ഉടൻ കെട്ടിവെപ്പിക്കുക.
c) സൗജന്യ നിയമസഹായം (DLSA) ലഭ്യമാക്കുക.

സ്ഥലം: എറണാകുളം, കേരളം
തീയതി: ${dateStr}

പരാതിക്കാരന്റെ ഒപ്പ് / വിരലടയാളം:
${dispute.workerName}`;
  }

  if (hostStateId === 'karnataka') {
    return `ಜಿಲ್ಲಾ ಕಾರ್ಮಿಕ ಅಧಿಕಾರಿಗಳ ಸನ್ನಿಧಾನದಲ್ಲಿ ಸಲ್ಲಿಸುವ ಅಹವಾಲು ಅರ್ಜಿ
(ವೇತನ ಪಾವತಿ ಕಾಯ್ದೆ 1936 ಮತ್ತು ಅಂತರ-ರಾಜ್ಯ ವಲಸೆ ಕಾರ್ಮಿಕರ ಕಾಯ್ದೆ 1979 ರ ಅಡಿಯಲ್ಲಿ)
${host.laborDepartmentOffice}

ಅರ್ಜಿದಾರ:
${dispute.workerName}, ಮೂಲ ರಾಜ್ಯ: ${dispute.workerHomeState}, ವೃತ್ತಿ: ${dispute.workerTrade}, ಮೊಬೈಲ್: ${dispute.workerPhone}

ವಿರುದ್ಧ:
1. ಗುತ್ತಿಗೆದಾರ (ಕಾಂಟ್ರಾಕ್ಟರ್): ${dispute.contractorName}, ಮೊಬೈಲ್: ${dispute.contractorPhone}
2. ಮುಖ್ಯ ಮಾಲೀಕರು (ಪ್ರಿನ್ಸಿಪಲ್ ಎಂಪ್ಲಾಯರ್): ${dispute.principalEmployer}, ಸ್ಥಳ: ${dispute.worksiteLocation}

ವಿಷಯ: ಬಾಕಿ ಉಳಿಸಿಕೊಂಡಿರುವ ಶಾಸನಬದ್ಧ ವೇತನ ಮತ್ತು ಭತ್ಯೆಗಳ (ರೂ. ${total}/-) ವಸೂಲಾತಿಗಾಗಿ ಮನವಿ.

ವಿವರಗಳು:
1. ಅರ್ಜಿದಾರರು ${dispute.workerHomeState} ರಾಜ್ಯದಿಂದ ಕರ್ನಾಟಕಕ್ಕೆ ಕೆಲಸಕ್ಕಾಗಿ ಬಂದ ವಲಸೆ ಕಾರ್ಮಿಕರಾಗಿದ್ದಾರೆ.
2. ಅರ್ಜಿದಾರರು ${dispute.worksiteLocation} ಕಾಮಗಾರಿ ಸ್ಥಳದಲ್ಲಿ ಒಟ್ಟು ${claim.daysWorked} ದಿನಗಳ ಕಾಲ ದಿನಕ್ಕೆ ರೂ. ${claim.agreedDailyWage}/- ರಂತೆ ಕೆಲಸ ನಿರ್ವಹಿಸಿರುತ್ತಾರೆ.
3. ಗುತ್ತಿಗೆದಾರರು ಕೇವಲ ಅಲ್ಪ ಮುಂಗಡ ಹಣ ನೀಡಿ, ಉಳಿದ ಬಾಕಿ ಮೊತ್ತ ರೂ. ${principal}/- ನೀಡದೆ ಪರಾರಿಯಾಗಿದ್ದಾರೆ.
4. ಅಂತರ-ರಾಜ್ಯ ವಲಸೆ ಕಾರ್ಮಿಕರ ಕಾಯ್ದೆ 1979 ರ ಕಲಂ 21 ರ ಪ್ರಕಾರ ಮುಖ್ಯ ಮಾಲೀಕರು ಈ ಬಾಕಿ ವೇತನವನ್ನು ಪಾವತಿಸಲು ಸಂಪೂರ್ಣ ಜವಾಬ್ದಾರರಾಗಿರುತ್ತಾರೆ.
5. ಆದ್ದರಿಂದ ಒಟ್ಟು ಮೊತ್ತ ರೂ. ${total}/- ನ್ನು ತಕ್ಷಣವೇ ವಸೂಲಿ ಮಾಡಿಕೊಡಬೇಕಾಗಿ ವಿನಂತಿ.

ದಿನಾಂಕ: ${dateStr}
ಸ್ಥಳ: ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ

ಅರ್ಜಿದಾರರ ಸಹಿ / ಹೆಬ್ಬೆರಳಿನ ಗುರುತು:
${dispute.workerName}`;
  }

  // Fallback for Maharashtra (Marathi)
  if (hostStateId === 'maharashtra') {
    return `कामगार उपायुक्त यांच्या कार्यालयात सादर केलेला तक्रार अर्ज
(वेतन प्रदान कायदा, १९३६ आणि आंतरराज्य स्थलांतरित कामगार कायदा, १९७९ अंतर्गत)
${host.laborDepartmentOffice}

तक्रारदार:
${dispute.workerName}, मूळ राज्य: ${dispute.workerHomeState}, काम: ${dispute.workerTrade}, फोन: ${dispute.workerPhone}

विरुद्ध:
१. कंत्राटदार (ठेकेदार): ${dispute.contractorName}, फोन: ${dispute.contractorPhone}
२. मुख्य मालक: ${dispute.principalEmployer}, कामाचे ठिकाण: ${dispute.worksiteLocation}

विषय: थकीत वेतन व वैधानिक भत्ते (रक्कम रु. ${total}/-) तातडीने मिळण्याबाबत अर्ज.

सादर निवेदन:
१. तक्रारदार हे ${dispute.workerHomeState} येथून महाराष्ट्रात आलेले स्थलांतरित कामगार आहेत.
२. त्यांनी ${dispute.worksiteLocation} येथे एकूण ${claim.daysWorked} दिवस रु. ${claim.agreedDailyWage}/- प्रतिदिन दराने प्रामाणिकपणे काम केले.
३. ठेकेदाराने थकीत मजुरी रु. ${principal}/- न देता काम बंद केले आणि फोन बंद केला आहे.
४. कायद्यानुसार मुख्य मालक सदर रक्कम भरण्यास बांधील आहेत. एकूण रु. ${total}/- वसूल करून मिळावेत ही नम्र विनंती.

तारीख: ${dateStr}
स्थळ: महाराष्ट्र

तक्रारदाराची स्वाक्षरी / अंगठा:
${dispute.workerName}`;
  }

  // Fallback for Gujarat (Gujarati)
  return `જિલ્લા શ્રમ અધિકારી સમક્ષ રજૂ કરેલ લેબર ફરિયાદ અરજી
(પેમેન્ટ ઓફ વેજીસ એક્ટ, ૧૯૩૬ અને આંતર-રાજ્ય સ્થળાંતરિત મજૂર અધિનિયમ, ૧૯૭૯ હેઠળ)
${host.laborDepartmentOffice}

અરજદાર:
${dispute.workerName}, વતન: ${dispute.workerHomeState}, વ્યવસાય: ${dispute.workerTrade}, મોબાઈલ: ${dispute.workerPhone}

સામાવાળા:
૧. કોન્ટ્રાક્ટર / મુકાદમ: ${dispute.contractorName}, મોબાઈલ: ${dispute.contractorPhone}
૨. મુખ્ય માલિક: ${dispute.principalEmployer}, સાઇટ: ${dispute.worksiteLocation}

વિષય: બાકી વેતન અને કાયદેસર ભથ્થાં (કુલ રકમ રૂ. ${total}/-) તાત્કાલિક વસૂલ કરી આપવા બાબત.

વિનંતી કે સામાવાળા ૧ તથા ૨ પાસેથી બાકી વેતન રકમ રૂ. ${principal}/- તથા સ્થળાંતર ભથ્થું મળી કુલ રૂ. ${total}/- કાયદેસર રીતે વસૂલ કરી ન્યાય અપાવવા નમ્ર વિનંતી છે.

તારીખ: ${dateStr}
સ્થળ: ગુજરાત

અરજદારની સહી / અંગૂઠાનું નિશાન:
${dispute.workerName}`;
}

function formatOfficialPetitionInHostScript(
  hostStateId: string,
  dispute: DisputeDetails,
  claim: StatutoryClaim,
  translatedSnippet: string
): string {
  const host = HOST_STATES.find(s => s.id === hostStateId) || HOST_STATES[0];
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const total = claim.totalStatutoryClaim.toLocaleString('en-IN');

  return `OFFICE OF THE DISTRICT LABOUR OFFICER & DLSA AUTHORITY
${host.laborDepartmentOffice}
Date: ${dateStr}

PETITIONER: ${dispute.workerName} (${dispute.workerHomeState})
RESPONDENT 1 (Contractor): ${dispute.contractorName} (${dispute.contractorPhone})
RESPONDENT 2 (Principal Employer): ${dispute.principalEmployer} (${dispute.worksiteLocation})
STATUTORY CLAIM AMOUNT: INR ${total}/-

--- OFFICIAL ADMINISTRATIVE DRAFT IN ${host.languageName.toUpperCase()} ---
${translatedSnippet}

SCHEDULE OF STATUTORY RELIEF SOUGHT:
- Recovery of Unpaid Wages under Section 15 of Payment of Wages Act, 1936
- Joint & Several Recovery from Principal Employer under Section 21 of ISMW Act, 1979
- Award of Journey and Displacement Allowance under Sections 14 & 15 of ISMW Act, 1979

Petitioner Signature / Thumb Impression:
${dispute.workerName}`;
}

export function getSynchronousInitialOutputs(
  dispute: DisputeDetails,
  claim: StatutoryClaim,
  hostStateId: string,
  workerLangCode: string
): {
  legalAnalysis: string;
  petition: DualPetition;
  advisory: AudioAdvisory;
} {
  const hostState = HOST_STATES.find(s => s.id === hostStateId) || HOST_STATES[0];
  const workerLang = WORKER_LANGUAGES.find(l => l.code === workerLangCode) || WORKER_LANGUAGES[0];

  const fallbackAnalysis = `1. PRIMA FACIE STATUTORY CONTRAVENTION:
The withholding of earned wages for ${claim.daysWorked} days of completed physical labor directly violates Section 5 read with Section 15(2) of the Payment of Wages Act, 1936, which mandates wage disbursement within 7 to 10 days of the wage period termination without unauthorized deductions.

2. INTER-STATE MIGRANT WORKMEN (RECS) ACT, 1979 VIOLATIONS:
As an inter-state worker deployed in ${hostState.name}, the complainant is statutorily entitled to Displacement Allowance (Section 14: Rs. ${claim.displacementAllowance.toLocaleString('en-IN')}) and Journey Allowance with travel wages (Section 15: Rs. ${claim.journeyAllowance.toLocaleString('en-IN')}). Crucially, under Section 21(1) of the Act, if the labor contractor fails or absconds, the Principal Employer is statutorily bound to disburse the entire unpaid wages and recover the amount from the contractor.

3. MINIMUM WAGE UNDERPAYMENT:
Under Section 12 of the Minimum Wages Act, 1948, no contract or verbal agreement can supersede the host state floor wage of Rs. ${claim.statutoryMinWage}/day. The shortfall represents actionable underpayment.

4. ADMINISTRATIVE PRAYER FOR RECOVERY:
The competent Authority under the Payment of Wages Act and the District Labour Officer are urged to issue immediate summons to the Principal Employer and Contractor, attach unpaid worksite contractor bills, and issue a Revenue Recovery Certificate for Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}.`;

  const englishPetition = `BEFORE THE DISTRICT LABOUR OFFICER & COMPETENT AUTHORITY
UNDER THE PAYMENT OF WAGES ACT, 1936 & THE INTER-STATE MIGRANT WORKMEN ACT, 1979
${hostState.laborDepartmentOffice}

IN THE MATTER OF:
GRIEVANCE PETITION FOR IMMEDIATE RECOVERY OF UNPAID STATUTORY WAGES & DISPLACEMENT ALLOWANCES

COMPLAINANT:
${dispute.workerName}, S/o Complainant,
Native Resident of: ${dispute.workerHomeState},
Occupation / Trade: ${dispute.workerTrade},
Contact Mobile: ${dispute.workerPhone}

VERSUS

RESPONDENT 1 (Contractor / Thekedar):
${dispute.contractorName},
Contact Mobile: ${dispute.contractorPhone}

RESPONDENT 2 (Principal Employer / Site Owner):
${dispute.principalEmployer},
Worksite Location: ${dispute.worksiteLocation}, ${hostState.name}

MOST RESPECTFULLY SHOWETH:
1. That the Complainant is an inter-state migrant worker recruited from ${dispute.workerHomeState} to perform labor at the worksite situated at ${dispute.worksiteLocation} under the supervision of Respondent 1 for the project of Respondent 2.
2. That the Complainant worked diligently for a total of ${claim.daysWorked} days at an agreed daily wage rate of Rs. ${claim.agreedDailyWage}/- per day.
3. That out of the total earned principal wage of Rs. ${claim.totalAgreedWages.toLocaleString('en-IN')}/-, the Complainant was provided only Rs. ${claim.advancesPaid.toLocaleString('en-IN')}/- as subsistence food allowance. The balance principal wage of Rs. ${claim.unpaidPrincipal.toLocaleString('en-IN')}/- remains unlawfully withheld.
4. That under Section 21 of the Inter-State Migrant Workmen Act, 1979, Respondent 2 (Principal Employer) is strictly liable to disburse all unpaid wages in full.
5. That the Complainant is also entitled to statutory Displacement Allowance (Rs. ${claim.displacementAllowance.toLocaleString('en-IN')}) and Journey Allowance (Rs. ${claim.journeyAllowance.toLocaleString('en-IN')}), bringing the total claim to Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/-.

TOTAL STATUTORY AMOUNT CLAIMED: Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}

PRAYER FOR RELIEF:
Issue immediate conciliation summons to Respondents, direct deposit of Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/-, and provide free legal aid through DLSA.`;

  const hostLangPetition = getFallbackHostPetition(hostState.id, dispute, claim);
  const vernacularText = getWorkerAdvisoryText(workerLang.code, dispute, claim);
  const englishText = `${dispute.workerName}, your legal grievance petition has been prepared for Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}. Submit it to the District Labour Officer or free DLSA cell. Dial 14434 for helpline assistance.`;

  return {
    legalAnalysis: fallbackAnalysis,
    petition: {
      hostLanguageCode: hostState.languageCode,
      hostLanguageName: hostState.languageName,
      petitionInHostLanguage: hostLangPetition,
      petitionInEnglish: englishPetition,
      subjectLine: `Grievance Petition under ISMW Act 1979 for Recovery of Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/-`,
      addressedTo: hostState.laborDepartmentOffice,
      prayerForRelief: [
        `Immediate recovery of Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/- from Principal Employer`,
        `Summons to absconding contractor`,
        `Compensation under Section 15(3) of Payment of Wages Act, 1936`,
        `Free legal aid support via District Legal Services Authority (DLSA)`,
      ],
    },
    advisory: {
      languageCode: workerLang.code,
      languageName: workerLang.name,
      audioBase64: generateDemoAudioBase64(),
      transcriptVernacular: vernacularText,
      transcriptEnglish: englishText,
      keyInstructions: [
        `Take this printed petition to the District Labour Office (DLSA free legal cell).`,
        `Total legal claim under statute: Rs. ${claim.totalStatutoryClaim.toLocaleString('en-IN')}/-.`,
        `Call Toll-Free Shramik Helpline: 14434 if contractor intimidates or threatens.`,
        `Do not sign blank vouchers or accept partial settlements without a formal receipt.`,
      ],
    },
  };
}
