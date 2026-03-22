import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { users } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await authStorage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, { claims: { sub: user.id } });
      } catch (err) {
        return done(err);
      }
    })
  );

  app.post("/api/login/local", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      req.logIn(user, { session: true }, (err) => {
        if (err) return next(err);
        req.session?.save((saveErr) => {
          if (saveErr) return next(saveErr);
          res.json({ success: true });
        });
      });
    })(req, res, next);
  });

  app.post("/api/register", async (req, res) => {
    const { username, password, firstName, lastName } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const existing = await authStorage.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const user = await authStorage.createUser({
      username,
      password,
      firstName,
      lastName,
    });
    req.logIn({ claims: { sub: user.id } }, { session: true }, (err) => {
      if (err) return res.status(500).json({ message: "Error logging in" });
      req.session?.save((saveErr) => {
        if (saveErr) return res.status(500).json({ message: "Error logging in" });
        res.json({ success: true });
      });
    });
  });

  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
