import { useLanguage } from '../contexts/LanguageContext';
import { SIBLING_APPS } from '../data/siblingApps';

const CURRENT_APP_ID = 'epilog';

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 px-4 py-6 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {t.ftr_siblings_heading}
        </span>
        <nav className="flex flex-wrap gap-3">
          {SIBLING_APPS.map((app) =>
            app.id === CURRENT_APP_ID ? (
              <span
                key={app.id}
                className="text-sm font-bold text-teal-600 dark:text-teal-400"
              >
                {app.name}
              </span>
            ) : (
              <a
                key={app.id}
                href={app.url}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:underline"
              >
                {app.name}
              </a>
            )
          )}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-400 dark:text-gray-500">
        <a
          href="https://phtlab.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-teal-600 dark:hover:text-teal-400 hover:underline"
        >
          {t.ftr_hub}
        </a>
        <span className="text-gray-300 dark:text-gray-700">&middot;</span>
        <a
          href="https://orcid.org/0009-0005-1866-8257"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-teal-600 dark:hover:text-teal-400 hover:underline"
        >
          {t.ftr_orcid}
        </a>
        <span className="text-gray-300 dark:text-gray-700">&middot;</span>
        <span>&copy; {year} Won Ho Lee &middot; PHT Lab</span>
      </div>

      <p className="text-[11px] italic leading-relaxed text-gray-400 dark:text-gray-500">
        {t.ftr_disclaimer}
      </p>
    </footer>
  );
}

export default Footer;