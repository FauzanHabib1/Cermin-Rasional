import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { cn } from "@/lib/utils";

export default function Register() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [strength, setStrength] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username) return setError("Masukkan nama pengguna");
    if (!password) return setError("Masukkan kata sandi");
    if (password.length < 8) return setError("Kata sandi minimal 8 karakter");
    if (password !== confirm) return setError("Kata sandi tidak cocok");

    const res = await register(username, password);
    if (!res.ok) setError(res.message || "Gagal membuat akun");
  }

  function calcStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-4
  }


  return (
    <Shell>
      <div className="max-w-sm mx-auto mt-16 p-6 bg-card rounded-md border border-border">
        <h2 className="text-lg font-semibold mb-4">Buat Akun</h2>
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
              onChange={(e) => { setPassword(e.target.value); setStrength(calcStrength(e.target.value)); }}
              className="w-full mt-1 p-2 bg-input border border-border rounded-sm"
            />
          </div>
          <div>
            <div className="h-2 bg-muted rounded-sm overflow-hidden">
              <div
                className={cn(
                  "h-full",
                  strength <= 1 ? "bg-destructive" : strength === 2 ? "bg-yellow-500" : strength === 3 ? "bg-accent" : "bg-emerald-500"
                )}
                style={{ width: `${(strength / 4) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{["Very weak","Weak","Fair","Good","Strong"][strength]}</div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Konfirmasi Kata Sandi</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full mt-1 p-2 bg-input border border-border rounded-sm"
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-accent text-accent-foreground rounded-sm">Buat Akun</button>
            <Link href="/login" className="px-3 py-2 rounded-sm border inline-flex items-center">Masuk</Link>
          </div>
        </form>
      </div>
    </Shell>
  );
}
