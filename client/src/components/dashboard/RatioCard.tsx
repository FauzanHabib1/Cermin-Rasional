import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  let barColor = "";
  let barBgColor = "bg-secondary/30";

  if (type === 'need') {
    barColor = "bg-blue-500";
  } else if (type === 'want') {
    barColor = "bg-amber-500";
  } else { // savings
    barColor = "bg-green-500";
  }

  const deviation = value - target;
  const deviationText = deviation > 0 ? `+${deviation.toFixed(1)}%` : `${deviation.toFixed(1)}%`;
  const deviationColor = type === 'savings' ? (deviation < 0 ? 'text-destructive' : 'text-accent') : (deviation > 0 ? 'text-destructive' : 'text-accent');

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
            {label}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1 hover:bg-secondary rounded transition-colors">
                <Info className="w-3 h-3 text-muted-foreground/50" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Target ideal: {target}%</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-1 sm:gap-2 mt-2">
          <span className="text-2xl font-bold font-mono">{value.toFixed(1)}%</span>
          <span className={cn("text-xs font-mono", deviationColor)}>
            {deviationText} dari target
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("w-full h-2 rounded-full overflow-hidden", barBgColor)}>
          <div 
            className={cn("h-full transition-all duration-300", barColor)}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground font-mono">
          Rp {amount.toLocaleString('id-ID')}
        </p>
      </CardContent>
    </Card>
  );
}
