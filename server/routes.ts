import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.balances.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    let balance = await storage.getBalance(userId);
    if (!balance) {
      balance = await storage.createBalance(userId);
    }
    res.json({ amount: balance.amount });
  });

  app.get(api.transactions.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const transactions = await storage.getTransactions(userId);
    res.json(transactions);
  });

  app.post(api.transactions.deposit.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.transactions.deposit.input.parse(req.body);
      const userId = req.user.claims.sub;
      const transaction = await storage.deposit(userId, input.amount, input.externalApp, input.upiId);
      res.json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.post(api.transactions.withdraw.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.transactions.withdraw.input.parse(req.body);
      const userId = req.user.claims.sub;
      const transaction = await storage.withdraw(userId, input.amount, input.upiId);
      res.json(transaction);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: err.message });
    }
  });

  app.post(api.transactions.transfer.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.transactions.transfer.input.parse(req.body);
      const userId = req.user.claims.sub;
      const transaction = await storage.transfer(userId, input.toUserId, input.amount, input.description);
      res.json(transaction);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: err.message });
    }
  });

  app.get(api.users.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const search = req.query.search as string;
      const users = await storage.searchUsers(search, req.user.claims.sub);
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Internal Error" });
    }
  });

  return httpServer;
}
