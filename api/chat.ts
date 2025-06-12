console.log('--- /api/chat invoked ---');
import Groq from 'groq-sdk';
import { chatRequestSchema } from './schema.js';
import { getFallbackResponse } from './fallbackData.js';

const groq = new Groq({
  apiKey: "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"
});

export default async function handler(req: any, res: any) {
  console.log('Handler called', { method: req.method, env: process.env.GROQ_API_KEY ? 'API key present' : 'API key missing' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let result;
  try {
    result = chatRequestSchema.safeParse(req.body);
  } catch (e) {
    console.error('Schema parse error:', e);
    return res.status(500).json({ error: 'Schema parse error', details: String(e) });
  }
  if (!result || !result.success) {
    console.error('Invalid request body', req.body);
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { question, language } = result.data;

  try {
    if (!process.env.GROQ_API_KEY) {
      const fallback = getFallbackResponse(question);
      if (fallback) return res.json(fallback);
      return res.status(503).json({ error: 'No API key and no fallback available' });
    }

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a Pakistani legal expert AI. Provide accurate legal information in JSON format.'
        },
        {
          role: 'user',
          content: `Analyze this legal question: "${question}" and provide a JSON response with:\n- definition: Brief definition (${language === 'ur' ? 'in Urdu and English' : 'in English'})\n- explanation: Clear explanation\n- constitutionalArticles: Key relevant articles\n- recommendedLawyers: 1-2 relevant lawyers`
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    });
    console.log('Groq response:', response);
    const resultJson = JSON.parse(response.choices[0].message.content || '{}');
    const legalResponse = {
      definition: resultJson.definition || 'Legal definition not available',
      explanation: resultJson.explanation || 'Legal explanation not available',
      constitutionalArticles: resultJson.constitutionalArticles || [],
      supremeCourtCases: resultJson.supremeCourtCases || [],
      recommendedLawyers: resultJson.recommendedLawyers || [],
      followUpQuestions: resultJson.followUpQuestions || [],
      usedFallback: false
    };
    return res.json(legalResponse);
  } catch (error) {
    console.error('Error getting AI response:', error);
    const fallback = getFallbackResponse ? getFallbackResponse(question) : null;
    if (fallback) return res.json(fallback);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
} 