# PravasiMitra (প্রবাসী মিত্র / प्रवासी मित्र)
## Inter-State Migrant Labor Rights & Wage Dispute Companion

> **Zero-Backend Pure Frontend Single Page Application (SPA)** powered by **Sarvam AI Indic Cloud Intelligence**.
> Converts raw vernacular voice testimonies and crumpled attendance slips into legally enforceable administrative grievance petitions within 60 seconds.

---

## 1. The Problem: Linguistic Isolation in Indian Labor Migration
Over **100 million inter-state migrant workers** form the economic foundation of Indian construction, textiles, manufacturing, agriculture, and infrastructure.

Every year, millions migrate across linguistic and cultural boundaries:
- From **Bihar, Jharkhand, and Uttar Pradesh** (speaking Bhojpuri/Hindi) to industrial zones in **Kerala** (Malayalam) or **Karnataka** (Kannada).
- From **West Bengal and Assam** (speaking Bengali/Assamese) to **Bengaluru** (Kannada) or **Tamil Nadu** (Tamil).
- From **Odisha** (speaking Odia) to the textile powerlooms of **Surat, Gujarat** (Gujarati).

When workers face wage theft or contractor abandonment:
1. **Linguistic Isolation**: Workers cannot draft administrative complaints in the official script of the host state (Malayalam, Kannada, Marathi, Tamil, etc.).
2. **Informal Records**: Documentation consists solely of handwritten attendance diaries (*Hajiri Khata*), gate passes, or informal cash vouchers (*Kharcha*).
3. **Bureaucratic Gatekeeping**: District Labour Officers and Legal Services Authorities require formal petitions citing statutory sections and joint liability under the Inter-State Migrant Workmen Act.
4. **Result**: Workers forfeit months of hard-earned wages and return home empty-handed.

---

## 2. The Pure Frontend Architecture

PravasiMitra is engineered as a **100% client-side, zero-backend Single Page Application**.
All communication with Sarvam AI cloud services occurs directly via secure browser-to-cloud HTTPS fetch calls using the `api-subscription-key` header.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PravasiMitra Web Application (SPA)                   │
│                                                                        │
│  - Web Audio Recorder (MediaRecorder API + live Canvas visualizer)     │
│  - Interactive Evidence Dropzone (Zoom, Rotate, Document Inspector)    │
│  - In-Browser API Key Manager (localStorage + .env fallback)           │
│  - Statutory Wage Reckoner & Indian Labor Law Calculation Engine       │
│  - Dual Administrative Petition Viewer & Clean Printable PDF Layout    │
│  - Bulbul Spoken Advisory Player & WhatsApp Legal Aid Exporter         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Direct HTTPS Fetch
                                    │ (api-subscription-key)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Sarvam AI Cloud APIs                          │
│                                                                        │
│  1. Speech-to-Text: POST https://api.sarvam.ai/speech-to-text         │
│     (Saaras:v4 - Indic Code-Mixed Speech Recognition)                  │
│                                                                        │
│  2. Legal Reasoning: POST https://api.sarvam.ai/v1/chat/completions    │
│     (Sarvam-105B - Statutory Analysis & Joint Employer Liability)      │
│                                                                        │
│  3. Administrative Translation: POST https://api.sarvam.ai/translate   │
│     (Mayura:v1 - Official State Script Legal Drafting)                 │
│                                                                        │
│  4. Spoken Advisory: POST https://api.sarvam.ai/text-to-speech         │
│     (Bulbul:v4-flash - Reassuring Native Mother-Tongue Voice)          │
│                                                                        │
│  5. Document Intelligence / OCR: POST https://api.sarvam.ai/doc-ai     │
│     (Handwritten Hajiri Slip & Gate Pass Digitization)                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Why Pure Frontend?
- **Zero Server Overhead**: Host on static edge providers (Vercel, Cloudflare Pages, GitHub Pages) with zero runtime server costs.
- **Worker Privacy**: Sensitive labor dispute data and audio recordings remain strictly on the user's browser without passing through intermediary proxy databases.
- **Instant Response**: Real-time Web Audio API analysis, canvas waveforms, and immediate PDF printing.

---

