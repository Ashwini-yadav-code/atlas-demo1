/** Suspense fallback for every page under the (app) route group — the
 * sidebar/topbar chrome (rendered by the layout) stays put; this covers
 * just the content area while a page's own data fetch is in flight.
 * Shape/radius match the real cards so it doesn't jump on swap-in. */
export default function AppLoading() {
  return (
    <div>
      <div className="j-head">
        <div>
          <div className="skeleton" style={{ width: 220, height: 30, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 320, height: 16, borderRadius: 6, marginTop: 10 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 140, borderRadius: "var(--r-lg)", marginBottom: 22 }} />
      <div className="stat-row">
        <div className="skeleton" style={{ height: 84, borderRadius: "var(--r-lg)" }} />
        <div className="skeleton" style={{ height: 84, borderRadius: "var(--r-lg)" }} />
        <div className="skeleton" style={{ height: 84, borderRadius: "var(--r-lg)" }} />
      </div>
    </div>
  );
}
