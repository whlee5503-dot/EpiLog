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
  FileText,
  Heart,
  Loader2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { db } from '../db/database';
import type { FieldRecord } from '../types/index';
import { secondaryAttackRate, formatRate, summarizeRecords } from '../utils/epiCalc';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  airborne: '공기 전파',
  droplet: '비말 전파',
  contact: '접촉 전파',
  foodborne: '식품 매개',
  waterborne: '수인성',
  vector: '매개체',
  unknown: '미상',
};

const PIE_COLORS = ['#0d9488', '#f97316', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateKey(ts: string): string {
  return ts.slice(0, 10);
}

function formatDateLabel(dateKey: string): string {
  const parts = dateKey.split('-');
  return `${parts[1]}/${parts[2]}`;
}

function interpretRate(
  rate: number | null,
  low: number,
  mid: number,
): { label: string; color: string } {
  if (rate === null) return { label: '데이터 없음', color: 'text-gray-400' };
  if (rate < low) return { label: '낮음', color: 'text-green-600' };
  if (rate < mid) return { label: '보통 수준', color: 'text-yellow-600' };
  return { label: '높음', color: 'text-red-600' };
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
    teal: { bg: 'bg-teal-50', iconColor: 'text-teal-600' },
    orange: { bg: 'bg-orange-50', iconColor: 'text-orange-500' },
    red: { bg: 'bg-red-50', iconColor: 'text-red-500' },
    blue: { bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  }[accent];

  return (
    <div className={`rounded-2xl p-4 ${styles.bg} flex flex-col gap-2`}>
      <div className={styles.iconColor}>{icon}</div>
      <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function EpiMetricRow({
  label,
  value,
  interpretation,
  interpretColor,
}: {
  label: string;
  value: string;
  interpretation: string;
  interpretColor: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-600 flex-1 mr-3">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-gray-800">{value}</span>
        <span className={`text-xs font-medium ${interpretColor}`}>{interpretation}</span>
      </div>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="flex flex-col items-center justify-center h-28 gap-2">
      <FileText size={24} className="text-gray-300" />
      <p className="text-xs text-gray-400">표시할 데이터가 없습니다</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
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

  const transmissionData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      map.set(r.transmission, (map.get(r.transmission) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([route, count]) => ({ name: ROUTE_LABELS[route] ?? route, value: count }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  const arInterp = interpretRate(summary.overallAR, 5, 20);
  const cfrInterp = interpretRate(summary.overallCFR, 1, 5);
  const sarInterp = interpretRate(sarValue, 10, 25);

  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
          <div>
            <h1 className="text-lg font-bold leading-tight">발생 현황 대시보드</h1>
            <p className="text-xs text-teal-200">역학 지표 요약</p>
          </div>
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
          <p className="text-sm text-gray-500">데이터를 불러오지 못했습니다.</p>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
            <Activity size={36} className="text-teal-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">아직 기록이 없습니다</h3>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              현장 역학조사 기록을 추가하면<br />여기에 통계가 표시됩니다.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
          >
            기록 목록으로 이동
          </Link>
        </div>
      )}

      {/* Content */}
      {!loading && !error && records.length > 0 && (
        <main className="flex-1 px-4 py-4 pb-10 space-y-4">
          {/* 1. Summary stats — 2×2 grid */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              label="총 기록 수"
              value={summary.recordCount}
              icon={<Activity size={22} />}
              accent="teal"
            />
            <SummaryCard
              label="누적 환자 수"
              value={summary.totalCases.toLocaleString()}
              icon={<Users size={22} />}
              accent="orange"
            />
            <SummaryCard
              label="누적 사망 수"
              value={summary.totalDeaths.toLocaleString()}
              icon={<Heart size={22} />}
              accent="red"
            />
            <SummaryCard
              label="전체 AR (%)"
              value={formatRate(summary.overallAR)}
              icon={<TrendingUp size={22} />}
              accent="blue"
            />
          </div>

          {/* 2. Epidemic curve */}
          <SectionCard title="일별 발생 현황 (Epidemic Curve)">
            {epicurveData.length === 0 ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={epicurveData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar name="신규 환자" dataKey="cases" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* 3. Cumulative trend */}
          <SectionCard title="누적 환자 추이">
            {cumulativeData.length === 0 ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cumulativeData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    name="누적 환자"
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
          <SectionCard title="역학 지표 요약">
            <EpiMetricRow
              label="발병률 (Attack Rate)"
              value={formatRate(summary.overallAR)}
              interpretation={arInterp.label}
              interpretColor={arInterp.color}
            />
            <EpiMetricRow
              label="치명률 (Case Fatality Rate)"
              value={formatRate(summary.overallCFR)}
              interpretation={cfrInterp.label}
              interpretColor={cfrInterp.color}
            />
            <EpiMetricRow
              label="2차 발병률 (SAR, 가족 기준)"
              value={formatRate(sarValue)}
              interpretation={sarInterp.label}
              interpretColor={sarInterp.color}
            />
          </SectionCard>

          {/* 5. Transmission route distribution */}
          <SectionCard title="전파 경로 분포">
            {transmissionData.length === 0 ? (
              <EmptyChartState />
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={transmissionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {transmissionData.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
                  {transmissionData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      {item.name} ({item.value})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </main>
      )}
    </div>
  );
}
