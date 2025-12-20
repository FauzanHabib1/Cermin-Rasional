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
          "border-r border-border bg-sidebar hidden md:flex flex-col transition-all duration-200",
          (collapsed && !hoverExpanded) ? "w-16" : "w-64",
          "md:fixed md:top-0 md:left-0 md:h-full z-20"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div className={cn("flex-1 min-w-0", (collapsed && !hoverExpanded) && "hidden")}>
              <h1 className="text-2xl font-display font-bold tracking-tighter">
                RATIO<span className="text-accent text-xs align-top">.beta</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
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
              className="p-1 rounded-sm hover:bg-secondary text-muted-foreground shrink-0"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed && !hoverExpanded ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <button
                title={item.label}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer",
                  location === item.href
                    ? "bg-accent/10 text-accent border-l-2 border-accent"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  (collapsed && !hoverExpanded) && "justify-center"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className={cn((collapsed && !hoverExpanded) ? "hidden" : "truncate")}>
                  {item.label}
                </span>
              </button>
            </Link>
          ))}
        </nav>

        {/* User Info & Alert */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-sm">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className={cn("text-xs font-bold uppercase", (collapsed && !hoverExpanded) && "hidden")}>
                Logika Aktif
              </span>
            </div>
            <p className={cn("text-[10px] text-muted-foreground leading-tight", (collapsed && !hoverExpanded) && "hidden")}>
              Analisis rasional tanpa emosi buatan.
            </p>
          </div>

          {username && (
            <div className={cn("text-sm text-muted-foreground p-2 border border-border rounded-sm", (collapsed && !hoverExpanded) && "hidden")}>
              User: <span className="font-semibold">{username}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-sm border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm",
              (collapsed && !hoverExpanded) && "justify-center"
            )}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className={cn((collapsed && !hoverExpanded) ? "hidden" : "")}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 overflow-auto transition-all duration-200", "md:ml-64")}>
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
