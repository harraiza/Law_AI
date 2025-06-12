const fallbackResponses = {
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
  // ... (other responses: dowry, cybercrime, women)
};

function getFallbackResponse(question) {
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

module.exports = { getFallbackResponse }; 