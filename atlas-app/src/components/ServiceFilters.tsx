"use client";

import { Children, cloneElement, isValidElement, useState } from "react";

export function ServiceFilters({
  categories,
  children,
}: {
  categories: { cat: string; label: string }[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState("all");
  const items = Children.toArray(children) as React.ReactElement<{ "data-cat"?: string }>[];
  const visible = items.filter((el) => active === "all" || el.props["data-cat"] === active);

  return (
    <>
      <div className="sec-head">
        <h2>All services</h2>
        <span>
          {visible.length} of {items.length}
        </span>
      </div>
      <div className="chip-row" id="svcFilters">
        <button type="button" className={`chip${active === "all" ? " active" : ""}`} onClick={() => setActive("all")}>
          All services
        </button>
        {categories.map((c) => (
          <button key={c.cat} type="button" className={`chip${active === c.cat ? " active" : ""}`} onClick={() => setActive(c.cat)}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="svc-grid" id="svcGrid">
        {visible.map((el) => (isValidElement(el) ? cloneElement(el) : el))}
      </div>
      {visible.length === 0 && (
        <div className="empty on">
          <b>No services in this category yet</b>We are still vetting partners here. Try another filter.
        </div>
      )}
    </>
  );
}
