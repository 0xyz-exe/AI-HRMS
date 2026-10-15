"use client";

import { useEffect, useState } from "react";

import { PageShell } from "@/components/page-shell";

type Employee = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string | null;
  status: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/employees")
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { employees?: Employee[]; error?: string }
          | null;
        if (!response.ok) throw new Error(payload?.error ?? "Sign in to view employees.");
        setEmployees(payload?.employees ?? []);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Unable to load employees.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell eyebrow="People" title="Employee directory" description="Manage employee records inside your organization.">
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <section className="table-card" aria-live="polite">
        <div className="toolbar">
          <div><h2>People</h2><p className="muted">Only records authorized for your organization are shown.</p></div>
          <span className="status-pill">{employees.length} records</span>
        </div>
        {loading ? <p className="muted">Loading employees…</p> : employees.length === 0 ? (
          <p className="muted">No employee records are available, or your session does not have directory access.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>{employees.map((employee) => (
                <tr key={employee.id}>
                  <td><strong>{employee.firstName} {employee.lastName}</strong><br /><span className="muted">{employee.employeeNumber}</span></td>
                  <td>{employee.email}</td><td>{employee.jobTitle ?? "—"}</td><td><span className="status-pill">{employee.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
