import type { ReactNode } from "react";

import { AppNav } from "./app-nav";

export function PageShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="app-shell">
      <AppNav />
      <main className="page-content">
        <div className="page-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="summary">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
