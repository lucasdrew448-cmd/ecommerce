"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Registration failed.");
      return;
    }

    router.push("/admin");
  };

  return (
    <main>
      <section className="section max-w-lg mx-auto">
        <div className="section-header">
          <h1>Admin registration</h1>
          <p>Create an admin account with the external auth service.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-2">
            <span>Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2">
            <span>Full name</span>
            <input
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2">
            <span>Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button type="submit" className="button">
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already an admin? <Link href="/admin/login" className="text-blue-700 font-semibold">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
