"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/lib/useIsMounted";

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  // Portals must not render during hydration's first pass — the server has
  // no `document.body` to portal into, so it renders nothing there, and if
  // the client rendered a portal on that very first pass (mount) instead,
  // React sees a structural mismatch against the server HTML and discards
  // the whole subtree to re-render it, taking sibling markup down with it.
  // Gating on a post-mount flag makes the client's first render match the
  // server (both render nothing), then the portal appears one tick later.
  const mounted = useIsMounted();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div className={`drawer-backdrop${open ? " on" : ""}`} onClick={onClose} />
      <aside className={`drawer${open ? " on" : ""}`} aria-label={title} aria-hidden={!open}>
        <div className="drawer-head">
          <h3>{title}</h3>
          <div className="drawer-close" role="button" tabIndex={0} aria-label={`Close ${title}`} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </>,
    document.body
  );
}
