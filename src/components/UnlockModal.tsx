import { useState, useCallback, useRef, useEffect } from 'react';
import { Lock, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff, AlertTriangle, Trash2 } from 'lucide-react';
import { useCrypto } from '../contexts/CryptoContext';
import { useLanguage } from '../contexts/LanguageContext';

type Mode = 'password' | 'recovery';

const RESET_PHRASE: Record<'ko' | 'en', string> = { ko: '초기화', en: 'RESET' };

/** Full-screen lock screen shown when encryption is enabled but the app is locked.
 *  Cannot be dismissed with a valid credential — the only other way out is the
 *  explicit "forgot both" reset flow below, which is destructive by design. */
export function UnlockModal() {
  const { t, lang } = useLanguage();
  const { unlock, unlockWithRecoveryCode, resetForgotten } = useCrypto();

  const [mode, setMode] = useState<Mode>('password');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // "Forgot both" reset flow
  const [showReset, setShowReset] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input whenever the mode changes
  useEffect(() => {
    setValue('');
    setError('');
    setShowPassword(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [mode]);

  const handleSubmit = useCallback(async () => {
    if (!value.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const ok =
        mode === 'password'
          ? await unlock(value)
          : await unlockWithRecoveryCode(value.trim().replace(/\s/g, '').toUpperCase());
      if (!ok) {
        setError(mode === 'password' ? t.ul_pwd_error : t.ul_recovery_error);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, mode, t.ul_pwd_error, t.ul_recovery_error, unlock, unlockWithRecoveryCode, value]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit],
  );

  const requiredPhrase = RESET_PHRASE[lang];
  const canReset = resetConfirmText.trim() === requiredPhrase;

  const handleReset = useCallback(async () => {
    if (!canReset || resetting) return;
    setResetting(true);
    try {
      await resetForgotten();
      // No need to reset local state here — once isEncryptionEnabled flips
      // to false, App.tsx stops rendering this modal at all.
    } finally {
      setResetting(false);
    }
  }, [canReset, resetForgotten, resetting]);

  // ── "Forgot both" confirmation panel ──────────────────────────────────────

  if (showReset) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-md px-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center">
            <AlertTriangle size={36} className="text-red-400" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">
              {lang === 'ko' ? '모든 데이터를 삭제하고 초기화합니다' : 'This will erase all data and reset'}
            </h1>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              {lang === 'ko'
                ? '비밀번호와 복구코드가 없으면 암호화된 기록은 어떤 방법으로도 복구할 수 없습니다. 계속하면 저장된 모든 현장조사 기록이 영구적으로 삭제되고, 암호화가 비활성화된 빈 상태로 앱이 시작됩니다. 이 작업은 되돌릴 수 없습니다.'
                : 'Without either the password or the recovery code, encrypted records can never be recovered by any means. Continuing will permanently delete every stored field record and restart the app with encryption disabled. This cannot be undone.'}
            </p>
          </div>

          <div className="w-full">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {lang === 'ko'
                ? `계속하려면 "${requiredPhrase}"를 입력하세요`
                : `Type "${requiredPhrase}" to continue`}
            </label>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="w-full h-12 px-4 rounded-xl border border-red-800 bg-gray-800 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
              placeholder={requiredPhrase}
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <button
              type="button"
              disabled={!canReset || resetting}
              onClick={handleReset}
              className="w-full h-12 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white disabled:text-red-400/60 rounded-xl font-semibold text-sm active:bg-red-700 touch-manipulation transition-colors"
            >
              {resetting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Trash2 size={18} />
                  {lang === 'ko' ? '모든 데이터 삭제 및 초기화' : 'Delete everything and reset'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReset(false);
                setResetConfirmText('');
              }}
              className="w-full h-11 text-sm text-gray-300 hover:text-white touch-manipulation"
            >
              {lang === 'ko' ? '취소하고 돌아가기' : 'Cancel and go back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal unlock screen ───────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-md px-6 dark:bg-gray-900">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-teal-600/20 border-2 border-teal-500/40 flex items-center justify-center">
          <Lock size={36} className="text-teal-400" />
        </div>

        {/* Title + description */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">{t.ul_title}</h1>
          <p className="text-sm text-gray-400 mt-1.5 leading-relaxed dark:text-gray-300">{t.ul_desc}</p>
        </div>

        {/* Input area */}
        <div className="w-full flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 dark:text-gray-300">
              {mode === 'password' ? t.ul_pwd_label : t.ul_recovery_label}
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={mode === 'password' ? (showPassword ? 'text' : 'password') : 'text'}
                value={value}
                onChange={(e) =>
                  setValue(
                    mode === 'recovery'
                      ? e.target.value.replace(/\s/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '')
                      : e.target.value,
                  )
                }
                onKeyDown={handleKey}
                placeholder={mode === 'password' ? t.ul_pwd_ph : t.ul_recovery_ph}
                autoComplete={mode === 'password' ? 'current-password' : 'off'}
                spellCheck={false}
                className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
              {mode === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Unlock button */}
          <button
            type="button"
            disabled={!value.trim() || loading}
            onClick={handleSubmit}
            className="w-full h-12 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900 text-white disabled:text-teal-600/60 rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation transition-colors"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <ShieldCheck size={18} />
                {t.ul_unlock_btn}
              </>
            )}
          </button>
        </div>

        {/* Mode toggle */}
        <button
          type="button"
          onClick={() => setMode(mode === 'password' ? 'recovery' : 'password')}
          className="text-sm text-teal-400 hover:text-teal-300 touch-manipulation dark:text-teal-400"
        >
          {mode === 'password' ? t.ul_switch_recovery : t.ul_switch_pwd}
        </button>

        {/* Forgot both — last-resort destructive reset */}
        <button
          type="button"
          onClick={() => setShowReset(true)}
          className="text-xs text-gray-500 hover:text-gray-300 touch-manipulation underline underline-offset-2"
        >
          {lang === 'ko' ? '비밀번호와 복구코드를 모두 잃어버렸어요' : 'I lost both my password and recovery code'}
        </button>
      </div>
    </div>
  );
}