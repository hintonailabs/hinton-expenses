import { Hono } from "hono";
import { budgetInputSchema } from "@hinton/shared";
import { AppError, parseBody } from "../errors";
import type { AppEnv } from "../middleware";
import * as reference from "../repositories/referenceRepository";
import * as dashboard from "../services/dashboardService";

export const referenceRoutes = new Hono<AppEnv>()
  .get("/accounts", async (c) => c.json(await reference.listAccountsWithBalance(c.get("userId"))))
  .get("/categories", async (c) => c.json(await reference.listCategories(c.get("userId"))))
  .get("/budgets", async (c) => c.json(await dashboard.getBudgets(c.get("userId"))))
  .put("/budgets/:categoryId", async (c) => {
    const userId = c.get("userId");
    const categoryId = c.req.param("categoryId");
    if (!(await reference.ownsCategory(userId, categoryId))) throw new AppError(404, "not_found", "Category not found");
    const { monthlyLimit } = await parseBody(c, budgetInputSchema);
    await reference.saveBudget(userId, categoryId, monthlyLimit);
    return c.json(await dashboard.getBudgets(userId));
  })
  .get("/dashboard", async (c) => c.json(await dashboard.getDashboard(c.get("userId"))));
