import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Target, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SavingsGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export function SavingsGoals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: ''
  });

  const { data: goals = [] } = useQuery<SavingsGoal[]>({
    queryKey: ["savings-goals"],
    queryFn: async () => {
      const res = await fetch("/api/savings-goals");
      if (!res.ok) throw new Error("Failed to fetch savings goals");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/savings-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      setIsAdding(false);
      setFormData({ name: '', targetAmount: '', currentAmount: '0', deadline: '' });
      toast({ title: "Goal Created", description: "Savings goal successfully created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const res = await fetch(`/api/savings-goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      setEditingId(null);
      toast({ title: "Goal Updated", description: "Savings goal successfully updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/savings-goals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({ title: "Goal Deleted", description: "Savings goal successfully deleted" });
    },
  });

  const handleCreate = () => {
    if (!formData.name || !formData.targetAmount) {
      toast({ title: "Error", description: "Name and target amount are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdateProgress = (goal: SavingsGoal, newAmount: string) => {
    updateMutation.mutate({ id: goal.id, data: { currentAmount: newAmount } });
  };

  const calculateProgress = (current: string, target: string) => {
    const c = Number(current);
    const t = Number(target);
    return t > 0 ? Math.min((c / t) * 100, 100) : 0;
  };

  const calculateDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold">Target Tabungan</h2>
        <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Target
        </Button>
      </div>

      {isAdding && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm">Target Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Nama target (e.g., Dana Darurat)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Target amount"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Current amount (optional)"
              value={formData.currentAmount}
              onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
            />
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate}>
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const daysRemaining = calculateDaysRemaining(goal.deadline);
          const isEditing = editingId === goal.id;

          return (
            <Card key={goal.id} className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <CardTitle className="text-sm">{goal.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setEditingId(isEditing ? null : goal.id)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => deleteMutation.mutate(goal.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold font-mono text-green-500">
                      Rp {Number(goal.currentAmount).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      / Rp {Number(goal.targetAmount).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-green-500 font-bold">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" indicatorClassName="bg-green-500" />
                </div>

                {daysRemaining !== null && (
                  <p className="text-xs text-muted-foreground">
                    {daysRemaining > 0 ? `${daysRemaining} hari lagi` : 'Deadline terlewat'}
                  </p>
                )}

                {isEditing && (
                  <div className="space-y-2 pt-2 border-t">
                    <Input
                      type="number"
                      placeholder="Update current amount"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value;
                          if (value) handleUpdateProgress(goal, value);
                        }
                      }}
                    />
                  </div>
                )}

                {progress >= 100 && (
                  <p className="text-xs text-green-500 font-bold">
                    🎉 Target tercapai!
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && !isAdding && (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Belum ada target tabungan. Klik "Tambah Target" untuk membuat target baru.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
