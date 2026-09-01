/* ==========================================================================
   Atlas auth gate — static-prototype stand-in for real session checking.
   This file is a static mock with no server, so there's no real session to
   verify; it checks a localStorage flag set by auth.html on successful
   sign-in (mirrors how the real app's requireUser() redirects to /auth).
   Include this as the FIRST thing in <head>, unminified and render-
   blocking (no async/defer), so a signed-out visitor never sees a flash
   of the protected page before the redirect fires.
   ========================================================================== */
(function () {
  try {
    if (localStorage.getItem('atlas-session') !== '1') {
      location.replace('auth.html');
    }
  } catch (e) {
    // localStorage unavailable (private browsing, disabled storage) —
    // fail open rather than lock a real visitor out of a static demo
  }
})();
