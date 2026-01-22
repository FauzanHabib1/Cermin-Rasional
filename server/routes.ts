import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTransactionSchema,
  insertUserSettingsSchema,
} from "../shared/schema";
import { z } from "zod";
import { exportToExcel, exportToCSV } from "./export";

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
  app: Express,
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
        email: "demo@example.com",
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
      return res
        .status(400)
        .json({ message: "Invalid transaction data", errors: parsed.error });
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

  app.patch("/api/transactions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const transaction = await storage.getTransaction(id);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    // Update transaction (simplified - only allow updating amount and description)
    const updated = await storage.updateTransaction(id, req.body);
    res.json(updated);
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
      return res
        .status(400)
        .json({ message: "Invalid settings data", errors: parsed.error });
    }
    const settings = await storage.updateUserSettings(userId, parsed.data);
    res.json(settings);
  });

  app.get("/api/summary", async (req, res) => {
    const userId = (req as any).user.id;
    const transactions = await storage.getTransactions(userId);

    // Filter for current month
    const now = new Date();
    const currentMonthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });

    // Calculate totals with new logic:
    // 1. Allocated Savings = expenses with isAllocation === true
    // 2. Available Balance = Total Income - Allocated Savings
    // 3. Regular Expenses = expenses with isAllocation !== true
    // 4. Net Balance = Available Balance - Regular Expenses

    let totalIncome = 0;
    let allocatedSavings = 0;
    let needExpense = 0;
    let wantExpense = 0;
    let totalRegularExpenses = 0;

    for (const t of currentMonthTransactions) {
      const amt = Number(t.amount);
      if (t.type === "income") {
        totalIncome += amt;
      } else if (t.type === "expense") {
        // Check if this is an allocated savings transaction
        if (t.isAllocation === true || t.category === "savings") {
          allocatedSavings += amt;
        } else {
          // Regular expense
          totalRegularExpenses += amt;
          if (t.category === "need") needExpense += amt;
          if (t.category === "want") wantExpense += amt;
        }
      }
    }

    // Calculate derived values
    const availableForExpenses = totalIncome - allocatedSavings;
    const totalExpense = totalRegularExpenses + allocatedSavings; // Total of all expenses
    const netBalance = availableForExpenses - totalRegularExpenses;

    // Calculate ratios based on regular expenses only (excluding allocated savings)
    const needRatio =
      totalRegularExpenses > 0 ? (needExpense / totalRegularExpenses) * 100 : 0;
    const wantRatio =
      totalRegularExpenses > 0 ? (wantExpense / totalRegularExpenses) * 100 : 0;
    const savingsRatio =
      totalIncome > 0 ? (allocatedSavings / totalIncome) * 100 : 0;

    res.json({
      totalIncome,
      allocatedSavings,
      availableForExpenses,
      totalRegularExpenses,
      totalExpense, // Keep for backward compatibility
      netBalance,
      netSavings: netBalance, // Alias for backward compatibility
      needRatio: Math.round(needRatio * 100) / 100,
      wantRatio: Math.round(wantRatio * 100) / 100,
      savingsRatio: Math.round(savingsRatio * 100) / 100,
      breakdown: {
        need: needExpense,
        want: wantExpense,
        savings: allocatedSavings,
      },
    });
  });

  // Export endpoints
  app.get("/api/export/excel", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || 1;
      const transactions = await storage.getTransactions(userId);

      const buffer = await exportToExcel(transactions);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=transaksi-${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      res.status(500).json({ error: "Failed to export to Excel" });
    }
  });

  app.get("/api/export/csv", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || 1;
      const transactions = await storage.getTransactions(userId);

      const csv = exportToCSV(transactions);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=transaksi-${new Date().toISOString().split("T")[0]}.csv`,
      );
      res.send("\uFEFF" + csv); // Add BOM for Excel compatibility
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      res.status(500).json({ error: "Failed to export to CSV" });
    }
  });

  // Budget endpoints
  app.get("/api/budgets", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || 1;
      const budgets = await storage.getBudgets(userId);
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || 1;
      const { category, monthlyLimit } = req.body;

      if (!category || !monthlyLimit) {
        return res
          .status(400)
          .json({ error: "Category and monthlyLimit are required" });
      }

      if (!["need", "want", "savings"].includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }

      const budget = await storage.createBudget(userId, {
        category,
        monthlyLimit,
      });
      res.json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create budget";
      res.status(400).json({ error: message });
    }
  });

  app.put("/api/budgets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { monthlyLimit } = req.body;

      if (!monthlyLimit) {
        return res.status(400).json({ error: "monthlyLimit is required" });
      }

      const budget = await storage.updateBudget(id, { monthlyLimit });
      res.json(budget);
    } catch (error) {
      console.error("Error updating budget:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update budget";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/budgets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBudget(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ error: "Failed to delete budget" });
    }
  });

  // Savings Goals endpoints
  app.get("/api/savings-goals", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || 1;
      const goals = await storage.getSavingsGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching savings goals:", error);
      res.status(500).json({ error: "Failed to fetch savings goals" });
    }
  });

  app.post("/api/savings-goals", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || 1;
      const { name, targetAmount, currentAmount, deadline } = req.body;

      if (!name || !targetAmount) {
        return res
          .status(400)
          .json({ error: "Name and targetAmount are required" });
      }

      const goal = await storage.createSavingsGoal(userId, {
        name,
        targetAmount,
        currentAmount,
        deadline: deadline ? new Date(deadline) : null,
      });
      res.json(goal);
    } catch (error) {
      console.error("Error creating savings goal:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create savings goal";
      res.status(400).json({ error: message });
    }
  });

  app.put("/api/savings-goals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, targetAmount, currentAmount, deadline } = req.body;

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (targetAmount !== undefined) updates.targetAmount = targetAmount;
      if (currentAmount !== undefined) updates.currentAmount = currentAmount;
      if (deadline !== undefined)
        updates.deadline = deadline ? new Date(deadline) : null;

      const goal = await storage.updateSavingsGoal(id, updates);
      res.json(goal);
    } catch (error) {
      console.error("Error updating savings goal:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update savings goal";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/savings-goals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSavingsGoal(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting savings goal:", error);
      res.status(500).json({ error: "Failed to delete savings goal" });
    }
  });

  return httpServer;
}
