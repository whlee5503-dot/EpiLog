import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  useNavigate,
  useMatch,
  useParams,
  Link,
} from 'react-router-dom';
import { ChevronLeft, Activity, ClipboardList, Home } from 'lucide-react';
import RecordList from './pages/RecordList';
import NewRecord from './pages/NewRecord';

// ─── Route metadata ───────────────────────────────────────────────────────────

interface RouteMeta {
  title: string;
  showBack: boolean;
}

function useRouteMeta(): RouteMeta {
  const { pathname } = useLocation();
  const isDetail = useMatch('/records/:id');

  if (isDetail) return { title: '기록 상세', showBack: true };

  const map: Record<string, RouteMeta> = {
    '/':     { title: '조사 기록 목록', showBack: false },
    '/new':  { title: '새 현장 기록',   showBack: true  },
  };

  return map[pathname] ?? { title: '페이지를 찾을 수 없습니다', showBack: true };
}

// ─── Global app header ────────────────────────────────────────────────────────

function AppHeader() {
  const navigate = useNavigate();
  const { title, showBack } = useRouteMeta();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center h-14 px-4 gap-3">
        {/* Left: back button or app icon */}
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="p-1.5 -ml-1.5 rounded-lg text-gray-500 active:bg-gray-100 touch-manipulation"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-teal-600">
            <Activity size={20} strokeWidth={2.5} />
          </div>
        )}

        {/* Center: page title + EpiLog brand */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-teal-600 font-semibold leading-none tracking-wide uppercase">
            EpiLog
          </p>
          <h1 className="text-sm font-bold text-gray-800 leading-snug truncate">{title}</h1>
        </div>

        {/* Right: home shortcut (non-root pages) */}
        {showBack && (
          <Link
            to="/"
            aria-label="홈으로"
            className="p-1.5 -mr-1.5 rounded-lg text-gray-400 active:bg-gray-100 touch-manipulation"
          >
            <Home size={20} />
          </Link>
        )}
      </div>
    </header>
  );
}

// ─── Shared layout (wraps all routes) ─────────────────────────────────────────

function AppShell() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <Outlet />
    </div>
  );
}

// ─── RecordDetail placeholder ─────────────────────────────────────────────────

function RecordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 px-4 py-10 items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
        <ClipboardList size={36} className="text-teal-400" />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">기록 상세 준비 중</p>
        <p className="text-sm text-gray-400 mt-1">
          기록 ID: <span className="font-mono font-medium text-teal-600">{id}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}

// ─── 404 Not Found ────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 text-center gap-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-4xl font-black text-gray-300">404</span>
      </div>

      <div>
        <p className="text-lg font-semibold text-gray-700">페이지를 찾을 수 없습니다</p>
        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
          요청하신 주소가 올바른지 확인해 주세요.
        </p>
      </div>

      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
      >
        <Home size={16} />
        홈으로 이동
      </Link>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<RecordList />} />
          <Route path="/new" element={<NewRecord />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
