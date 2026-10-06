import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    MapPin,
    Loader2,
    AlertCircle,
    BarChart2,
    Trash2,
    User,
} from 'lucide-react';
import { db } from '../db/database';
import type { FieldRecord, TransmissionRoute, VaccinationStatus } from '../types/index';
import { buildEpiCalcURL, getIndexCases } from '../utils/exportData';
import { useLanguage } from '../contexts/LanguageContext';
import { useCrypto } from '../contexts/CryptoContext';
import { LangToggle } from '../components/LangToggle';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function attackRate(record: FieldRecord): string {
    const { totalPopulation, dailyCases } = record;
    if (!totalPopulation || totalPopulation === 0) return '-';
    const ar = (dailyCases.newCases / totalPopulation) * 100;
    return `${ar.toFixed(1)}%`;
}

function formatTimestamp(iso: string, lang: 'ko' | 'en'): string {
    const d = new Date(iso);
    return d.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                {title}
            </h3>
            {children}
        </div>
    );
}

function StatPair({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg font-bold text-gray-800 dark:text-white leading-none">{value}</span>
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecordDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const { cryptoKey } = useCrypto();

    const [record, setRecord] = useState<FieldRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const numericId = Number(id);
        if (!id || Number.isNaN(numericId)) {
            setError(lang === 'ko' ? '잘못된 기록 ID입니다.' : 'Invalid record ID.');
            setLoading(false);
            return;
        }
        db.getRecordById(numericId, cryptoKey ?? undefined)
            .then((r) => {
                if (!r) {
                    setError(lang === 'ko' ? '기록을 찾을 수 없습니다.' : 'Record not found.');
                } else {
                    setRecord(r);
                }
            })
            .catch((e) => setError(String(e)))
            .finally(() => setLoading(false));
    }, [id, cryptoKey, lang]);

    const facilityLabels: Record<string, string> = {
        school: t.ft_school,
        hospital: t.ft_hospital,
        workplace: t.ft_workplace,
        restaurant: t.ft_restaurant,
        household: t.ft_household,
        community: t.ft_community,
    };

    const transmissionLabels: Record<TransmissionRoute, string> = {
        airborne: lang === 'ko' ? '공기 전파' : 'Airborne',
        droplet: t.tr_droplet,
        contact: t.tr_contact,
        foodborne: t.tr_foodborne,
        waterborne: t.tr_waterborne,
        vector: t.tr_vector,
        unknown: lang === 'ko' ? '미상' : 'Unknown',
    };

    const vaccinationLabels: Record<VaccinationStatus, string> = {
        vaccinated: t.va_vaccinated,
        partial: t.va_partial,
        unvaccinated: t.va_unvaccinated,
        unknown: t.va_unknown,
    };

    const genderLabels: Record<string, string> = {
        male: t.ge_male, female: t.ge_female, other: t.ge_other, unknown: t.ge_unknown,
    };

    const symptomLabels: Record<string, string> = {
        '발열': t.sy_fever, '기침': t.sy_cough, '설사': t.sy_diarrhea,
        '구토': t.sy_vomiting, '복통': t.sy_abdominal, '발진': t.sy_rash,
        '호흡곤란': t.sy_dyspnea, '두통': t.sy_headache, '근육통': t.sy_myalgia,
    };

    const handleDelete = async () => {
        if (!record?.id) return;
        const confirmed = window.confirm(
            lang === 'ko'
                ? '이 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
                : 'Delete this record? This cannot be undone.',
        );
        if (!confirmed) return;
        setDeleting(true);
        try {
            await db.deleteRecord(record.id);
            navigate('/');
        } catch (e) {
            setError(String(e));
            setDeleting(false);
        }
    };

    // ─── Loading / error states ────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
                <Loader2 size={32} className="animate-spin text-teal-500" />
            </div>
        );
    }

    if (error || !record) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center bg-white dark:bg-gray-900">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {error ?? (lang === 'ko' ? '기록을 불러올 수 없습니다.' : 'Could not load record.')}
                </p>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="mt-2 px-6 h-11 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
                >
                    {t.app_back_list}
                </button>
            </div>
        );
    }

    const cases = getIndexCases(record);
    const ar = attackRate(record);
    const totalContacts = record.contacts.household + record.contacts.colleague + record.contacts.community;

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
            {/* Header */}
            <header className="bg-teal-600 text-white px-4 py-3 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="p-1 -ml-1 active:opacity-70 touch-manipulation"
                        aria-label={t.app_back_list}
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <h1 className="text-lg font-semibold flex-1 truncate">{record.location || t.rl_no_location}</h1>
                    <LangToggle />
                </div>
            </header>

            <main className="flex-1 px-5 py-6 pb-28">
                {/* Location / facility / time */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
                            {facilityLabels[record.facilityType] ?? record.facilityType}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin size={12} className="shrink-0" />
                        <span>{formatTimestamp(record.timestamp, lang)}</span>
                    </div>
                    {record.gps && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            <span>
                                {record.gps.lat.toFixed(4)}, {record.gps.lng.toFixed(4)}
                                {record.gps.accuracy != null && ` (±${Math.round(record.gps.accuracy)}m)`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6">
                    <StatPair label={t.rl_metric_new_cases} value={record.dailyCases.newCases} />
                    <StatPair label={t.rl_metric_ar} value={ar} />
                    <StatPair label={t.rl_metric_deaths} value={record.dailyCases.deaths} />
                    <StatPair
                        label={lang === 'ko' ? '위험노출' : 'At risk'}
                        value={record.totalPopulation.toLocaleString()}
                    />
                </div>

                {/* Index cases (multi-patient aware) */}
                <Section
                    title={
                        lang === 'ko'
                            ? `지표환자 (${cases.length}명)`
                            : `Index Patients (${cases.length})`
                    }
                >
                    {cases.length === 0 ? (
                        <p className="text-sm text-gray-400">{lang === 'ko' ? '기록된 환자 없음' : 'No patient recorded'}</p>
                    ) : (
                        <div className="space-y-3">
                            {cases.map((c, idx) => (
                                <div
                                    key={idx}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50/50 dark:bg-gray-800/50"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={14} className="text-teal-500 shrink-0" />
                                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                            {c.name || (lang === 'ko' ? `환자 ${idx + 1}` : `Patient ${idx + 1}`)}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {genderLabels[c.gender] ?? c.gender} · {c.age}
                                            {lang === 'ko' ? '세' : 'y'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">
                                        {t.nr_onset}: {c.onsetDate}
                                    </p>
                                    {c.symptoms.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {c.symptoms.map((s) => (
                                                <span
                                                    key={s}
                                                    className="px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs text-gray-600 dark:text-gray-300"
                                                >
                                                    {symptomLabels[s] ?? s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Contacts */}
                <Section title={t.nr_contacts_section}>
                    <div className="grid grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                        <StatPair label={t.nr_household} value={record.contacts.household} />
                        <StatPair label={t.nr_colleague} value={record.contacts.colleague} />
                        <StatPair label={t.nr_community} value={record.contacts.community} />
                        <StatPair label={lang === 'ko' ? '총' : 'Total'} value={totalContacts} />
                    </div>
                </Section>

                {/* Daily cases */}
                <Section title={t.nr_cases_section}>
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                        <StatPair label={t.nr_new_cases} value={record.dailyCases.newCases} />
                        <StatPair label={t.nr_deaths} value={record.dailyCases.deaths} />
                        <StatPair label={t.nr_hospitalized} value={record.dailyCases.hospitalized} />
                    </div>
                </Section>

                {/* Transmission / vaccination */}
                <Section title={lang === 'ko' ? '전파 및 접종' : 'Transmission & Vaccination'}>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-300">
                            {t.nr_transmission}: {transmissionLabels[record.transmission]}
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-300">
                            {t.nr_vaccination}: {vaccinationLabels[record.vaccinated]}
                        </span>
                    </div>
                </Section>

                {/* Notes */}
                {record.notes && (
                    <Section title={t.nr_notes}>
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                            {record.notes}
                        </p>
                    </Section>
                )}
            </main>

            {/* Bottom actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 flex gap-3">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl border border-red-200 dark:border-red-900 text-red-500 font-semibold text-sm active:bg-red-50 dark:active:bg-red-900/20 disabled:opacity-50 touch-manipulation"
                >
                    {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
                <button
                    type="button"
                    onClick={() => window.open(buildEpiCalcURL(record), '_blank', 'noopener,noreferrer')}
                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
                >
                    <BarChart2 size={18} />
                    {lang === 'ko' ? 'EpiCalc로 분석' : 'Analyze with EpiCalc'}
                </button>
            </div>
        </div>
    );
}