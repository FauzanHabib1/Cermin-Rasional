import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertUserSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Middleware to simulate a logged-in user for MVP
  // In a real app, this would use Passport or another auth strategy
  app.use(async (req, res, next) => {
    // Check if we have a user 1, if not create one
    let user = await storage.getUser(1);
    if (!user) {
      user = await storage.createUser({
        username: "demo",
        password: "password", // In real app, hash this
        email: "demo@example.com"
      });
    }
    // Attach user to request (using any cast to avoid type errors with standard express Request)
    (req as any).user = user;
    next();
  });

  app.get("/api/transactions", async (req, res) => {
    const userId = (req as any).user.id;
    const transactions = await storage.getTransactions(userId);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    const userId = (req as any).user.id;
    const parsed = insertTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid transaction data", errors: parsed.error });
    }
    const transaction = await storage.createTransaction(userId, parsed.data);
    res.json(transaction);
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteTransaction(id);
    res.sendStatus(204);
  });

  app.get("/api/settings", async (req, res) => {
    const userId = (req as any).user.id;
    const settings = await storage.getUserSettings(userId);
    res.json(settings || {});
  });

  app.patch("/api/settings", async (req, res) => {
    const userId = (req as any).user.id;
    const parsed = insertUserSettingsSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid settings data", errors: parsed.error });
    }
    const settings = await storage.updateUserSettings(userId, parsed.data);
    res.json(settings);
  });

  app.get("/api/summary", async (req, res) => {
    const userId = (req as any).user.id;
    const transactions = await storage.getTransactions(userId);

    // Filter for current month
    const now = new Date();
    const currentMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    let needExpense = 0;
    let wantExpense = 0;
    // let savingsExpense = 0; // if category is savings, does it count as expense or savings?
    // Schema says:
    // Income -> category: need (passive), want, savings
    // Expense -> category: need, want, savings
    // Logic says:
    // Need Ratio = Expense(need) / Total Expense
    // Want Ratio = Expense(want) / Total Expense
    // Savings Ratio = Net Savings / Total Income  (Net Savings = Total Income - Total Expense)

    // Note: If expense is category 'savings', it reduces Net Savings in the formula (Income - Expense).
    // However, usually 'savings' category in expense means transferring to savings account, so it is technically an expense from 'cash' but addition to 'savings'.
    // The formula "Net Savings = Total Income - Total Expense" implies that anything logged as expense reduces net savings.
    // But if I explicitly log an expense as 'savings', it should probably be counted towards savings?
    // Let's stick strictly to the formula provided in DATABASE_SCHEMA.md:
    // Net Savings = Total Income - Total Expense
    // Savings Ratio = Net Savings / Total Income * 100

    // Wait, if I spend 500 on 'need', 300 on 'want', and 200 on 'savings' (transfer to investment), logic says Total Expense = 1000.
    // If Income = 1000. Net Savings = 0. Savings Ratio = 0%.
    // This seems wrong if I explicitly categorized 200 as savings.
    // However, maybe 'savings' ratio is meant to be (Income - (Need + Want)) / Income?
    // Let's re-read the doc:
    // "Net Savings = Total Income - Total Expense"
    // "Savings Ratio = Net Savings / Total Income * 100"
    // This implies that 'savings' category in Expense might be for tracking where the money went (e.g. into an investment account), but the simpler calculation relies on raw cash flow.
    // Let's follow the doc strictly for now.

    for (const t of currentMonthTransactions) {
      const amt = Number(t.amount);
      if (t.type === 'income') {
        totalIncome += amt;
      } else if (t.type === 'expense') {
        totalExpense += amt;
        if (t.category === 'need') needExpense += amt;
        if (t.category === 'want') wantExpense += amt;
      }
    }

    const netSavings = totalIncome - totalExpense;

    const needRatio = totalExpense > 0 ? (needExpense / totalExpense) * 100 : 0;
    const wantRatio = totalExpense > 0 ? (wantExpense / totalExpense) * 100 : 0;
    const savingsRatio = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    res.json({
      totalIncome,
      totalExpense,
      netSavings,
      needRatio: Math.round(needRatio * 100) / 100,
      wantRatio: Math.round(wantRatio * 100) / 100,
      savingsRatio: Math.round(savingsRatio * 100) / 100,
      breakdown: {
        need: needExpense,
        want: wantExpense,
        savings: netSavings // or should this be expense(savings)? 
        // The doc implies savings is the residual.
      }
    });
  });

  return httpServer;
}
