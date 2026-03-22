import { db } from "./db";
import {
  balances,
  transactions,
  users,
  type Balance,
  type Transaction,
  type TransactionResponse
} from "@shared/schema";
import { eq, or, and, desc, ilike, not, inArray } from "drizzle-orm";

export interface IStorage {
  getBalance(userId: string): Promise<Balance | undefined>;
  createBalance(userId: string): Promise<Balance>;
  getTransactions(userId: string): Promise<TransactionResponse[]>;
  deposit(userId: string, amount: number, externalApp?: string): Promise<Transaction>;
  withdraw(userId: string, amount: number): Promise<Transaction>;
  transfer(fromUserId: string, toUserId: string, amount: number, description?: string): Promise<Transaction>;
  searchUsers(query: string | undefined, currentUserId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getBalance(userId: string): Promise<Balance | undefined> {
    const [balance] = await db.select().from(balances).where(eq(balances.userId, userId));
    return balance;
  }

  async createBalance(userId: string): Promise<Balance> {
    const [balance] = await db.insert(balances).values({ userId, amount: 0 }).returning();
    return balance;
  }

  async getTransactions(userId: string): Promise<TransactionResponse[]> {
    const txs = await db.select().from(transactions)
      .where(or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)))
      .orderBy(desc(transactions.createdAt));
      
    const userIds = new Set<string>();
    txs.forEach(tx => {
      if (tx.fromUserId && tx.fromUserId !== userId) userIds.add(tx.fromUserId);
      if (tx.toUserId && tx.toUserId !== userId) userIds.add(tx.toUserId);
    });
    
    const usersMap = new Map();
    if (userIds.size > 0) {
      const relatedUsers = await db.select().from(users).where(inArray(users.id, Array.from(userIds)));
      relatedUsers.forEach(u => usersMap.set(u.id, u));
    }
    
    return txs.map(tx => {
      const otherUserId = tx.fromUserId === userId ? tx.toUserId : tx.fromUserId;
      const otherUser = otherUserId ? usersMap.get(otherUserId) : undefined;
      return {
        ...tx,
        otherUser: otherUser ? {
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          email: otherUser.email
        } : undefined
      };
    });
  }

  async deposit(userId: string, amount: number, externalApp?: string, upiId?: string): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      const [balance] = await tx.select().from(balances).where(eq(balances.userId, userId));
      if (!balance) {
        await tx.insert(balances).values({ userId, amount });
      } else {
        await tx.update(balances).set({ amount: balance.amount + amount, updatedAt: new Date() }).where(eq(balances.userId, userId));
      }
      const [transaction] = await tx.insert(transactions).values({
        type: 'deposit',
        amount,
        toUserId: userId,
        status: 'completed',
        externalApp,
        description: upiId ? `Deposit via ${externalApp} from UPI: ${upiId}` : (externalApp ? `Deposit via ${externalApp}` : 'Deposit from external account')
      }).returning();
      return transaction;
    });
  }

  async withdraw(userId: string, amount: number, upiId?: string): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      const [balance] = await tx.select().from(balances).where(eq(balances.userId, userId));
      if (!balance || balance.amount < amount) {
        throw new Error("Insufficient funds");
      }
      await tx.update(balances).set({ amount: balance.amount - amount, updatedAt: new Date() }).where(eq(balances.id, balance.id));
      
      const [transaction] = await tx.insert(transactions).values({
        type: 'withdrawal',
        amount,
        fromUserId: userId,
        status: 'completed',
        externalApp: upiId ? 'upi' : undefined,
        description: upiId ? `Withdrawal to UPI: ${upiId}` : 'Withdrawal to external account'
      }).returning();
      return transaction;
    });
  }

  async transfer(fromUserId: string, toUserId: string, amount: number, description?: string): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      const [fromBalance] = await tx.select().from(balances).where(eq(balances.userId, fromUserId));
      if (!fromBalance || fromBalance.amount < amount) {
        throw new Error("Insufficient funds");
      }
      
      let [toBalance] = await tx.select().from(balances).where(eq(balances.userId, toUserId));
      if (!toBalance) {
        [toBalance] = await tx.insert(balances).values({ userId: toUserId, amount: 0 }).returning();
      }
      
      await tx.update(balances).set({ amount: fromBalance.amount - amount, updatedAt: new Date() }).where(eq(balances.id, fromBalance.id));
      await tx.update(balances).set({ amount: toBalance.amount + amount, updatedAt: new Date() }).where(eq(balances.id, toBalance.id));
      
      const [transaction] = await tx.insert(transactions).values({
        type: 'transfer',
        amount,
        fromUserId,
        toUserId,
        status: 'completed',
        description: description || 'Peer to peer transfer'
      }).returning();
      
      return transaction;
    });
  }
  
  async searchUsers(query: string | undefined, currentUserId: string): Promise<any[]> {
    let conditions: any[] = [not(eq(users.id, currentUserId))];
    
    if (query) {
       conditions.push(or(
         ilike(users.email, `%${query}%`),
         ilike(users.firstName, `%${query}%`),
         ilike(users.lastName, `%${query}%`)
       ));
    }
    
    return await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      profileImageUrl: users.profileImageUrl
    }).from(users).where(and(...conditions)).limit(20);
  }
}

export const storage = new DatabaseStorage();
