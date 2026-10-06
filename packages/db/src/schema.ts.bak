import { sql } from "drizzle-orm";
import { boolean, check, date, index, numeric, pgEnum, pgTableCreator, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

// snake_case: the `openingBalance` property is stored in the `opening_balance` column.
const pgTable = pgTableCreator((name) => name, "snake_case");

// ---------- Better Auth tables (login + sessions) ----------
// Better Auth expects these four tables. Don't rename the columns.

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text().primaryKey(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  ipAddress: text(),
  userAgent: text(),
  userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
});

// Login credentials (not a bank account!). Bank accounts are in `bankAccounts` below.
export const account = pgTable("account", {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// ---------- App tables ----------
// Every table has a user_id: each person only ever sees their own rows.

export const transactionType = pgEnum("transaction_type", ["income", "expense"]);
export const paymentMethod = pgEnum("payment_method", ["upi", "card", "cash"]);

// Money columns are numeric(12,2). `mode: "number"` makes Drizzle hand us JS numbers
// instead of strings like "450.00", so we convert once, here, and nowhere else.
const money = () => numeric({ precision: 12, scale: 2, mode: "number" });

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text().notNull(),
  openingBalance: money().notNull().default(0),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    type: transactionType().notNull(),
  },
  (t) => [unique().on(t.userId, t.name)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    accountId: uuid().notNull().references(() => bankAccounts.id, { onDelete: "restrict" }),
    categoryId: uuid().notNull().references(() => categories.id, { onDelete: "restrict" }),
    date: date({ mode: "string" }).notNull(),
    title: text().notNull(),
    // Always positive. `type` says whether it is money in or money out.
    amount: money().notNull(),
    type: transactionType().notNull(),
    paymentMethod: paymentMethod().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [check("amount_positive", sql`${t.amount} > 0`), index().on(t.userId, t.date)],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid().notNull().references(() => categories.id, { onDelete: "cascade" }),
    monthlyLimit: money().notNull(),
  },
  (t) => [unique().on(t.userId, t.categoryId), check("limit_positive", sql`${t.monthlyLimit} > 0`)],
);
