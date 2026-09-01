"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
function getThemeSnapshot() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}
function getServerThemeSnapshot() {
  return false; // matches the hardcoded data-theme="light" in app/layout.tsx
}

export function ThemeToggle({ className = "icon-btn" }: { className?: string }) {
  // Reads the <html> attribute (set synchronously pre-hydration by
  // ThemeInitScript below) without an effect — see useIsMounted's doc
  // comment for why useSyncExternalStore replaces the classic
  // state+effect pair here.
  const dark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  function toggle() {
    const next = !dark;
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem("atlas-theme", next ? "dark" : "light");
    } catch {
      // storage unavailable — theme just won't persist across reloads
    }
  }

  return (
    <button type="button" className={className} title="Toggle theme" onClick={toggle} style={{ position: "relative" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: dark ? 0 : 1, width: 18, height: 18 }}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ opacity: dark ? 1 : 0, width: 18, height: 18, position: "absolute" }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}

/** Blocking pre-hydration script so the theme doesn't flash on load.
 * next/script's beforeInteractive strategy is Next's supported way to
 * inject this in <head> — a raw JSX <script> tag triggers a dev warning
 * ("scripts inside React components are never executed on the client")
 * even though it works, because it runs once during raw HTML parsing,
 * before React ever mounts to manage it.
 *
 * eslint-disable-next-line: the no-before-interactive-script-outside-document
 * rule predates the App Router and only recognizes this pattern when the
 * <Script> JSX is written literally inline in app/layout.tsx. It IS there
 * (imported and rendered in <head>, see app/layout.tsx) — this component
 * just factors the script string out of that file. False positive. */
export function ThemeInitScript() {
  const code = `(function(){try{var t=localStorage.getItem('atlas-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
  // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
  return <Script id="theme-init" strategy="beforeInteractive">{code}</Script>;
}
