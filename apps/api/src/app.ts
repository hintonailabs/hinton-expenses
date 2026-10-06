import { Hono } from "hono";
import { logger } from "hono/logger";
import { db, ensureSeeded } from "@hinton/db";
import type { Me } from "@hinton/shared";
import { auth } from "./auth";
import { errorHandler } from "./errors";
import { requireUser, type AppEnv } from "./middleware";
import { importRoutes } from "./routes/import";
import { referenceRoutes } from "./routes/reference";
import { transactionRoutes } from "./routes/transactions";

export const app = new Hono<AppEnv>();

app.use(logger());
app.onError(errorHandler);

// Sign up / sign in / sign out are handled by Better Auth.
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use("/api/*", requireUser);

// The web app calls this right after sign-in. New users get the sample data here.
app.get("/api/me", async (c) => {
  await ensureSeeded(db, c.get("userId"));
  const me: Me = { id: c.get("userId"), email: c.get("userEmail"), name: c.get("userName") };
  return c.json(me);
});

app.route("/api/transactions", transactionRoutes);
app.route("/api/import", importRoutes);
app.route("/api", referenceRoutes);
