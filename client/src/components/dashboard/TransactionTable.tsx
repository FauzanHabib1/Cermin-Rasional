import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <div className="min-w-full">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead className="font-mono text-[11px] sm:text-xs uppercase whitespace-nowrap">Tanggal</TableHead>
              <TableHead className="font-mono text-[11px] sm:text-xs uppercase">Deskripsi</TableHead>
              <TableHead className="font-mono text-[11px] sm:text-xs uppercase">Kategori</TableHead>
              <TableHead className="text-right font-mono text-[11px] sm:text-xs uppercase whitespace-nowrap">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-mono text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(t.date), "dd MMM", { locale: id })}
                </TableCell>
                <TableCell className="font-medium text-xs sm:text-sm truncate">
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
