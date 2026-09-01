"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Item = { date: string; title: string; type: "task" | "event"; href?: string };

export function CalendarView({ items }: { items: Item[] }) {
  const [view, setView] = useState<"month" | "list">("month");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const byDay = useMemo(() => {
    const map = new Map<number, Item[]>();
    for (const item of items) {
      const d = new Date(item.date);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const day = d.getDate();
      map.set(day, [...(map.get(day) ?? []), item]);
    }
    return map;
  }, [items, year, month]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <>
      <div className="chip-row" style={{ margin: "0 0 18px" }}>
        <button type="button" className={`chip${view === "month" ? " active" : ""}`} onClick={() => setView("month")}>Month</button>
        <button type="button" className={`chip${view === "list" ? " active" : ""}`} onClick={() => setView("list")}>List</button>
      </div>

      {view === "month" ? (
        <div className="card" style={{ padding: 22 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, marginBottom: 18 }}>{monthLabel}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textAlign: "center", textTransform: "uppercase" }}>{d}</div>
            ))}
            {cells.map((day, i) => (
              <div
                key={i}
                style={{
                  minHeight: 88, borderRadius: "var(--r-md)", border: "1px solid var(--line)",
                  background: day ? "var(--card)" : "transparent", borderColor: day ? "var(--line)" : "transparent",
                  padding: 8, display: "flex", flexDirection: "column", gap: 4,
                }}
              >
                {day && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>{day}</div>}
                {day && (byDay.get(day) ?? []).map((item, j) => (
                  <div
                    key={j}
                    style={{
                      fontSize: 10.5, fontWeight: 600, padding: "2px 6px", borderRadius: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      background: item.type === "event" ? "var(--gold-soft)" : "var(--blue-soft)",
                      color: item.type === "event" ? "#8a5a06" : "var(--blue)",
                    }}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="list-card" style={{ margin: 8 }}>
            {items
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((item, i) => {
                const d = new Date(item.date);
                const row = (
                  <div className="row" style={{ padding: "13px 16px" }}>
                    <div style={{ width: 52, textAlign: "center", flex: "none" }}>
                      <b style={{ display: "block", fontFamily: "var(--font-heading)", fontSize: 17 }}>{d.getDate()}</b>
                      <span style={{ fontSize: 10.5, color: "var(--ink-soft)", textTransform: "uppercase" }}>{d.toLocaleDateString("en-GB", { month: "short" })}</span>
                    </div>
                    <div className="row-label">{item.title}</div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: item.type === "event" ? "var(--gold-soft)" : "var(--blue-soft)", color: item.type === "event" ? "#8a5a06" : "var(--blue)" }}>
                      {item.type === "event" ? "Event" : "Task"}
                    </span>
                  </div>
                );
                return item.href ? (
                  <Link key={i} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>{row}</Link>
                ) : (
                  <div key={i}>{row}</div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
}
