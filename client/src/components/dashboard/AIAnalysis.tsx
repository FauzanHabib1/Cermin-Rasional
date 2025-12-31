import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Sparkles } from "lucide-react";
import { MonthlyAnalysis } from "@/lib/types";

interface AIAnalysisProps {
  analysis: MonthlyAnalysis;
}

export function AIAnalysis({ analysis }: AIAnalysisProps) {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function analyzeWithAI() {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/analyze-finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze finances");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) {
                text += data.content;
                setResponse(text);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error analyzing finances");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono font-medium text-blue-600 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Analisis AI
          </CardTitle>
          <Button
            size="sm"
            onClick={analyzeWithAI}
            disabled={loading}
            variant="outline"
            className="text-xs"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-3 w-3" />
                Menganalisis...
              </>
            ) : (
              "Analisis Sekarang"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {error}
          </div>
        )}
        {!response && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            Klik tombol di atas untuk mendapatkan analisis mendalam tentang keuangan Anda menggunakan AI.
          </p>
        )}
        {response && (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none">
            {response.split("\n").map((line, i) => {
              if (line.startsWith("# ")) {
                return (
                  <h3 key={i} className="font-bold text-base mt-3 mb-2">
                    {line.substring(2)}
                  </h3>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h4 key={i} className="font-semibold text-sm mt-2 mb-1">
                    {line.substring(3)}
                  </h4>
                );
              }
              if (line.startsWith("- ")) {
                return (
                  <li key={i} className="ml-4">
                    {line.substring(2)}
                  </li>
                );
              }
              if (line.trim()) {
                return (
                  <p key={i} className="mb-2">
                    {line}
                  </p>
                );
              }
              return null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
