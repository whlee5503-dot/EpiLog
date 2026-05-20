import { useState, useCallback, useRef, useEffect } from 'react';
import { Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCrypto } from '../contexts/CryptoContext';
import { useLanguage } from '../contexts/LanguageContext';

type Mode = 'password' | 'recovery';

/** Full-screen lock screen shown when encryption is enabled but the app is locked.
 *  Cannot be dismissed — the user must provide a valid credential to continue. */
export function UnlockModal() {
  const { t } = useLanguage();
  const { unlock, unlockWithRecoveryCode } = useCrypto();

  const [mode, setMode] = useState<Mode>('password');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input whenever the mode changes
  useEffect(() => {
    setValue('');
    setError('');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-md px-6 dark:bg-gray-900">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-teal-600/20 border-2 border-teal-500/40 flex items-center justify-center">
          <Lock size={36} className="text-teal-400" />
        </div>

        {/* Title + description */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white dark:text-white">{t.ul_title}</h1>
          <p className="text-sm text-gray-400 mt-1.5 leading-relaxed dark:text-gray-300">{t.ul_desc}</p>
        </div>

        {/* Input area */}
        <div className="w-full flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 dark:text-gray-300">
              {mode === 'password' ? t.ul_pwd_label : t.ul_recovery_label}
            </label>
            <input
              ref={inputRef}
              type={mode === 'password' ? 'password' : 'text'}
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
              className="w-full h-12 px-4 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
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
            className="w-full h-12 flex items-center justify-center gap-2 bg-teal-600 disabled:bg-gray-700 text-white disabled:text-gray-500 rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation transition-colors"
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
      </div>
    </div>
  );
}
