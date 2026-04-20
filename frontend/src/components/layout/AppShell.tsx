import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { logout } from "../../lib/api";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Button } from "../ui/Button";
import { StatusPill } from "../ui/StatusPill";
import { HelpModal } from "../ui/HelpModal";
import { Alert } from "../ui/Alert";
import { Footer } from "./Footer";

const SunIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDown = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const MenuIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const iconButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-750 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";

export function AppShell() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const snapshot = useDashboardStore((state) => state.snapshot);
  const reset = useDashboardStore((state) => state.reset);
  const [helpOpen, setHelpOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/settings",  label: t("nav.settings") },
    { to: "/history",   label: t("nav.history") },
  ];

  const languages = [
    { code: "en", name: "English",    flag: "🇬🇧" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    { code: "es", name: "Español",    flag: "🇪🇸" },
    { code: "pt", name: "Português",  flag: "🇵🇹" },
    { code: "fr", name: "Français",   flag: "🇫🇷" },
    { code: "de", name: "Deutsch",    flag: "🇩🇪" },
    { code: "ru", name: "Русский",    flag: "🇷🇺" },
    { code: "ja", name: "日本語",      flag: "🇯🇵" },
    { code: "ko", name: "한국어",      flag: "🇰🇷" },
    { code: "tr", name: "Türkçe",     flag: "🇹🇷" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) ?? languages[0];

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  }, [pathname]);

  // Close menus on Escape
  useEffect(() => {
    if (!langMenuOpen && !mobileMenuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLangMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [langMenuOpen, mobileMenuOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-4 py-1.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
      isActive
        ? "bg-violet-600 text-white"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  async function handleLogout() {
    await logout();
    reset();
    navigate("/");
  }

  return (
    <div className="relative min-h-screen text-slate-100">
      {/* ── Fixed header ── */}
      <header className="fixed top-0 z-40 w-full border-b border-slate-800 bg-slate-900 shadow-sm">
        <div className="mx-auto flex h-14 max-w-[1920px] items-center gap-3 px-4 sm:px-6">

          {/* Version — hidden on mobile */}
          <div className="hidden shrink-0 font-mono text-xs text-slate-500 sm:block">
            v{__BUILD_VERSION__}
          </div>
          <div className="hidden h-6 w-px bg-slate-800 sm:block" aria-hidden="true" />

          {/* Avatar + channel */}
          <div className="flex shrink-0 items-center gap-3">
            {snapshot?.broadcaster.profileImageUrl ? (
              <img
                src={snapshot.broadcaster.profileImageUrl}
                alt={snapshot.broadcaster.displayName}
                className="h-8 w-8 rounded-lg border border-slate-700 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-600/20 text-sm font-bold text-violet-300">
                {(snapshot?.broadcaster.displayName ?? "T").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight text-white">
                {snapshot?.broadcaster.channelName ?? snapshot?.broadcaster.displayName ?? "Giveaway Wheel"}
              </p>
              <p className="text-xs leading-tight text-slate-500">{t("nav.appSubtitle")}</p>
            </div>
          </div>

          <div className="hidden h-6 w-px bg-slate-800 sm:block" aria-hidden="true" />

          {/* Desktop nav — hidden on mobile */}
          <nav aria-label={t("nav.mainNavLabel", "Main navigation")} className="hidden flex-1 justify-center sm:flex">
            <div className="flex gap-1">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Mobile: spacer + hamburger */}
          <div className="flex flex-1 items-center justify-end gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t("nav.closeMenu", "Close menu") : t("nav.openMenu", "Open menu")}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              className={iconButtonClass}
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* Desktop right controls — hidden on mobile */}
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? t("settings.lightMode") : t("settings.darkMode")}
              className={iconButtonClass}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Language switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label={t("settings.language")}
                aria-expanded={langMenuOpen}
                aria-haspopup="listbox"
                className="flex h-8 items-center justify-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-750 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
                <ChevronDown />
              </button>

              {langMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} aria-hidden="true" />
                  <ul
                    role="listbox"
                    aria-label={t("settings.language")}
                    className="absolute right-0 top-10 z-50 w-48 rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-2xl"
                  >
                    {languages.map((lang) => (
                      <li key={lang.code} role="option" aria-selected={i18n.language === lang.code}>
                        <button
                          type="button"
                          onClick={() => { i18n.changeLanguage(lang.code); setLangMenuOpen(false); }}
                          className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:bg-slate-800 ${
                            i18n.language === lang.code
                              ? "bg-violet-500/20 text-violet-300"
                              : "text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                          {i18n.language === lang.code && <CheckIcon />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Help */}
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label={t("nav.helpTitle")}
              className={iconButtonClass}
            >
              <QuestionIcon />
            </button>

            <StatusPill status={snapshot?.twitch.status ?? "disconnected"} />

            <Button variant="ghost" className="text-sm" onClick={handleLogout}>
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mobile nav panel ── */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav"
          className="fixed top-14 left-0 right-0 z-30 border-b border-slate-800 bg-slate-900/98 shadow-lg backdrop-blur-sm sm:hidden"
        >
          <nav aria-label={t("nav.mainNavLabel", "Main navigation")} className="px-4 pt-3 pb-2">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="border-t border-slate-800 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <StatusPill status={snapshot?.twitch.status ?? "disconnected"} />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === "dark" ? t("settings.lightMode") : t("settings.darkMode")}
                  className={iconButtonClass}
                >
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </button>
                <button
                  type="button"
                  onClick={() => { setHelpOpen(true); setMobileMenuOpen(false); }}
                  aria-label={t("nav.helpTitle")}
                  className={iconButtonClass}
                >
                  <QuestionIcon />
                </button>
                <Button variant="ghost" className="text-sm" onClick={handleLogout}>
                  {t("nav.logout")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col px-4 pt-16 sm:px-6">
        {snapshot?.twitch.lastError && (
          <div className="mt-4">
            <Alert variant="error">
              {t("nav.twitchError")}: {snapshot.twitch.lastError}
            </Alert>
          </div>
        )}

        <main className="flex-1 py-4">
          <Outlet />
        </main>

        <Footer />
      </div>

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
