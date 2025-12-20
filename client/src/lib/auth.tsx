import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

type User = { username: string } | null;

const AUTH_KEY = "ratio_auth";
const USERS_KEY = "ratio_users";

type AuthContextValue = {
  user: User;
  login: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  changePassword: (username: string, oldPassword: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  function getUsers(): Record<string, string> {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  async function hashPassword(password: string) {
    const enc = new TextEncoder().encode(password);
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) throw new Error("Web Crypto API not available");
    const hashBuf = await subtle.digest("SHA-256", enc);
    return bufferToHex(hashBuf);
  }

  function bufferToHex(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function setUsers(users: Record<string, string>) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async function login(username: string, password: string) {
    // Check local users store
    const users = getUsers();
    if (!users[username]) {
      return { ok: false, message: "user_not_found" };
    }

    // stored value may be plaintext (preferred) or hashed (legacy)
    const stored = users[username];
    const hashed = await hashPassword(password);

    if (stored === password) {
      // already plaintext — ok
    } else if (stored === hashed) {
      // legacy hashed entry — migrate to plaintext storage
      users[username] = password;
      setUsers(users);
    } else {
      return { ok: false, message: "wrong_password" };
    }

    const token = `${username}:local`;
    const payload = { user: { username }, token };
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    setUser({ username });
    setLocation("/");
    return { ok: true };
  }

  async function register(username: string, password: string) {
    const users = getUsers();
    if (users[username]) {
      return { ok: false, message: "Nama pengguna sudah digunakan" };
    }
    if (password.length < 8) {
      return { ok: false, message: "Kata sandi minimal 8 karakter" };
    }
    // store plaintext password per request (but still support migrating old hashed entries)
    users[username] = password;
    setUsers(users);
    // auto-login after register
    const token = `${username}:local`;
    const payload = { user: { username }, token };
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    setUser({ username });
    setLocation("/");
    return { ok: true };
  }

  async function changePassword(username: string, oldPassword: string, newPassword: string) {
    const users = getUsers();
    if (!users[username]) return { ok: false, message: "user_not_found" };
    if (newPassword.length < 8) return { ok: false, message: "Kata sandi minimal 8 karakter" };

    const stored = users[username];
    const oldHashed = await hashPassword(oldPassword);
    // handle legacy plaintext
    if (stored !== oldPassword && stored !== oldHashed) {
      return { ok: false, message: "wrong_password" };
    }

    users[username] = await hashPassword(newPassword);
    setUsers(users);
    return { ok: true };
  }

  function logout() {
    // preserve app data (transactions etc) — only remove auth key
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setLocation("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
