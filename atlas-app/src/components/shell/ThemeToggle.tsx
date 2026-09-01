"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export function ThemeToggle({ className = "icon-btn" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
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
 * before React ever mounts to manage it. */
export function ThemeInitScript() {
  const code = `(function(){try{var t=localStorage.getItem('atlas-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
  return <Script id="theme-init" strategy="beforeInteractive">{code}</Script>;
}
