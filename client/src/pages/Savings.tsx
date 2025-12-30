import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function Savings() {
  const { transactions, deleteTransaction } = useTransactions();
  const allocations = transactions.filter(t => t.category === 'savings');

  const total = allocations.reduce((s,a)=> s + a.amount, 0);

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Tabungan Anda</h2>
          <p className="text-sm text-muted-foreground">Saldo teramankan: Rp {total.toLocaleString('id-ID')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Alokasi Tabungan</CardTitle>
          </CardHeader>
          <CardContent>
            {allocations.length === 0 ? (
              <div className="text-sm text-muted-foreground">Belum ada alokasi tabungan.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{format(new Date(a.date), 'dd MMM', { locale: id })}</TableCell>
                      <TableCell>{a.description}</TableCell>
                      <TableCell>Rp {a.amount.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Batalkan alokasi ini?')) deleteTransaction(a.id); }}>Batalkan Alokasi</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
