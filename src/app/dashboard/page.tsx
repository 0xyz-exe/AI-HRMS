import Link from "next/link";

import { PageShell } from "@/components/page-shell";

const modules = [
  {
    href: "/employees",
    title: "Employee directory",
    description: "Search, create, update, and deactivate employee records.",
    icon: "01",
  },
  {
    href: "/departments",
    title: "Departments",
    description: "View organization departments.",
    icon: "04",
  },
  {
    href: "/attendance",
    title: "Attendance",
    description: "Clock in, clock out, and review attendance history.",
    icon: "02",
  },
  {
    href: "/leave",
    title: "Leave management",
    description: "Submit requests and track balances and approvals.",
    icon: "03",
  },
];

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Workspace"
      title="Your HR operations, in one place."
      description="Choose a workspace to get started. Every action is protected by server-side authorization."
    >
      <section className="metric-grid" aria-label="MVP overview">
        <article className="metric-card">
          <span className="metric-label">MVP modules</span>
          <strong>3</strong>
          <span className="metric-note">Available now</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Security</span>
          <strong>On</strong>
          <span className="metric-note">Tenant isolation enabled</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">System</span>
          <strong>Healthy</strong>
          <span className="metric-note">API health check available</span>
        </article>
      </section>
      <section className="module-grid" aria-label="HR modules">
        {modules.map((module) => (
          <Link className="module-card" href={module.href} key={module.href}>
            <span className="module-icon">{module.icon}</span>
            <span>
              <strong>{module.title}</strong>
              <span>{module.description}</span>
            </span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
