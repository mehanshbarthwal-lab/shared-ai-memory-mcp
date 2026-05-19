import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";

function getBearerToken(req: Request): string | undefined {
  const header = req.header("authorization");
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;
}

function getQueryToken(req: Request): string | undefined {
  const token = req.query.mcp_token;
  return typeof token === "string" ? token.trim() : undefined;
}

function getPathToken(req: Request): string | undefined {
  const token = req.params.mcp_token;
  return typeof token === "string" ? token.trim() : undefined;
}

function isValidToken(token: string | undefined): boolean {
  return Boolean(token && token === config.memoryMcpToken);
}

export function requireBearerToken(req: Request, res: Response, next: NextFunction): void {
  const token = getBearerToken(req);

  if (!isValidToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

export function requireMcpToken(req: Request, res: Response, next: NextFunction): void {
  const token = getBearerToken(req) ?? getQueryToken(req) ?? getPathToken(req);

  if (!isValidToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
