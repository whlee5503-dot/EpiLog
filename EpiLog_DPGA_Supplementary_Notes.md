# EpiLog — DPGA Application Supplementary Notes

**Application ID:** GID0093669  
**Developer:** Won Ho Lee, Ph.D., MPH, MDiv | EpiCalc Suite  
**Prepared:** May 26, 2026  
**Purpose:** Proactive supplementary clarifications to support DPGA review. This document addresses potential reviewer questions on interoperability, data validation, and technical architecture. Ready to submit upon request.

---

## Correction Notice

> ⚠️ The original application document contains an error in the developer title.  
> **Incorrect:** Won Ho Lee, MD  
> **Correct:** Won Ho Lee, Ph.D. (Chemical Engineering), MPH, MDiv  
> This correction applies to all instances in the original submission (Sections 1, 4, and signature line).

---

## Supplement A — DHIS2 Interoperability (Question 11 Addition)

*This section supplements the original answer to Question 11 (Open Standards).*

### Design Alignment with DHIS2 Data Model

EpiLog is architecturally positioned as a **Tier-1 offline data capture layer** that feeds into — rather than competes with — national health information systems such as DHIS2, which is deployed by over 80% of health ministries across sub-Saharan Africa.

EpiLog's JSON export structure is deliberately aligned with the **DHIS2 Event data model**. The core data fields map directly to DHIS2 program elements as follows:

| EpiLog Field | DHIS2 Equivalent | Notes |
|---|---|---|
| `location` (survey area) | `orgUnit` | Organization unit identifier |
| `timestamp` (auto-recorded) | `eventDate` | ISO 8601 format |
| `dailyCases.confirmed` | `dataValue` (cases) | Numeric data element |
| `contacts.household / colleague / community` | `dataValue` (contact type) | Categorical data element |
| `transmission` (route) | `dataValue` (transmission route) | Categorical data element |
| `dailyCases.deaths` | `dataValue` (deaths) | Numeric data element |
| `gps.lat / gps.lng` | `coordinate` | GeoJSON point |

This design enables field workers to collect data offline in EpiLog and subsequently **import records into a national DHIS2 instance when connectivity is restored**, without requiring manual re-entry or custom middleware.

### Practical Integration Pathway

The recommended workflow for DHIS2-integrated deployments is:

1. Field worker collects outbreak data offline in EpiLog (PWA, no internet required)
2. EpiLog instantly calculates AR, CFR, SAR at the point of care
3. Upon connectivity restoration, worker exports data as JSON from EpiLog
4. JSON is transformed to DHIS2 Event format using a lightweight mapping script (field-to-field, no data loss)
5. Transformed data is uploaded to the national DHIS2 instance via DHIS2 Import API

