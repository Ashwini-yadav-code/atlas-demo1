/* ==========================================================================
   Atlas auth gate — static-prototype stand-in for real session checking.
   This file is a static mock with no server, so there's no real session to
   verify; it checks localStorage flags set by auth.html (sign-in) and
   onboarding.html (quiz completion) — mirrors how the real Next.js app's
   requireUser() checks both session AND user.onboarded, redirecting to
   /onboarding rather than letting a new user reach the app with no
   profile. Include this as the FIRST thing in <head>, unminified and
   render-blocking (no async/defer), so a signed-out or not-yet-onboarded
   visitor never sees a flash of the protected page before the redirect
   fires.

   Two flags, two independent facts:
   - atlas-session   — signed in at all (set by auth.html, cleared on
                        logout in profile.html)
   - atlas-onboarded — has ever finished the quiz (set by onboarding.html,
                        persists across logout/login — same as the real
                        app, where user.onboarded lives in the database,
                        not the session)
   ========================================================================== */
(function () {
  try {
    if (localStorage.getItem('atlas-session') !== '1') {
      location.replace('auth.html');
      return;
    }

    const onboarded = localStorage.getItem('atlas-onboarded') === '1';
    const onOnboardingPage = /(^|\/)onboarding\.html$/.test(location.pathname);

    if (!onboarded && !onOnboardingPage) {
      // signed in but never completed the quiz — every other page requires
      // that first, same as requireUser() -> redirect("/onboarding")
      location.replace('onboarding.html');
    } else if (onboarded && onOnboardingPage) {
      // already has a profile — no reason to sit on the quiz screen, same
      // as onboarding's own layout redirecting a finished user to "/"
      location.replace('index.html');
    }
  } catch (e) {
    // localStorage unavailable (private browsing, disabled storage) —
    // fail open rather than lock a real visitor out of a static demo
  }
})();
