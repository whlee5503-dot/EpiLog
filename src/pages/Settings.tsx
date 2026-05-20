import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  ShieldOff,
  Lock,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useCrypto } from '../contexts/CryptoContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EncryptionSetupModal } from '../components/EncryptionSetupModal';
import { db } from '../db/database';

type PanelView = 'none' | 'disable' | 'changePwd' | 'newRecovery';

// ─── Small helpers ─────────────────────────────────────────────────────────────

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Settings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isEncryptionEnabled, disableEncryption, changePassword } = useCrypto();

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [panel, setPanel] = useState<PanelView>('none');

  // Disable encryption state
  const [disablePwd, setDisablePwd] = useState('');
  const [disableError, setDisableError] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);

  // Change password state
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwdConfirm, setNewPwdConfirm] = useState('');
  const [chPwdError, setChPwdError] = useState('');
  const [chPwdLoading, setChPwdLoading] = useState(false);
  const [newRecoveryCode, setNewRecoveryCode] = useState('');
  const [copied, setCopied] = useState(false);

  const newPwdTooShort = newPwd.length > 0 && newPwd.length < 8;
  const newPwdMismatch = newPwdConfirm.length > 0 && newPwd !== newPwdConfirm;
  const canChangePwd = oldPwd.length > 0 && newPwd.length >= 8 && newPwd === newPwdConfirm;

  const resetPanel = useCallback(() => {
    setPanel('none');
    setDisablePwd('');
    setDisableError('');
    setOldPwd('');
    setNewPwd('');
    setNewPwdConfirm('');
    setChPwdError('');
    setNewRecoveryCode('');
    setCopied(false);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDisable = useCallback(async () => {
    setDisableLoading(true);
    setDisableError('');
    try {
      await disableEncryption(disablePwd);
      resetPanel();
    } catch {
      setDisableError(t.st_disable_error);
    } finally {
      setDisableLoading(false);
    }
  }, [disableEncryption, disablePwd, resetPanel, t.st_disable_error]);

  const handleChangePassword = useCallback(async () => {
    if (!canChangePwd) return;
    setChPwdLoading(true);
    setChPwdError('');
    try {
      const code = await changePassword(oldPwd, newPwd, async (oldKey, newKey) => {
        await db.reEncryptAll(oldKey, newKey);
      });
      setNewRecoveryCode(code);
      setCopied(false);
      setPanel('newRecovery');
    } catch {
      setChPwdError(t.st_chpwd_error);
    } finally {
      setChPwdLoading(false);
    }
  }, [canChangePwd, changePassword, newPwd, oldPwd, t.st_chpwd_error]);

  const handleCopyRecovery = useCallback(async () => {
    await navigator.clipboard.writeText(newRecoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [newRecoveryCode]);

  const formattedRecovery = newRecoveryCode.match(/.{1,4}/g)?.join(' ') ?? newRecoveryCode;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 touch-manipulation"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-bold">{t.st_title}</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* ── Encryption section ── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isEncryptionEnabled
                ? 'bg-teal-100 dark:bg-teal-900/40'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {isEncryptionEnabled
                ? <ShieldCheck size={18} className="text-teal-600 dark:text-teal-400" />
                : <ShieldOff size={18} className="text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                {t.st_section_encryption}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5 leading-snug">
                {t.st_encryption_desc}
              </p>
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isEncryptionEnabled
                ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {isEncryptionEnabled ? t.st_status_on : t.st_status_off}
            </span>
          </div>

          <div className="px-4 py-4 flex flex-col gap-3">
            {/* ── OFF state ── */}
            {!isEncryptionEnabled && panel === 'none' && (
              <button
                type="button"
                onClick={() => { setShowSetupModal(true); }}
                className="w-full h-11 flex items-center justify-center gap-2 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation"
              >
                <Lock size={16} />
                {t.st_enable_btn}
              </button>
            )}

            {/* ── ON state: action buttons ── */}
            {isEncryptionEnabled && panel === 'none' && (
              <>
                <button
                  type="button"
                  onClick={() => setPanel('changePwd')}
                  className="w-full h-11 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-white active:bg-gray-50 dark:active:bg-gray-700 touch-manipulation"
                >
                  {t.st_change_pwd_btn}
                </button>
                <button
                  type="button"
                  onClick={() => setPanel('disable')}
                  className="w-full h-11 flex items-center justify-center border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/20 touch-manipulation"
                >
                  {t.st_disable_btn}
                </button>
              </>
            )}

            {/* ── Panel: Disable encryption ── */}
            {panel === 'disable' && (
              <div className="flex flex-col gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.st_disable_desc}</p>
                <PasswordInput
                  label={t.enc_pwd_label}
                  value={disablePwd}
                  onChange={setDisablePwd}
                  placeholder={t.ul_pwd_ph}
                />
                {disableError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={15} className="shrink-0" />
                    {disableError}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetPanel}
                    className="flex-1 h-10 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 active:bg-gray-50 dark:active:bg-gray-700 touch-manipulation"
                  >
                    {t.st_cancel}
                  </button>
                  <button
                    type="button"
                    disabled={!disablePwd || disableLoading}
                    onClick={handleDisable}
                    className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-red-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 rounded-xl text-sm font-semibold active:bg-red-700 touch-manipulation transition-colors"
                  >
                    {disableLoading ? <Loader2 size={15} className="animate-spin" /> : t.st_confirm}
                  </button>
                </div>
              </div>
            )}

            {/* ── Panel: Change password ── */}
            {panel === 'changePwd' && (
              <div className="flex flex-col gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.st_chpwd_title}</p>
                <PasswordInput
                  label={t.st_old_pwd_label}
                  value={oldPwd}
                  onChange={setOldPwd}
                />
                <PasswordInput
                  label={t.st_new_pwd_label}
                  value={newPwd}
                  onChange={setNewPwd}
                  autoComplete="new-password"
                />
                {newPwdTooShort && (
                  <p className="text-xs text-red-500 -mt-1">{t.enc_pwd_too_short}</p>
                )}
                <PasswordInput
                  label={t.st_new_pwd_confirm}
                  value={newPwdConfirm}
                  onChange={setNewPwdConfirm}
                  autoComplete="new-password"
                />
                {newPwdMismatch && (
                  <p className="text-xs text-red-500 -mt-1">{t.enc_pwd_mismatch}</p>
                )}
                {chPwdError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={15} className="shrink-0" />
                    {chPwdError}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetPanel}
                    className="flex-1 h-10 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 active:bg-gray-50 dark:active:bg-gray-700 touch-manipulation"
                  >
                    {t.st_cancel}
                  </button>
                  <button
                    type="button"
                    disabled={!canChangePwd || chPwdLoading}
                    onClick={handleChangePassword}
                    className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-teal-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 rounded-xl text-sm font-semibold active:bg-teal-700 touch-manipulation transition-colors"
                  >
                    {chPwdLoading ? <Loader2 size={15} className="animate-spin" /> : t.st_confirm}
                  </button>
                </div>
              </div>
            )}

            {/* ── Panel: New recovery code (after password change) ── */}
            {panel === 'newRecovery' && (
              <div className="flex flex-col gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.st_new_recovery_title}</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2 leading-snug">
                  {t.st_new_recovery_desc}
                </p>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <span className="font-mono text-base font-bold tracking-widest text-gray-900 dark:text-white break-all">
                    {formattedRecovery}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRecovery}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-medium active:opacity-70 touch-manipulation"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? t.enc_copied : t.enc_copy}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetPanel}
                  className="w-full h-10 bg-teal-600 text-white rounded-xl text-sm font-semibold active:bg-teal-700 touch-manipulation"
                >
                  {t.st_confirm}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Encryption setup modal */}
      {showSetupModal && (
        <EncryptionSetupModal onClose={() => setShowSetupModal(false)} />
      )}
    </div>
  );
}
