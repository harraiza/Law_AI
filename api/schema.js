const { z } = require('zod');

const chatRequestSchema = z.object({
  question: z.string().min(1),
  language: z.enum(["en", "ur"]).default("en"),
});

// This is just for type hinting, not used at runtime
// type LegalResponse = { ... };

module.exports = { chatRequestSchema }; 