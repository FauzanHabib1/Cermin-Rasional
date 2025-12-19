import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Warning } from "@/lib/types";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface ScoreCardProps {
  score: number;
  label: string;
  efficiency: number;
  warnings: Warning[];
}

export function ScoreCard({ score, label, efficiency, warnings }: ScoreCardProps) {
  // Color coding for score
  const scoreColor = score > 80 ? "text-accent" : score > 50 ? "text-orange-400" : "text-destructive";
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Score */}
      <Card className="lg:col-span-1 border-border bg-card relative overflow-hidden">
        <div className={cn("absolute top-0 left-0 w-1 h-full", score > 80 ? "bg-accent" : "bg-destructive")} />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest font-mono">
            Skor Konsistensi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            <span className={cn("text-6xl font-bold font-display tracking-tighter", scoreColor)}>
              {score}
            </span>
            <span className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-widest">
              {label}
            </span>
            
            <div className="w-full mt-6 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>Efisiensi Alokasi</span>
                <span className={efficiency > 80 ? "text-accent" : "text-destructive"}>{efficiency}/100</span>
              </div>
              <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn("h-full", efficiency > 80 ? "bg-accent" : "bg-destructive")} 
                  style={{ width: `${efficiency}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings / Logic Log */}
      <Card className="lg:col-span-2 border-border bg-card flex flex-col">
        <CardHeader className="pb-2 border-b border-border/50">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Logika & Peringatan Sistem
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          {warnings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Sistem tidak mendeteksi anomali.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {warnings.map((warn, i) => (
                <div key={i} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    {warn.level === 'critical' ? (
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={cn("text-sm font-medium", warn.level === 'critical' ? "text-destructive" : "text-foreground")}>
                        {warn.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        IMPLIKASI LOGIS: {warn.implication}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
