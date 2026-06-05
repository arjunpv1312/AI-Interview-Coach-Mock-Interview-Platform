import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { apiManager } from './src/lib/ApiManager';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/interact', async (req, res) => {
    try {
      const { company, role, history } = req.body;
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.json({ text: "I'm sorry, but I cannot assist you right now. The Gemini API Key is missing from your server configuration. Please add it to continue the interview." });
      }

      const ai = new GoogleGenAI({ 
         apiKey
      });
      
      let chatPrompt = `You are a strict, highly technical interviewer at ${company} interviewing a candidate for the "${role}" position.
Your responses must be spoken-word conversational, VERY concise (1 or 2 sentences maximum), and MUST BE COMPLETELY IN ENGLISH.

Crucial Instructions:
1. FOCUS ON DEPTH: Ask practical, highly technical questions, including coding logic, system design, data structures, or deeply specialized aspects of the ${role} at ${company}. Don't ask generic questions.
2. ADAPTIVE: If the candidate answers well, pivot to a harder follow-up.
3. CONVERSATIONAL: Pure spoken text only. No markdown, lists, or asterisks (like *smiles*). NEVER write code blocks.
4. PROBE: If they give a superficial answer, ask them to explain the inner workings or edge cases.
5. EXTREMELY BRIEF: Keep your prompts under 40 words total. The user must do the talking.

Conversation so far:
`;

      if (history && history.length > 0) {
        history.forEach((msg: any) => {
           chatPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.text}\n`;
        });
      } else {
        chatPrompt += "(Start the interview by introducing yourself briefly as the AI interviewer and asking the first interview question regarding the role.)\n";
      }
      
      chatPrompt += `\nInterviewer:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: chatPrompt,
      });

      if (!response.text) {
        throw new Error("Empty response from AI");
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Error getting interaction:', error);
      let fallbackText = "I'm having a technical issue processing that. Could you please answer the previous question again, or rephrase it?";
      
      const errString = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (errString.includes('429') && errString.includes('Quota')) {
         apiManager.nextKey();
         fallbackText = "Our AI system is currently handling a maximum load. We are dynamically re-routing resources and switching nodes... Please wait up to 60 seconds and submit your response again.";
      }

      res.json({ text: fallbackText });
    }
  });

  // Simulate specific questions without chatting
  app.post('/api/simulate-questions', async (req, res) => {
    try {
      const { company, role, experience } = req.body;
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.status(500).json({ error: "Missing Gemini API Key." });
      }

      const ai = new GoogleGenAI({ 
        apiKey
      });
      
      let prompt = `You are an expert technical recruiter and hiring manager at ${company}. Generate exactly 5 custom, high-quality interview questions for a ${role} position (Experience level: ${experience} years).
The questions must be highly specific to the technologies and domain of ${company} and the day-to-day work of a ${role}. 
Do not include any introductory or concluding text. 
Return ONLY a JSON array of 5 strings.
Example: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.7,
        }
      });

      let text = response.text || '';
      // Attempt to parse JSON
      try {
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            const rawQuestions = JSON.parse(jsonMatch[0]);
            return res.json({ questions: rawQuestions.slice(0, 5) });
        }
      } catch(e) {
         // fallback
      }
      
      // Fallback if parsing fails
      const fallbackQuestions = text.split('\n').filter(l => l.trim().length > 10).map(l => l.replace(/^[\d\.\-\*]\s*/, '').trim()).slice(0, 5);
      res.json({ questions: fallbackQuestions });
      
    } catch (error) {
      console.error('Gemini Generate Simulation Error:', error);
      res.status(500).json({ error: 'Failed to communicate with AI' });
    }
  });

  app.post('/api/evaluate', async (req, res) => {
    try {
      const { company, role, history } = req.body;
      const apiKey = apiManager.getCurrentKey();
      if (!apiKey) {
        return res.json({
          crackProbability: "Needs Work",
          overallScore: 0,
          overallSummary: "We couldn't fully evaluate your performance because the Gemini API Key is missing.",
          speakingSkills: "Not enough data.",
          technicalSkills: "Not enough data.",
          deepDive: "Your server is missing the Gemini API Key. Please add it to your configuration.",
          improvements: ["Add GEMINI_API_KEY to continue."],
          studyTopics: ["System Design Fundamentals", "Data Structures & Algorithms", "Mock Interview Practice"]
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey
      });
      
      let chatPrompt = `Analyze this interview transcript for a ${role} at ${company}.
Evaluate the candidate thoroughly based on the conversation.
You MUST return ONLY a raw JSON object with the following fields: 
- crackProbability: string (Must be exactly one of: "Highly Likely", "Possible", "Needs Work")
- overallScore: number (A score from 0 to 100 representing their overall performance)
- overallSummary: string (A solid 2-3 sentence overview of their performance. Explicitly state whether they have a well-founded chance to clear the interview or crack the job/internship offer based on this evaluation.)
- speakingSkills: string (Evaluate their communication, tone, and clarity)
- technicalSkills: string (Evaluate the accuracy, depth, and problem-solving skills)
- deepDive: string (A very comprehensive, multi-paragraph deep-dive analysis summarizing specific topics discussed, strengths, weaknesses, and nuances from the candidate's answers)
- improvements: array of strings (List 3-5 specific, actionable areas they need to improve on)
- studyTopics: array of strings (List exactly 3 specific, actionable technical study resources or topics for the user to research based on their technicalSkills evaluation)

Transcript:
`;

      history.forEach((msg: any) => {
         chatPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.text}\n`;
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: chatPrompt,
      });

      let responseText = response.text || "";
      
      let parsedResponse = {
        crackProbability: "Needs Work",
        overallScore: 0,
        overallSummary: "We couldn't fully evaluate your performance.",
        speakingSkills: "Not enough data.",
        technicalSkills: "Not enough data.",
        deepDive: "There was a technical issue analyzing the interview data. Please try taking another interview.",
        improvements: ["Practice more interviews."],
        studyTopics: ["System Design Fundamentals", "Data Structures & Algorithms", "Mock Interview Practice"]
      };

      try {
        const jsonMatch = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
        if (jsonMatch) {
            const jsonText = Array.isArray(jsonMatch) && jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
            parsedResponse = JSON.parse(jsonText);
        } else {
            parsedResponse = JSON.parse(responseText);
        }
      } catch (e) {
        console.error("Failed to parse Gemini evaluation as JSON:", responseText, e);
      }

      res.json(parsedResponse);
    } catch (error: any) {
      console.error('Error getting evaluation:', error);
      
      const errString = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      let summaryText = `We couldn't fully evaluate your performance due to a server error.`;
      if (errString.includes('429') && errString.includes('Quota')) {
          apiManager.nextKey();
          summaryText = "We are currently operating at maximum capacity. We have switched API nodes in the background. Please try submitting your evaluation again.";
      }

      res.json({
        crackProbability: "Needs Work",
        overallScore: 0,
        overallSummary: summaryText,
        speakingSkills: "Not enough data.",
        technicalSkills: "Not enough data.",
        deepDive: "There was an unexpected error connecting to the AI system. We apologize for the inconvenience and recommend trying your interview again.",
        improvements: ["Ensure stable network connection.", "Try another mock interview session."],
        studyTopics: ["System Design Fundamentals", "Data Structures & Algorithms", "Mock Interview Practice"]
      });
    }
  });

  app.post('/api/insights', async (req, res) => {
    try {
      const { userDetails, historyStr } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key not configured");
      
      const ai = new GoogleGenAI({ 
        apiKey 
      });

      const prompt = `You are an expert career coach and technical interviewer analyzing a candidate's overall progress.
      
Candidate Profile:
${userDetails}

Summary of Past Sessions:
${historyStr}

Based on this data, provide a highly personalized and professional overall performance analysis.
Respond ONLY in JSON format with the following keys:
- strengths: array of strings (3-4 technical or communication strengths)
- weaknesses: array of strings (3-4 specific areas needing improvement)
- studyPlan: array of objects with keys: "topic" (string), "reason" (string), "actionableSteps" (string) (Provide 3 key areas of study)
- overallAdvice: string (A solid paradigm-shifting piece of advice for their career)`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      let responseText = response.text || "";
      let parsedResponse;
      try {
        const jsonMatch = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
        const jsonText = jsonMatch ? (Array.isArray(jsonMatch) && jsonMatch[1] ? jsonMatch[1] : jsonMatch[0]) : responseText;
        parsedResponse = JSON.parse(jsonText);
      } catch (e) {
        parsedResponse = {
           strengths: ["Shows dedication to practice"],
           weaknesses: ["Needs more consistent interview data"],
           studyPlan: [{topic: "General Interviewing", reason: "Need more data", actionableSteps: "Continue doing mock sessions."}],
           overallAdvice: "Keep practicing consistently to unlock tailored insights."
        };
      }
      res.json(parsedResponse);
    } catch (err: any) {
      console.error("Insights error", err);
      res.json({
         strengths: ["System detected dedication"],
         weaknesses: ["Not enough data due to error"],
         studyPlan: [{topic: "General Practice", reason: "API Error", actionableSteps: "Try again later."}],
         overallAdvice: "We experienced a technical hiccup. Keep pushing forward and try refreshing later."
      });
    }
  });

  app.post('/api/learner', async (req, res) => {
    try {
      const { topic } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key not configured");
      
      const ai = new GoogleGenAI({ 
        apiKey 
      });

      const prompt = `You are an expert tech lead and automated course generator. Provide the absolute latest industry trends, algorithms, and practices regarding: ${topic || 'General Software Engineering Interviews'}.
Create an educational module auto-updated with recent methods.
Respond ONLY in JSON format:
{
  "title": "Module Title",
  "lastUpdated": "Today's Date",
  "trends": ["trend1", "trend2"],
  "resources": [{"name": "Resource source", "url": "url if known, or text"}],
  "newQuestions": [{"question": "Q1", "concept": "what it tests"}]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      let responseText = response.text || "";
      let parsedResponse;
      try {
        const jsonMatch = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
        const jsonText = jsonMatch ? (Array.isArray(jsonMatch) && jsonMatch[1] ? jsonMatch[1] : jsonMatch[0]) : responseText;
        parsedResponse = JSON.parse(jsonText);
      } catch (e) {
        parsedResponse = {
           title: "Latest in " + (topic || "Tech"),
           lastUpdated: new Date().toLocaleDateString(),
           trends: ["AI Coding Assistants", "System Design for Scale"],
           resources: [{name: "Google Tech Blog", url: "#"}],
           newQuestions: [{question: "How do you design a distributed cache?", concept: "Caching Strategies"}]
        };
      }
      res.json(parsedResponse);
    } catch (err: any) {
      console.error("Learner error", err);
      res.status(500).json({ error: "Failed to generate learning module" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
