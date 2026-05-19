import { useLanguage } from '../contexts/LanguageContext';

export function LangToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center bg-white/20 rounded-full p-0.5 text-xs font-bold touch-manipulation select-none"
      aria-label={lang === 'ko' ? '영어로 전환' : 'Switch to Korean'}
    >
      <span
        className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
          lang === 'ko' ? 'bg-white text-teal-700 shadow-sm' : 'text-white/60'
        }`}
      >
        KO
      </span>
      <span
        className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
          lang === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-white/60'
        }`}
      >
        EN
      </span>
    </button>
  );
}
