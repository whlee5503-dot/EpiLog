import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MapPin,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  LayoutDashboard,

  Settings,
} from 'lucide-react';
import { db } from '../db/database';
import type { FieldRecord } from '../types/index';
import { TRANSMISSION_COLORS, TRANSMISSION_LABELS } from '../utils/transmission';
import { useLanguage } from '../contexts/LanguageContext';
import { useCrypto } from '../contexts/CryptoContext';
import { LangToggle } from '../components/LangToggle';
import { GuideButton } from '../components/GuideButton';
import { ThemeButton } from '../components/ThemeButton';

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

function RecordCard({
  record,
  onClick,
}: {
  record: FieldRecord;
  onClick: () => void;
}) {
  const { t, lang } = useLanguage();

  const facilityLabels: Record<string, string> = {
    school: t.ft_school,
    hospital: t.ft_hospital,
    workplace: t.ft_workplace,
    restaurant: t.ft_restaurant,
    household: t.ft_household,
    community: t.ft_community,
  };

  const facilityLabel = facilityLabels[record.facilityType] ?? record.facilityType;
  const ar = attackRate(record);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 text-left active:bg-gray-50 dark:active:bg-gray-700 touch-manipulation transition-colors"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-gray-800 dark:text-white truncate">
              {record.location || t.rl_no_location}
            </span>
            <span className="shrink-0 px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
              {facilityLabel}
            </span>
            <span
              className="shrink-0 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: TRANSMISSION_COLORS[record.transmission] }}
              title={TRANSMISSION_LABELS[lang][record.transmission]}
              aria-label={TRANSMISSION_LABELS[lang][record.transmission]}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400">{formatTimestamp(record.timestamp, lang)}</span>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 divide-x divide-gray-100 dark:divide-gray-700">
        <div className="flex-1 flex flex-col items-center gap-0.5 px-2 first:pl-0 last:pr-0">
          <span className="text-lg font-bold text-teal-600 dark:text-teal-400 leading-none">
            {record.dailyCases.newCases}
          </span>
          <span className="text-xs text-gray-400">{t.rl_metric_new_cases}</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5 px-2">
          <span className="text-lg font-bold text-orange-500 dark:text-orange-400 leading-none">{ar}</span>
          <span className="text-xs text-gray-400">{t.rl_metric_ar}</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5 px-2 first:pl-0 last:pr-0">
          <span className="text-lg font-bold text-red-500 dark:text-red-400 leading-none">
            {record.dailyCases.deaths}
          </span>
          <span className="text-xs text-gray-400">{t.rl_metric_deaths}</span>
        </div>
      </div>
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-4">
        <FileText size={36} className="text-teal-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">{t.rl_empty_title}</h3>
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        {t.rl_empty_desc1}<br />{t.rl_empty_desc2}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
      >
        <Plus size={18} />
        {t.rl_empty_btn}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecordList() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { cryptoKey } = useCrypto();
  const [records, setRecords] = useState<FieldRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    db.getRecords(cryptoKey ?? undefined)
      .then(setRecords)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [cryptoKey]);

  // Record count is metadata about the list itself, so it stays here as a
  // one-line subtitle. Aggregate statistics (total cases, deaths, AR%) live
  // exclusively on the Dashboard now, to avoid showing the same numbers
  // twice across two screens.
  const recordCountLabel =
    lang === 'ko' ? `${t.rl_subtitle} · 총 ${records.length}건` : `${t.rl_subtitle} · ${records.length} total`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t.rl_title}</h1>
            <p className="text-sm text-teal-200 mt-0.5">
              {loading || error ? t.rl_subtitle : recordCountLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeButton />
            <GuideButton />
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl bg-white/20 active:bg-white/30 touch-manipulation"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={18} />
              <span className="text-[9px] leading-none font-medium">{lang === 'ko' ? '현황' : 'Stats'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl bg-white/20 active:bg-white/30 touch-manipulation"
              aria-label={t.st_title}
            >
              <Settings size={18} />
              <span className="text-[9px] leading-none font-medium">{lang === 'ko' ? '설정' : 'Settings'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-28 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-teal-500" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.rl_load_error}</p>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <EmptyState onAdd={() => navigate('/new')} />
        )}

        {!loading &&
          !error &&
          records.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onClick={() => navigate(`/records/${record.id}`)}
            />
          ))}
      </main>

      {/* FAB */}
      <button
        type="button"
        onClick={() => navigate('/new')}
        className="fixed bottom-6 right-5 flex items-center gap-2 pl-4 pr-5 h-14 bg-teal-600 text-white rounded-full shadow-xl active:bg-teal-700 touch-manipulation z-20"
        aria-label={lang === 'ko' ? '새 현장기록 추가' : 'Add new field record'}
      >
        <Plus size={22} />
        <span className="text-sm font-semibold whitespace-nowrap">{lang === 'ko' ? '새 기록' : 'New Record'}</span>
      </button>
    </div>
  );
}