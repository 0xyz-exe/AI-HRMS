import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
  { href: "/attendance", label: "Attendance" },
  { href: "/leave", label: "Leave" },
];

export function AppNav() {
  return (
    <header className="app-header">
      <Link className="brand" href="/">
        <span className="brand-mark">H</span>
        <span>AI HRMS</span>
      </Link>
      <nav aria-label="Primary navigation" className="main-nav">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <Link className="button button-secondary header-login" href="/login">
        Sign in
      </Link>
    </header>
  );
}
