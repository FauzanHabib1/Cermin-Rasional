import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: string;
  type: "income" | "expense";
  category: "need" | "want" | "savings";
}

const COLORS = {
  need: '#3b82f6',
  want: '#f59e0b',
  savings: '#10b981',
};

export default function Analysis() {

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  // Calculate category breakdown
  const categoryData = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      const amount = parseFloat(t.amount);
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name: name === 'need' ? 'Kebutuhan' : name === 'want' ? 'Keinginan' : 'Tabungan',
    value,
    category: name,
  }));

  // Calculate monthly trend
  const monthlyData = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }
    
    const amount = parseFloat(t.amount);
    if (t.type === 'income') {
      acc[monthKey].income += amount;
    } else {
      acc[monthKey].expense += amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  const trendData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const hasData = transactions.length > 0;
  
  // Advanced Statistics Calculations
  const currentMonth = new Date();
  const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  
  const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthData = monthlyData[currentMonthKey] || { income: 0, expense: 0 };
  const lastMonthData = monthlyData[lastMonthKey] || { income: 0, expense: 0 };
  
  // Month-to-month comparison
  const incomeChange = lastMonthData.income > 0 
    ? ((currentMonthData.income - lastMonthData.income) / lastMonthData.income) * 100 
    : 0;
  const expenseChange = lastMonthData.expense > 0
    ? ((currentMonthData.expense - lastMonthData.expense) / lastMonthData.expense) * 100
    : 0;
  
  // Category averages (last 3 months)
  const last3Months = trendData.slice(-3);
  const avgIncome = last3Months.reduce((sum, m) => sum + m.income, 0) / (last3Months.length || 1);
  const avgExpense = last3Months.reduce((sum, m) => sum + m.expense, 0) / (last3Months.length || 1);
  
  // Category-specific averages
  const categoryAverages = transactions
    .filter(t => {
      const txDate = new Date(t.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return t.type === 'expense' && txDate >= threeMonthsAgo;
    })
    .reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(parseFloat(t.amount));
      return acc;
    }, {} as Record<string, number[]>);
  
  const avgByCategory = Object.entries(categoryAverages).reduce((acc, [cat, amounts]) => {
    acc[cat] = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    return acc;
  }, {} as Record<string, number>);
  
  // Trend indicator helper
  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };
  
  const getTrendColor = (change: number, inverse = false) => {
    const isPositive = inverse ? change < 0 : change > 0;
    if (Math.abs(change) < 5) return "text-muted-foreground";
    return isPositive ? "text-green-500" : "text-red-500";
  };



  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Analisis Mendalam
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualisasi dan analisis pola keuangan Anda
          </p>
        </div>

        {!isLoading && !hasData && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-semibold mb-2">Belum ada data untuk dianalisis</h3>
              <p className="text-sm text-muted-foreground">
                Tambahkan transaksi terlebih dahulu untuk melihat analisis
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && hasData && (
          <>
            {/* Category Breakdown */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Breakdown Pengeluaran per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Statistics Insights */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Income Comparison */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Pemasukan Bulan Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-green-500">
                    Rp {currentMonthData.income.toLocaleString('id-ID')}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(incomeChange)}
                    <span className={`text-sm font-medium ${getTrendColor(incomeChange)}`}>
                      {incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs bulan lalu</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rata-rata 3 bulan: Rp {avgIncome.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </p>
                </CardContent>
              </Card>

              {/* Expense Comparison */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Pengeluaran Bulan Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-red-500">
                    Rp {currentMonthData.expense.toLocaleString('id-ID')}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(expenseChange)}
                    <span className={`text-sm font-medium ${getTrendColor(expenseChange, true)}`}>
                      {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs bulan lalu</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rata-rata 3 bulan: Rp {avgExpense.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </p>
                </CardContent>
              </Card>

              {/* Savings Rate */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Tingkat Tabungan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-blue-500">
                    {currentMonthData.income > 0 
                      ? ((currentMonthData.income - currentMonthData.expense) / currentMonthData.income * 100).toFixed(1)
                      : '0.0'
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentMonthData.income > currentMonthData.expense 
                      ? '✅ Surplus: Rp ' + (currentMonthData.income - currentMonthData.expense).toLocaleString('id-ID')
                      : '⚠️ Defisit: Rp ' + (currentMonthData.expense - currentMonthData.income).toLocaleString('id-ID')
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target ideal: 20%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Averages */}
            {Object.keys(avgByCategory).length > 0 && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Rata-rata Pengeluaran per Kategori (3 Bulan Terakhir)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    {Object.entries(avgByCategory).map(([category, avg]) => (
                      <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="text-sm font-medium">
                            {category === 'need' ? 'Kebutuhan' : category === 'want' ? 'Keinginan' : 'Tabungan'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Per transaksi
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold font-mono" style={{ color: COLORS[category as keyof typeof COLORS] }}>
                            Rp {avg.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Monthly Trend */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Trend Bulanan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Pemasukan" />
                    <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>



            {/* Category Details */}
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(categoryData).map(([category, amount]) => (
                <Card key={category} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                      {category === 'need' ? 'Kebutuhan' : category === 'want' ? 'Keinginan' : 'Tabungan'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono" style={{ color: COLORS[category as keyof typeof COLORS] }}>
                      Rp {amount.toLocaleString('id-ID')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transactions.filter(t => t.type === 'expense' && t.category === category).length} transaksi
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {isLoading && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Memuat data...</div>
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
