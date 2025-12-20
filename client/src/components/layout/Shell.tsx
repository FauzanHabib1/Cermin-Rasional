import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setHoverExpanded(true)}
        onMouseLeave={() => setHoverExpanded(false)}
        className={cn(
          "border-r border-border bg-sidebar hidden md:flex flex-col transition-width duration-200",
          (collapsed && !hoverExpanded) ? "w-16" : "w-64",
          "md:fixed md:top-0 md:left-0 md:h-full z-20"
        )}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2">
              RATIO<span className="text-accent text-xs align-top">.beta</span>
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Rational Finance Engine
          </p>
        </div>

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

        <div className="p-4 border-t border-border">
          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-sm">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span
                className={cn(
                  "text-xs font-bold uppercase",
                  collapsed && "hidden"
                )}
              >
                Logika Aktif
              </span>
            </div>
            <p className={cn("text-[10px] text-muted-foreground leading-tight", collapsed && "hidden")}>
              Sistem memberikan analisis rasional tanpa motivasi emosional.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 overflow-auto", "md:ml-64")}>
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
