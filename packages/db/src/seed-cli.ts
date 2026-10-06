import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "./client";
import { account, user } from "./schema";
import { ensureSeeded } from "./seed";

// `pnpm db:seed` creates a demo login with sample data. You can also just sign up in the app.
const DEMO_EMAIL = "demo@hinton.test";
const DEMO_PASSWORD = "demo-password-123";

const [existing] = await db.select().from(user).where(eq(user.email, DEMO_EMAIL));
let userId = existing?.id;

if (!userId) {
  userId = randomUUID();
  await db.insert(user).values({ id: userId, name: "Demo User", email: DEMO_EMAIL, emailVerified: true });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: await hashPassword(DEMO_PASSWORD),
  });
}

await ensureSeeded(db, userId);
console.log(`Demo user ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
