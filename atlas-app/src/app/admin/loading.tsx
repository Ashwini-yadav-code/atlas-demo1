export default function AdminLoading() {
  return (
    <div className="stat-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 76, borderRadius: "var(--r-lg)" }} />
      ))}
    </div>
  );
}
