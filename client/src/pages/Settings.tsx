import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Shell } from "@/components/layout/Shell";

export default function Settings() {
  const { user, changePassword, logout } = useAuth();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (newPass.length < 8) return setMsg("Kata sandi minimal 8 karakter");
    if (newPass !== confirm) return setMsg("Konfirmasi kata sandi tidak cocok");
    if (!user) return setMsg("Tidak ada pengguna");

    const res = await changePassword(user.username, oldPass, newPass);
    if (!res.ok) setMsg(res.message || "Gagal mengubah kata sandi");
    else setMsg("Kata sandi berhasil diubah");
  }

  return (
    <Shell>
      <div className="max-w-md mx-auto mt-8 p-6 bg-card rounded-md border border-border space-y-4">
        <h2 className="text-lg font-semibold">Pengaturan Akun</h2>
        <div className="text-sm text-muted-foreground">Nama pengguna: {user?.username}</div>

        <form onSubmit={handleChange} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Kata Sandi Lama</label>
            <input value={oldPass} onChange={(e) => setOldPass(e.target.value)} className="w-full mt-1 p-2 bg-input border border-border rounded-sm" type="password" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Kata Sandi Baru</label>
            <input value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full mt-1 p-2 bg-input border border-border rounded-sm" type="password" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Konfirmasi Kata Sandi Baru</label>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full mt-1 p-2 bg-input border border-border rounded-sm" type="password" />
          </div>
          {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-accent text-accent-foreground rounded-sm">Ubah Kata Sandi</button>
            <button type="button" onClick={logout} className="px-3 py-2 rounded-sm border">Logout</button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
