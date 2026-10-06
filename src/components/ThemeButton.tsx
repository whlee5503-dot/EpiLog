import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Shared theme toggle for the header control row.
 * The icon and label both show the mode you will switch TO
 * (Sun + "Light" while in dark mode, Moon + "Dark" while in light mode).
 */
export function ThemeButton() {
    const { isDark, toggle } = useTheme();
    const { lang } = useLanguage();

    const label = isDark
        ? (lang === 'ko' ? '라이트' : 'Light')
        : (lang === 'ko' ? '다크' : 'Dark');

    const ariaLabel = isDark
        ? (lang === 'ko' ? '라이트 모드로 전환' : 'Switch to light mode')
        : (lang === 'ko' ? '다크 모드로 전환' : 'Switch to dark mode');

    return (
        <button
            type="button"
            onClick={toggle}
            className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl bg-white/20 active:bg-white/30 touch-manipulation"
            aria-label={ariaLabel}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-[9px] leading-none font-medium">{label}</span>
        </button>
    );
}