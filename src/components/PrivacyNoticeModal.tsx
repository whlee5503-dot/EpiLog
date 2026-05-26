import { useState } from 'react';
import { Shield, HardDrive, UserX, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LangToggle } from './LangToggle';

const STORAGE_KEY = 'epilog-privacy-accepted';

interface PrivacyNoticeModalProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function PrivacyNoticeModal({ forceShow = false, onClose }: PrivacyNoticeModalProps = {}) {
  const { t } = useLanguage();
  const [accepted, setAccepted] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  if (accepted && !forceShow) return null;

  const handleConfirm = () => {
    if (forceShow) {
      onClose?.();
    } else {
      localStorage.setItem(STORAGE_KEY, 'true');
      setAccepted(true);
    }
  };

  const items = [
    { icon: <HardDrive size={20} className="text-teal-400 shrink-0 mt-0.5" />, text: t.pn_item1 },
    { icon: <UserX size={20} className="text-teal-400 shrink-0 mt-0.5" />, text: t.pn_item2 },
    { icon: <Lock size={20} className="text-teal-400 shrink-0 mt-0.5" />, text: t.pn_item3 },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/95 backdrop-blur-md px-6">
      <div className="relative w-full max-w-sm flex flex-col items-center gap-6">
        {/* Language toggle — top-right corner, above Shield icon */}
        <div className="absolute top-0 right-0">
          <LangToggle />
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-teal-600/20 border-2 border-teal-500/40 flex items-center justify-center">
          <Shield size={36} className="text-teal-400" />
        </div>

        {/* Title */}
        <p className="text-2xl font-bold text-white text-center">{t.pn_title}</p>

        {/* Items */}
        <ul className="w-full flex flex-col gap-4">
          {items.map(({ icon, text }, i) => (
            <li key={i} className="flex items-start gap-3 bg-gray-800/60 rounded-xl px-4 py-3">
              {icon}
              <span className="text-sm text-gray-200 leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>

        {/* Confirm button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full h-12 flex items-center justify-center gap-2 bg-teal-600 text-white rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation transition-colors"
        >
          <Shield size={18} />
          {t.pn_confirm}
        </button>
      </div>
    </div>
  );
}
