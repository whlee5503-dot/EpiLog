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
} from 'lucide-react';
import { db } from '../db/database';
import type { FieldRecord } from '../types/index';

// ─── Constants ────────────────────────────────────────────────────────────────

const FACILITY_LABELS: Record<string, string> = {
  school: '학교',
  hospital: '병원/의료기관',
  workplace: '직장',
  restaurant: '식당/음식점',
  household: '가정',
  community: '지역사회',
};

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
  const bg = { teal: 'bg-teal-50', orange: 'bg-orange-50', red: 'bg-red-50' }[accent];
  const text = { teal: 'text-teal-600', orange: 'text-orange-500', red: 'text-red-500' }[accent];

  return (
    <div className={`rounded-2xl p-4 ${bg}`}>
      <div className={`mb-1.5 ${text}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
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
  const facilityLabel = FACILITY_LABELS[record.facilityType] ?? record.facilityType;
  const ar = attackRate(record);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left active:bg-gray-50 touch-manipulation transition-colors"
    >
      {/* Top row: location + facility badge + arrow */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-gray-800 truncate">
              {record.location || '(장소 미입력)'}
            </span>
            <span className="shrink-0 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
              {facilityLabel}
            </span>
          </div>
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400">{formatTimestamp(record.timestamp)}</span>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-300 shrink-0 mt-0.5" />
      </div>

      {/* Metrics row */}
      <div className="flex items-center mt-3 pt-3 border-t border-gray-100 divide-x divide-gray-100">
        <div className="flex-1 flex flex-col items-center gap-0.5 px-2 first:pl-0 last:pr-0">
          <span className="text-lg font-bold text-teal-600 leading-none">
            {record.dailyCases.newCases}
          </span>
          <span className="text-xs text-gray-400">신규 확진</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5 px-2">
          <span className="text-lg font-bold text-orange-500 leading-none">{ar}</span>
          <span className="text-xs text-gray-400">발병률(AR)</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5 px-2 first:pl-0 last:pr-0">
          <span className="text-lg font-bold text-red-500 leading-none">
            {record.dailyCases.deaths}
          </span>
          <span className="text-xs text-gray-400">사망</span>
        </div>
      </div>
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-4">
        <FileText size={36} className="text-teal-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">기록이 없습니다</h3>
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        현장 역학조사 결과를 기록하면<br />이곳에 목록으로 표시됩니다.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
      >
        <Plus size={18} />
        첫 기록 추가하기
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecordList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<FieldRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    db.getRecords()
      .then(setRecords)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Summary stats
  const totalCases = records.reduce((sum, r) => sum + r.dailyCases.newCases, 0);
  const totalDeaths = records.reduce((sum, r) => sum + r.dailyCases.deaths, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">조사 기록 목록</h1>
            <p className="text-sm text-teal-200 mt-0.5">현장 역학조사 전체 기록</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-white/20 active:bg-white/30 touch-manipulation"
            aria-label="대시보드"
          >
            <LayoutDashboard size={22} />
          </button>
        </div>
      </header>

      {/* Summary stats */}
      {!loading && !error && records.length > 0 && (
        <div className="px-4 -mt-2 mb-2">
          <div className="bg-white shadow-sm rounded-xl p-4 grid grid-cols-3 gap-3">
            <StatCard
              label="총 기록"
              value={records.length}
              icon={<Activity size={18} />}
              accent="teal"
            />
            <StatCard
              label="누적 환자"
              value={totalCases.toLocaleString()}
              icon={<Users size={18} />}
              accent="orange"
            />
            <StatCard
              label="누적 사망"
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
            <p className="text-sm text-gray-500">데이터를 불러오지 못했습니다.</p>
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
