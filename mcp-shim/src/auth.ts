// src/auth.ts
import type { Request, Response, NextFunction } from "express";

/**
 * Bearer token authentication middleware
 */
export function auth(required = true) {
  const TOKEN = process.env.MCP_AUTH_TOKEN;

  return (req: Request, res: Response, next: NextFunction) => {
    if (!required || !TOKEN) return next();

    const ok = (req.headers.authorization || "") === `Bearer ${TOKEN}`;
    if (ok) return next();

    res.status(401).json({ error: "Unauthorized" });
  };
}