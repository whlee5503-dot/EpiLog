import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MapPin,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  Activity,
  Users,
  Heart,
  LayoutDashboard,
  Sun,
  Moon,
} from 'lucide-react';
import { db } from '../db/database';
import type { FieldRecord } from '../types/index';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';
import { LangToggle } from '../components/LangToggle';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function attackRate(record: FieldRecord): string {
  const { totalPopulation, dailyCases } = record;
  if (!totalPopulation || totalPopulation === 0) return '-';
  const ar = (dailyCases.newCases / totalPopulation) * 100;
  return `${ar.toFixed(1)}%`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: 'teal' | 'orange' | 'red';
}) {
  const bg = {
    teal: 'bg-teal-50 dark:bg-teal-800',
    orange: 'bg-orange-50 dark:bg-orange-800',
    red: 'bg-red-50 dark:bg-red-800',
  }[accent];
  const text = {
    teal: 'text-teal-600 dark:text-white',
    orange: 'text-orange-500 dark:text-white',
    red: 'text-red-500 dark:text-white',
  }[accent];

  return (
    <div className={`rounded-2xl p-4 ${bg}`}>
      <div className={`mb-1.5 ${text}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">{label}</p>
    </div>
  );
}

function RecordCard({
  record,
  onClick,
}: {
  record: FieldRecord;
  onClick: () => void;
}) {
  const { t } = useLanguage();

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
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400">{formatTimestamp(record.timestamp)}</span>
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
  const { theme, toggle: toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [records, setRecords] = useState<FieldRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    db.getRecords()
      .then(setRecords)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const totalCases = records.reduce((sum, r) => sum + r.dailyCases.newCases, 0);
  const totalDeaths = records.reduce((sum, r) => sum + r.dailyCases.deaths, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t.rl_title}</h1>
            <p className="text-sm text-teal-200 mt-0.5">{t.rl_subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/20 active:bg-white/30 touch-manipulation"
              aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-white/20 active:bg-white/30 touch-manipulation"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Summary stats */}
      {!loading && !error && (
        <div className="px-4 -mt-2 mb-2">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 grid grid-cols-3 gap-3">
            <StatCard
              label={t.rl_stat_records}
              value={records.length}
              icon={<Activity size={18} />}
              accent="teal"
            />
            <StatCard
              label={t.rl_stat_cases}
              value={totalCases.toLocaleString()}
              icon={<Users size={18} />}
              accent="orange"
            />
            <StatCard
              label={t.rl_stat_deaths}
              value={totalDeaths.toLocaleString()}
              icon={<Heart size={18} />}
              accent="red"
            />
          </div>
        </div>
      )}

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
        className="fixed bottom-6 right-5 w-14 h-14 bg-teal-600 text-white rounded-full shadow-xl flex items-center justify-center active:bg-teal-700 touch-manipulation z-20"
        aria-label="새 기록 추가"
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
