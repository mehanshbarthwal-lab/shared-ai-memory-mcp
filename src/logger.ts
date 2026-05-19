import { config } from "./config.js";

const levels = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
} as const;

type LogLevel = keyof typeof levels;

function shouldLog(level: LogLevel): boolean {
  return levels[level] >= levels[config.logLevel];
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry = {
    level,
    message,
    ...meta,
    time: new Date().toISOString()
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta)
};
