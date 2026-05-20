import { useState, useCallback } from 'react';
import { X, Copy, Check, Shield, KeyRound, CheckCircle2, Loader2 } from 'lucide-react';
import { useCrypto } from '../contexts/CryptoContext';
import { useLanguage } from '../contexts/LanguageContext';

type Step = 'password' | 'recovery' | 'done';

const STEPS: Step[] = ['password', 'recovery', 'done'];

interface Props {
  onClose: () => void;
}

/** Modal for enabling encryption for the first time. Walks through 3 steps:
 *  password setup → recovery code display → completion. */
export function EncryptionSetupModal({ onClose }: Props) {
  const { t } = useLanguage();
  const { enableEncryption } = useCrypto();

  const [step, setStep] = useState<Step>('password');
  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [written, setWritten] = useState(false);

  const pwdTooShort = pwd.length > 0 && pwd.length < 8;
  const pwdMismatch = pwdConfirm.length > 0 && pwd !== pwdConfirm;
  const canProceed = pwd.length >= 8 && pwd === pwdConfirm;

  const stepIndex = STEPS.indexOf(step);

  const handlePasswordNext = useCallback(async () => {
    if (!canProceed) return;
    setLoading(true);
    setError('');
    try {
      const code = await enableEncryption(pwd);
      setRecoveryCode(code);
      setStep('recovery');
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [canProceed, enableEncryption, pwd]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(recoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [recoveryCode]);

  // Format as groups of 4 for readability: ABCD EFGH IJKL MNOP
  const formattedCode = recoveryCode.match(/.{1,4}/g)?.join(' ') ?? recoveryCode;

  const stepLabels = [t.enc_step_pwd, t.enc_step_recovery, t.enc_step_done];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t.enc_setup_title}</h2>
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mt-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      stepIndex > i
                        ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400'
                        : stepIndex === i
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    {stepIndex > i ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${stepIndex === i ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-300'}`}>
                    {stepLabels[i]}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`w-5 h-px transition-colors ${stepIndex > i ? 'bg-teal-300 dark:bg-teal-700' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4 overflow-y-auto flex-1">

          {/* ── Step 1: Password ── */}
          {step === 'password' && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                  <KeyRound size={20} className="text-teal-600" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
                  {t.enc_step_pwd}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t.enc_pwd_label}
                  </label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder={t.enc_pwd_ph}
                    autoComplete="new-password"
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {pwdTooShort && (
                    <p className="text-xs text-red-500 mt-1">{t.enc_pwd_too_short}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t.enc_pwd_confirm}
                  </label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    placeholder={t.enc_pwd_confirm_ph}
                    autoComplete="new-password"
                    onKeyDown={(e) => { if (e.key === 'Enter' && canProceed) handlePasswordNext(); }}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {pwdMismatch && (
                    <p className="text-xs text-red-500 mt-1">{t.enc_pwd_mismatch}</p>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPwd}
                    onChange={(e) => setShowPwd(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t.enc_show_pwd}</span>
                </label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </>
          )}

          {/* ── Step 2: Recovery code ── */}
          {step === 'recovery' && (
            <>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-amber-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug pt-1">
                  {t.enc_recovery_desc}
                </p>
              </div>

              {/* Code display */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-3">
                <span className="font-mono text-lg font-bold tracking-widest text-gray-900 dark:text-white break-all">
                  {formattedCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-medium active:opacity-70 touch-manipulation"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? t.enc_copied : t.enc_copy}
                </button>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={written}
                  onChange={(e) => setWritten(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 shrink-0"
                />
                <span className="text-sm text-amber-800 dark:text-amber-200 font-medium leading-snug">
                  {t.enc_written_check}
                </span>
              </label>
            </>
          )}

          {/* ── Step 3: Done ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-teal-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{t.enc_done_title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{t.enc_done_desc}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-7 pt-3 shrink-0">
          {step === 'password' && (
            <button
              type="button"
              disabled={!canProceed || loading}
              onClick={handlePasswordNext}
              className="w-full h-12 flex items-center justify-center gap-2 bg-teal-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation transition-colors"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : t.enc_next}
            </button>
          )}
          {step === 'recovery' && (
            <button
              type="button"
              disabled={!written}
              onClick={() => setStep('done')}
              className="w-full h-12 bg-teal-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation transition-colors"
            >
              {t.enc_next}
            </button>
          )}
          {step === 'done' && (
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
            >
              {t.enc_done_btn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
