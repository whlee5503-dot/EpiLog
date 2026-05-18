/**
 * EpiLog — 현장 역학조사 앱 공통 타입 정의
 * Dexie.js(IndexedDB) 직렬화 호환: 모든 값은 plain-object 형태
 */

// ────────────────────────────────────────────────
// Union types
// ────────────────────────────────────────────────

/**
 * 전파 경로
 * - airborne   : 공기 전파
 * - droplet    : 비말 전파
 * - contact    : 접촉 전파
 * - foodborne  : 식품 매개
 * - waterborne : 수인성
 * - vector     : 매개체(모기·진드기 등)
 * - unknown    : 미상
 */
export type TransmissionRoute =
  | 'airborne'
  | 'droplet'
  | 'contact'
  | 'foodborne'
  | 'waterborne'
  | 'vector'
  | 'unknown';

/**
 * 예방접종 여부
 * - vaccinated   : 완전 접종
 * - partial      : 부분 접종
 * - unvaccinated : 미접종
 * - unknown      : 확인 불가
 */
export type VaccinationStatus =
  | 'vaccinated'
  | 'partial'
  | 'unvaccinated'
  | 'unknown';

// ────────────────────────────────────────────────
// Sub-interfaces
// ────────────────────────────────────────────────

/** GPS 좌표 */
export interface GpsCoords {
  /** 위도 (decimal degrees, WGS-84) */
  lat: number;
  /** 경도 (decimal degrees, WGS-84) */
  lng: number;
  /** 위치 정확도 (미터, Geolocation API 제공 시) */
  accuracy?: number;
}

/**
 * 지표 환자(Index Case) 정보
 * 역학조사에서 최초로 확인된 환자
 */
export interface IndexCase {
  /** 환자 이름 또는 익명 코드 (예: "홍길동", "P-001") */
  name: string;
  /** 성별 */
  gender: 'male' | 'female' | 'other' | 'unknown';
  /** 나이 (만 나이, 정수) */
  age: number;
  /** 증상 발생일 (ISO 8601 날짜 문자열, 예: "2026-05-18") */
  onsetDate: string;
  /** 주요 증상 목록 (예: ["발열", "기침", "호흡곤란"]) */
  symptoms: string[];
}

/**
 * 접촉자 분류별 수
 * WHO 접촉자 추적 기준에 따라 분류
 */
export interface ContactCount {
  /** 동거 가족(household) 접촉자 수 */
  household: number;
  /** 직장·학교 동료(colleague) 접촉자 수 */
  colleague: number;
  /** 지역사회(community) 접촉자 수 */
  community: number;
}

/**
 * 당일 발생 현황
 * 조사 당일 기준 신규 집계
 */
export interface DailyCases {
  /** 신규 확진(발생) 수 */
  newCases: number;
  /** 사망 수 */
  deaths: number;
  /** 신규 입원 수 */
  hospitalized: number;
}

// ────────────────────────────────────────────────
// Root record (Dexie Table entity)
// ────────────────────────────────────────────────

/**
 * 현장 역학조사 기록 전체
 *
 * Dexie 스키마 예시:
 * ```ts
 * db.version(1).stores({ fieldRecords: '++id, timestamp, location, facilityType' });
 * ```
 * `id`는 Dexie가 자동 발급하므로 삽입 시 생략 가능(`Omit<FieldRecord, 'id'>`).
 */
export interface FieldRecord {
  /**
   * 고유 식별자 — Dexie auto-increment primary key (`++id`)
   * 신규 레코드 생성 시 undefined; DB 저장 후 number로 채워짐
   */
  id?: number;

  /** 조사 생성 일시 (ISO 8601, 예: "2026-05-18T09:30:00+09:00") */
  timestamp: string;

  /** 발생 장소 명칭 (예: "○○초등학교", "△△요양원") */
  location: string;

  /**
   * 시설 유형
   * 예: "school" | "hospital" | "workplace" | "restaurant" | "household" | "community"
   */
  facilityType: string;

  /** 위험 노출 인구(총 대상자 수) */
  totalPopulation: number;

  /** 현장 GPS 좌표 (기기 위치 정보 미허용 시 undefined) */
  gps?: GpsCoords;

  /** 지표 환자 정보 */
  indexCase: IndexCase;

  /** 접촉자 분류별 수 */
  contacts: ContactCount;

  /** 당일 발생 현황 */
  dailyCases: DailyCases;

  /** 추정 전파 경로 */
  transmission: TransmissionRoute;

  /** 지표 환자의 예방접종 여부 */
  vaccinated: VaccinationStatus;

  /** 조사관 메모 및 특이사항 (자유 텍스트) */
  notes?: string;
}
