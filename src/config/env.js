import "dotenv/config";

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "0.0.0.0",
  port: parsePositiveInteger(process.env.PORT, 3000),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  rateLimitMax: parsePositiveInteger(process.env.RATE_LIMIT_MAX, 30),
  rateLimitTimeWindow: process.env.RATE_LIMIT_TIME_WINDOW ?? "1 minute",
  downloadTimeoutMs: parsePositiveInteger(
    process.env.DOWNLOAD_TIMEOUT_MS,
    300000,
  ),
};
