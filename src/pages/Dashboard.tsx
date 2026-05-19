import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  FileDown,
  FileJson,
  FileText,
  Heart,
  Loader2,
  Mail,
  MessageCircle,
  TrendingUp,
  Users,
} from 'lucide-react';
import { db } from '../db/database';
import type { FieldRecord } from '../types/index';
import { secondaryAttackRate, formatRate, summarizeRecords } from '../utils/epiCalc';
import {
  exportToCSV,
  exportToJSON,
  shareViaWhatsApp,
  shareViaEmail,
  generateSummaryText,
} from '../utils/exportData';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';
import { LangToggle } from '../components/LangToggle';

// ─── Constants ────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#0d9488', '#f97316', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateKey(ts: string): string {
  return ts.slice(0, 10);
}

function formatDateLabel(dateKey: string): string {
  const parts = dateKey.split('-');
  return `${parts[1]}/${parts[2]}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: 'teal' | 'orange' | 'red' | 'blue';
}) {
  const styles = {
    teal: { bg: 'bg-teal-50 dark:bg-teal-700', iconColor: 'text-teal-600 dark:text-white' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-700', iconColor: 'text-orange-500 dark:text-white' },
    red: { bg: 'bg-red-50 dark:bg-red-700', iconColor: 'text-red-500 dark:text-white' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-700', iconColor: 'text-blue-600 dark:text-white' },
  }[accent];

  return (
    <div className={`rounded-2xl p-4 ${styles.bg} flex flex-col gap-2`}>
      <div className={styles.iconColor}>{icon}</div>
      <p className="text-2xl font-bold text-white leading-tight">{value}</p>
      <p className="text-sm text-white opacity-90">{label}</p>
    </div>
  );
}

function SectionCard({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div className="bg-white dark:bg-[#2d3748] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-4">
      <h2
        className="text-sm font-semibold text-gray-900 dark:text-white mb-3"
        style={{ color: isDark ? '#ffffff' : '#111827' }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function EpiMetricRow({
  label,
  value,
  interpretation,
  interpretColor,
  isDark,
}: {
  label: string;
  value: string;
  interpretation: string;
  interpretColor: string;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <span
        className="text-sm flex-1 mr-3"
        style={{ color: isDark ? '#d1d5db' : '#374151' }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-sm font-bold"
          style={{ color: isDark ? '#ffffff' : '#111827' }}
        >
          {value}
        </span>
        <span className={`text-xs font-medium ${interpretColor}`}>{interpretation}</span>
      </div>
    </div>
  );
}

function EmptyChartState() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center h-28 gap-2">
      <FileText size={24} className="text-gray-300 dark:text-gray-600" />
      <p className="text-xs text-gray-400 dark:text-gray-500">{t.db_no_data}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { isDark } = useTheme();
  const { t, lang } = useLanguage();
  const [records, setRecords] = useState<FieldRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    db.getRecords()
      .then(setRecords)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => summarizeRecords(records), [records]);

  const epicurveData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      const k = getDateKey(r.timestamp);
      map.set(k, (map.get(k) ?? 0) + r.dailyCases.newCases);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cases]) => ({ date: formatDateLabel(date), cases }));
  }, [records]);

  const cumulativeData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      const k = getDateKey(r.timestamp);
      map.set(k, (map.get(k) ?? 0) + r.dailyCases.newCases);
    }
    let cum = 0;
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cases]) => {
        cum += cases;
        return { date: formatDateLabel(date), cumulative: cum };
      });
  }, [records]);

  const sarValue = useMemo(() => {
    const secondaryCases = Math.max(0, summary.totalCases - records.length);
    const householdContacts = records.reduce((s, r) => s + r.contacts.household, 0);
    return secondaryAttackRate(secondaryCases, householdContacts);
  }, [records, summary]);

  const transmissionCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      map.set(r.transmission, (map.get(r.transmission) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const routeLabels: Record<string, string> = {
    airborne: t.rt_airborne,
    droplet: t.rt_droplet,
    contact: t.rt_contact,
    foodborne: t.rt_foodborne,
    waterborne: t.rt_waterborne,
    vector: t.rt_vector,
    unknown: t.rt_unknown,
  };

  const transmissionData = transmissionCounts.map(({ route, count }) => ({
    name: routeLabels[route] ?? route,
    value: count,
  }));

  function interpretRate(rate: number | null, low: number, mid: number): { label: string; color: string } {
    if (rate === null) return { label: t.db_interp_none, color: 'text-gray-400 dark:text-gray-500' };
    if (rate < low) return { label: t.db_interp_low, color: 'text-green-600 dark:text-green-400' };
    if (rate < mid) return { label: t.db_interp_mid, color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: t.db_interp_high, color: 'text-red-600 dark:text-red-400' };
  }

  const arInterp = interpretRate(summary.overallAR, 5, 20);
  const cfrInterp = interpretRate(summary.overallCFR, 1, 5);
  const sarInterp = interpretRate(sarValue, 10, 25);

  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f9fafb' : '#111827',
  };
  const tickColor = isDark ? '#e5e7eb' : '#6b7280';
  const axisTickStyle = { fontSize: 11, fill: tickColor };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 -ml-1 rounded-lg bg-white/20 active:bg-white/30 touch-manipulation"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">{t.db_title}</h1>
            <p className="text-xs text-teal-200">{t.db_subtitle}</p>
          </div>
          <LangToggle />
        </div>
      </header>

      {/* Loading */}
      {loading && (
        <div className="flex flex-1 items-center justify-center py-24">
          <Loader2 size={36} className="animate-spin text-teal-500" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-20 px-6 text-center">
          <AlertCircle size={40} className="text-red-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.db_error}</p>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
            <Activity size={36} className="text-teal-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{t.db_empty_title}</h3>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              {t.db_empty_desc1}<br />{t.db_empty_desc2}
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
          >
            {t.db_go_records}
          </Link>
        </div>
      )}

      {/* Content */}
      {!loading && !error && records.length > 0 && (
        <main className="flex-1 px-4 py-4 pb-10 space-y-4">
          {/* 1. Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label={t.db_stat_records} value={summary.recordCount} icon={<Activity size={22} />} accent="teal" />
            <SummaryCard label={t.db_stat_cases} value={summary.totalCases.toLocaleString()} icon={<Users size={22} />} accent="orange" />
            <SummaryCard label={t.db_stat_deaths} value={summary.totalDeaths.toLocaleString()} icon={<Heart size={22} />} accent="red" />
            <SummaryCard label={t.db_stat_ar} value={formatRate(summary.overallAR)} icon={<TrendingUp size={22} />} accent="blue" />
          </div>

          {/* 2. Epidemic curve */}
          <SectionCard title={t.db_epicurve} isDark={isDark}>
            {epicurveData.length === 0 ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={epicurveData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} vertical={false} />
                  <XAxis dataKey="date" tick={axisTickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar name={t.db_bar_name} dataKey="cases" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* 3. Cumulative trend */}
          <SectionCard title={t.db_cumulative} isDark={isDark}>
            {cumulativeData.length === 0 ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cumulativeData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} vertical={false} />
                  <XAxis dataKey="date" tick={axisTickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    name={t.db_line_name}
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={{ fill: '#0d9488', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* 4. Epi metrics */}
          <SectionCard title={t.db_metrics_title} isDark={isDark}>
            <EpiMetricRow label={t.db_ar_label} value={formatRate(summary.overallAR)} interpretation={arInterp.label} interpretColor={arInterp.color} isDark={isDark} />
            <EpiMetricRow label={t.db_cfr_label} value={formatRate(summary.overallCFR)} interpretation={cfrInterp.label} interpretColor={cfrInterp.color} isDark={isDark} />
            <EpiMetricRow label={t.db_sar_label} value={formatRate(sarValue)} interpretation={sarInterp.label} interpretColor={sarInterp.color} isDark={isDark} />
          </SectionCard>

          {/* 5. Transmission routes */}
          <SectionCard title={t.db_transmission} isDark={isDark}>
            {transmissionData.length === 0 ? (
              <EmptyChartState />
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={transmissionData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {transmissionData.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
                  {transmissionData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {item.name} ({item.value})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* 6. Export / Share */}
          <SectionCard title={lang === 'ko' ? '데이터 내보내기' : 'Export Data'} isDark={isDark}>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => exportToCSV(records)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold active:bg-teal-700 touch-manipulation"
              >
                <FileDown size={18} />
                CSV
              </button>
              <button
                type="button"
                onClick={() => exportToJSON(records)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold active:bg-blue-700 touch-manipulation"
              >
                <FileJson size={18} />
                JSON
              </button>
              <button
                type="button"
                onClick={() => shareViaWhatsApp(generateSummaryText(records, lang))}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold active:bg-green-700 touch-manipulation"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  const subject = lang === 'ko' ? 'EpiLog 현장조사 요약' : 'EpiLog Field Investigation Summary';
                  shareViaEmail(subject, generateSummaryText(records, lang));
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 text-white text-sm font-semibold active:bg-orange-700 touch-manipulation"
              >
                <Mail size={18} />
                {lang === 'ko' ? '이메일' : 'Email'}
              </button>
            </div>
          </SectionCard>
        </main>
      )}
    </div>
  );
}
