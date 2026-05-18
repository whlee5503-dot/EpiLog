import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  BarChart2,
  Plus,
  Minus,
  Loader2,
  Navigation,
  MapPin,
} from 'lucide-react';
import { db } from '../db/database';
import type { FieldRecord, TransmissionRoute, VaccinationStatus } from '../types/index';

// ─── Constants ────────────────────────────────────────────────────────────────

const SYMPTOMS = ['발열', '기침', '설사', '구토', '발진', '호흡곤란', '두통', '근육통'];

const FACILITY_TYPES: { value: string; label: string }[] = [
  { value: 'school', label: '학교' },
  { value: 'hospital', label: '병원/의료기관' },
  { value: 'workplace', label: '직장' },
  { value: 'restaurant', label: '식당/음식점' },
  { value: 'household', label: '가정' },
  { value: 'community', label: '지역사회' },
];

const TRANSMISSION_OPTIONS: { value: TransmissionRoute; label: string }[] = [
  { value: 'droplet', label: '비말 전파' },
  { value: 'contact', label: '접촉 전파' },
  { value: 'waterborne', label: '수인성' },
  { value: 'foodborne', label: '식품 매개' },
  { value: 'vector', label: '매개체(벡터)' },
];

const VACCINATION_OPTIONS: { value: VaccinationStatus; label: string }[] = [
  { value: 'vaccinated', label: '완전 접종' },
  { value: 'partial', label: '부분 접종' },
  { value: 'unvaccinated', label: '미접종' },
  { value: 'unknown', label: '확인 불가' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: '남' },
  { value: 'female', label: '여' },
  { value: 'other', label: '기타' },
  { value: 'unknown', label: '미상' },
] as const;

const STEP_LABELS = ['기본정보', '지표환자', '접촉자', '역학특성'];

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = Omit<FieldRecord, 'id'>;

function initForm(): FormData {
  return {
    timestamp: new Date().toISOString(),
    location: '',
    facilityType: 'school',
    totalPopulation: 0,
    gps: undefined,
    indexCase: {
      name: '',
      gender: 'unknown',
      age: 0,
      onsetDate: new Date().toISOString().split('T')[0],
      symptoms: [],
    },
    contacts: { household: 0, colleague: 0, community: 0 },
    dailyCases: { newCases: 0, deaths: 0, hospitalized: 0 },
    transmission: 'unknown',
    vaccinated: 'unknown',
    notes: '',
  };
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 touch-manipulation"
        >
          <Minus size={14} className="text-gray-600" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-16 h-8 text-center text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center active:bg-teal-700 touch-manipulation"
        >
          <Plus size={14} className="text-white" />
        </button>
      </div>
    </div>
  );
}

