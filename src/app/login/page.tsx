"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: values.get("organizationId"),
          email: values.get("email"),
          password: values.get("password"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error ?? "Unable to sign in.");
        return;
      }

      window.location.assign("/dashboard");
    } catch {
      setError("The sign-in service is unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/">
          <span className="brand-mark">H</span>
          <span>AI HRMS</span>
        </Link>
        <div className="page-heading compact">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to your workspace.</h1>
          <p className="summary">
            Use your organization ID and credentials to access protected HR
            operations.
          </p>
        </div>
        <form className="form-stack" onSubmit={submit}>
          <label>
            Organization ID
            <input name="organizationId" required placeholder="UUID" />
          </label>
          <label>
            Work email
            <input name="email" required type="email" autoComplete="email" />
          </label>
          <label>
            Password
            <input
              name="password"
              required
              type="password"
              autoComplete="current-password"
            />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button button-primary" disabled={pending} type="submit">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link className="text-link" href="/">
          Back to home
        </Link>
      </section>
    </main>
  );
}
