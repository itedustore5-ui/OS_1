import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Korisničko ime i lozinka su obavezni" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user || !user.active) {
    res.status(401).json({ error: "Pogrešno korisničko ime ili lozinka" });
    return;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Pogrešno korisničko ime ili lozinka" });
    return;
  }
  const token = signToken({ id: user.id, username: user.username, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      neverExpires: user.neverExpires,
    }
  });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const payload = (req as any).user;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
  if (!user || !user.active) {
    res.status(401).json({ error: "Korisnik nije pronađen" });
    return;
  }
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    neverExpires: user.neverExpires,
  });
});

export default router;
