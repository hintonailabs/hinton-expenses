import { defineConfig } from "drizzle-kit";

// drizzle-kit runs inside packages/db, so load the .env from the repo root ourselves.
process.loadEnvFile(new URL("../../.env", import.meta.url));

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
