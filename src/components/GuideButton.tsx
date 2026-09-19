import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Guide is one of the few things every screen should be able to reach in
 * one tap (not just Settings), so it lives in the shared header control
 * row rather than buried in a Settings sub-section.
 */
export function GuideButton() {
    const navigate = useNavigate();
    const { lang } = useLanguage();

    return (
        <button
            type="button"
            onClick={() => navigate('/guide')}
            className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl bg-white/20 active:bg-white/30 touch-manipulation"
            aria-label={lang === 'ko' ? '가이드' : 'Guide'}
        >
            <BookOpen size={18} />
            <span className="text-[9px] leading-none font-medium">{lang === 'ko' ? '가이드' : 'Guide'}</span>
        </button>
    );
}