import { Router } from "express";
import { db } from "@workspace/db";
import { resultsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import { nanoid } from "../lib/nanoid.js";

const router = Router();

router.get("/results/scoreboard", requireAuth, async (_req, res) => {
  const results = await db.select().from(resultsTable).orderBy(desc(resultsTable.percentage), desc(resultsTable.score));
  res.json(results);
});

router.get("/results", requireAdmin, async (_req, res) => {
  const results = await db.select().from(resultsTable).orderBy(desc(resultsTable.completedAt));
  res.json(results);
});

router.post("/results", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { score, totalQuestions, percentage, timeSpent, answers, displayName } = req.body;
  const [result] = await db.insert(resultsTable).values({
    id: `result-${nanoid()}`,
    userId: user.id,
    username: user.username,
    displayName: displayName || user.username,
    score,
    totalQuestions,
    percentage,
    timeSpent,
    answers,
  }).returning();
  res.status(201).json(result);
});

router.delete("/results/:id", requireAdmin, async (req, res) => {
  await db.delete(resultsTable).where(eq(resultsTable.id, req.params.id));
  res.json({ success: true });
});

router.delete("/results", requireAdmin, async (_req, res) => {
  await db.delete(resultsTable);
  res.json({ success: true });
});

export default router;
