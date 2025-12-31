import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
