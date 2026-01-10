import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Edit2, Check, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: number;
  category: 'need' | 'want' | 'savings';
  monthlyLimit: string;
}

interface BudgetCardProps {
  category: 'need' | 'want' | 'savings';
  label: string;
  currentSpending: number;
  budget: Budget | undefined;
  onUpdate: (category: string, limit: number) => Promise<void>;
  onCreate: (category: string, limit: number) => Promise<void>;
}

const COLORS = {
  need: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', progress: 'bg-blue-500' },
  want: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', progress: 'bg-amber-500' },
  savings: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500', progress: 'bg-green-500' },
};

export function BudgetCard({ category, label, currentSpending, budget, onUpdate, onCreate }: BudgetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [limitValue, setLimitValue] = useState(budget?.monthlyLimit || '');
  const { toast } = useToast();
  
  const limit = budget ? Number(budget.monthlyLimit) : 0;
  const percentage = limit > 0 ? Math.min((currentSpending / limit) * 100, 100) : 0;
  const isOverBudget = currentSpending > limit && limit > 0;
  
  const colors = COLORS[category];
  
  const handleSave = async () => {
    const numLimit = Number(limitValue);
    if (isNaN(numLimit) || numLimit <= 0) {
      toast({
        title: "Error",
        description: "Budget harus berupa angka positif",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (budget) {
        await onUpdate(category, numLimit);
      } else {
        await onCreate(category, numLimit);
      }
      setIsEditing(false);
      toast({
        title: "Budget Diperbarui",
        description: `Budget ${label} berhasil disimpan`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan budget",
        variant: "destructive"
      });
    }
  };
  
  const handleCancel = () => {
    setLimitValue(budget?.monthlyLimit || '');
    setIsEditing(false);
  };
  
  return (
    <Card className={`border ${colors.border} ${colors.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wider font-mono">
            {label}
          </CardTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLimitValue(budget?.monthlyLimit || '');
                setIsEditing(true);
              }}
              className="h-7 w-7 p-0"
            >
              {budget ? <Edit2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Spending */}
        <div>
          <p className="text-xs text-muted-foreground">Pengeluaran Bulan Ini</p>
          <p className={`text-xl font-bold font-mono ${colors.text}`}>
            Rp {currentSpending.toLocaleString('id-ID')}
          </p>
        </div>
        
        {/* Budget Limit */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Budget Bulanan</p>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                type="number"
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
                placeholder="Masukkan budget"
                className="h-8 text-sm"
              />
              <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-lg font-bold font-mono">
              {budget ? `Rp ${limit.toLocaleString('id-ID')}` : 'Belum diset'}
            </p>
          )}
        </div>
        
        {/* Progress Bar */}
        {budget && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className={isOverBudget ? 'text-red-500 font-bold' : colors.text}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={percentage} 
              className="h-2"
              indicatorClassName={isOverBudget ? 'bg-red-500' : colors.progress}
            />
            {isOverBudget && (
              <p className="text-xs text-red-500 font-medium">
                ⚠️ Melebihi budget Rp {(currentSpending - limit).toLocaleString('id-ID')}
              </p>
            )}
            {!isOverBudget && limit > 0 && (
              <p className="text-xs text-muted-foreground">
                Sisa: Rp {(limit - currentSpending).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
