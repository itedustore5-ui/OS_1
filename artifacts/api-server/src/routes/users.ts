import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";
import { nanoid } from "../lib/nanoid.js";

const router = Router();

router.get("/users", requireAdmin, async (_req, res) => {
  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    role: usersTable.role,
    neverExpires: usersTable.neverExpires,
    createdAt: usersTable.createdAt,
    active: usersTable.active,
    displayName: usersTable.displayName,
  }).from(usersTable);
  res.json(users);
});

router.post("/users", requireAdmin, async (req, res) => {
  const { username, password, role, neverExpires, displayName, active } = req.body;
  if (!username || !password || !displayName) {
    res.status(400).json({ error: "Obavezna polja nedostaju" });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    id: `user-${nanoid()}`,
    username,
    password: hashed,
    role: role || "student",
    neverExpires: neverExpires ?? false,
    displayName,
    active: active ?? true,
  }).returning({
    id: usersTable.id,
    username: usersTable.username,
    role: usersTable.role,
    neverExpires: usersTable.neverExpires,
    createdAt: usersTable.createdAt,
    active: usersTable.active,
    displayName: usersTable.displayName,
  });
  res.status(201).json(user);
});

router.put("/users/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { password, role, neverExpires, displayName, active } = req.body;
  const updates: Record<string, unknown> = {};
  if (password) updates.password = await bcrypt.hash(password, 10);
  if (role !== undefined) updates.role = role;
  if (neverExpires !== undefined) updates.neverExpires = neverExpires;
  if (displayName !== undefined) updates.displayName = displayName;
  if (active !== undefined) updates.active = active;
  await db.update(usersTable).set(updates).where(eq(usersTable.id, id));
  res.json({ success: true });
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ success: true });
});

export default router;
