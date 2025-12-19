import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  description: z.string().min(2, "Deskripsi terlalu pendek"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Jumlah harus angka positif"),
  type: z.enum(["income", "expense"]),
  category: z.enum(["need", "want", "savings"]),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Tanggal tidak valid"),
});

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      category: "need",
      date: new Date().toISOString().split('T')[0],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(values.date).toISOString(),
      amount: Number(values.amount),
      type: values.type as "income" | "expense",
      category: values.category as "need" | "want" | "savings",
      description: values.description,
    };
    
    addTransaction(newTransaction);
    toast({
      title: "Transaksi Tercatat",
      description: `${values.description} - Rp ${Number(values.amount).toLocaleString('id-ID')}`,
    });
    form.reset({
      description: "",
      amount: "",
      type: "expense",
      category: "need",
      date: new Date().toISOString().split('T')[0],
    });
  }

  const filteredTransactions = transactions.filter(t => 
    filter === "all" ? true : t.type === filter
  );

  const handleDelete = (id: string, desc: string) => {
    deleteTransaction(id);
    toast({
      title: "Transaksi Dihapus",
      description: desc,
    });
  };

  return (
    <Shell>
      <div className="flex flex-col gap-4 md:gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Manajemen Transaksi</h2>
          <p className="text-muted-foreground font-mono text-xs sm:text-sm mt-1">
            Input, kelola, dan pantau semua transaksi finansial Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Form Input */}
          <Card className="lg:col-span-1 border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                <Plus className="w-4 h-4 inline mr-2" />
                Input Transaksi Baru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Tipe</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">Pemasukan</SelectItem>
                            <SelectItem value="expense">Pengeluaran</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Kategori</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="need">Kebutuhan</SelectItem>
                            <SelectItem value="want">Keinginan</SelectItem>
                            <SelectItem value="savings">Tabungan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Tanggal</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="text-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Deskripsi</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Makan Siang" {...field} className="text-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Nominal (Rp)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} className="text-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full text-xs sm:text-sm">
                    <Plus className="w-3 h-3 mr-2" />
                    Simpan Transaksi
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="lg:col-span-2 border-border/50 bg-card/50 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  Riwayat Transaksi ({filteredTransactions.length})
                </CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    size="sm" 
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                    className="text-xs"
                  >
                    Semua
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === "income" ? "default" : "outline"}
                    onClick={() => setFilter("income")}
                    className="text-xs"
                  >
                    Masuk
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === "expense" ? "default" : "outline"}
                    onClick={() => setFilter("expense")}
                    className="text-xs"
                  >
                    Keluar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              {filteredTransactions.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  Belum ada transaksi
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-secondary/50">
                      <TableRow>
                        <TableHead className="font-mono text-[11px] sm:text-xs uppercase whitespace-nowrap">Tanggal</TableHead>
                        <TableHead className="font-mono text-[11px] sm:text-xs uppercase">Deskripsi</TableHead>
                        <TableHead className="font-mono text-[11px] sm:text-xs uppercase">Kategori</TableHead>
                        <TableHead className="text-right font-mono text-[11px] sm:text-xs uppercase whitespace-nowrap">Jumlah</TableHead>
                        <TableHead className="w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((t) => (
                        <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-mono text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(t.date), "dd MMM", { locale: id })}
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm truncate max-w-[100px]">
                            {t.description}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap",
                              t.category === 'need' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                              t.category === 'want' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                              t.category === 'savings' && "bg-green-500/10 text-green-500 border-green-500/20",
                            )}>
                              {t.category === 'need' ? 'Kebutuhan' : t.category === 'want' ? 'Keinginan' : 'Tabungan'}
                            </span>
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-mono text-xs sm:text-sm whitespace-nowrap",
                            t.type === 'income' ? "text-accent" : ""
                          )}>
                            {t.type === 'income' ? '+' : '-'} Rp {Math.round(t.amount / 1000)}k
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => handleDelete(t.id, t.description)}
                              className="text-destructive hover:text-destructive/70 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
