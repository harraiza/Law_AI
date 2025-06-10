import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatRequestSchema } from "@shared/schema";
import type { LegalResponse } from "@shared/schema";
import { getFallbackResponse } from "../client/src/lib/fallbackData";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "fallback-key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoint for legal queries
  app.post("/api/chat", async (req, res) => {
    try {
      const startTime = Date.now();
      const { question, language } = chatRequestSchema.parse(req.body);
      
      let response: LegalResponse;
      let usedFallback = false;

      try {
        // Try OpenAI first
        response = await getLegalResponseFromAI(question, language);
      } catch (error) {
        console.error("OpenAI failed, using fallback:", error);
        // Fall back to preloaded data
        response = getFallbackResponse(question) || getDefaultFallbackResponse();
        usedFallback = true;
      }

      const responseTime = Date.now() - startTime;

      // Store chat message
      await storage.createChatMessage({
        question,
        response: JSON.stringify(response),
        language,
        usedFallback,
        responseTime
      });

      response.usedFallback = usedFallback;
      res.json(response);

    } catch (error) {
      console.error("Chat endpoint error:", error);
      res.status(500).json({ error: "Failed to process legal query" });
    }
  });

  // Get lawyers endpoint
  app.get("/api/lawyers", async (req, res) => {
    try {
      const { specialization } = req.query;
      
      const lawyers = specialization 
        ? await storage.getLawyersBySpecialization(specialization as string)
        : await storage.getLawyers();
        
      res.json(lawyers);
    } catch (error) {
      console.error("Lawyers endpoint error:", error);
      res.status(500).json({ error: "Failed to get lawyers" });
    }
  });

  // Get chat history endpoint
  app.get("/api/chat/history", async (req, res) => {
    try {
      const { limit } = req.query;
      const history = await storage.getChatHistory(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(history);
    } catch (error) {
      console.error("Chat history endpoint error:", error);
      res.status(500).json({ error: "Failed to get chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function getLegalResponseFromAI(question: string, language: string): Promise<LegalResponse> {
  const prompt = `You are the LegalConnect AI chatbot, built for Pakistani users to understand the law in plain terms. 

Analyze this legal question: "${question}"

Respond with a JSON object containing:
- definition: Brief definition of the legal topic in ${language === 'ur' ? 'Urdu and English' : 'English'}
- explanation: Clear explanation of the user's question in plain terms
- constitutionalArticles: Array of relevant Pakistani constitutional articles with article number, title, and summary
- supremeCourtCases: Array of relevant Supreme Court cases with title and summary
- recommendedLawyers: Array of 2-3 lawyers with name, area of specialization, and region
- followUpQuestions: Array of 3 related questions the user might ask

Focus on Pakistani law only. Be accurate and cite real constitutional articles when possible.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a Pakistani legal expert AI. Provide accurate legal information based on Pakistani Constitution, laws, and Supreme Court cases. Always respond in the requested JSON format."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 1500,
    temperature: 0.3
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  
  return {
    definition: result.definition || "Legal definition not available",
    explanation: result.explanation || "Legal explanation not available", 
    constitutionalArticles: result.constitutionalArticles || [],
    supremeCourtCases: result.supremeCourtCases || [],
    recommendedLawyers: result.recommendedLawyers || [],
    followUpQuestions: result.followUpQuestions || [],
    usedFallback: false
  };
}

function getDefaultFallbackResponse(): LegalResponse {
  return {
    definition: "This appears to be a legal question about Pakistani law.",
    explanation: "Our AI assistant can help explain Pakistani legal matters in simple terms. Please try rephrasing your question or contact a legal professional for specific advice.",
    constitutionalArticles: [
      {
        article: "4",
        title: "Right of individuals to be dealt with in accordance with law",
        summary: "No action detrimental to the life, liberty, body, reputation or property of any person shall be taken except in accordance with law."
      }
    ],
    supremeCourtCases: [
      {
        title: "General Legal Principles",
        summary: "Pakistani courts follow established legal precedents and constitutional principles in all matters."
      }
    ],
    recommendedLawyers: [
      {
        name: "Legal Consultation Service",
        area: "General Legal Advice", 
        region: "All Major Cities"
      }
    ],
    followUpQuestions: [
      "Can you be more specific about your legal issue?",
      "What type of legal matter do you need help with?",
      "Do you need information about a specific Pakistani law?"
    ],
    usedFallback: true
  };
}
