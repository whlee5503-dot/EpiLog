import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { T, type Lang, type Translations } from '../i18n/translations';

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ko',
  t: T.ko,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('epilog-lang') as Lang) ?? 'ko';
  });

  useEffect(() => {
    localStorage.setItem('epilog-lang', lang);
  }, [lang]);

  const toggle = () => setLang((l) => (l === 'ko' ? 'en' : 'ko'));

  return (
    <LanguageContext.Provider value={{ lang, t: T[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
