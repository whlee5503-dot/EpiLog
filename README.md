# EpiLog — Offline Field Epidemiology Diary

> Part of the **PHT Lab** suite of free, open-source public health tools | MIT License

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-teal.svg)](https://epilog.phtlab.org)
[![Live App](https://img.shields.io/badge/Live-App-blue.svg)](https://epilog.phtlab.org)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20318922.svg)](https://doi.org/10.5281/zenodo.20318922)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20349994.svg)](https://doi.org/10.5281/zenodo.20349994)

---

## Overview

**EpiLog** is a free, open-source, offline-capable field diary for epidemiologists and public health workers, especially in low-resource settings.

Where field teams still record outbreak data on paper, transcription errors and delays of days or weeks before analysis are common. EpiLog is meant for the first days of an investigation: record what you find, see it on a map and a dashboard, and pass the numbers to EpiCalc for further analysis, all on one phone.

EpiLog is **not** a replacement for Go.Data, KoBoToolbox or DHIS2. It is designed for the early phase of an investigation before those systems are in place, for small teams, and for training.

**Live app:** https://epilog.phtlab.org (open in a browser, then install to your phone or PC)

---

## Key Features

| Feature | Description |
|---|---|
| 4-step field record | Basic info → Index patient(s) → Contacts → Epidemiological characteristics |
| Multiple index patients | Add or remove index patients within one record |
| Edit saved records | Correct or update a record after saving |
| GPS or manual coordinates | Collect GPS, or enter latitude/longitude by hand when GPS is unavailable |
| Map | Records coloured by transmission route, marker size by new cases, date filter, clustering |
| Dashboard | Epidemic curve, cumulative cases, transmission routes, AR / CFR / SAR |
| EpiCalc integration | "Analyze with EpiCalc" fills the SIR/SEIR simulator with population and case counts |
| Export | CSV and JSON download; share via WhatsApp or email |
| Optional encryption | Password protection (AES-256-GCM) with a recovery code |
| Languages | Korean and English. French is planned, and translation contributions for other languages are welcome |
| Dark / light theme | Switch from the header |
| Installable PWA | Works offline after installation |
| Free | No login, no registration, no fees |

---

## Target Users

- Field epidemiologists and public health workers conducting outbreak investigations
- FETP (Field Epidemiology Training Program) trainees and trainers
- Small teams and NGOs in the first days of an investigation

---

## Screens

- **Records list:** one card per record with attack rate and a transmission-route colour dot
- **New / edit record (4 steps):**
  - Step 1: date and time, location, facility type, at-risk population, GPS or manual coordinates
  - Step 2: index patients (one card each: sex, age, onset date, symptoms)
  - Step 3: contacts by type (household / colleague / community) and new cases
  - Step 4: transmission route, vaccination status, notes, save or save and analyze
- **Record detail:** full record, with delete, edit and "Analyze with EpiCalc"
- **Dashboard:** summary metrics, charts, section navigation, export
- **Map:** records on OpenStreetMap, filtered by date
- **Privacy & Security:** encryption, recovery code, privacy notice, guide

---

## Epidemiological Metrics

| Metric | Formula |
|---|---|
| Attack Rate (AR) | (New cases ÷ at-risk population) × 100 |
| Case Fatality Rate (CFR) | (Deaths ÷ cases) × 100 |
| Secondary Attack Rate (SAR) | ((New cases − index patients) ÷ total contacts) × 100, summed over records |

Notes:

- **New cases include the index patients** of the same record. SAR therefore subtracts them from the numerator.
- If a SAR result would exceed 100%, it is not shown, because the inputs do not match this definition.
- The dashboard shows SAR combined over all records. Combining unrelated outbreaks is hard to interpret; read it per event.
- The app shows the numbers only. It does not label them as low, moderate or high.
- The formulas are covered by unit tests (`npm test`).

---

## Privacy & Security

- Records are stored on your device (IndexedDB). They are not sent to any server, and there is no login.
- Optional password encryption (AES-256-GCM) with a recovery code. Encrypted records stay encrypted when edited.
- If both the password and the recovery code are lost, the app offers a confirmed reset, which deletes the stored data.
- When you tap "Analyze with EpiCalc", only aggregate numbers (population, cases, deaths) are passed to EpiCalc.
- Data export (CSV/JSON, WhatsApp, email) leaves the app only when you choose it.

---

## Offline Use

| Phase | Network needed |
|---|---|
| First load and install | Yes (once) |
| Data entry, editing, dashboard | No |
| GPS recording | No (device GPS only) |
| Map background tiles | Once, while online, for each area you want to see |
| Analyze with EpiCalc | No, once EpiCalc has also been opened or installed on the same device |
| Export | No (local download); sharing apps may need a connection |

All screens are precached at install. Install size is about 1.4 MB.

> **Recommended for field use:** install EpiLog (and EpiCalc) on Wi-Fi or a mobile connection before going to the field.

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Local database | Dexie.js (IndexedDB) |
| Charts | Recharts |
| Maps | Leaflet + OpenStreetMap, leaflet.markercluster |
| Icons | lucide-react (ISC) |
| PWA | vite-plugin-pwa + Workbox |
| Routing | React Router |
| Tests | Vitest |
| Hosting | Cloudflare Pages |

---

## Installation & Development

Prerequisites: Node.js 20+, npm 9+

```bash
git clone https://github.com/whlee5503-dot/EpiLog.git
cd EpiLog
npm install
npm run dev      # development server
npm test         # unit tests (Vitest)
npm run build    # production build
```

Any push to `main` is built and deployed automatically by Cloudflare Pages.

---

## PHT Lab Suite

EpiLog is one of six free, open-source tools by PHT Lab:

| App | Purpose |
|---|---|
| [EpiCalc](https://epi.chem-health-calc.com) | Epidemic simulation (SIR/SEIR/SEIRD), epi metrics, screening tests, biostatistics |
| [EpiStat](https://epistat.phtlab.org) | Epidemiology statistics (e.g. Mantel-Haenszel, sample size and power) |
| [EpiPlus](https://epiplus.phtlab.org) | Additional epidemiology and biostatistics calculators |
| [EpiLog](https://epilog.phtlab.org) | Offline field record keeping (this app) |
| [VaxGuard](https://vaxguard.phtlab.org) | Decision support for vaccines after a cold chain break |
| [EpiAid](https://epiaid.phtlab.org) | Dose calculator based on WHO guidance |

**Data flow with EpiCalc:** record in EpiLog → tap "Analyze with EpiCalc" → population and case counts fill the SIR/SEIR inputs.

---

## Compared with Other Tools

| Tool | Main limitation for early field use | EpiLog |
|---|---|---|
| KoBoToolbox / ODK | Built around server setup and sync | Single device, no server |
| DHIS2 | National system, needs institutional setup | Individual use, no setup |
| Epi Info (CDC) | CDC discontinued development and support in 2025; mobile apps were removed from app stores in Dec 2024 | Browser-based, installable, mobile-first |
| Paper notebooks | Transcription errors, delayed analysis | Digital, instant metrics, CSV export |

---

## Sustainable Development Goals

**SDG 3 — Good Health and Well-Being.** EpiLog aims to shorten the time between field data collection and first analysis.

---

## Project Status

- Open source (MIT)
- DPGA (Digital Public Goods Alliance) application: **GID0093669**, under review
- Collaborators and endorsements: University of Utah (faculty endorsement of EpiCalc); AFENET outreach is planned

---

## License

MIT License. See [LICENSE](LICENSE).

---

## Acknowledgments

- OpenStreetMap contributors (ODbL)
- WHO ICD symptom classification (public domain)
- CDC Field Epidemiology Manual
- Open-source libraries listed in [LICENSES.md](LICENSES.md)

---

## Contact

**Developer:** Won Ho Lee, PhD, MPH, MDiv
**GitHub:** https://github.com/whlee5503-dot/EpiLog
**Suite:** PHT Lab (phtlab.org)