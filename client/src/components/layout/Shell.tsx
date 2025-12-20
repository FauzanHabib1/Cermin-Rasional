import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { userStorage } from "@/lib/user-storage";
import { useToast } from "@/hooks/use-toast";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const { toast } = useToast();
  const username = userStorage.getUser();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Wallet, label: "Transaksi", href: "/transactions" },
    { icon: PieChart, label: "Analisis", href: "/analysis" },
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ratio_sidebar_collapsed");
      if (raw) setCollapsed(raw === "true");
    } catch {}
  }, []);

  const handleLogout = () => {
    userStorage.clearUser();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari aplikasi",
    });
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setHoverExpanded(true)}
        onMouseLeave={() => setHoverExpanded(false)}
        className={cn(
          "border-r border-border bg-sidebar hidden flex-col transition-all duration-200 md:flex",
          (collapsed && !hoverExpanded) ? "w-16" : "w-64",
          "fixed top-0 left-0 h-full z-20"
        )}
      >
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className={cn("min-w-0 flex-1", (collapsed && !hoverExpanded) && "hidden")}>
              <h1 className="text-2xl font-display font-bold tracking-tighter">
                RATIO<span className="align-top text-xs text-accent">.beta</span>
              </h1>
              <p className="mt-0.5 text-xs font-mono text-muted-foreground truncate">
                Rational Finance
              </p>
            </div>
            <button
              onClick={() => {
                setCollapsed(s => {
                  const next = !s;
                  try {
                    localStorage.setItem("ratio_sidebar_collapsed", next ? "true" : "false");
                  } catch {}
                  return next;
                });
              }}
              className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-secondary"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed && !hoverExpanded ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <button
                title={item.label}
                className={cn(
                  "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm font-medium transition-colors",
                  location === item.href
                    ? "border-l-2 border-accent bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  (collapsed && !hoverExpanded) && "justify-center"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={cn((collapsed && !hoverExpanded) ? "hidden" : "truncate")}>
                  {item.label}
                </span>
              </button>
            </Link>
          ))}
        </nav>

        {/* User Info & Alert */}
        <div className="space-y-3 border-t border-border p-4">
          <div className="rounded-sm border border-destructive/20 bg-destructive/10 p-3">
            <div className="mb-1 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className={cn("text-xs font-bold uppercase", (collapsed && !hoverExpanded) && "hidden")}>
                Logika Aktif
              </span>
            </div>
            <p className={cn("text-[10px] leading-tight text-muted-foreground", (collapsed && !hoverExpanded) && "hidden")}>
              Analisis rasional tanpa emosi buatan.
            </p>
          </div>

          {username && (
            <div className={cn("truncate rounded-sm border border-border p-2 text-sm text-muted-foreground", (collapsed && !hoverExpanded) && "hidden")}>
              <span className="font-semibold">{username}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm border border-destructive/30 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10",
              (collapsed && !hoverExpanded) ? "justify-center" : "justify-start"
            )}
            title="Logout"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn((collapsed && !hoverExpanded) ? "hidden" : "truncate")}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Centered */}
      <main className="flex-1 overflow-auto transition-all duration-200">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-6xl space-y-6 p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
