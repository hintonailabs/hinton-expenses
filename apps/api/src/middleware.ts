import { createMiddleware } from "hono/factory";
import { auth } from "./auth";
import { AppError } from "./errors";

export type AppEnv = { Variables: { userId: string; userEmail: string; userName: string } };

/** Every route after this one knows who is logged in via `c.get("userId")`. */
export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) throw new AppError(401, "unauthorized", "Please sign in");
  c.set("userId", session.user.id);
  c.set("userEmail", session.user.email);
  c.set("userName", session.user.name);
  await next();
});
