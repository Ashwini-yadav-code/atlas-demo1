"use client";

import { useState } from "react";
import { TaskRow } from "@/components/TaskRow";
import type { JourneyStage } from "@/generated/prisma/enums";

type Stage = {
  stage: JourneyStage;
  label: string;
  unlocked: boolean;
  tasks: { id: string; label: string; done: boolean; note: string | null; due?: string }[];
};

export function ChecklistView({ stages, currentStage }: { stages: Stage[]; currentStage: JourneyStage }) {
  const defaultIndex = Math.max(0, stages.findIndex((s) => s.stage === currentStage));
  const [active, setActive] = useState(defaultIndex);
  const stage = stages[active];

  return (
    <>
      <div className="card accent-dark stage-rail">
        <div className="stepper" id="stageStepper">
          {stages.map((s, i) => (
            <div
              key={s.stage}
              className={`step ${i < active ? "done" : i === active ? "now" : "locked"}`}
              role="button"
              tabIndex={0}
              onClick={() => setActive(i)}
              style={{ cursor: "pointer" }}
            >
              {i > 0 && <div className="step-line" />}
              <div className="step-dot">{i + 1}</div>
              <div className="step-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <h3>{stage.label}</h3>
          <span className="panel-note">
            {stage.tasks.filter((t) => t.done).length}/{stage.tasks.length}
          </span>
        </div>
        <div className="list-card" style={{ margin: "0 20px 20px" }}>
          {!stage.unlocked ? (
            <div className="empty on"><b>Locked</b>This stage unlocks once the earlier ones are complete.</div>
          ) : stage.tasks.length === 0 ? (
            <div className="empty on"><b>Nothing here yet</b></div>
          ) : (
            stage.tasks.map((t) => <TaskRow key={t.id} id={t.id} label={t.label} due={t.due} done={t.done} note={t.note} />)
          )}
        </div>
      </div>
    </>
  );
}
