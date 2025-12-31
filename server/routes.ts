import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface FinancialData {
  period: string;
  totalIncome: number;
  totalExpense: number;
  needExpense: number;
  wantExpense: number;
  savedAmount: number;
  needRatio: number;
  wantRatio: number;
  savingsRatio: number;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // AI Financial Analysis endpoint
  app.post("/api/analyze-finances", async (req: Request, res: Response) => {
    try {
      const { analysis } = req.body as { analysis: FinancialData };

      if (!analysis) {
        return res.status(400).json({ error: "Financial analysis data required" });
      }

      const prompt = `Analisis laporan keuangan bulanan berikut dan berikan wawasan mendalam dalam bahasa Indonesia:

Periode: ${analysis.period}
- Total Pemasukan: Rp ${analysis.totalIncome.toLocaleString("id-ID")}
- Total Pengeluaran: Rp ${analysis.totalExpense.toLocaleString("id-ID")}
  - Kebutuhan (Needs): Rp ${analysis.needExpense.toLocaleString("id-ID")} (${analysis.needRatio.toFixed(1)}%)
  - Keinginan (Wants): Rp ${analysis.wantExpense.toLocaleString("id-ID")} (${analysis.wantRatio.toFixed(1)}%)
- Tabungan/Alokasi: Rp ${analysis.savedAmount.toLocaleString("id-ID")} (${analysis.savingsRatio.toFixed(1)}%)

Berikan:
1. Ringkasan kesehatan finansial (2-3 kalimat)
2. Analisis rasio 50/30/20 (kebutuhan/keinginan/tabungan)
3. 2-3 rekomendasi konkret untuk meningkatkan manajemen keuangan
4. Poin positif dan area perbaikan

Format dengan jelas menggunakan markdown.`;

      const stream = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_completion_tokens: 1024,
      });

      // Set up SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error analyzing finances:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to analyze finances" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Analysis failed" })}\n\n`);
        res.end();
      }
    }
  });

  return httpServer;
}
