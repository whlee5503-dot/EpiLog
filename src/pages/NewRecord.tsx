import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  BarChart2,
  Loader2,
  Navigation,
  MapPin,
} from 'lucide-react';
import { db } from '../db/database';
import type { FieldRecord, TransmissionRoute, VaccinationStatus } from '../types/index';
import { useLanguage } from '../contexts/LanguageContext';
import { LangToggle } from '../components/LangToggle';

// Internal keys for symptoms (stored in DB as Korean)
const SYMPTOMS_KEYS = ['발열', '기침', '설사', '구토', '복통', '발진', '호흡곤란', '두통', '근육통'] as const;

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
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center active:bg-gray-50 dark:active:bg-gray-700 touch-manipulation"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-lg text-sm py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center active:bg-gray-50 dark:active:bg-gray-700 touch-manipulation"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewRecord() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initForm);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const TOTAL_STEPS = 4;
  const STEP_LABELS = [t.nr_step1, t.nr_step2, t.nr_step3, t.nr_step4];

  const FACILITY_TYPES = [
    { value: 'school', label: t.ft_school },
    { value: 'hospital', label: t.ft_hospital },
    { value: 'workplace', label: t.ft_workplace },
    { value: 'restaurant', label: t.ft_restaurant },
    { value: 'household', label: t.ft_household },
    { value: 'community', label: t.ft_community },
  ];

  const TRANSMISSION_OPTIONS: { value: TransmissionRoute; label: string }[] = [
    { value: 'droplet', label: t.tr_droplet },
    { value: 'contact', label: t.tr_contact },
    { value: 'waterborne', label: t.tr_waterborne },
    { value: 'foodborne', label: t.tr_foodborne },
    { value: 'vector', label: t.tr_vector },
  ];

  const VACCINATION_OPTIONS: { value: VaccinationStatus; label: string }[] = [
    { value: 'vaccinated', label: t.va_vaccinated },
    { value: 'partial', label: t.va_partial },
    { value: 'unvaccinated', label: t.va_unvaccinated },
    { value: 'unknown', label: t.va_unknown },
  ];

  const GENDER_OPTIONS = [
    { value: 'male' as const, label: t.ge_male },
    { value: 'female' as const, label: t.ge_female },
    { value: 'other' as const, label: t.ge_other },
    { value: 'unknown' as const, label: t.ge_unknown },
  ];

  const SYMPTOM_LABELS: Record<string, string> = {
    '발열': t.sy_fever, '기침': t.sy_cough, '설사': t.sy_diarrhea,
    '구토': t.sy_vomiting, '복통': t.sy_abdominal, '발진': t.sy_rash,
    '호흡곤란': t.sy_dyspnea, '두통': t.sy_headache, '근육통': t.sy_myalgia,
  };

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

  const totalContacts = form.contacts.household + form.contacts.colleague + form.contacts.community;
  const totalContactsLabel = lang === 'ko' ? `총 ${totalContacts}명` : `Total ${totalContacts}`;

  // ─── Step renders ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="mb-5">
              <span className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_survey_datetime}</span>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400">
                {(() => {
                  const d = new Date(form.timestamp);
                  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                })()}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                {t.nr_location} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t.nr_placeholder_location}
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="mb-5">
              <span className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_facility_type}</span>
              <div className="flex flex-wrap gap-2">
                {FACILITY_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, facilityType: opt.value }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border touch-manipulation transition-colors ${
                      form.facilityType === opt.value
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 active:bg-gray-50 dark:active:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                {t.nr_population}
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
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="mb-5">
              <span className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_gps}</span>
              {form.gps ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-xl">
                  <MapPin size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="text-sm text-teal-700 dark:text-teal-300 truncate">
                    {form.gps.lat.toFixed(4)}, {form.gps.lng.toFixed(4)}
                    {form.gps.accuracy != null && ` (±${Math.round(form.gps.accuracy)}m)`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, gps: undefined }))}
                    className="ml-auto text-xs text-gray-400 underline touch-manipulation shrink-0"
                  >
                    {t.nr_gps_recollect}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={collectGps}
                  disabled={gpsLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-teal-300 dark:border-teal-600 rounded-xl text-teal-600 dark:text-teal-400 font-medium text-sm active:bg-teal-50 dark:active:bg-teal-900/20 disabled:opacity-50 touch-manipulation"
                >
                  {gpsLoading ? (
                    <><Loader2 size={14} className="animate-spin" />{t.nr_gps_collecting}</>
                  ) : (
                    <><Navigation size={14} />{t.nr_gps_collect}</>
                  )}
                </button>
              )}
              {gpsError && <p className="mt-1 text-xs text-red-500">{gpsError}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="mb-5">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                {t.nr_patient_name}{' '}
                <span className="text-xs text-gray-400 dark:text-gray-500">{t.nr_optional}</span>
              </label>
              <input
                type="text"
                placeholder={t.nr_placeholder_name}
                value={form.indexCase.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, indexCase: { ...p.indexCase, name: e.target.value } }))
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="mb-5">
              <span className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_gender}</span>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, indexCase: { ...p.indexCase, gender: opt.value } }))
                    }
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border touch-manipulation transition-colors ${
                      form.indexCase.gender === opt.value
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 active:bg-gray-50 dark:active:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_age}</label>
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
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_onset}</label>
              <input
                type="date"
                value={form.indexCase.onsetDate}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    indexCase: { ...p.indexCase, onsetDate: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_symptoms}</label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS_KEYS.map((symptom) => {
                  const selected = form.indexCase.symptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border touch-manipulation transition-colors ${
                        selected
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 active:bg-gray-50 dark:active:bg-gray-600'
                      }`}
                    >
                      {SYMPTOM_LABELS[symptom] ?? symptom}
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
            <div>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                {t.nr_contacts_section}
              </h3>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6">
                <Counter
                  label={t.nr_household}
                  value={form.contacts.household}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, contacts: { ...p.contacts, household: v } }))
                  }
                />
                <Counter
                  label={t.nr_colleague}
                  value={form.contacts.colleague}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, contacts: { ...p.contacts, colleague: v } }))
                  }
                />
                <Counter
                  label={t.nr_community}
                  value={form.contacts.community}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, contacts: { ...p.contacts, community: v } }))
                  }
                />
              </div>
              <p className="mt-1 text-xs text-gray-400 text-right">{totalContactsLabel}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                {t.nr_cases_section}
              </h3>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6">
                <Counter
                  label={t.nr_new_cases}
                  value={form.dailyCases.newCases}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, dailyCases: { ...p.dailyCases, newCases: v } }))
                  }
                />
                <Counter
                  label={t.nr_deaths}
                  value={form.dailyCases.deaths}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, dailyCases: { ...p.dailyCases, deaths: v } }))
                  }
                />
                <Counter
                  label={t.nr_hospitalized}
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
          <div>
            <div className="mb-5">
              <span className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_transmission}</span>
              <div className="flex flex-wrap gap-2">
                {TRANSMISSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, transmission: opt.value }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border touch-manipulation transition-colors ${
                      form.transmission === opt.value
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 active:bg-gray-50 dark:active:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <span className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_vaccination}</span>
              <div className="flex flex-wrap gap-2">
                {VACCINATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, vaccinated: opt.value }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border touch-manipulation transition-colors ${
                      form.vaccinated === opt.value
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 active:bg-gray-50 dark:active:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t.nr_notes}</label>
              <textarea
                placeholder={t.nr_placeholder_notes}
                value={form.notes ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full h-28 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-teal-600 text-white rounded-2xl font-semibold text-base active:bg-teal-700 disabled:opacity-50 touch-manipulation"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {t.nr_save}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white dark:bg-gray-800 border-2 border-teal-600 text-teal-700 dark:text-teal-400 rounded-2xl font-semibold text-base active:bg-teal-50 dark:active:bg-teal-900/20 disabled:opacity-50 touch-manipulation"
              >
                <BarChart2 size={20} />
                {t.nr_analyze}
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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
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
          <h1 className="text-lg font-semibold flex-1">{t.nr_title}</h1>
          <LangToggle />
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">{STEP_LABELS[step - 1]}</span>
          <span className="text-xs text-gray-400">{step} / {TOTAL_STEPS}</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <main className="flex-1 px-5 py-6 pb-32 text-left">
        {renderStep()}
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={saving}
            className="flex items-center justify-center gap-1 px-6 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm active:bg-gray-50 dark:active:bg-gray-800 touch-manipulation disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            {t.nr_prev}
          </button>
        )}
        {step < TOTAL_STEPS && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed}
            className="flex-1 flex items-center justify-center gap-1 h-11 rounded-xl bg-teal-600 text-white font-semibold text-sm active:bg-teal-700 disabled:opacity-40 touch-manipulation"
          >
            {t.nr_next}
            <ChevronRight size={18} />
          </button>
        )}
        {step === TOTAL_STEPS && (
          <div className="flex-1 text-center text-xs text-gray-400 flex items-center justify-center">
            {t.nr_step_hint}
          </div>
        )}
      </div>
    </div>
  );
}
