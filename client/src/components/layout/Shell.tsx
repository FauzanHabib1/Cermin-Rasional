import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Wallet, PieChart, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Wallet, label: "Transaksi", href: "/transactions" },
    { icon: PieChart, label: "Analisis", href: "/analysis" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2">
            RATIO<span className="text-accent text-xs align-top">.beta</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Rational Finance Engine
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <button className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer",
                location === item.href 
                  ? "bg-accent/10 text-accent border-l-2 border-accent" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-sm">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Logika Aktif</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Sistem akan memberikan peringatan rasional tanpa empati buatan.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6 md:p-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
