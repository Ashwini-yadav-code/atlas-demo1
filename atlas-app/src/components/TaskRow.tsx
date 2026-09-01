"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleTask, updateTaskNote } from "@/lib/actions";
import { Drawer } from "@/components/ui/Drawer";

export function TaskRow({
  id,
  label,
  due,
  done,
  note,
  variant = "row",
}: {
  id: string;
  label: string;
  due?: string;
  done: boolean;
  note?: string | null;
  variant?: "row" | "task";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [noteText, setNoteText] = useState(note ?? "");

  function onToggle(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      await toggleTask(id);
      router.refresh();
    });
  }

  function saveNote() {
    startTransition(async () => {
      await updateTaskNote(id, noteText);
      setDrawerOpen(false);
      router.refresh();
    });
  }

  const className = variant === "task" ? "task" + (done ? " is-done" : "") : "row" + (done ? " is-done" : "");

  const toggleAriaLabel = done ? `Mark incomplete: "${label}"` : `Mark complete: "${label}"`;

  return (
    <>
      <div
        className={className}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        aria-label={`Open task: ${label}`}
        onClick={() => setDrawerOpen(true)}
        onKeyDown={(e) => {
          // the checkbox is a real nested <button> — let its own native
          // Enter/Space activation run without also opening the drawer
          if ((e.target as HTMLElement).closest(".mini-btn")) return;
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDrawerOpen(true); }
        }}
      >
        {variant === "task" && (
          <div className="task-top">
            <div className="task-actions">
              <button type="button" className={`mini-btn${done ? " done" : ""}`} aria-label={toggleAriaLabel} disabled={isPending} onClick={onToggle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          </div>
        )}
        {variant === "row" && (
          <button type="button" className={`mini-btn${done ? " done" : ""}`} aria-label={toggleAriaLabel} disabled={isPending} onClick={onToggle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
          </button>
        )}
        <div className={variant === "task" ? "task-label" : "row-label"}>
          {label}
          {note && <span className="note-dot" style={{ marginLeft: 6, display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--blue)" }} />}
        </div>
        {due && <div className={`due${isSoon(due) ? " soon" : ""}`}>{due}</div>}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Task"
        footer={
          <>
            <button type="button" className="btn btn-primary" disabled={isPending} onClick={saveNote}>
              Save note
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>
              Close
            </button>
          </>
        }
      >
        <div style={{ padding: "18px 22px" }}>
          <div className="field" style={{ marginBottom: 16 }}>
            <label className="field-label">Task</label>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{label}</div>
          </div>
          {due && (
            <div className="field" style={{ marginBottom: 18 }}>
              <label className="field-label">Due</label>
              <div style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 4 }}>{due}</div>
            </div>
          )}
          <div className="field">
            <label className="field-label" htmlFor={`note-${id}`}>
              Note for your advisor
            </label>
            <textarea
              id={`note-${id}`}
              className="field-input"
              rows={5}
              style={{ resize: "vertical" }}
              placeholder="Add context, a question, or a link…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>
        </div>
      </Drawer>
    </>
  );
}

function isSoon(due: string) {
  return due.toLowerCase().startsWith("due");
}
