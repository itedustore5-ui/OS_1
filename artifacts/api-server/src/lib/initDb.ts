import { db, pool } from "@workspace/db";
import { usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      never_expires BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      display_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      display_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      percentage INTEGER NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      time_spent INTEGER NOT NULL,
      answers JSONB NOT NULL
    );
  `);

  const existing = await db.select().from(usersTable);
  if (existing.length === 0) {
    const adminHash = await bcrypt.hash("Admin2024!", 10);
    const studentHash = await bcrypt.hash("kviz2024", 10);
    await db.insert(usersTable).values([
      {
        id: "admin-001",
        username: "admin",
        password: adminHash,
        role: "admin",
        neverExpires: true,
        active: true,
        displayName: "Administrator",
      },
      {
        id: "student-001",
        username: "student1",
        password: studentHash,
        role: "student",
        neverExpires: false,
        active: true,
        displayName: "Student 1",
      },
    ]);
  }
}
