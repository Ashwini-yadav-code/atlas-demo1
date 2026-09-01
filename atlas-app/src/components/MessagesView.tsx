"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/lib/actions";

const DEFAULT_AVATAR = "https://i.pravatar.cc/100?img=47";

type Thread = {
  id: string;
  advisor: { name: string; jobTitle: string; image: string | null };
  messages: { id: string; body: string; own: boolean; createdAt: string }[];
};

export function MessagesView({ threads }: { threads: Thread[] }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(threads[0]?.id);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const active = threads.find((t) => t.id === activeId);

  function send() {
    if (!active || !draft.trim()) return;
    const body = draft;
    setDraft("");
    startTransition(async () => {
      await sendMessage(active.id, body);
      router.refresh();
    });
  }

  return (
    <div className="msg-view" style={{ padding: 0, display: "flex", height: "calc(100vh - 78px)" }} data-open={chatOpen}>
      <style>{`
        .msg-list-x{width:320px;flex:none;border-right:1px solid var(--line);overflow-y:auto}
        .msg-item-x{display:flex;gap:12px;align-items:flex-start;padding:13px 20px;cursor:pointer;border-left:2px solid transparent}
        .msg-item-x:hover{background:var(--panel)}
        .msg-item-x.active{background:var(--blue-soft);border-left-color:var(--blue)}
        .msg-thread-x{flex:1;display:flex;flex-direction:column;min-width:0}
        .bubble-row-x{display:flex;gap:10px;max-width:72%;margin-bottom:14px}
        .bubble-row-x.own{align-self:flex-end;flex-direction:row-reverse;margin-left:auto}
        .bubble-x{background:var(--card);border:1px solid var(--line);border-radius:var(--r-md);padding:11px 14px;font-size:13.5px;line-height:1.5}
        .bubble-row-x.own .bubble-x{background:var(--blue-soft);border-color:transparent}
        @media (max-width:760px){
          .msg-list-x{width:100%;border-right:none}
          [data-open="true"] .msg-list-x{display:none}
          [data-open="false"] .msg-thread-x{display:none}
        }
      `}</style>

      <div className="msg-list-x">
        <div style={{ padding: "20px 20px 12px", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 19 }}>Messages</div>
        {threads.length === 0 && <div className="empty on"><b>No advisor threads yet</b></div>}
        {threads.map((t) => {
          const last = t.messages[t.messages.length - 1];
          return (
            <div
              key={t.id}
              className={`msg-item-x${t.id === activeId ? " active" : ""}`}
              onClick={() => { setActiveId(t.id); setChatOpen(true); }}
            >
              <div className="p-avatar" style={{ width: 42, height: 42, flex: "none" }}>
                <Image src={t.advisor.image || DEFAULT_AVATAR} alt="" fill sizes="42px" style={{ objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t.advisor.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", fontWeight: 600 }}>{t.advisor.jobTitle}</div>
                {last && (
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {last.own ? "You: " : ""}
                    {last.body}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="msg-thread-x">
        {active ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: "1px solid var(--line)" }}>
              <div className="back-btn" style={{ display: "none" }} onClick={() => setChatOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </div>
              <div className="p-avatar" style={{ width: 38, height: 38 }}>
                <Image src={active.advisor.image || DEFAULT_AVATAR} alt="" fill sizes="38px" style={{ objectFit: "cover" }} />
              </div>
              <div>
                <b style={{ fontSize: 14.5, display: "block" }}>{active.advisor.name}</b>
                <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{active.advisor.jobTitle}</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px", display: "flex", flexDirection: "column" }}>
              {active.messages.map((m) => (
                <div key={m.id} className={`bubble-row-x${m.own ? " own" : ""}`}>
                  {!m.own && (
                    <div className="p-avatar" style={{ width: 28, height: 28, flex: "none" }}>
                      <Image src={active.advisor.image || DEFAULT_AVATAR} alt="" fill sizes="28px" style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div className="bubble-x">{m.body}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "16px 24px", borderTop: "1px solid var(--line)" }}>
              <input
                className="field-input"
                style={{ flex: 1 }}
                placeholder="Write a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button
                type="button"
                className="icon-btn"
                style={{ background: "var(--accent)", color: "var(--panel)" }}
                disabled={isPending}
                onClick={send}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="empty on"><b>No conversation selected</b></div>
        )}
      </div>
    </div>
  );
}
