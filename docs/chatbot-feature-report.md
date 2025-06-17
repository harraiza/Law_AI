# LegalConnectAI – Chatbot Feature Report

## 📌 Project Summary
LegalConnectAI is a legal assistant web app that answers user queries using AI + legal document context. The chatbot helps users explore Pakistan's Constitution and Supreme Court case law in plain language, with relevant references.

## 🤖 Chatbot Feature: Overview
### Core Purpose:
To understand and answer legal queries using AI that is deeply grounded in:
- The Constitution of Pakistan
- Supreme Court Judgements
- Relevant legal articles, citations, and summaries

## 🔁 How It Works – Behind the Scenes
1. **User Input**: Query is submitted via the chatbot UI.
2. **Prompt Formatting**: The query is formatted into a structured prompt before being sent to the Groq API. This includes:
   - Instructions for generating a JSON response.
   - Guidelines for handling fallback scenarios.
3. **AI Integration**: The formatted query is sent to Groq (llama3-8b-8192) with a system prompt that requires a structured JSON response.
4. **Answer Generation**: The AI explains the law in plain language, citing articles & cases.
5. **Suggested Queries**: New suggested questions are generated to guide the user.

## 🧪 Features
- ✅ **Legal Q&A** – Ask about any legal topic (e.g., bail, Article 25, defamation).
- 📚 **Articles Referenced** – Responses cite specific legal articles (e.g., Article 19, Page 45).
- ⚖️ **Case Law Matched** – Relevant Supreme Court cases are suggested.
- 🧑‍⚖️ **Lawyer Suggestions** – [Optional future] Suggest lawyers by topic & location.
- 🧵 **Follow-Up Questions** – Suggestions shown before and after the response.
- 🌐 **Web Lookup Fallback** – If context is not available locally, web-based fallback can fetch extra info.

## 🧰 Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI**: Groq (llama3-8b-8192)
- **Hosting**: Vercel or Railway
- **Data Source**: Full Pakistan Constitution (PDF) + SC Judgements (HTML/PDF)
- **Future Expansion**: Lawyer DB, Region-wise Filtering, Audio/Video Explanation

## ✅ Example Flow
1. **User**: "Can women be appointed as judges in Pakistan?"
2. **AI responds**:
   - Explains the article in plain terms.
   - Cites real cases and page numbers.
   - Offers follow-up suggestions like "Rights under Article 25A?"

## 🛠️ Fallback Technique in LegalConnectAI Chatbot
### Fallback System Overview
- **What is it?** A fallback mechanism ensures that if no match is found locally, the chatbot still attempts to answer the user's question by using external or default resources.
- If the chatbot can't find a direct answer from the Constitution or court cases, it:
  - Tries to explain the question in simple words.
  - Uses its general knowledge about Pakistani law to answer.
  - Still gives legal articles or case references if it finds anything close.
  - Shows suggested questions to help the user ask better or related things.

### Step-by-Step Flow
1. **User Submits a Query**.
2. **Primary Attempt**: The query is sent to Groq.
3. **Fallback Trigger** – if no match is found or confidence is low, fallback options are triggered.

### Fallback Handling Options
- 🔹 **Web Fallback** – Summarize legal sites like gov.pk.
- 🔹 **AI Default Response** – Use Groq's built-in knowledge with a disclaimer.
- 🔹 **Prompt Injection** – Inject fallback instructions into the prompt.
- 🔹 **Retry with Relaxed Filters** – Search broader legal topics.

### Prompt Structure (With Fallback Example)
```
You are a legal assistant for Pakistani law. A user has asked:
"{userQuery}"

If no relevant article or judgement is found:
- Use your general legal knowledge.
- Explain the concept simply.
- Clarify that this is not a guaranteed legal citation.
- Suggest related legal terms the user may search.

Context:
{retrievedContext || 'No context found'}
```

### Fallback UX (Frontend Behavior)
- ❌ **No Context** – Show badge: "⚠️ No legal reference found, using AI explanation".
- ✅ **Fallback Response** – Still explain clearly.
- 🔁 **Suggested Questions** – Based on fallback results.
- 📤 **Retry Button** – "Try again with more detail" option.

### Result
- ✅ No dead ends.
- ✅ Polite, helpful fallback.
- ✅ No hallucination without disclaimer.
- ✅ Keeps user engaged. 