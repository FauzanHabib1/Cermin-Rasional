import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  description: z.string().min(2, "Deskripsi terlalu pendek"),
  amount: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Jumlah harus angka positif"
    ),
  type: z.enum(["income", "expense"]),
  category: z.enum(["need", "want", "savings"]),
  savingsAllocation: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      "Alokasi harus berupa angka >= 0"
    ),
});

interface AddTransactionProps {
  onAdd: (transaction: Transaction) => void;
}

export function AddTransaction({ onAdd }: AddTransactionProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      category: "need",
      savingsAllocation: "",
    },
  });

  const watchedType = form.watch("type");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const allocation = values.savingsAllocation
      ? Number(values.savingsAllocation)
      : 0;
    const incomeAmount = Number(values.amount);
    if (values.type === "income" && allocation > incomeAmount) {
      toast({
        title: "Alokasi melebihi pemasukan",
        description: `Anda mencoba mengamankan Rp ${allocation.toLocaleString("id-ID")} dari pemasukan Rp ${incomeAmount.toLocaleString("id-ID")}. Kurangi alokasi.`,
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      amount: Number(values.amount),
      type: values.type as "income" | "expense",
      category: values.category as "need" | "want" | "savings",
      description: values.description,
    };
    // If income and user specified a savings allocation, create a separate savings transaction
    onAdd(newTransaction);

    if (newTransaction.type === "income" && allocation > 0) {
      const savingsTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        amount: allocation,
        type: "expense",
        category: "savings",
        description: `Alokasi Tabungan: ${newTransaction.description}`,
        parentIncomeId: newTransaction.id as any,
        isAllocation: true,
      };

      onAdd(savingsTx);
    }
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-4 h-4" />
          Input Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Input Transaksi Baru</DialogTitle>
          <DialogDescription>
            Masukkan data secara jujur untuk hasil analisis yang akurat.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Arus Kas</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan (Income)</SelectItem>
                      <SelectItem value="expense">
                        Pengeluaran (Expense)
                      </SelectItem>
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
                  <FormLabel>Kategori Logis</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="need">
                        Kebutuhan (Needs) - Wajib
                      </SelectItem>
                      <SelectItem value="want">
                        Keinginan (Wants) - Opsional
                      </SelectItem>
                      <SelectItem value="savings">
                        Tabungan/Investasi
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedType === "income" && (
              <FormField
                control={form.control}
                name="savingsAllocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Alokasi Tabungan (opsional, dari jumlah pemasukan)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Makan Siang, Kopi, Gaji"
                      {...field}
                    />
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
                  <FormLabel>Nominal (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Simpan Data</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
