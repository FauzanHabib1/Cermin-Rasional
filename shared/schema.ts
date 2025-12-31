import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, date, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactionTypeEnum = pgEnum("type", ["income", "expense"]);
export const transactionCategoryEnum = pgEnum("category", ["need", "want", "savings"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  parentIncomeId: integer("parent_income_id"), // Links allocation to source income
  isAllocation: boolean("is_allocation").default(false), // True if this is a savings allocation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  targetNeedRatio: decimal("target_need_ratio", { precision: 5, scale: 2 }).default("50"),
  targetWantRatio: decimal("target_want_ratio", { precision: 5, scale: 2 }).default("30"),
  targetSavingsRatio: decimal("target_savings_ratio", { precision: 5, scale: 2 }).default("20"),
  monthlyIncomeTarget: decimal("monthly_income_target", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("IDR"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }),
  resourceId: integer("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  description: true,
  amount: true,
  type: true,
  category: true,
}).extend({
  date: z.string(),
  amount: z.union([z.string(), z.number().transform(String)]),
  parentIncomeId: z.number().optional(),
  isAllocation: z.boolean().optional(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  targetNeedRatio: true,
  targetWantRatio: true,
  targetSavingsRatio: true,
  monthlyIncomeTarget: true,
  currency: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type AuditLog = typeof auditLogs.$inferSelect;
