import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { CryptoProvider, useCrypto } from './contexts/CryptoContext';
import { UnlockModal } from './components/UnlockModal';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { Footer } from './components/Footer';

const RecordList = lazy(() => import('./pages/RecordList'));
const NewRecord = lazy(() => import('./pages/NewRecord'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RecordDetail = lazy(() => import('./pages/RecordDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const Guide = lazy(() => import('./pages/Guide'));

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

function PageLoader() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900'>
      <div
        className='w-10 h-10 border-4 rounded-full animate-spin mb-4'
        style={{
          borderColor: '#1a6b4a',
          borderTopColor: 'transparent',
        }}
      />
      <p className='text-sm text-gray-500 dark:text-gray-400'>
        Loading...
      </p>
    </div>
  );
}

function AppRoutes() {
  useTheme();
  const { isEncryptionEnabled, isUnlocked } = useCrypto();

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route index element={<RecordList />} />
            <Route path="/new" element={<NewRecord />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/records/:id" element={<RecordDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </BrowserRouter>

      {/* Lock screen — rendered above the router so it blocks all routes */}
      {isEncryptionEnabled && !isUnlocked && <UnlockModal />}

      {/* First-launch privacy notice — shown once, above everything else */}
      <PrivacyNoticeModal />
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