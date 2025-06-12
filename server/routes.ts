import { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage.js";
import { chatRequestSchema, type LegalResponse } from "../shared/schema.js";
import Groq from "groq-sdk";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || process.env.GROQ_KEY || "fallback-key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req, res) => {
    const result = chatRequestSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    try {
      const response = await storage.handleChat(result.data);
      await storage.createChatMessage({
        question: result.data.question,
        response: JSON.stringify(response),
        language: result.data.language,
        usedFallback: false,
        responseTime: 0
      });
      res.json(response);
    } catch (error) {
      console.error("Error handling chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        const result = chatRequestSchema.safeParse(data);
        if (!result.success) {
          ws.send(JSON.stringify({ error: "Invalid message format" }));
          return;
        }

        const response = await storage.handleChat(result.data);
        await storage.createChatMessage({
          question: result.data.question,
          response: JSON.stringify(response),
          language: result.data.language,
          usedFallback: false,
          responseTime: 0
        });
        ws.send(JSON.stringify({ response }));
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
        ws.send(JSON.stringify({ error: "Internal server error" }));
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
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

  return httpServer;
}

async function getLegalResponseFromAI(question: string, language: string): Promise<LegalResponse> {
  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: "You are a Pakistani legal expert AI. Provide accurate legal information in JSON format."
      },
      {
        role: "user",
        content: `Analyze this legal question: \"${question}\" and provide a JSON response with:\n- definition: Brief definition (${language === 'ur' ? 'in Urdu and English' : 'in English'})\n- explanation: Clear explanation\n- constitutionalArticles: Key relevant articles\n- recommendedLawyers: 1-2 relevant lawyers`
      }
    ],
    max_tokens: 800,
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
