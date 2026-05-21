import type { FieldRecord } from '../types/index';
import { attackRate, caseFatalityRate, formatRate } from './epiCalc';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

const CSV_COLUMNS = [
  'id', 'timestamp', 'location', 'facilityType',
  'totalPopulation', 'newCases', 'deaths',
  'hospitalized', 'household', 'colleague',
  'community', 'transmission', 'vaccinated',
  'symptoms', 'gps_lat', 'gps_lng', 'notes',
] as const;

function escapeCSV(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function recordToCSVRow(r: FieldRecord): string {
  const values = [
    r.id,
    r.timestamp,
    r.location,
    r.facilityType,
    r.totalPopulation,
    r.dailyCases.newCases,
    r.dailyCases.deaths,
    r.dailyCases.hospitalized,
    r.contacts.household,
    r.contacts.colleague,
    r.contacts.community,
    r.transmission,
    r.vaccinated,
    r.indexCase.symptoms.join(';'),
    r.gps?.lat,
    r.gps?.lng,
    r.notes,
  ];
  return values.map(escapeCSV).join(',');
}

export function exportToCSV(records: FieldRecord[]): void {
  const header = CSV_COLUMNS.join(',');
  const rows = records.map(recordToCSVRow);
  const csv = [header, ...rows].join('\n');
  triggerDownload(csv, `epilog_export_${todayString()}.csv`, 'text/csv;charset=utf-8;');
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

export function exportToJSON(records: FieldRecord[]): void {
  const json = JSON.stringify(records, null, 2);
  triggerDownload(json, `epilog_export_${todayString()}.json`, 'application/json');
}

// ─── Share ────────────────────────────────────────────────────────────────────

export function shareViaWhatsApp(summary: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(summary)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareViaEmail(subject: string, body: string): void {
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

// ─── Summary text ─────────────────────────────────────────────────────────────

export function generateSummaryText(records: FieldRecord[], lang: 'ko' | 'en'): string {
  const totalCases = records.reduce((s, r) => s + r.dailyCases.newCases, 0);
  const totalDeaths = records.reduce((s, r) => s + r.dailyCases.deaths, 0);
  const totalPopulation = records.reduce((s, r) => s + r.totalPopulation, 0);

  const ar = formatRate(attackRate(totalCases, totalPopulation));
  const cfr = formatRate(caseFatalityRate(totalDeaths, totalCases));

  const topLocations = [...records]
    .sort((a, b) => b.dailyCases.newCases - a.dailyCases.newCases)
    .slice(0, 3)
    .map((r) => r.location);

  if (lang === 'ko') {
    return [
      `[EpiLog 현장조사 요약]`,
      `조사 기록 수: ${records.length}건`,
      `총 환자 수: ${totalCases}명`,
      `발병률(AR): ${ar}`,
      `치명률(CFR): ${cfr}`,
      `주요 발생지역: ${topLocations.join(', ') || '-'}`,
      `생성일: ${todayString()}`,
    ].join('\n');
  }

  return [
    `[EpiLog Field Investigation Summary]`,
    `Records: ${records.length}`,
    `Total cases: ${totalCases}`,
    `Attack Rate (AR): ${ar}`,
    `Case Fatality Rate (CFR): ${cfr}`,
    `Key locations: ${topLocations.join(', ') || '-'}`,
    `Generated: ${todayString()}`,
  ].join('\n');
}

// ─── EpiCalc URL ──────────────────────────────────────────────────────────────

export function buildEpiCalcURL(record: FieldRecord): string {
  const base = 'https://epi.chem-health-calc.com';
  const params = new URLSearchParams({
    population: String(record.totalPopulation),
    cases: String(record.dailyCases.newCases),
    deaths: String(record.dailyCases.deaths),
  });
  return `${base}?${params.toString()}`;
}
