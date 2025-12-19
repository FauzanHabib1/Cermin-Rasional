import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RatioCardProps {
  label: string;
  value: number;
  target: number;
  type: 'need' | 'want' | 'savings';
  amount: number;
}

export function RatioCard({ label, value, target, type, amount }: RatioCardProps) {
  let statusColor = "bg-primary";
  let statusText = "text-muted-foreground";
  let barColor = "";

  if (type === 'need') {
    barColor = "bg-[hsl(var(--chart-2))]";
    if (value > target) statusColor = "text-warning"; 
  } else if (type === 'want') {
    barColor = "bg-[hsl(var(--chart-3))]";
    if (value > target) statusColor = "text-destructive";
  } else { // savings
    barColor = "bg-[hsl(var(--chart-1))]";
    if (value < target) statusColor = "text-destructive";
  }

  const deviation = value - target;
  const deviationText = deviation > 0 ? `+${deviation.toFixed(1)}%` : `${deviation.toFixed(1)}%`;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
            {label}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3 h-3 text-muted-foreground/50" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Target ideal: {target}%</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold font-mono nums">{value.toFixed(1)}%</span>
          <span className={cn("text-xs font-mono", type === 'savings' ? (deviation < 0 ? 'text-destructive' : 'text-accent') : (deviation > 0 ? 'text-destructive' : 'text-accent'))}>
            {deviationText} dari target
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={Math.min(value, 100)} className="h-2 bg-secondary" indicatorClassName={barColor} />
        <p className="mt-2 text-xs text-muted-foreground font-mono">
          Rp {amount.toLocaleString('id-ID')}
        </p>
      </CardContent>
    </Card>
  );
}
