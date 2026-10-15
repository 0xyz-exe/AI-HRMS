"use client";

import { useEffect, useState } from "react";

import { PageShell } from "@/components/page-shell";

type AttendanceRecord = {
  id: string;
  clockInAt: string;
  clockOutAt: string | null;
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function loadRecords() {
    try {
      const response = await fetch("/api/attendance");
      const payload = (await response.json().catch(() => null)) as
        | { attendance?: AttendanceRecord[]; error?: string }
        | null;
      if (!response.ok) {
        setError(payload?.error ?? "Sign in to view attendance.");
        return;
      }
      setRecords(payload?.attendance ?? []);
      setError("");
    } catch {
      setError("The attendance service is unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  async function record(action: "clock_in" | "clock_out") {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to update attendance.");
      } else {
        await loadRecords();
      }
    } catch {
      setError("The attendance service is unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell
      eyebrow="Time tracking"
      title="Attendance"
      description="Clock in and out with server-controlled timestamps."
    >
      <section className="toolbar">
        <div>
          <strong>Today&apos;s attendance</strong>
          <p className="muted">Your actions are tied to your authenticated employee profile.</p>
        </div>
        <div className="button-row">
          <button className="button button-primary" disabled={pending} onClick={() => void record("clock_in")}>
            Clock in
          </button>
          <button className="button button-secondary" disabled={pending} onClick={() => void record("clock_out")}>
            Clock out
          </button>
        </div>
      </section>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <section className="table-card" aria-live="polite">
        <h2>Attendance history</h2>
        {loading ? <p className="muted">Loading attendance…</p> : records.length === 0 ? (
          <p className="muted">No attendance records are available yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Clocked in</th><th>Clocked out</th></tr></thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.clockInAt).toLocaleString()}</td>
                    <td>{record.clockOutAt ? new Date(record.clockOutAt).toLocaleString() : "Still working"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
