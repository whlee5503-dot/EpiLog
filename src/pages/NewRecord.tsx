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

// ─── Shared sub-components (defined outside to avoid remount on re-render) ────

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
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 touch-manipulation"
        >
          <Minus size={16} className="text-gray-600" />
        </button>
        <span className="w-10 text-center text-lg font-semibold text-gray-800 tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center active:bg-teal-700 touch-manipulation"
        >
          <Plus size={16} className="text-white" />
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
    <div className={`grid ${colClass[cols] ?? 'grid-cols-3'} gap-2`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`py-2.5 rounded-xl text-sm font-medium border touch-manipulation transition-colors ${
            value === opt.value
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
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

  const handleSave = async (toEpicalc = false) => {
    setSaving(true);
    try {
      const id = await db.addRecord(form);
      if (toEpicalc) {
        navigate('/epicalc', { state: { recordId: id } });
      } else {
        navigate('/records');
      }
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
          <div className="space-y-5">
            {/* Timestamp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">조사 일시</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                {new Date(form.timestamp).toLocaleString('ko-KR')}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                발생 장소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="예: ○○초등학교, △△요양원"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Facility type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시설 유형</label>
              <SegmentedButtons
                options={FACILITY_TYPES}
                value={form.facilityType}
                onChange={(v) => setForm((p) => ({ ...p, facilityType: v }))}
                cols={3}
              />
            </div>

            {/* Total population */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* GPS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GPS 좌표</label>
              {form.gps ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <MapPin size={16} className="text-teal-600 shrink-0" />
                  <span className="text-sm text-teal-700">
                    {form.gps.lat.toFixed(5)}, {form.gps.lng.toFixed(5)}
                    {form.gps.accuracy != null && ` (±${Math.round(form.gps.accuracy)}m)`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, gps: undefined }))}
                    className="ml-auto text-xs text-gray-400 underline touch-manipulation"
                  >
                    재수집
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={collectGps}
                  disabled={gpsLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-teal-300 rounded-xl text-teal-600 font-medium text-sm active:bg-teal-50 disabled:opacity-50 touch-manipulation"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      위치 수집 중…
                    </>
                  ) : (
                    <>
                      <Navigation size={16} />
                      GPS 수집
                    </>
                  )}
                </button>
              )}
              {gpsError && <p className="mt-1.5 text-xs text-red-500">{gpsError}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
              <SegmentedButtons
                options={GENDER_OPTIONS}
                value={form.indexCase.gender}
                onChange={(v) =>
                  setForm((p) => ({ ...p, indexCase: { ...p.indexCase, gender: v } }))
                }
                cols={4}
              />
            </div>

            {/* Age + onset date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">나이 (만)</label>
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">증상 발생일</label>
                <input
                  type="date"
                  value={form.indexCase.onsetDate}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      indexCase: { ...p.indexCase, onsetDate: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주요 증상{' '}
                <span className="text-xs text-gray-400 font-normal">
                  {form.indexCase.symptoms.length > 0
                    ? `${form.indexCase.symptoms.length}개 선택됨`
                    : '복수 선택 가능'}
                </span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SYMPTOMS.map((symptom) => {
                  const selected = form.indexCase.symptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`py-2.5 rounded-xl text-sm font-medium border touch-manipulation transition-colors ${
                        selected
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
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
          <div className="space-y-6">
            {/* Contacts */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
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
                  label="직장/학교 동료 (Colleague)"
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
              <p className="mt-1.5 text-xs text-gray-400 text-right">
                총{' '}
                {form.contacts.household + form.contacts.colleague + form.contacts.community}명
              </p>
            </div>

            {/* Daily cases */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
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
          <div className="space-y-5">
            {/* Transmission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추정 전파 경로
              </label>
              <SegmentedButtons
                options={TRANSMISSION_OPTIONS}
                value={form.transmission}
                onChange={(v) => setForm((p) => ({ ...p, transmission: v }))}
                cols={2}
              />
            </div>

            {/* Vaccination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예방접종 여부
              </label>
              <SegmentedButtons
                options={VACCINATION_OPTIONS}
                value={form.vaccinated}
                onChange={(v) => setForm((p) => ({ ...p, vaccinated: v }))}
                cols={2}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모 및 특이사항
              </label>
              <textarea
                rows={4}
                placeholder="조사관 메모, 특이사항을 자유롭게 입력하세요"
                value={form.notes ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-4 bg-teal-600 text-white rounded-2xl font-semibold text-base active:bg-teal-700 disabled:opacity-50 touch-manipulation"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                저장하기
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 active:opacity-70 touch-manipulation"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">새 현장 기록</h1>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-start">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const isActive = s === step;
            const isDone = s < step;
            return (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className="relative flex items-center w-full">
                  {/* Left connector */}
                  {i > 0 && (
                    <div
                      className={`absolute left-0 right-1/2 h-0.5 top-1/2 -translate-y-1/2 ${
                        isDone ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  {/* Circle */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto relative z-10 transition-colors ${
                      isActive
                        ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                        : isDone
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {s}
                  </div>
                  {/* Right connector */}
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={`absolute left-1/2 right-0 h-0.5 top-1/2 -translate-y-1/2 ${
                        s < step ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs text-center leading-tight ${
                    isActive ? 'text-teal-700 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <main className="flex-1 px-4 py-6 pb-32">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {['기본 정보', '지표환자 정보', '접촉자 & 발생현황', '역학 특성'][step - 1]}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Step {step} / {TOTAL_STEPS}
          </p>
        </div>
        {renderStep()}
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={saving}
            className="flex items-center justify-center gap-1 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm active:bg-gray-50 touch-manipulation disabled:opacity-40"
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
            className="flex-1 flex items-center justify-center gap-1 py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm active:bg-teal-700 disabled:opacity-40 touch-manipulation"
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
