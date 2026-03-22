import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

export const balances = pgTable("balances", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull().default(0), // stored in cents
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(), // 'deposit', 'withdrawal', 'transfer'
  amount: integer("amount").notNull(), // stored in cents
  status: varchar("status").notNull().default('completed'), // 'pending', 'completed', 'failed'
  fromUserId: varchar("from_user_id").references(() => users.id), // null for deposits
  toUserId: varchar("to_user_id").references(() => users.id), // null for withdrawals
  externalApp: varchar("external_app"), // 'gpay', 'phonepe', 'paytm', etc.
  description: varchar("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true, 
  status: true,
  fromUserId: true 
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Balance = typeof balances.$inferSelect;

export type DepositRequest = { amount: number; externalApp?: string; upiId?: string }; 
export type WithdrawRequest = { amount: number; upiId: string };
export type TransferRequest = { amount: number, toUserId: string, description?: string };

export type TransactionResponse = Transaction & { 
  otherUser?: { firstName: string | null, lastName: string | null, email: string | null } 
};
