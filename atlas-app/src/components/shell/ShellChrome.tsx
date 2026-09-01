"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { PillNav } from "@/components/shell/PillNav";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { Drawer } from "@/components/ui/Drawer";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions";

type Notif = {
  id: string;
  kind: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

const KIND_ICON: Record<string, { cls: string; path: React.ReactNode }> = {
  DEADLINE: { cls: "coral", path: <><path d="M12 8v5M12 16v.1" /><circle cx="12" cy="12" r="9" /></> },
  MESSAGE: { cls: "blue", path: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /> },
  OFFER: { cls: "green", path: <path d="M20 6L9 17l-5-5" /> },
  EVENT: { cls: "gold", path: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> },
  SYSTEM: { cls: "blue", path: <circle cx="12" cy="12" r="9" /> },
};

export function ShellChrome({
  userName,
  userImage,
  notifications,
  children,
}: {
  userName: string;
  userImage: string | null;
  notifications: Notif[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const unread = notifications.filter((n) => !n.isRead).length;

  function onAvatarClick() {
    if (typeof window !== "undefined" && window.matchMedia("(max-width:620px)").matches) {
      setAccountOpen((v) => !v);
    } else {
      router.push("/profile");
    }
  }

  return (
    <>
      <nav className="sidebar" id="sidebarRail" aria-label="Tools">
        <button type="button" className="side-btn" title="Search" aria-label="Search" onClick={() => setSearchOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        </button>
        <Link href="/messages" className="side-btn" title="Messages" aria-label="Messages">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        </Link>
        <Link href="/checklist" className="side-btn" title="Document vault" aria-label="Document vault">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></svg>
        </Link>
        <button type="button" className="side-btn" title="Help & support" aria-label="Help and support" onClick={() => setHelpOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2-2.4 3.7" /><path d="M12 17.2v.1" /></svg>
        </button>
        <div className="side-gap" />
        <Link href="/profile" className="side-btn" title="Settings" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" /></svg>
        </Link>
        <ThemeToggle className="side-btn" />
      </nav>

      <div className="main">
        <div className="topbar">
          <div className="brand">
            <span className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 2L2 21h20L12 2z" /><path d="M12 9l4.5 9h-9L12 9z" opacity=".5" /></svg>
            </span>
            atlas
          </div>

          <PillNav />

          <div className="top-right">
            <button
              type="button"
              className="icon-btn"
              title="Notifications"
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
              onClick={() => setNotifOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              {unread > 0 && <span className="side-dot" />}
            </button>
            <button
              type="button"
              className="profile-btn"
              title="Account menu"
              aria-label={`Account menu for ${userName}`}
              onClick={onAvatarClick}
              style={{ appearance: "none", border: "none", background: "none" }}
            >
              <div className="avatar-ring">
                <Image src={userImage || "https://i.pravatar.cc/100?img=47"} alt={userName} fill sizes="36px" style={{ objectFit: "cover" }} />
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="11" height="11"><path d="M6 9l6 6 6-6" /></svg>
            </button>

            <div className={`account-menu${accountOpen ? " on" : ""}`} id="accountMenu">
              <button type="button" className="account-menu-item" onClick={() => { setAccountOpen(false); setSearchOpen(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>Search
              </button>
              <Link href="/messages" className="account-menu-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>Messages</Link>
              <Link href="/checklist" className="account-menu-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>Document vault</Link>
              <button type="button" className="account-menu-item" onClick={() => { setAccountOpen(false); setHelpOpen(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>Help &amp; support
              </button>
              <div className="account-menu-sep" />
              <Link href="/profile" className="account-menu-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>Profile &amp; settings</Link>
              <button type="button" className="account-menu-item" onClick={() => signOut({ callbackUrl: "/auth" })}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>Log out
              </button>
            </div>
          </div>
        </div>

        <div className="view active">{children}</div>
      </div>

      {/* ---------- notifications drawer ---------- */}
      <Drawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
        footer={
          unread > 0 ? (
            <button
              type="button"
              className="btn btn-secondary btn-block"
              disabled={isPending}
              onClick={() => startTransition(async () => { await markAllNotificationsRead(); router.refresh(); })}
            >
              Mark all as read
            </button>
          ) : undefined
        }
      >
        {notifications.length === 0 && (
          <div className="empty on"><b>You&apos;re all caught up</b>No notifications yet.</div>
        )}
        {notifications.map((n) => {
          const icon = KIND_ICON[n.kind] ?? KIND_ICON.SYSTEM;
          return (
            <div
              key={n.id}
              className={`notif-row${!n.isRead ? " unread" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => !n.isRead && startTransition(async () => { await markNotificationRead(n.id); router.refresh(); })}
            >
              <div className={`notif-icon ${icon.cls}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon.path}</svg>
              </div>
              <div className="notif-text">
                <b>{n.title}</b>
                <span>{n.body}</span>
              </div>
            </div>
          );
        })}
      </Drawer>

      {/* ---------- help drawer ---------- */}
      <Drawer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Help & support"
        footer={
          <Link href="/messages" className="btn btn-primary btn-block">
            Message an advisor
          </Link>
        }
      >
        <div style={{ padding: "6px 22px 20px" }}>
          <div className="field-help" style={{ marginBottom: 16 }}>
            <b style={{ display: "block", color: "var(--ink)", fontSize: 13.5, marginBottom: 4 }}>How fast do advisors reply?</b>
            Usually within one business day — faster during application deadlines.
          </div>
          <div className="field-help" style={{ marginBottom: 16 }}>
            <b style={{ display: "block", color: "var(--ink)", fontSize: 13.5, marginBottom: 4 }}>Is Atlas really free?</b>
            Yes — always, for students. Service partners pay a flat, published fee, never a commission.
          </div>
          <div className="field-help">
            <b style={{ display: "block", color: "var(--ink)", fontSize: 13.5, marginBottom: 4 }}>Can I change my shortlist later?</b>
            Yes, from Journey — add or remove universities at any stage before you apply.
          </div>
        </div>
      </Drawer>

      {/* ---------- search drawer ---------- */}
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SearchDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ label: string; sub: string; href: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSearch(value: string) {
    setQ(value);
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Search">
      <div style={{ padding: "0 22px 14px" }}>
        <input
          className="field-input"
          placeholder="Search universities, services, community…"
          value={q}
          autoFocus={open}
          onChange={(e) => runSearch(e.target.value)}
        />
      </div>
      {loading && <div className="empty on"><b>Searching…</b></div>}
      {!loading && results.map((r) => (
        <Link key={r.href} href={r.href} className="row" style={{ padding: "12px 22px", cursor: "pointer" }} onClick={onClose}>
          <div className="row-label">
            {r.label}
            <br />
            <span style={{ color: "var(--ink-soft)", fontWeight: 500, fontSize: 12 }}>{r.sub}</span>
          </div>
        </Link>
      ))}
      {!loading && q && results.length === 0 && (
        <div className="empty on"><b>No matches</b>Try a different search term.</div>
      )}
    </Drawer>
  );
}
