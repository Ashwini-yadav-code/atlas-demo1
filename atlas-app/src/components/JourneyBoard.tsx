"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TaskRow } from "@/components/TaskRow";
import { addTask } from "@/lib/actions";
import type { JourneyStage } from "@/generated/prisma/enums";

type Column = {
  stage: JourneyStage;
  label: string;
  unlocked: boolean;
  tasks: { id: string; label: string; done: boolean; note: string | null; due?: string }[];
};

export function JourneyBoard({ columns }: { columns: Column[] }) {
  const [active, setActive] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  function onAdd(stage: JourneyStage) {
    const label = window.prompt("New task");
    if (!label) return;
    startTransition(async () => {
      await addTask(stage, label);
      router.refresh();
    });
  }

  return (
    <>
      <div className="j-subtabs">
        {columns.map((c, i) => (
          <button key={c.stage} type="button" className={`chip${i === active ? " active" : ""}`} onClick={() => setActive(i)}>
            {c.label}
          </button>
        ))}
      </div>

      <div
        className="j-board"
        ref={boardRef}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) {
            if (dx < 0 && active < columns.length - 1) setActive(active + 1);
            else if (dx > 0 && active > 0) setActive(active - 1);
          }
          touchStartX.current = null;
        }}
      >
        {columns.map((col, i) => (
          <div key={col.stage} className={`j-col${i === active ? " active-col" : ""}`}>
            <div className="col-label">
              {col.label} <span className="col-count">{col.tasks.filter((t) => t.done).length}/{col.tasks.length}</span>
            </div>
            {!col.unlocked ? (
              <div className="empty-card" style={{ marginTop: 0 }}>
                <b>Locked</b>
                Finish the earlier stages to unlock this one.
              </div>
            ) : (
              <div className="list-card">
                {col.tasks.length === 0 && <div className="empty on" style={{ padding: "24px 12px" }}><b>Nothing here yet</b></div>}
                {col.tasks.map((t) => (
                  <TaskRow key={t.id} id={t.id} label={t.label} due={t.due} done={t.done} note={t.note} />
                ))}
                <div className="row" style={{ cursor: "pointer" }} onClick={() => onAdd(col.stage)}>
                  <div className="plus">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                  </div>
                  <div className="row-label" style={{ color: "var(--ink-soft)" }}>{isPending ? "Adding…" : "Add a task"}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
