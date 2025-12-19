import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/50">
          <TableRow>
            <TableHead className="w-[120px] font-mono text-xs uppercase">Tanggal</TableHead>
            <TableHead className="font-mono text-xs uppercase">Deskripsi</TableHead>
            <TableHead className="font-mono text-xs uppercase">Kategori</TableHead>
            <TableHead className="text-right font-mono text-xs uppercase">Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-mono text-xs text-muted-foreground">
                {format(new Date(t.date), "dd MMM yyyy", { locale: id })}
              </TableCell>
              <TableCell className="font-medium text-sm">
                {t.description}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border",
                  t.category === 'need' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  t.category === 'want' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                  t.category === 'savings' && "bg-green-500/10 text-green-500 border-green-500/20",
                )}>
                  {t.category === 'need' ? 'Kebutuhan' : t.category === 'want' ? 'Keinginan' : 'Tabungan'}
                </span>
              </TableCell>
              <TableCell className={cn(
                "text-right font-mono text-sm",
                t.type === 'income' ? "text-accent" : ""
              )}>
                {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