## 3. Sarvam AI Service Integration Matrix

| Service | Sarvam Model | Endpoint | Purpose in PravasiMitra |
| :--- | :--- | :--- | :--- |
| **Speech-to-Text** | `saaras:v4` | `/speech-to-text` | Transcribes colloquial rural dialects (Bhojpuri, Bengali, Odia) and code-mixed trade terminology (*thekedar*, *hajiri*, *kharcha*). |
| **Legal Reasoning** | `sarvam-105b` | `/v1/chat/completions` | Identifies statutory violations under ISMW Act 1979 and Payment of Wages Act 1936; articulates Principal Employer liability. |
| **Translation** | `mayura:v1` | `/translate` | Formats formal administrative grievances in the official host language (Malayalam, Kannada, Marathi, Tamil, Gujarati). |
| **Text-to-Speech** | `bulbul:v4-flash` | `/text-to-speech` | Synthesizes spoken audio advice in the worker's native tongue explaining claimed dues, helpline numbers, and safety steps. |
| **Document AI** | Document Digitise | `/doc-ai/v1/job/digitise` | Extracts structured dates, daily rates, and signatures from handwritten *Hajiri Khata* cards. |

---

## 4. Statutory Legal Basis

PravasiMitra enforces four core Indian labor statutes:

1. **The Inter-State Migrant Workmen (RECS) Act, 1979**:
   - **Section 14 (Displacement Allowance)**: 50% of monthly wages or Rs. 75, whichever is higher, payable at recruitment (non-refundable).
   - **Section 15 (Journey Allowance)**: Bus/train travel fare from home residence to worksite and return, plus wages during transit period.
   - **Section 21 (Principal Employer Joint Liability)**: If the contractor fails to pay wages, the Principal Employer is strictly bound to disburse the entire unpaid sum.

2. **The Payment of Wages Act, 1936**:
   - **Section 5 (Time of Payment)**: Wages must be disbursed within 7 to 10 days of the wage period completion.
   - **Section 15(3) (Penalty)**: Authority may award up to 10x the withheld wage as statutory compensation.

3. **The Minimum Wages Act, 1948**:
   - **Section 12**: Mandatory payment of the host state statutory floor wage regardless of verbal contractor agreements.
   - **Section 25**: Contracting out or verbal waivers are legally null and void.

4. **The Building & Other Construction Workers (BOCW) Act, 1996**:
   - **Section 44**: 2x double overtime rates for work beyond 8 hours a day.

---

## 5. Quick Start & Local Setup

### Prerequisites
- Node.js v18+ or v20+ or v22+
- npm v9+

### Installation
```bash
# Navigate to the pravasimitra directory
cd pravasimitra

# Install dependencies
npm install

# Run Vite development server
npm run dev
```

The application will be live at `http://localhost:3000`.

### Building for Production
```bash
# Type check and build optimized static assets
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Configuring the Sarvam API Key

You can configure your Sarvam API Key in two ways:

1. **In-Browser UI (Recommended for Testing & Demos)**:
   - Click the **"Sarvam Key"** button in the top navigation bar.
   - Paste your API key from [dashboard.sarvam.ai](https://dashboard.sarvam.ai).
   - Click **"Test Connection"** to verify live communication with Sarvam Cloud.
   - Click **"Save & Apply"**. The key is securely stored in your browser's `localStorage`.

2. **Environment Variable**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Set your key:
     ```env
     VITE_SARVAM_API_KEY=your_actual_sarvam_api_key_here
     ```

3. **High-Fidelity Smart Simulation Mode (Zero-Key Demo)**:
   - If no API key is provided, PravasiMitra automatically runs in **Smart Simulation Mode**.
   - Comes preloaded with 3 realistic migrant worker dispute test cases (Ramesh Kumar - Bihar to Kerala; Subhash Mondal - WB to Bengaluru; Pravat Jena - Odisha to Surat).
   - Audio recordings, attendance cards, statutory calculations, and audio playback work out-of-the-box.

---

## 7. National Helplines & Legal Aid
- **Ministry of Labour Toll-Free Shramik Helpline**: `14434` (24x7)
- **National Legal Services Authority (NALSA) Free Legal Aid**: `15100`
