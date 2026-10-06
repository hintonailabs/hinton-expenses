import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, db, session, user, verification } from "@hinton/db";

// The browser talks to the Vite dev server (5173), which forwards /api to this server.
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

export const auth = betterAuth({
  baseURL: webOrigin,
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-change-me-please-32chars",
  trustedOrigins: [webOrigin],
  database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
});
