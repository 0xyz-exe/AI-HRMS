"use client";

import { FormEvent, useEffect, useState } from "react";

import { PageShell } from "@/components/page-shell";

type LeaveRequest = { id: string; startDate: string; endDate: string; days: number; status: string; reason: string | null };
type LeaveBalance = { leaveTypeId: string; allocatedDays: number; usedDays: number; year: number };

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  async function loadLeave() {
    try {
      const response = await fetch("/api/leave");
      const payload = (await response.json().catch(() => null)) as
        | { requests?: LeaveRequest[]; balances?: LeaveBalance[]; error?: string }
        | null;
      if (!response.ok) {
        setFormError(payload?.error ?? "Sign in to manage leave.");
      } else {
        setRequests(payload?.requests ?? []);
        setBalances(payload?.balances ?? []);
        setFormError("");
      }
    } catch {
      setFormError("The leave service is unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadLeave(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError("");
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(values.entries())),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) setFormError(payload?.error ?? "Unable to submit leave request.");
      else { event.currentTarget.reset(); await loadLeave(); }
    } catch {
      setFormError("The leave service is unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell eyebrow="Time away" title="Leave management" description="Request time off, check balances, and follow approval status.">
      <div className="split-grid">
        <section className="table-card">
          <h2>Request time off</h2>
          <form className="form-stack" onSubmit={submit}>
            <label>Employee ID<input name="employeeId" required placeholder="Your employee UUID" /></label>
            <label>Leave type ID<input name="leaveTypeId" required placeholder="Leave type UUID" /></label>
            <div className="form-grid">
              <label>Start date<input name="startDate" required type="date" /></label>
              <label>End date<input name="endDate" required type="date" /></label>
            </div>
            <label>Reason<textarea name="reason" rows={3} maxLength={1000} /></label>
            {formError ? <p className="form-error" role="alert">{formError}</p> : null}
            <button className="button button-primary" disabled={pending} type="submit">{pending ? "Submitting…" : "Submit request"}</button>
          </form>
        </section>
        <section className="table-card">
          <h2>Balances</h2>
          {balances.length === 0 ? <p className="muted">No balances available.</p> : balances.map((balance) => (
            <p className="balance-row" key={`${balance.leaveTypeId}-${balance.year}`}><span>{balance.leaveTypeId}</span><strong>{balance.allocatedDays - balance.usedDays} days left</strong></p>
          ))}
        </section>
      </div>
      <section className="table-card">
        <h2>Requests</h2>
        {loading ? <p className="muted">Loading requests…</p> : requests.length === 0 ? <p className="muted">No leave requests yet.</p> : (
          <div className="table-wrap"><table><thead><tr><th>Dates</th><th>Days</th><th>Status</th><th>Reason</th></tr></thead><tbody>
            {requests.map((request) => <tr key={request.id}><td>{new Date(request.startDate).toLocaleDateString()} – {new Date(request.endDate).toLocaleDateString()}</td><td>{request.days}</td><td><span className="status-pill">{request.status}</span></td><td>{request.reason ?? "—"}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </PageShell>
  );
}
