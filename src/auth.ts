import type { NextFunction, Request, Response } from "express";

import { config } from "./config.js";

export function requireBearerToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;

  if (!token || token !== config.memoryMcpToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
