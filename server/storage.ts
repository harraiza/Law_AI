import { users, chatMessages, lawyers, type DbUser, type InsertUser, type ChatMessage, type InsertChatMessage, type Lawyer, type InsertLawyer, type ChatRequest, type LegalResponse } from "../shared/schema.js";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import OpenAI from "openai";
import { getFallbackResponse } from "../client/src/lib/fallbackData.js";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "fallback-key"
});

export interface IStorage {
  getUser(id: number): Promise<DbUser | undefined>;
  getUserByUsername(username: string): Promise<DbUser | undefined>;
  createUser(user: InsertUser): Promise<DbUser>;
  
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(limit?: number): Promise<ChatMessage[]>;
  
  getLawyers(): Promise<Lawyer[]>;
  getLawyersBySpecialization(specialization: string): Promise<Lawyer[]>;
  createLawyer(lawyer: InsertLawyer): Promise<Lawyer>;
  
  handleChat(data: ChatRequest): Promise<LegalResponse>;
}

export class MemStorage implements IStorage {
  private users: Map<number, DbUser>;
  private chatMessages: Map<number, ChatMessage>;
  private lawyers: Map<number, Lawyer>;
  private currentUserId: number;
  private currentChatId: number;
  private currentLawyerId: number;

  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.lawyers = new Map();
    this.currentUserId = 1;
    this.currentChatId = 1;
    this.currentLawyerId = 1;
    
    // Seed with some lawyers
    this.seedLawyers();
  }

  private seedLawyers() {
    const lawyersData = [
      { name: "Ahmed Ali Khan", specialization: "Criminal Law", region: "Lahore", contact: "+92-300-1234567", experience: 15 },
      { name: "Fatima Sheikh", specialization: "Constitutional Law", region: "Karachi", contact: "+92-321-7654321", experience: 12 },
      { name: "Dr. Yasmeen Hassan", specialization: "Family Law", region: "Islamabad", contact: "+92-345-9876543", experience: 18 },
      { name: "Barrister Ali Zafar", specialization: "Women's Rights", region: "Lahore", contact: "+92-333-1111222", experience: 20 },
      { name: "Advocate Nighat Dad", specialization: "Cyber Law", region: "Lahore", contact: "+92-300-3333444", experience: 10 },
      { name: "Barrister Salman Safdar", specialization: "Digital Rights", region: "Karachi", contact: "+92-321-5555666", experience: 8 },
      { name: "Justice (R) Nasira Javed Iqbal", specialization: "Women's Rights", region: "Islamabad", contact: "+92-345-7777888", experience: 25 },
      { name: "Advocate Hina Jilani", specialization: "Human Rights", region: "Lahore", contact: "+92-300-9999000", experience: 30 }
    ];

    lawyersData.forEach(lawyer => {
      const id = this.currentLawyerId++;
      const lawyerRecord: Lawyer = { ...lawyer, id };
      this.lawyers.set(id, lawyerRecord);
    });
  }

  async getUser(id: number): Promise<DbUser | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<DbUser | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<DbUser> {
    const id = this.currentUserId++;
    const user: DbUser = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = { 
      ...insertMessage,
      id,
      createdAt: new Date(),
      language: insertMessage.language || "en",
      usedFallback: insertMessage.usedFallback || false,
      responseTime: insertMessage.responseTime || 0
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatHistory(limit: number = 50): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values());
    return messages
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getLawyers(): Promise<Lawyer[]> {
    return Array.from(this.lawyers.values());
  }

  async getLawyersBySpecialization(specialization: string): Promise<Lawyer[]> {
    return Array.from(this.lawyers.values()).filter(
      lawyer => lawyer.specialization.toLowerCase().includes(specialization.toLowerCase())
    );
  }

  async createLawyer(insertLawyer: InsertLawyer): Promise<Lawyer> {
    const id = this.currentLawyerId++;
    const lawyer: Lawyer = { ...insertLawyer, id };
    this.lawyers.set(id, lawyer);
    return lawyer;
  }

  async handleChat(data: ChatRequest): Promise<LegalResponse> {
    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "fallback-key") {
        console.log("Using fallback response due to missing API key");
        return getFallbackResponse(data.question) || this.getDefaultFallbackResponse();
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a Pakistani legal expert AI. Provide accurate legal information in JSON format."
          },
          {
            role: "user",
            content: `Analyze this legal question: "${data.question}" and provide a JSON response with:
- definition: Brief definition (${data.language === 'ur' ? 'in Urdu and English' : 'in English'})
- explanation: Clear explanation
- constitutionalArticles: Key relevant articles
- recommendedLawyers: 1-2 relevant lawyers`
          }
        ],
        response_format: { type: "json_object" },
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
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Use fallback data if available
      const fallback = getFallbackResponse(data.question);
      if (fallback) {
        console.log("Using specific fallback response for question");
        return fallback;
      }
      console.log("Using default fallback response");
      return this.getDefaultFallbackResponse();
    }
  }

  private getDefaultFallbackResponse(): LegalResponse {
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
}

export const storage = new MemStorage();
