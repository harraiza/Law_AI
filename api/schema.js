import { z } from 'zod';

export const chatRequestSchema = z.object({
  question: z.string().min(1),
  language: z.enum(["en", "ur"]).default("en"),
});

// This is just for type hinting, not used at runtime
// type LegalResponse = { ... }; 