function SegmentedButtons<T extends string>({
  options,
  value,
  onChange,
  cols = 3,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  cols?: number;
}) {
  const colClass: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };
  return (
    <div className={`grid ${colClass[cols] ?? 'grid-cols-3'} gap-1.5`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`py-2 rounded-xl text-sm font-medium border touch-manipulation transition-colors ${
            value === opt.value
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-gray-700 border-gray-300 active:bg-gray-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewRecord() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initForm);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const TOTAL_STEPS = 4;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const collectGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('이 기기에서 위치 정보를 지원하지 않습니다.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          gps: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
        }));
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(`위치 수집 실패: ${err.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const toggleSymptom = (symptom: string) => {
    setForm((prev) => {
      const has = prev.indexCase.symptoms.includes(symptom);
      return {
        ...prev,
        indexCase: {
          ...prev.indexCase,
          symptoms: has
            ? prev.indexCase.symptoms.filter((s) => s !== symptom)
            : [...prev.indexCase.symptoms, symptom],
        },
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await db.addRecord(form);
      navigate('/');
    } catch (e) {
      console.error('저장 실패:', e);
      setSaving(false);
    }
  };

  const canProceed = step === 1 ? form.location.trim() !== '' : true;

  // ─── Step renders ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-3">
            {/* Timestamp */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">조사 일시</span>
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                {(() => {
                  const d = new Date(form.timestamp);
                  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                })()}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                발생 장소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="예: ○○초등학교, △△요양원"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Facility type */}
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap pt-1.5">시설 유형</span>
              <div className="flex-1">
                <SegmentedButtons
                  options={FACILITY_TYPES}
                  value={form.facilityType}
                  onChange={(v) => setForm((p) => ({ ...p, facilityType: v }))}
                  cols={3}
                />
              </div>
            </div>

            {/* Total population */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                위험 노출 인구 (명)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                value={form.totalPopulation || ''}
                onChange={(e) =>
                  setForm((p) => ({ ...p, totalPopulation: parseInt(e.target.value) || 0 }))
                }
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* GPS */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">GPS 좌표</span>
              <div className="flex-1">
                {form.gps ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-xl">
                    <MapPin size={14} className="text-teal-600 shrink-0" />
                    <span className="text-sm text-teal-700 truncate">
                      {form.gps.lat.toFixed(4)}, {form.gps.lng.toFixed(4)}
                      {form.gps.accuracy != null && ` (±${Math.round(form.gps.accuracy)}m)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, gps: undefined }))}
                      className="ml-auto text-xs text-gray-400 underline touch-manipulation shrink-0"
                    >
                      재수집
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={collectGps}
                    disabled={gpsLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-teal-300 rounded-xl text-teal-600 font-medium text-sm active:bg-teal-50 disabled:opacity-50 touch-manipulation"
                  >
                    {gpsLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        위치 수집 중…
                      </>
                    ) : (
                      <>
                        <Navigation size={14} />
                        GPS 수집
                      </>
                    )}
                  </button>
                )}
                {gpsError && <p className="mt-1 text-xs text-red-500">{gpsError}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            {/* Name */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                환자명{' '}
                <span className="text-xs text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                type="text"
                placeholder="이름 또는 익명 코드 (예: P-001)"
                value={form.indexCase.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, indexCase: { ...p.indexCase, name: e.target.value } }))
                }
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Gender */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">성별</span>
              <div className="flex-1">
                <SegmentedButtons
                  options={GENDER_OPTIONS}
                  value={form.indexCase.gender}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, indexCase: { ...p.indexCase, gender: v } }))
                  }
                  cols={4}
                />
              </div>
            </div>

            {/* Age + onset date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0">
                  나이 (만)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={130}
                  placeholder="0"
                  value={form.indexCase.age || ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      indexCase: { ...p.indexCase, age: parseInt(e.target.value) || 0 },
                    }))
                  }
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0">
                  발생일
                </label>
                <input
                  type="date"
                  value={form.indexCase.onsetDate}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      indexCase: { ...p.indexCase, onsetDate: e.target.value },
                    }))
                  }
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 text-left mb-2">
                주요 증상
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SYMPTOMS.map((symptom) => {
                  const selected = form.indexCase.symptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`py-2 rounded-xl text-sm font-medium border touch-manipulation transition-colors ${
                        selected
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-gray-700 border-gray-300 active:bg-gray-50'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            {/* Contacts */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                접촉자 분류
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl px-4">
                <Counter
                  label="동거 가족 (Household)"
                  value={form.contacts.household}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, contacts: { ...p.contacts, household: v } }))
                  }
                />
                <Counter
                  label="직장/학교 (Colleague)"
                  value={form.contacts.colleague}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, contacts: { ...p.contacts, colleague: v } }))
                  }
                />
                <Counter
                  label="지역사회 (Community)"
                  value={form.contacts.community}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, contacts: { ...p.contacts, community: v } }))
                  }
                />
              </div>
              <p className="mt-1 text-xs text-gray-400 text-right">
                총{' '}
                {form.contacts.household + form.contacts.colleague + form.contacts.community}명
              </p>
            </div>

            {/* Daily cases */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                당일 발생 현황
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl px-4">
                <Counter
                  label="신규 확진"
                  value={form.dailyCases.newCases}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, dailyCases: { ...p.dailyCases, newCases: v } }))
                  }
                />
                <Counter
                  label="사망"
                  value={form.dailyCases.deaths}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, dailyCases: { ...p.dailyCases, deaths: v } }))
                  }
                />
                <Counter
                  label="신규 입원"
                  value={form.dailyCases.hospitalized}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, dailyCases: { ...p.dailyCases, hospitalized: v } }))
                  }
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            {/* Transmission */}
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap pt-1.5">
                추정 전파 경로
              </span>
              <div className="flex-1">
                <SegmentedButtons
                  options={TRANSMISSION_OPTIONS}
                  value={form.transmission}
                  onChange={(v) => setForm((p) => ({ ...p, transmission: v }))}
                  cols={2}
                />
              </div>
            </div>

            {/* Vaccination */}
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap pt-1.5">
                예방접종 여부
              </span>
              <div className="flex-1">
                <SegmentedButtons
                  options={VACCINATION_OPTIONS}
                  value={form.vaccinated}
                  onChange={(v) => setForm((p) => ({ ...p, vaccinated: v }))}
                  cols={2}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 text-left mb-1">
                메모 및 특이사항
              </label>
              <textarea
                rows={4}
                placeholder="조사관 메모, 특이사항을 자유롭게 입력하세요"
                value={form.notes ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-4 bg-teal-600 text-white rounded-2xl font-semibold text-base active:bg-teal-700 disabled:opacity-50 touch-manipulation"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                저장하기
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-teal-600 text-teal-700 rounded-2xl font-semibold text-base active:bg-teal-50 disabled:opacity-50 touch-manipulation"
              >
                <BarChart2 size={20} />
                EpiCalc 분석
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 text-white px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 active:opacity-70 touch-manipulation"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-semibold">새 현장 기록</h1>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-semibold text-teal-700">{STEP_LABELS[step - 1]}</span>
          <span className="text-xs text-gray-400">{step} / {TOTAL_STEPS}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <main className="flex-1 px-4 py-3 pb-24">
        {renderStep()}
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={saving}
            className="flex items-center justify-center gap-1 px-6 h-11 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm active:bg-gray-50 touch-manipulation disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            이전
          </button>
        )}
        {step < TOTAL_STEPS && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed}
            className="flex-1 flex items-center justify-center gap-1 h-11 rounded-xl bg-teal-600 text-white font-semibold text-sm active:bg-teal-700 disabled:opacity-40 touch-manipulation"
          >
            다음
            <ChevronRight size={18} />
          </button>
        )}
        {step === TOTAL_STEPS && (
          <div className="flex-1 text-center text-xs text-gray-400 flex items-center justify-center">
            위의 버튼으로 저장 또는 분석을 진행하세요
          </div>
        )}
      </div>
    </div>
  );
}
