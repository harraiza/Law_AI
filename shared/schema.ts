import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  response: text("response").notNull(),
  language: text("language").notNull().default("en"), // 'en' or 'ur'
  usedFallback: boolean("used_fallback").notNull().default(false),
  responseTime: integer("response_time").notNull(), // in milliseconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lawyers = pgTable("lawyers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  region: text("region").notNull(),
  contact: text("contact").notNull(),
  experience: integer("experience").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  question: true,
  response: true,
  language: true,
  usedFallback: true,
  responseTime: true,
});

export const insertLawyerSchema = createInsertSchema(lawyers).pick({
  name: true,
  specialization: true,
  region: true,
  contact: true,
  experience: true,
});

export const chatRequestSchema = z.object({
  question: z.string().min(1),
  language: z.enum(["en", "ur"]).default("en"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type DbUser = typeof users.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertLawyer = z.infer<typeof insertLawyerSchema>;
export type Lawyer = typeof lawyers.$inferSelect;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export interface LegalResponse {
  definition: string;
  explanation: string;
  constitutionalArticles: Array<{
    article: string;
    title: string;
    summary: string;
  }>;
  supremeCourtCases: Array<{
    title: string;
    summary: string;
  }>;
  recommendedLawyers: Array<{
    name: string;
    area: string;
    region: string;
  }>;
  followUpQuestions: string[];
  usedFallback: boolean;
}

// Define your shared schemas here
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type UserProfile = z.infer<typeof userSchema>;

// Add other schemas as needed