A DHIS2 import guide and field mapping reference will be maintained in the project documentation:  
📄 [https://github.com/whlee5503-dot/EpiLog](https://github.com/whlee5503-dot/EpiLog)

### Clarification on Positioning vs. DHIS2

EpiLog and DHIS2 operate at **different tiers of the health information architecture**:

- **DHIS2** — Tier 3: National/district-level aggregate reporting system. Requires institutional IT infrastructure, server connectivity, and admin configuration.
- **EpiLog** — Tier 1: Individual field worker tool. Zero setup, zero connectivity required, deployed on personal smartphone in minutes.

EpiLog solves the **last-mile data capture problem** that DHIS2 alone cannot address: the days or weeks between field data collection and entry into national systems. EpiLog reduces this delay to zero, then feeds clean, structured data upstream to DHIS2.

---

## Supplement B — Offline Sync & Conflict Resolution (Architecture Clarification)

*This section clarifies the architectural rationale for EpiLog's single-device design.*

### Design Philosophy: Privacy-First Single-Device Architecture

EpiLog is intentionally designed for **one epidemiologist, one device** operation. This is not a limitation — it is a deliberate architectural decision aligned with the realities of field epidemiology and the application's Privacy First core value.

**Why single-device design is appropriate:**

In standard field epidemiology practice (WHO FETP protocol), each field officer is assigned a defined geographic zone and is personally responsible for that zone's surveillance data. Multi-device concurrent data entry into a shared database is not a standard field workflow. The typical data flow is:

> Individual field worker → collects zone data → exports/shares to supervisor → supervisor aggregates → national system

EpiLog mirrors this workflow exactly. Conflict resolution mechanisms (e.g., CouchDB/PouchDB-style vector clocks) are architecturally incompatible with EpiLog's core constraint: **patient data must never leave the device**.

Any multi-device sync mechanism, by definition, requires data transmission between devices — which would violate GDPR compliance, IRB-friendly design, and the zero-server-transmission privacy guarantee that makes EpiLog uniquely deployable in sensitive contexts without institutional data agreements.

### For Multi-Worker Deployments

In scenarios where multiple field workers are collecting data in the same outbreak zone, the recommended workflow is:

1. Each worker uses their own EpiLog instance on their own device (no conflict possible)
2. Each worker exports their CSV/JSON at the end of the field day
3. A supervisor aggregates the exported files offline or via WhatsApp/email
4. Aggregated data is uploaded to DHIS2 or shared with the analysis team

This is consistent with WHO and CDC FETP field protocols and requires no cloud infrastructure.

---

## Supplement C — Real-World Validation Status (Question 15 Clarification)

*This section clarifies the validation methodology described in Question 15.*

### Current Validation Status

EpiLog's functional validation has been conducted through **three simulation-based field scenarios** designed according to WHO and CDC FETP standard protocols. These scenarios were explicitly chosen to represent the full spectrum of real-world field conditions:

| Scenario | Setting | Key Validation Target |
|---|---|---|
| A — School Foodborne Outbreak | Kenya, Kisumu County | AR auto-calculation accuracy; EpiCalc data transfer |
| B — Rural Respiratory Cluster | Ethiopia, Oromia Region | SAR calculation; SIR model auto-population |
| C — Early-Stage Incomplete Data | Uganda, Kampala slum | Graceful handling of missing fields; incomplete AR warning |

All three scenarios confirmed correct epidemiological metric calculation, complete offline functionality, and successful EpiCalc integration.

### Prospective Field Validation Plan

Upon DPGA registry approval, formal outreach to **AFENET (African Field Epidemiology Network)** will be initiated. The planned field validation protocol includes:

- **Target:** Structured usability testing with trained field epidemiologists in at least **two sub-Saharan African countries** within 12 months of DPGA approval
- **Method:** Guided scenario-based testing using standardized WHO FETP outbreak scenarios, followed by semi-structured interviews
- **Outcome measures:** Task completion rate, data entry accuracy, time-to-analysis, subjective usability (SUS score)
- **IRB:** Not required (simulation-based testing with trained professionals, no patient data involved)

AFENET contact has been initiated and a formal collaboration proposal — including the EpiLog Quick Start Guide (bilingual Korean/English) — is being prepared for submission.

---

## Supplement D — Development Status Correction (Question 19 Roadmap)

*The original application roadmap requires correction. Stages 4 and 5 are now complete.*

### Corrected Roadmap

| Stage | Features | Status | Completion Date |
|---|---|---|---|
| Stage 1 | 4-step field diary, offline PWA, local storage | ✅ Complete | May 2026 |
| Stage 2 | Outbreak dashboard, epidemic curve, epi metrics | ✅ Complete | May 2026 |
| Stage 3 | EpiCalc integration, CSV/JSON export, WhatsApp/email sharing | ✅ Complete | May 2026 |
| Stage 4 | AES-256-GCM local encryption, GPS coordinates, Leaflet/OSM offline maps | ✅ Complete | May 2026 |
| Stage 5 | EpiCalc Suite branding unification, Zenodo DOI registration, GitHub v1.1.1 Release | ✅ Complete | May 2026 |
| Stage 6 | DHIS2-compatible export guide, multilingual support (French, Swahili), custom domain (epilog.chem-health-calc.com) | 🔄 Planned | Post-DPGA approval |

### Zenodo DOI (Updated)

- EpiLog stable release: `10.5281/zenodo.20349994` (GitHub-linked, v1.1.1)
- EpiLog DPGA notification DOI: `10.5281/zenodo.20318922`

---

## Summary of Key Strengths for Reviewer Reference

| Criterion | EpiLog Response |
|---|---|
| Open License | MIT — confirmed, all dependencies MIT/Apache-2.0/ISC |
| Platform Independence | PWA — runs on any modern browser, any OS, no installation |
| Open Standards | HTML5, PWA (W3C), IndexedDB (W3C), JSON (ECMA-404), CSV (RFC 4180); DHIS2 Event data model alignment |
| Privacy & Security | Zero server transmission; AES-256-GCM local encryption; IRB-friendly; GDPR-compatible |
| Do No Harm | Metrics presented as estimates; no clinical diagnosis; WHO/CDC formula compliance |
| SDG Alignment | SDG 3.3, 3.8, 3.d — directly reduces time-to-analysis from days/weeks to zero |
| Community | EpiCalc Suite ecosystem; University of Utah faculty endorsement; AFENET outreach in progress |
| Interoperability | DHIS2 Event data model alignment; CSV/JSON export; EpiCalc Suite integration |

---

*EpiCalc Suite — Log with EpiLog, Analyze with EpiCalc, Instantly.*  
*Developer: Won Ho Lee, Ph.D., MPH, MDiv | whlee5503@gmail.com*  
*GitHub: https://github.com/whlee5503-dot/EpiLog*
