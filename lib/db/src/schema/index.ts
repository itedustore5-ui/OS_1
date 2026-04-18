import { pgTable, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  neverExpires: boolean("never_expires").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
  displayName: text("display_name").notNull(),
});

export const resultsTable = pgTable("results", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  percentage: integer("percentage").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  timeSpent: integer("time_spent").notNull(),
  answers: jsonb("answers").notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true });
export const insertResultSchema = createInsertSchema(resultsTable).omit({ completedAt: true });

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Result = typeof resultsTable.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
