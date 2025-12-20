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
  category: z.enum(["need", "want"]),
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
      category: values.category as "need" | "want",
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-4xl font-display font-bold tracking-tight">Manajemen Transaksi</h2>
          <p className="mt-2 text-sm font-mono text-muted-foreground">
            Input, kelola, dan pantau semua transaksi finansial Anda
          </p>
        </div>

        {/* Form & List Container */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Input - Left Column on Desktop, Full Width on Mobile */}
          <Card className="border-border/50 bg-card/50 lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground">
                <Plus className="mr-2 inline h-4 w-4" />
                Input Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Tipe</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-sm">
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
                        <FormLabel className="text-xs font-medium">Kategori</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="need">Kebutuhan</SelectItem>
                            <SelectItem value="want">Keinginan</SelectItem>
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
                        <FormLabel className="text-xs font-medium">Tanggal</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="text-sm" />
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
                        <FormLabel className="text-xs font-medium">Deskripsi</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Makan Siang" {...field} className="text-sm" />
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
                        <FormLabel className="text-xs font-medium">Nominal (Rp)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Simpan
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Transactions List - Right Column on Desktop, Full Width Below on Mobile */}
          <Card className="border-border/50 bg-card/50 lg:col-span-2 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground">
                  Riwayat ({filteredTransactions.length})
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
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
            <CardContent className="flex-1 overflow-x-auto p-0">
              {filteredTransactions.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Belum ada transaksi
                </div>
              ) : (
                <Table className="text-xs sm:text-sm">
                  <TableHeader className="bg-secondary/50 sticky top-0">
                    <TableRow>
                      <TableHead className="whitespace-nowrap font-mono text-[10px] sm:text-xs uppercase">Tanggal</TableHead>
                      <TableHead className="font-mono text-[10px] sm:text-xs uppercase">Deskripsi</TableHead>
                      <TableHead className="font-mono text-[10px] sm:text-xs uppercase">Kategori</TableHead>
                      <TableHead className="whitespace-nowrap text-right font-mono text-[10px] sm:text-xs uppercase">Jumlah</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((t) => (
                      <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="whitespace-nowrap font-mono text-[10px] sm:text-xs text-muted-foreground">
                          {format(new Date(t.date), "dd MMM", { locale: id })}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-medium truncate">
                          {t.description}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "whitespace-nowrap border rounded px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider",
                            t.category === 'need' && "border-blue-500/30 bg-blue-500/10 text-blue-500",
                            t.category === 'want' && "border-amber-500/30 bg-amber-500/10 text-amber-500",
                          )}>
                            {t.category === 'need' ? 'Kebutuhan' : 'Keinginan'}
                          </span>
                        </TableCell>
                        <TableCell className={cn(
                          "whitespace-nowrap text-right font-mono text-xs sm:text-sm",
                          t.type === 'income' ? "text-accent font-medium" : ""
                        )}>
                          <span className="hidden sm:inline">{t.type === 'income' ? '+' : '-'} Rp</span>
                          {Math.round(t.amount / 1000)}k
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleDelete(t.id, t.description)}
                            className="text-destructive hover:text-destructive/70 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
