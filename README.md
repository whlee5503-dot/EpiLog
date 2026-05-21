# EpiLog — Offline Field Epidemiology Digital Diary

> **EpiCalc Suite — Module 2**
> *Part of the EpiCalc Suite | MIT License | Open Source*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-teal.svg)](https://epilog-d72.pages.dev)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue.svg)](https://epilog-d72.pages.dev)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20318922.svg)](https://doi.org/10.5281/zenodo.20318922)

---

## 🌍 Overview

**EpiLog** is a free, open-source, offline-capable digital field diary designed specifically for epidemiologists and public health workers in **low-resource settings**.

In under-resourced environments across Africa and other developing regions, field epidemiologists still rely on paper notebooks to record outbreak data — leading to data loss, transcription errors, and delays of days or weeks before analysis can begin. EpiLog bridges this critical gap.

> *"From Field Logging to Instant Analytics — Anywhere, Offline."*

EpiLog seamlessly integrates with **EpiCalc** (Module 1 of the EpiCalc Suite), enabling field workers to collect data and perform real-time epidemiological analysis — all within a single smartphone browser, without internet connectivity.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📋 **4-Step Field Diary** | Structured data entry: Basic Info → Index Case → Contacts → Epi Characteristics |
| 📊 **Auto Calculations** | Attack Rate, Case Fatality Rate, Secondary Attack Rate — computed instantly |
| 📈 **Outbreak Dashboard** | Epidemic curve, cumulative trend, transmission route distribution |
| 📤 **Data Export** | CSV & JSON download, WhatsApp & email sharing |
| 🔗 **EpiCalc Integration** | One-tap transfer to EpiCalc for SIR/SEIR simulation |
| 🌐 **Bilingual** | Korean / English language toggle |
| 🌙 **Dark / Light Mode** | Automatic theme switching |
| 📱 **PWA — Offline Ready** | Installable on any smartphone, works without internet |
| 🔒 **Privacy First** | All data stored locally on device — never leaves the phone |
| 🆓 **Completely Free** | No login, no registration, no fees |

---

## 🎯 Target Users

- Field epidemiologists in low-resource settings (Africa, Southeast Asia, etc.)
- Public health workers conducting outbreak investigations
- FETP (Field Epidemiology Training Program) trainees
- NGO health workers in remote areas

---

## 🚀 Live Demo

**Try EpiLog now:** [https://epilog-d72.pages.dev](https://epilog-d72.pages.dev)

No installation required — open in any mobile browser and tap "Add to Home Screen" to install as a PWA.

---

## 📱 Screenshots

### Field Records List
- Summary statistics (Total Records, Cumulative Cases, Deaths)
- Per-record cards with Attack Rate auto-calculated
- Dark mode support

### 4-Step Data Entry
- **Step 1:** Survey date/time (auto), location, facility type, at-risk population, GPS
- **Step 2:** Index case — gender, age, onset date, symptom checklist (9 symptoms)
- **Step 3:** Contact classification (Household / Colleague / Community) + daily cases counter
- **Step 4:** Transmission route, vaccination status, notes, Save & EpiCalc buttons

### Outbreak Dashboard
- Epidemic Curve (bar chart)
- Cumulative Cases trend (line chart)
- Epi Metrics: AR / CFR / SAR with interpretation (Low / Moderate / High)
- Transmission Routes (donut chart)
- Export: CSV, JSON, WhatsApp, Email

---

## 🏗️ Tech Stack

| Component | Technology |
|---|---|
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Local Database | Dexie.js (IndexedDB) |
| Charts | Recharts |
| Icons | lucide-react (ISC License) |
| PWA | vite-plugin-pwa + Workbox |
| Routing | React Router v6 |
| Date handling | date-fns |
| CSV export | papaparse |
| Hosting | Cloudflare Pages |

---

## 🔧 Installation & Development

### Prerequisites
- Node.js 20+
- npm 9+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/whlee5503-dot/EpiLog.git
cd EpiLog

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deploy
The project is configured for automatic deployment via **Cloudflare Pages**.
Any push to the `main` branch triggers an automatic build and deployment.

---

## 📊 Epidemiological Metrics

EpiLog automatically calculates the following metrics from entered data:

| Metric | Formula | Interpretation |
|---|---|---|
| Attack Rate (AR) | (Cases / At-risk Population) × 100 | <5% Low / 5–20% Moderate / >20% High |
| Case Fatality Rate (CFR) | (Deaths / Cases) × 100 | <1% Low / 1–5% Moderate / >5% High |
| Secondary Attack Rate (SAR) | (Secondary Cases / Contacts) × 100 | <10% Low / 10–25% Moderate / >25% High |

---

## 🔗 EpiCalc Integration

EpiLog is **Module 2** of the **EpiCalc Suite**:

| Module | Role | Status |
|---|---|---|
| **EpiCalc** (Module 1) | Brain — SIR/SEIR simulation, epi metrics, screening tests, biostatistics | ✅ Live |
| **EpiLog** (Module 2) | Hands & Feet — field data collection, offline diary, secure local storage | ✅ Live |

**Data flow:**
1. Field worker records outbreak data in EpiLog
2. Taps "Analyze with EpiCalc" button
3. Data auto-populates EpiCalc's SIR model inputs
4. Instant epidemic simulation — all on one smartphone, offline

**EpiCalc:** [https://chem-health-calc.com](https://chem-health-calc.com)

---

## 🛡️ Privacy & Security

- **Zero server transmission** — all patient data stays on the device
- **IRB-friendly** — no cloud sync, no external data exposure
- **GDPR-compatible** — no personal data leaves the user's phone
- **Local IndexedDB storage** — survives app restarts, no 5MB localStorage limit

---

## 🌱 Sustainable Development Goals

EpiLog directly contributes to:

- **SDG 3** — Good Health and Well-Being
  - Strengthens health emergency response in low-resource settings
  - Reduces time-to-analysis from days/weeks to **zero** (field-instant)
  - Empowers frontline health workers with real-time decision support

---

## 📋 Existing Solutions Comparison

| Tool | Key Limitation | EpiLog Advantage |
|---|---|---|
| KoboToolbox | Server sync required, no instant analytics | 100% offline, instant EpiCalc integration |
| ODK | Server setup required, limited iOS support | PWA — no install, all platforms |
| DHIS2 | National system integration required | Individual use, no server needed |
| Epi Info (CDC) | PC-first UI, poor mobile UX | Mobile-first design |
| Paper notebooks | Data loss, transcription errors, days of delay | Digital, instant analysis, instant sharing |

---

## 🤝 Strategic Partnerships

- **University of Utah** — Division of Public Health (faculty endorsement of EpiCalc)
- **AFENET** — African Field Epidemiology Network (prospective collaboration)
- **DPGA** — Digital Public Goods Alliance (EpiCalc: Application ID GID0093635)

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

This software is free to use, modify, and distribute for any purpose, including commercial use.

---

## 🙏 Acknowledgments

- WHO ICD-10/11 symptom classification (Public Domain)
- CDC Field Epidemiology Manual guidelines
- OpenStreetMap contributors (ODbL License)
- All open-source libraries listed in [LICENSES.md](LICENSES.md)

---

## 📬 Contact

**Developer:** Won Ho Lee, PhD, MPH, MDiv  
**Project:** EpiCalc Suite  
**GitHub:** [https://github.com/whlee5503-dot/EpiLog](https://github.com/whlee5503-dot/EpiLog)  
**EpiCalc:** [https://chem-health-calc.com](https://chem-health-calc.com)

---

*EpiCalc Suite — Log with EpiLog, Analyze with EpiCalc, Instantly.*
