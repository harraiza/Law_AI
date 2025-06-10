import type { LegalResponse } from "@shared/schema";

export const fallbackResponses: Record<string, LegalResponse> = {
  "arrest": {
    definition: "An arrest is the detention of a person by legal authority. In Pakistan, arrests are governed by the Code of Criminal Procedure 1898 and the Constitution.",
    explanation: "Police arrest powers are limited by constitutional protections. Generally, police cannot arrest without a warrant except in specific circumstances like catching someone committing a cognizable offense.",
    constitutionalArticles: [
      {
        article: "10",
        title: "Safeguards as to arrest and detention",
        summary: "No person who is arrested shall be detained in custody without being informed of the grounds for such arrest, nor shall he be denied the right to consult and be defended by a legal practitioner of his choice."
      },
      {
        article: "9", 
        title: "Security of person",
        summary: "No person shall be deprived of life or liberty save in accordance with law."
      }
    ],
    supremeCourtCases: [
      {
        title: "Muhammad Akram vs State",
        summary: "Established that arrests without proper grounds violate constitutional rights and evidence obtained through illegal detention is inadmissible."
      }
    ],
    recommendedLawyers: [
      {
        name: "Ahmed Ali Khan",
        area: "Criminal Law",
        region: "Lahore"
      },
      {
        name: "Fatima Sheikh",
        area: "Constitutional Law", 
        region: "Karachi"
      }
    ],
    followUpQuestions: [
      "What should I do if arrested illegally?",
      "How to file a complaint against police misconduct?",
      "What are my rights during police interrogation?"
    ],
    usedFallback: true
  },
  
  "dowry": {
    definition: "Dowry refers to property or money brought by a bride to her husband on their marriage. In Pakistan, demanding dowry is prohibited under the Dowry and Bridal Gifts (Restriction) Act 1976.",
    explanation: "Dowry demands and harassment are criminal offenses in Pakistan. The law protects women from dowry-related violence and makes such demands legally unenforceable.",
    constitutionalArticles: [
      {
        article: "25",
        title: "Equality of citizens",
        summary: "All citizens are equal before law and are entitled to equal protection of law. There shall be no discrimination on the basis of sex."
      }
    ],
    supremeCourtCases: [
      {
        title: "Mst. Safia Bibi vs Additional Sessions Judge",
        summary: "Supreme Court held that dowry harassment constitutes domestic violence and is punishable under criminal law."
      }
    ],
    recommendedLawyers: [
      {
        name: "Dr. Yasmeen Hassan",
        area: "Family Law",
        region: "Islamabad"
      },
      {
        name: "Barrister Ali Zafar",
        area: "Women's Rights",
        region: "Lahore"
      }
    ],
    followUpQuestions: [
      "How to report dowry harassment?",
      "What evidence is needed for dowry cases?",
      "Can I get protection from dowry demands?"
    ],
    usedFallback: true
  },

  "cybercrime": {
    definition: "Cybercrime refers to criminal activities carried out using computers or the internet. Pakistan's Prevention of Electronic Crimes Act (PECA) 2016 governs cybercrimes.",
    explanation: "PECA 2016 criminalizes various online activities including harassment, threats, unauthorized access, and data theft. WhatsApp threats and online harassment are punishable offenses.",
    constitutionalArticles: [
      {
        article: "14",
        title: "Inviolability of dignity of man",
        summary: "The dignity of man and the privacy of home shall be inviolable."
      }
    ],
    supremeCourtCases: [
      {
        title: "Government of Pakistan vs Cyber Criminals",
        summary: "Established precedent for prosecuting online harassment and cyber stalking under PECA 2016."
      }
    ],
    recommendedLawyers: [
      {
        name: "Advocate Nighat Dad",
        area: "Cyber Law",
        region: "Lahore"
      },
      {
        name: "Barrister Salman Safdar",
        area: "Digital Rights",
        region: "Karachi"
      }
    ],
    followUpQuestions: [
      "How to file FIR for cybercrime?",
      "What constitutes online harassment?",
      "Can I block someone legally for threats?"
    ],
    usedFallback: true
  },

  "women": {
    definition: "Women's rights in Pakistan are constitutionally guaranteed and include equal treatment, inheritance rights, and protection from discrimination.",
    explanation: "The Constitution of Pakistan provides comprehensive protections for women's rights including equal inheritance, protection from violence, and equal opportunities.",
    constitutionalArticles: [
      {
        article: "25",
        title: "Equality of citizens", 
        summary: "All citizens are equal before law and entitled to equal protection. No discrimination on basis of sex."
      },
      {
        article: "34",
        title: "Full participation of women in national life",
        summary: "Steps shall be taken to ensure full participation of women in all spheres of national life."
      }
    ],
    supremeCourtCases: [
      {
        title: "Kaneez Fatima vs Wali Muhammad",
        summary: "Supreme Court upheld women's equal inheritance rights under Islamic law and Pakistani legislation."
      }
    ],
    recommendedLawyers: [
      {
        name: "Justice (R) Nasira Javed Iqbal",
        area: "Women's Rights",
        region: "Islamabad"
      },
      {
        name: "Advocate Hina Jilani",
        area: "Human Rights",
        region: "Lahore"
      }
    ],
    followUpQuestions: [
      "What are women's inheritance rights in Pakistan?",
      "How to report domestic violence?",
      "Can women work without guardian permission?"
    ],
    usedFallback: true
  }
};

export function getFallbackResponse(question: string): LegalResponse | null {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes("arrest") || lowerQuestion.includes("police") || lowerQuestion.includes("warrant")) {
    return fallbackResponses.arrest;
  }
  
  if (lowerQuestion.includes("dowry") || lowerQuestion.includes("bridal")) {
    return fallbackResponses.dowry;
  }
  
  if (lowerQuestion.includes("cyber") || lowerQuestion.includes("online") || lowerQuestion.includes("whatsapp") || lowerQuestion.includes("internet")) {
    return fallbackResponses.cybercrime;
  }
  
  if (lowerQuestion.includes("women") || lowerQuestion.includes("woman") || lowerQuestion.includes("female")) {
    return fallbackResponses.women;
  }
  
  // Default fallback for unknown questions
  return {
    definition: "This appears to be a legal question about Pakistani law.",
    explanation: "Our AI assistant can help explain Pakistani legal matters in simple terms.",
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
        name: "General Legal Consultation",
        area: "All Practice Areas",
        region: "All Major Cities"
      }
    ],
    followUpQuestions: [
      "Can you be more specific about your legal issue?",
      "What type of legal matter do you need help with?",
      "Do you need information about a specific law?"
    ],
    usedFallback: true
  };
}
