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
import Settings from './pages/Settings';
import { useTheme } from './hooks/useTheme';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { CryptoProvider, useCrypto } from './contexts/CryptoContext';
import { UnlockModal } from './components/UnlockModal';

function RecordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1 px-4 py-10 items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
        <ClipboardList size={36} className="text-teal-400" />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{t.app_detail_title}</p>
        <p className="text-sm text-gray-400 mt-1">
          {t.app_record_id} <span className="font-mono font-medium text-teal-600">{id}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full h-11 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
        >
          {t.app_back_list}
        </button>
      </div>
    </div>
  );
}

function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 text-center gap-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <span className="text-4xl font-black text-gray-300 dark:text-gray-600">404</span>
      </div>

      <div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{t.app_not_found}</p>
        <p className="text-sm text-gray-400 mt-1 leading-relaxed">{t.app_not_found_desc}</p>
      </div>

      <Link
        to="/"
        className="flex items-center gap-2 px-6 h-11 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
      >
        <Home size={16} />
        {t.app_go_home}
      </Link>
    </div>
  );
}

function AppRoutes() {
  useTheme();
  const { isEncryptionEnabled, isUnlocked } = useCrypto();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<RecordList />} />
          <Route path="/new" element={<NewRecord />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      {/* Lock screen — rendered above the router so it blocks all routes */}
      {isEncryptionEnabled && !isUnlocked && <UnlockModal />}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CryptoProvider>
        <AppRoutes />
      </CryptoProvider>
    </LanguageProvider>
  );
}
