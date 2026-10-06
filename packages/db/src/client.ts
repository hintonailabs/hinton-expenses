import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Copy .env.example to .env and paste your Neon connection string.");
}

export const db = drizzle(process.env.DATABASE_URL);
export type Db = typeof db;
