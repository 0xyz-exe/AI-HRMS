import Link from "next/link";

import { AppNav } from "@/components/app-nav";

export default function HomePage() {
  return (
    <div className="app-shell">
      <AppNav />
      <main className="landing">
        <section className="landing-copy">
          <p className="eyebrow">AI HRMS / People operations</p>
          <h1>Make every HR moment feel simple.</h1>
          <p className="summary">
            A secure workspace for employee records, attendance, and leave
            operations—built around your organization and your people.
          </p>
          <div className="landing-actions">
            <Link className="button button-primary" href="/dashboard">
              Explore the workspace
            </Link>
            <Link className="button button-secondary" href="/login">
              Sign in
            </Link>
          </div>
        </section>
        <section className="landing-panel" aria-label="Available modules">
          <div className="panel-topline">
            <span className="live-dot" />
            <span>Workspace ready</span>
          </div>
          <h2>Everything your team needs to move people forward.</h2>
          <div className="mini-list">
            <Link href="/employees">
              <span>01</span>
              <strong>Employee directory</strong>
              <span>→</span>
            </Link>
            <Link href="/attendance">
              <span>02</span>
              <strong>Attendance</strong>
              <span>→</span>
            </Link>
            <Link href="/leave">
              <span>03</span>
              <strong>Leave management</strong>
              <span>→</span>
            </Link>
          </div>
          <p className="panel-note">
            Protected by server-side authorization and organization isolation.
          </p>
        </section>
      </main>
    </div>
  );
}
