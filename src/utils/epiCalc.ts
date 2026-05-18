import type { FieldRecord } from '../types/index';

// ─── Output interface ─────────────────────────────────────────────────────────

/**
 * 전체 기록 집계 요약.
 * `summarizeRecords()`의 반환값으로 사용된다.
 */
export interface EpiSummary {
  /** 포함된 조사 기록 수 */
  recordCount: number;
  /** 신규 확진 누적 합계 */
  totalCases: number;
  /** 사망 누적 합계 */
  totalDeaths: number;
  /**
   * 접촉자 총 합계
   * (household + colleague + community) 의 전체 기록 합산
   */
  totalContacts: number;
  /**
   * 전체 발병률 (Attack Rate, %)
   * totalCases / 전체 totalPopulation 합산 × 100.
   * 분모가 0이면 null.
   */
  overallAR: number | null;
  /**
   * 전체 치명률 (Case Fatality Rate, %)
   * totalDeaths / totalCases × 100.
   * 분모가 0이면 null.
   */
  overallCFR: number | null;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** 음수를 0으로 보정한다. */
function clampPositive(n: number): number {
  return Math.max(0, n);
}

// ─── Rate functions ───────────────────────────────────────────────────────────

/**
 * 발병률 (Attack Rate, AR).
 *
 * AR = (cases / population) × 100
 *
 * @param cases      확진(발생) 수 — 음수는 0으로 보정
 * @param population 위험 노출 인구 — 0이면 null 반환
 * @returns 백분율(%) 또는 null
 */
export function attackRate(cases: number, population: number): number | null {
  const c = clampPositive(cases);
  const p = clampPositive(population);
  if (p === 0) return null;
  return (c / p) * 100;
}

/**
 * 치명률 (Case Fatality Rate, CFR).
 *
 * CFR = (deaths / cases) × 100
 *
 * @param deaths 사망 수 — 음수는 0으로 보정
 * @param cases  확진 수 — 0이면 null 반환
 * @returns 백분율(%) 또는 null
 */
export function caseFatalityRate(deaths: number, cases: number): number | null {
  const d = clampPositive(deaths);
  const c = clampPositive(cases);
  if (c === 0) return null;
  return (d / c) * 100;
}

/**
 * `caseFatalityRate`의 별칭.
 * 함수명 오기(caseLastalityRate)와의 하위 호환을 위해 유지한다.
 *
 * @deprecated `caseFatalityRate`를 사용하세요.
 */
export const caseLastalityRate = caseFatalityRate;

/**
 * 2차 발병률 (Secondary Attack Rate, SAR).
 *
 * SAR = (secondaryCases / contacts) × 100
 *
 * @param secondaryCases 2차 감염(접촉자 내 발생) 수 — 음수는 0으로 보정
 * @param contacts       노출 접촉자 총 수 — 0이면 null 반환
 * @returns 백분율(%) 또는 null
 */
export function secondaryAttackRate(
  secondaryCases: number,
  contacts: number,
): number | null {
  const s = clampPositive(secondaryCases);
  const c = clampPositive(contacts);
  if (c === 0) return null;
  return (s / c) * 100;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * 비율 값을 표시용 문자열로 변환한다.
 *
 * @param rate     `attackRate` 등이 반환한 값 (null 포함)
 * @param decimals 소수점 자릿수 (기본값: 1)
 * @returns null이면 `"-"`, 숫자면 `"XX.X%"` 형태
 *
 * @example
 * formatRate(null)        // "-"
 * formatRate(5.678)       // "5.7%"
 * formatRate(5.678, 2)    // "5.68%"
 * formatRate(100)         // "100.0%"
 */
export function formatRate(rate: number | null, decimals = 1): string {
  if (rate === null) return '-';
  return `${rate.toFixed(decimals)}%`;
}

// ─── Threshold ────────────────────────────────────────────────────────────────

/**
 * 집단면역 역치 (Herd Immunity Threshold, HIT).
 *
 * HIT = (1 − 1/R₀) × 100
 *
 * R₀ ≤ 1이면 자연적으로 유행이 소멸하므로 역치를 0으로 반환한다.
 * R₀ ≤ 0 입력은 0으로 보정한다.
 *
 * @param r0 기초감염재생산수 (Basic Reproduction Number) — 양수를 권장
 * @returns 집단면역 달성에 필요한 접종률(%) [0, 100)
 *
 * @example
 * herdImmunityThreshold(2)   // 50
 * herdImmunityThreshold(5)   // 80
 * herdImmunityThreshold(18)  // ~94.4 (홍역 수준)
 * herdImmunityThreshold(0.9) // 0 (R₀ < 1, 역치 없음)
 */
export function herdImmunityThreshold(r0: number): number {
  const safeR0 = clampPositive(r0);
  if (safeR0 <= 1) return 0;
  return (1 - 1 / safeR0) * 100;
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

/**
 * 복수의 현장 기록을 집계하여 요약 통계를 계산한다.
 *
 * - `totalCases`   : 모든 기록의 `dailyCases.newCases` 합산
 * - `totalDeaths`  : 모든 기록의 `dailyCases.deaths` 합산
 * - `totalContacts`: 모든 기록의 `contacts` (household + colleague + community) 합산
 * - `overallAR`    : totalCases / 모든 기록의 `totalPopulation` 합산 × 100
 * - `overallCFR`   : totalDeaths / totalCases × 100
 *
 * @param records `db.getRecords()`로 얻은 `FieldRecord` 배열
 * @returns {@link EpiSummary}
 */
export function summarizeRecords(records: FieldRecord[]): EpiSummary {
  let totalCases = 0;
  let totalDeaths = 0;
  let totalContacts = 0;
  let totalPopulation = 0;

  for (const r of records) {
    totalCases += clampPositive(r.dailyCases.newCases);
    totalDeaths += clampPositive(r.dailyCases.deaths);
    totalContacts +=
      clampPositive(r.contacts.household) +
      clampPositive(r.contacts.colleague) +
      clampPositive(r.contacts.community);
    totalPopulation += clampPositive(r.totalPopulation);
  }

  return {
    recordCount: records.length,
    totalCases,
    totalDeaths,
    totalContacts,
    overallAR: attackRate(totalCases, totalPopulation),
    overallCFR: caseFatalityRate(totalDeaths, totalCases),
  };
}
