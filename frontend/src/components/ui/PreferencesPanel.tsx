import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

export function PreferencesPanel() {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-lg backdrop-blur-sm transition hover:border-violet-400/50 hover:bg-violet-500/20 hover:text-violet-200"
        title="Preferences"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 left-6 z-50 w-72 rounded-xl border border-slate-300 bg-white/95 p-5 shadow-2xl backdrop-blur-md dark:border-violet-500/30 dark:bg-slate-900/95">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Preferences</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Theme
              </label>
              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-900 transition hover:border-slate-400 hover:bg-slate-200 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700/60"
                >
                  {theme === 'dark' ? (
                    <>
                      <svg className="mx-auto mb-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Light Mode
                    </>
                  ) : (
                    <>
                      <svg className="mx-auto mb-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Language
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                    i18n.language === 'en'
                      ? 'border-violet-500 bg-violet-100 text-violet-900 dark:border-violet-500/50 dark:bg-violet-500/20 dark:text-violet-200'
                      : 'border-slate-300 bg-slate-100 text-slate-900 hover:border-slate-400 hover:bg-slate-200 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700/60'
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => changeLanguage('nl')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                    i18n.language === 'nl'
                      ? 'border-violet-500 bg-violet-100 text-violet-900 dark:border-violet-500/50 dark:bg-violet-500/20 dark:text-violet-200'
                      : 'border-slate-300 bg-slate-100 text-slate-900 hover:border-slate-400 hover:bg-slate-200 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700/60'
                  }`}
                >
                  🇳🇱 Nederlands
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-600 dark:text-slate-500">
            Your preferences are saved locally
          </p>
        </div>
      )}
    </>
  );
}
