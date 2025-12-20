import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Shell } from "@/components/layout/Shell";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username) return setError("Masukkan nama pengguna");
    // password not validated for demo
    const res = await login(username, password);
    if (!res.ok) {
      if (res.message === "user_not_found") setError("Pengguna tidak ditemukan");
      else if (res.message === "wrong_password") setError("Kata sandi salah");
      else setError(res.message || "Gagal login");
    }
  }

  return (
    <Shell>
      <div className="max-w-sm mx-auto mt-16 p-6 bg-card rounded-md border border-border">
        <h2 className="text-lg font-semibold mb-4">Masuk ke RATIO</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Nama Pengguna</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-2 bg-input border border-border rounded-sm"
              placeholder="contoh: habib"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 bg-input border border-border rounded-sm"
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-accent text-accent-foreground rounded-sm">Masuk</button>
            <button type="button" className="px-3 py-2 rounded-sm border" onClick={() => { setUsername(""); setPassword(""); }}>
              Bersihkan
            </button>
            <Link href="/register" className="px-3 py-2 rounded-sm border inline-flex items-center">Daftar</Link>
          </div>
        </form>
      </div>
    </Shell>
  );
}
