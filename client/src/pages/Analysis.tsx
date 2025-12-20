import { useMemo } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { analyzeFinances, calculateConsistencyScore } from "@/lib/finance-engine";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, getWeek } from "date-fns";
import { id } from "date-fns/locale";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export default function Analysis() {
  const { transactions } = useTransactions();
  const analysis = useMemo(() => analyzeFinances(transactions), [transactions]);
  const score = useMemo(() => calculateConsistencyScore(transactions), [transactions]);

  // Daily trend data
  const dailyTrendData = useMemo(() => {
    if (transactions.length === 0) return [];
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(day => {
      const dayTransactions = transactions.filter(t => 
        isWithinInterval(new Date(t.date), { start: day, end: new Date(day.getTime() + 86400000) })
      );
      
      const needs = dayTransactions
        .filter(t => t.type === 'expense' && t.category === 'need')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const wants = dayTransactions
        .filter(t => t.type === 'expense' && t.category === 'want')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(day, "dd MMM", { locale: id }),
        needs,
        wants,
      };
    }).filter(d => d.needs > 0 || d.wants > 0);
  }, [transactions]);

  // Weekly consistency data
  const weeklyConsistencyData = useMemo(() => {
    if (transactions.length === 0) return [];
    const weeklySpending: Record<number, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const week = getWeek(new Date(t.date));
        weeklySpending[week] = (weeklySpending[week] || 0) + t.amount;
      });

    return Object.entries(weeklySpending)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([week, amount]) => ({
        week: `W${week}`,
        amount,
      }));
  }, [transactions]);

  // Ratio breakdown
  const ratioData = [
    { name: 'Kebutuhan (Needs)', value: analysis.needRatio, fill: 'hsl(var(--chart-2))' },
    { name: 'Keinginan (Wants)', value: analysis.wantRatio, fill: 'hsl(var(--chart-3))' },
    { name: 'Tabungan (Savings)', value: analysis.savingsRatio, fill: 'hsl(var(--chart-1))' },
  ];

  // Category breakdown
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const byCategory = {
      need: 0,
      want: 0,
    };
    
    expenses.forEach(t => {
      if (t.category === 'need') byCategory.need += t.amount;
      else if (t.category === 'want') byCategory.want += t.amount;
    });

    return [
      { name: 'Kebutuhan', value: byCategory.need, fill: 'hsl(var(--chart-2))' },
      { name: 'Keinginan', value: byCategory.want, fill: 'hsl(var(--chart-3))' },
    ].filter(d => d.value > 0);
  }, [transactions]);

  const hasData = transactions.length > 0;

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-4xl font-display font-bold tracking-tight">Analisis Mendalam</h2>
          <p className="mt-2 text-sm font-mono text-muted-foreground">
            Visualisasi tren, pola, dan deviasi perilaku finansial
          </p>
        </div>

        {!hasData ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-16 md:py-20">
              <p className="text-center text-sm text-muted-foreground max-w-sm">
                Tambahkan transaksi untuk melihat analisis
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quick Stats - Responsive Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Total Transaksi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl md:text-3xl font-bold">{transactions.length}</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Daily Avg
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-2xl md:text-3xl font-bold">
                    Rp {Math.round(analysis.totalExpense / 30).toLocaleString('id-ID')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Konsistensi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn("text-2xl md:text-3xl font-bold", score.consistencyScore > 70 ? "text-accent" : "text-destructive")}>
                    {score.consistencyScore}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">/100</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Efisiensi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn("text-2xl md:text-3xl font-bold", score.efficiencyScore > 70 ? "text-accent" : "text-destructive")}>
                    {score.efficiencyScore}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">/100</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section - Responsive Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Daily Trend */}
              {dailyTrendData.length > 0 && (
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xs sm:text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground">
                      Tren Pengeluaran Harian
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={dailyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="needs" fill="hsl(var(--chart-2))" name="Kebutuhan" />
                        <Bar dataKey="wants" fill="hsl(var(--chart-3))" name="Keinginan" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Consistency */}
              {weeklyConsistencyData.length > 0 && (
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xs sm:text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground">
                      Pengeluaran Mingguan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={weeklyConsistencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="hsl(var(--accent))" 
                          name="Pengeluaran"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--accent))', r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Ratio Breakdown */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs sm:text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Alokasi Pendapatan
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center overflow-x-auto">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={ratioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {ratioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              {categoryData.length > 0 && (
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xs sm:text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground">
                      Proporsi Pengeluaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center overflow-x-auto">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Key Insights */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground">
                  Ringkasan Analitik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs sm:text-sm text-foreground"><span className="font-bold">Konsistensi:</span> {score.consistencyLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1">Skor: {score.consistencyScore}/100</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-foreground"><span className="font-bold">Efisiensi:</span> {score.efficiencyScore > 80 ? "Sangat Efisien" : score.efficiencyScore > 60 ? "Cukup Efisien" : "Perlu Perbaikan"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Skor: {score.efficiencyScore}/100</p>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs sm:text-sm text-foreground"><span className="font-bold">Rasio Actual vs Target:</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Kebutuhan {analysis.needRatio.toFixed(1)}% (Target 50%) | Keinginan {analysis.wantRatio.toFixed(1)}% (Target 30%) | Tabungan {analysis.savingsRatio.toFixed(1)}% (Target 20%)</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Shell>
  );
}
