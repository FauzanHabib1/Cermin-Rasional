import {
  type User, type InsertUser,
  type Transaction, type InsertTransaction,
  type UserSettings, type InsertUserSettings
} from "../shared/schema";

export interface Budget {
  id: number;
  userId: number;
  category: 'need' | 'want' | 'savings';
  monthlyLimit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertBudget {
  category: 'need' | 'want' | 'savings';
  monthlyLimit: string;
}

export interface SavingsGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertSavingsGoal {
  name: string;
  targetAmount: string;
  currentAmount?: string;
  deadline?: Date | null;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transactions
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(userId: number, transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  
  // Allocations
  getAllocationsForIncome(incomeId: number): Promise<Transaction[]>;
  getTotalAllocatedForIncome(incomeId: number): Promise<number>;
  
  // Settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  updateUserSettings(userId: number, settings: InsertUserSettings): Promise<UserSettings>;
  
  // Budgets
  getBudgets(userId: number): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  getBudgetByCategory(userId: number, category: 'need' | 'want' | 'savings'): Promise<Budget | undefined>;
  createBudget(userId: number, budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, updates: Partial<Budget>): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;
  
  // Savings Goals
  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  createSavingsGoal(userId: number, goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, updates: Partial<SavingsGoal>): Promise<SavingsGoal>;
  deleteSavingsGoal(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private settings: Map<number, UserSettings>;
  private budgets: Map<number, Budget>;
  private savingsGoals: Map<number, SavingsGoal>;
  private currentUserId: number;
  private currentTransactionId: number;
  private currentSettingsId: number;
  private currentBudgetId: number;
  private currentSavingsGoalId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.settings = new Map();
    this.budgets = new Map();
    this.savingsGoals = new Map();
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.currentSettingsId = 1;
    this.currentBudgetId = 1;
    this.currentSavingsGoalId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email || null, // handle optional email
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);

    // Create default settings for the user
    await this.updateUserSettings(id, {
      targetNeedRatio: "50",
      targetWantRatio: "30",
      targetSavingsRatio: "20",
      currency: "IDR"
    });

    return user;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (t) => t.userId === userId
    );
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(userId: number, transaction: InsertTransaction): Promise<Transaction> {
    // Validation: If this is an allocation, validate against parent income
    if (transaction.isAllocation && transaction.parentIncomeId) {
      const parentIncome = await this.getTransaction(transaction.parentIncomeId);
      if (!parentIncome) {
        throw new Error("Parent income transaction not found");
      }
      if (parentIncome.type !== "income") {
        throw new Error("Parent transaction must be an income");
      }
      
      // Check total allocations don't exceed income
      const totalAllocated = await this.getTotalAllocatedForIncome(transaction.parentIncomeId);
      const newTotal = totalAllocated + Number(transaction.amount);
      if (newTotal > Number(parentIncome.amount)) {
        throw new Error(`Allocation would exceed income amount. Max available: Rp ${(Number(parentIncome.amount) - totalAllocated).toLocaleString('id-ID')}`);
      }
    }
    
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      userId,
      date: new Date(transaction.date),
      parentIncomeId: transaction.parentIncomeId ?? null,
      isAllocation: transaction.isAllocation ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    
    const updated: Transaction = {
      ...transaction,
      ...updates,
      id: transaction.id, // Ensure ID doesn't change
      userId: transaction.userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };
    
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: number): Promise<void> {
    const transaction = this.transactions.get(id);
    if (!transaction) return;
    
    // Cascade delete: If deleting an income, delete all its allocations
    if (transaction.type === "income") {
      const allocations = await this.getAllocationsForIncome(id);
      for (const allocation of allocations) {
        this.transactions.delete(allocation.id);
      }
    }
    
    this.transactions.delete(id);
  }

  async getAllocationsForIncome(incomeId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (t) => t.parentIncomeId === incomeId && t.isAllocation
    );
  }

  async getTotalAllocatedForIncome(incomeId: number): Promise<number> {
    const allocations = await this.getAllocationsForIncome(incomeId);
    return allocations.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.settings.values()).find(
      (s) => s.userId === userId
    );
  }

  async updateUserSettings(userId: number, settings: InsertUserSettings): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    if (existing) {
      const updated: UserSettings = {
        ...existing,
        ...settings,
        updatedAt: new Date(),
        monthlyIncomeTarget: settings.monthlyIncomeTarget || existing.monthlyIncomeTarget || null
      };
      this.settings.set(existing.id, updated);
      return updated;
    }

    const id = this.currentSettingsId++;
    const newSettings: UserSettings = {
      ...settings,
      id,
      userId,
      monthlyIncomeTarget: settings.monthlyIncomeTarget || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure defaults are set if not provided in insertObject (though our schema handles this, manual obj needs it)
      targetNeedRatio: settings.targetNeedRatio || "50",
      targetWantRatio: settings.targetWantRatio || "30",
      targetSavingsRatio: settings.targetSavingsRatio || "20",
      currency: settings.currency || "IDR"
    };
    this.settings.set(id, newSettings);
    return newSettings;
  }
  
  // Budget methods
  async getBudgets(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (b) => b.userId === userId
    );
  }
  
  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }
  
  async getBudgetByCategory(userId: number, category: 'need' | 'want' | 'savings'): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(
      (b) => b.userId === userId && b.category === category
    );
  }
  
  async createBudget(userId: number, budget: InsertBudget): Promise<Budget> {
    // Check if budget for this category already exists
    const existing = await this.getBudgetByCategory(userId, budget.category);
    if (existing) {
      throw new Error(`Budget for category ${budget.category} already exists`);
    }
    
    const id = this.currentBudgetId++;
    const newBudget: Budget = {
      ...budget,
      id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.budgets.set(id, newBudget);
    return newBudget;
  }
  
  async updateBudget(id: number, updates: Partial<Budget>): Promise<Budget> {
    const budget = this.budgets.get(id);
    if (!budget) {
      throw new Error("Budget not found");
    }
    
    const updated: Budget = {
      ...budget,
      ...updates,
      id: budget.id,
      userId: budget.userId,
      updatedAt: new Date(),
    };
    
    this.budgets.set(id, updated);
    return updated;
  }
  
  async deleteBudget(id: number): Promise<void> {
    this.budgets.delete(id);
  }
  
  // Savings Goals methods
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values()).filter(
      (g) => g.userId === userId
    );
  }
  
  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.get(id);
  }
  
  async createSavingsGoal(userId: number, goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.currentSavingsGoalId++;
    const newGoal: SavingsGoal = {
      ...goal,
      id,
      userId,
      currentAmount: goal.currentAmount || '0',
      deadline: goal.deadline || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.savingsGoals.set(id, newGoal);
    return newGoal;
  }
  
  async updateSavingsGoal(id: number, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const goal = this.savingsGoals.get(id);
    if (!goal) {
      throw new Error("Savings goal not found");
    }
    
    const updated: SavingsGoal = {
      ...goal,
      ...updates,
      id: goal.id,
      userId: goal.userId,
      updatedAt: new Date(),
    };
    
    this.savingsGoals.set(id, updated);
    return updated;
  }
  
  async deleteSavingsGoal(id: number): Promise<void> {
    this.savingsGoals.delete(id);
  }
}

export const storage = new MemStorage();
