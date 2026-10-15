"use client";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";

type Department = { id: string; name: string };
export default function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((d) => { setItems(d.departments ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  return (
    <PageShell eyebrow="Organization" title="Departments" description="View departments within your organization.">
      {loading ? <p className="muted">Loading departments…</p> : items.length === 0 ? <p className="muted">No departments found.</p> : (
        <div className="table-wrap"><table><thead><tr><th>Name</th></tr></thead><tbody>{items.map((d) => <tr key={d.id}><td><strong>{d.name}</strong></td></tr>)}</tbody></table></div>
      )}
    </PageShell>
  );
}
