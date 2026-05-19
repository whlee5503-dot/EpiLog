import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';
import { ClipboardList, Home } from 'lucide-react';
import RecordList from './pages/RecordList';
import NewRecord from './pages/NewRecord';
import Dashboard from './pages/Dashboard';

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
          className="w-full h-11 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}

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
        className="flex items-center gap-2 px-6 h-11 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
      >
        <Home size={16} />
        홈으로 이동
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<RecordList />} />
        <Route path="/new" element={<NewRecord />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/records/:id" element={<RecordDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
